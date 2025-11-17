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
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    /**
     * Create category - Evict all category caches
     */
    @Override
    @Caching(evict = {
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "categoriesFlat", allEntries = true)
    })
    public Category createCategory(CategoryDTO category) {
        log.info("Creating new category: {}", category.getName());

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
            newCategory.setLevel(0);
        } else {
            newCategory.setLevel(1);
        }

        Category saved = categoryRepository.save(newCategory);
        log.info("Category created with ID: {}", saved.getId());

        return saved;
    }

    /**
     * Update category - Evict specific and all category caches
     */
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "categories", key = "#id"),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "categoriesFlat", allEntries = true),
            @CacheEvict(value = "categoryBySlug", allEntries = true)
    })
    public Category updateCategory(Long id, CategoryDTO newCategory) {
        log.info("Updating category ID: {}", id);

        return categoryRepository.findById(id).map(existing -> {
            if (StringUtils.hasText(newCategory.getName()))
                existing.setName(newCategory.getName());

            if (StringUtils.hasText(newCategory.getSlug()))
                existing.setSlug(newCategory.getSlug());

            if (StringUtils.hasText(newCategory.getDescription()))
                existing.setDescription(newCategory.getDescription());

            if (newCategory.getIsActive() != null &&
                    !existing.getIsActive().equals(newCategory.getIsActive())) {
                existing.setIsActive(newCategory.getIsActive());
            }

            if (newCategory.getParent() != null) {
                Category parentCategory = categoryRepository.findById(newCategory.getParent())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                existing.setLevel(1);
                existing.setParent(parentCategory);
            } else {
                existing.setParent(null);
                existing.setLevel(0);
            }

            Category updated = categoryRepository.save(existing);
            log.info("Category updated: {}", updated.getId());

            return updated;
        }).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    /**
     * Delete category - Evict all category caches
     */
    @Override
    @Caching(evict = {
            @CacheEvict(value = "categories", key = "#id"),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "categoriesFlat", allEntries = true),
            @CacheEvict(value = "categoryBySlug", allEntries = true)
    })
    public void deleteCategory(Long id) {
        log.info("Deleting category ID: {}", id);
        categoryRepository.deleteById(id);
    }

    /**
     * Get category by ID - Cacheable
     */
    @Override
    @Cacheable(value = "categories", key = "#id", unless = "#result == null")
    public Optional<Category> getCategoryById(Long id) {
        log.info("Fetching category by ID: {} (cache miss)", id);
        return categoryRepository.findById(id);
    }

    /**
     * Get category by slug - Cacheable
     */
    @Override
    @Cacheable(value = "categoryBySlug", key = "#slug", unless = "#result == null")
    public Optional<Category> getCategoryBySlug(String slug) {
        log.info("Fetching category by slug: {} (cache miss)", slug);
        return categoryRepository.findBySlug(slug);
    }

    /**
     * Get all categories by level - Cacheable
     */
    @Override
    @Cacheable(value = "categories", key = "'level:' + #level")
    public List<Category> getAllCategoriesByLevel(int level) {
        log.info("Fetching categories by level: {} (cache miss)", level);
        return categoryRepository.findByLevel(level);
    }

    /**
     * Get all categories flat - Cacheable
     */
    @Override
    @Cacheable(value = "categoriesFlat", key = "'all'")
    public List<CategoryFlatDTO> getAllCategoriesFlat() {
        log.info("Fetching all flat categories (cache miss)");
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
                    listPostDTO.add(PostDTO.builder()
                            .id(post.getId())
                            .name(post.getName())
                            .slug(post.getSlug())
                            .build());
                }

                result.add(new GetAllCategoriesAndPostDTO(
                        category.getId(),
                        category.getName(),
                        category.getIsActive(),
                        category.getParentId(),
                        listPostDTO
                ));
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