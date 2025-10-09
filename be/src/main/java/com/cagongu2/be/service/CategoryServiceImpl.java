package com.cagongu2.be.service;

import com.cagongu2.be.dto.CategoryDTO;
import com.cagongu2.be.dto.CategoryFlatDTO;
import com.cagongu2.be.dto.GetAllCategoriesAndPostDTO;
import com.cagongu2.be.dto.post.request.PostDTO;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.repository.CategoryRepository;
import com.cagongu2.be.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    @Override
    public Category createCategory(CategoryDTO category) {
        Optional<Category> parentCategory = Optional.empty();
        if (category.getParent() != null) {
            parentCategory = categoryRepository.findById(category.getParent());
        }

        Category newCategory = Category.builder()
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .parent(parentCategory.orElse(null))
                .build();

        if (newCategory.getParent() == null) {
            newCategory.setLevel(1);
        } else {
            newCategory.setLevel(0);
        }

        return categoryRepository.save(newCategory);
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, CategoryDTO newCategory) {
        return categoryRepository.findById(id).map(existing -> {

            if (StringUtils.hasText(newCategory.getName()))
                existing.setName(newCategory.getName());

            if (StringUtils.hasText(newCategory.getSlug()))
                existing.setSlug(newCategory.getSlug());

            if (StringUtils.hasText(newCategory.getDescription()))
                existing.setDescription(newCategory.getDescription());

            if (newCategory.getIsActive() != null && !existing.getIsActive().equals(newCategory.getIsActive())) {
                existing.setIsActive(newCategory.getIsActive());
            }

            if (newCategory.getParent() != null) {
                Category parentCategory = categoryRepository.findById(newCategory.getParent())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                existing.setLevel(1);

                existing.setParent(parentCategory);
            }else{
                existing.setParent(null);
                existing.setLevel(0);
            }


            return categoryRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    @Override
    public List<Category> getAllCategoriesByLevel(int level) {
        return categoryRepository.findByLevel(level);
    }

    @Override
    public List<CategoryFlatDTO> getAllCategoriesFlat() {
        return categoryRepository.findAllFlat();
    }

    @Override
    public List<GetAllCategoriesAndPostDTO> getAllCategoriesWithPosts() {
        List<CategoryFlatDTO> categories = categoryRepository.findAllFlat();

        if (categories.isEmpty()) {
            return new ArrayList<>();
        }

        List<GetAllCategoriesAndPostDTO> result = new ArrayList<>();

        for (CategoryFlatDTO category : categories) {
            if (category.getId() != null) {
                List<Post> listPost = postRepository.findByCategoryId(category.getId());
                List<PostDTO> listPostDTO = new ArrayList<>();
                for (Post post : listPost) {
                    listPostDTO.add(PostDTO.builder().id(post.getId()).name(post.getName()).slug(post.getSlug()).build());
                }
                var tmp = new GetAllCategoriesAndPostDTO(
                        category.getId(),
                        category.getName(),
                        category.getIsActive(),
                        category.getParentId(),
                        listPostDTO
                );
            }
        }

        return result;
    }

    @Override
    public List<Category> getChildren(Long parentId) {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getParent() != null && c.getParent().getId().equals(parentId))
                .toList();
    }
}