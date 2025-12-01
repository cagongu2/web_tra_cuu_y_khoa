package com.cagongu2.be.service;

import com.cagongu2.be.context.RequestContextInfo;
import com.cagongu2.be.context.RequestContextService;
import com.cagongu2.be.dto.category.request.CategoryDTO;
import com.cagongu2.be.dto.category.request.CategoryFlatDTO;
import com.cagongu2.be.dto.category.request.GetAllCategoriesAndPostDTO;
import com.cagongu2.be.dto.category.response.CategoryResponse;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final AsyncAuditService asyncAuditService;
    private final RequestContextService requestContextService;

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
            parentCategory = categoryRepository.findByIdWithChildren(category.getParent());
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

        CategoryDTO auditDTO = CategoryDTO.builder()
                .name(saved.getName())
                .slug(saved.getSlug())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .level(saved.getLevel())
                .parent(saved.getParent() != null ? saved.getParent().getId() : null)
                .build();

        // AuditLog
        RequestContextInfo ctx = requestContextService.getInfo();
        asyncAuditService.logAudit(
                "CATEGORY",
                saved.getId(),
                "CREATE",
                ctx.getUserId(),
                ctx.getUsername(),
                null,
                requestContextService.toJson(auditDTO),
                ctx.getIp(),
                ctx.getUserAgent()
        );

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

        return categoryRepository.findByIdWithChildren(id).map(existing -> {

            CategoryDTO oldAuditDTO = CategoryDTO.builder()
                    .name(existing.getName())
                    .slug(existing.getSlug())
                    .description(existing.getDescription())
                    .isActive(existing.getIsActive())
                    .level(existing.getLevel())
                    .parent(existing.getParent() != null ? existing.getParent().getId() : null)
                    .build();

            String oldValue = requestContextService.toJson(oldAuditDTO);

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
                Category parentCategory = categoryRepository.findByIdWithChildren(newCategory.getParent())
                        .orElseThrow(() -> new RuntimeException("Parent category not found"));
                existing.setLevel(1);
                existing.setParent(parentCategory);
            } else {
                existing.setParent(null);
                existing.setLevel(0);
            }

            Category updated = categoryRepository.save(existing);
            log.info("Category updated: {}", updated.getId());

            CategoryDTO auditDTO = CategoryDTO.builder()
                    .name(updated.getName())
                    .slug(updated.getSlug())
                    .description(updated.getDescription())
                    .isActive(updated.getIsActive())
                    .level(updated.getLevel())
                    .parent(updated.getParent() != null ? updated.getParent().getId() : null)
                    .build();

            // AuditLog
            RequestContextInfo ctx = requestContextService.getInfo();
            asyncAuditService.logAudit(
                    "CATEGORY",
                    updated.getId(),
                    "UPDATE",
                    ctx.getUserId(),
                    ctx.getUsername(),
                    oldValue,
                    requestContextService.toJson(auditDTO),
                    ctx.getIp(),
                    ctx.getUserAgent()
            );

            return updated;
        }).orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    /**
     * Delete category - Evict all category caches
     */
    @Transactional
    @Override
    @Caching(evict = {
            @CacheEvict(value = "categories", key = "#id"),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "categoriesFlat", allEntries = true),
            @CacheEvict(value = "categoryBySlug", allEntries = true)
    })
    public void deleteCategory(Long id) {
        log.info("Deleting category ID: {}", id);

        Category category = categoryRepository.findByIdWithChildren(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found category has ID: " + id));

        CategoryDTO auditDTO = CategoryDTO.builder()
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .level(category.getLevel())
                .parent(category.getParent() != null ? category.getParent().getId() : null)
                .build();

        String deletedData = requestContextService.toJson(auditDTO);

        // AuditLog
        RequestContextInfo ctx = requestContextService.getInfo();
        asyncAuditService.logAudit(
                "CATEGORY",
                id,
                "DELETE",
                ctx.getUserId(),
                ctx.getUsername(),
                deletedData,
                null,
                ctx.getIp(),
                ctx.getUserAgent()
        );
    }

    /**
     * Get category by ID - Cacheable
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "#id", unless = "#result == null")
    public Optional<CategoryResponse> getCategoryById(Long id) {
        log.info("Fetching category by ID: {} (cache miss)", id);
        return categoryRepository.findByIdWithChildren(id)
                .map(this::mapToResponse);
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
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'level:' + #level")
    public List<CategoryResponse> getAllCategoriesByLevel(int level) {
        return categoryRepository.findByLevel(level)
                .stream()
                .map(this::mapToResponse)
                .toList();
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
        List<Long> categoryIds = categories.stream().map(CategoryFlatDTO::getId).toList();

        List<Post> posts = postRepository.findByCategoryIds(categoryIds);

        Map<Long, List<PostDTO>> postsByCategory = posts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getId(),
                        Collectors.mapping(p -> PostDTO.builder()
                                        .id(p.getId())
                                        .name(p.getName())
                                        .slug(p.getSlug())
                                        .build(),
                                Collectors.toList())
                ));


        return categories.stream()
                .map(c -> new GetAllCategoriesAndPostDTO(
                        c.getId(),
                        c.getName(),
                        c.getIsActive(),
                        c.getParentId(),
                        postsByCategory.getOrDefault(c.getId(), Collections.emptyList())
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getChildren(Long parentId) {
        return categoryRepository.findByParentId(parentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    private CategoryResponse mapToResponse(Category category) {
        if (category == null) return null;

        CategoryResponse response = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .isActive(category.getIsActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(new HashSet<>())
                .build();

        // Map children recursively
        if (category.getChildren() != null) {
            for (Category child : category.getChildren()) {
                response.getChildren().add(mapToResponse(child));
            }
        }

        return response;
    }

}