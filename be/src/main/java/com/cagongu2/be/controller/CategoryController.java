package com.cagongu2.be.controller;

import com.cagongu2.be.dto.category.request.CategoryDTO;
import com.cagongu2.be.dto.category.request.CategoryFlatDTO;
import com.cagongu2.be.dto.category.response.CategoryResponse;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Validated
public class CategoryController {
    private final CategoryService categoryService;

    /**
     * Get all categories by level - Public
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            @RequestParam @Min(0) @Max(1) int level) {
        return ResponseEntity.ok(categoryService.getAllCategoriesByLevel(level));
    }

    /**
     * Get flat categories - Public
     */
    @GetMapping("/flat")
    public ResponseEntity<List<CategoryFlatDTO>> getFlatCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesFlat());
    }

    /**
     * Get category by ID - Public
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable @Min(1) Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get category by slug - Public
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(
            @PathVariable @jakarta.validation.constraints.Pattern(
                    regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$"
            ) String slug) {
        return categoryService.getCategoryBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get children categories - Public
     */
    @GetMapping("/children/{parentId}")
    public ResponseEntity<List<CategoryResponse>> getChildren(
            @PathVariable @Min(1) Long parentId) {
        return ResponseEntity.ok(categoryService.getChildren(parentId));
    }

    /**
     * Create category - Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Category> createCategory(
            @Valid @RequestBody CategoryDTO category) {
        Category created = categoryService.createCategory(category);
        return ResponseEntity.created(
                URI.create("/api/categories/" + created.getId())
        ).body(created);
    }

    /**
     * Update category - Admin only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Category> updateCategory(
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody CategoryDTO category) {
        try {
            Category updated = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete category - Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable @Min(1) Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}