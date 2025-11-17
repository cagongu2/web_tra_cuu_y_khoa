package com.cagongu2.be.controller;

import com.cagongu2.be.dto.CategoryDTO;
import com.cagongu2.be.dto.CategoryFlatDTO;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(
            @RequestParam @Min(0) @Max(1) int level) {
        return ResponseEntity.ok(categoryService.getAllCategoriesByLevel(level));
    }

    @GetMapping("/flat")
    public ResponseEntity<List<CategoryFlatDTO>> getFlatCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesFlat());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable @Min(1) Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(
            @PathVariable @jakarta.validation.constraints.Pattern(
                    regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$"
            ) String slug) {
        return categoryService.getCategoryBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/children/{parentId}")
    public ResponseEntity<List<Category>> getChildren(
            @PathVariable @Min(1) Long parentId) {
        return ResponseEntity.ok(categoryService.getChildren(parentId));
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @Valid @RequestBody CategoryDTO category) {
        Category created = categoryService.createCategory(category);
        return ResponseEntity.created(
                URI.create("/api/categories/" + created.getId())
        ).body(created);
    }

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable @Min(1) Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}