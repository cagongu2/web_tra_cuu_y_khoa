package com.cagongu2.be.service;

import com.cagongu2.be.dto.category.request.CategoryDTO;
import com.cagongu2.be.dto.category.request.CategoryFlatDTO;
import com.cagongu2.be.dto.category.request.GetAllCategoriesAndPostDTO;
import com.cagongu2.be.dto.category.response.CategoryResponse;
import com.cagongu2.be.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    Category createCategory(CategoryDTO category);

    Category updateCategory(Long id, CategoryDTO category);

    void deleteCategory(Long id);

    Optional<CategoryResponse> getCategoryById(Long id);

    Optional<Category> getCategoryBySlug(String slug);

    List<CategoryResponse> getAllCategoriesByLevel(int level);

    List<CategoryFlatDTO> getAllCategoriesFlat();

    List<GetAllCategoriesAndPostDTO> getAllCategoriesWithPosts();

    List<CategoryResponse> getChildren(Long parentId);
}
