package com.cagongu2.be.service;

import com.cagongu2.be.dto.CategoryDTO;
import com.cagongu2.be.dto.CategoryFlatDTO;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category createCategory(CategoryDTO category) {
        Optional<Category> parentCategory = Optional.empty();
        if (category.getParent() != null){
            parentCategory = categoryRepository.findById(category.getParent());
        }

        Category newCategory = Category.builder()
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .level(category.getLevel())
                .parent(parentCategory.orElse(null))
                .build();

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

            if (newCategory.getLevel() != existing.getLevel())
                existing.setLevel(newCategory.getLevel());

            if (newCategory.getIsActive() != null && !existing.getIsActive().equals(newCategory.getIsActive())) {
                existing.setIsActive(newCategory.getIsActive());
            }

            if (newCategory.getParent() != null) {
                Category parentCategory = categoryRepository.findById(newCategory.getParent())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                existing.setParent(parentCategory);
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
    public List<Category> getChildren(Long parentId) {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getParent() != null && c.getParent().getId().equals(parentId))
                .toList();
    }
}