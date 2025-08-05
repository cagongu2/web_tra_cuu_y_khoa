package com.cagongu2.be.service;

import com.cagongu2.be.dto.CategoryDTO;
import com.cagongu2.be.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    Category createCategory(CategoryDTO category);

    Category updateCategory(Long id, CategoryDTO category);

    void deleteCategory(Long id);

    Optional<Category> getCategoryById(Long id);

    Optional<Category> getCategoryBySlug(String slug);

    List<Category> getAllCategoriesByLevel(int level);

    List<Category> getChildren(Long parentId);
}
