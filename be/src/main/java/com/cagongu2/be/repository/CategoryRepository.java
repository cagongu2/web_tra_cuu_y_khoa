package com.cagongu2.be.repository;

import com.cagongu2.be.dto.category.request.CategoryFlatDTO;
import com.cagongu2.be.model.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find by slug with parent loaded
     */
    @EntityGraph(attributePaths = {"parent"})
    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Find by level with parent loaded
     */
    @EntityGraph(attributePaths = {"parent", "postList"})
    @Query("SELECT c FROM Category c WHERE c.level = :level AND c.deletedAt IS NULL")
    List<Category> findByLevel(@Param("level") int level);

    /**
     * Find all flat - optimized projection
     */
    @Query("SELECT new com.cagongu2.be.dto.category.request.CategoryFlatDTO(" +
            "c.id, c.name, c.slug, c.description, c.isActive, p.id) " +
            "FROM Category c LEFT JOIN c.parent p " +
            "WHERE c.deletedAt IS NULL")
    List<CategoryFlatDTO> findAllFlat();

    /**
     * Find active categories only
     */
    @Query("SELECT c FROM Category c WHERE c.isActive = true AND c.deletedAt IS NULL")
    List<Category> findAllActive();

    /**
     * Find children of a parent category
     */
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.deletedAt IS NULL")
    List<Category> findByParentId(@Param("parentId") Long parentId);

    @EntityGraph(attributePaths = {"children", "parent", "postList"})
    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Category> findByIdWithChildren(Long id);
}