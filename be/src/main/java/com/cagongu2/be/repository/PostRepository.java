package com.cagongu2.be.repository;

import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Find by slug with all relationships loaded
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    Optional<Post> findBySlug(String slug);

    /**
     * Find by ID with all relationships loaded
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    Optional<Post> findById(Long id);

    /**
     * Find by category with optimized loading
     */
    @EntityGraph(attributePaths = {"author", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE p.category.id = :categoryId AND p.deletedAt IS NULL")
    List<Post> findByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * Find by author with optimized loading
     */
    @EntityGraph(attributePaths = {"category", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.deletedAt IS NULL")
    List<Post> findByAuthorId(@Param("authorId") Long authorId);

    /**
     * Find by status
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE p.status = :status AND p.deletedAt IS NULL")
    List<Post> findByStatus(@Param("status") String status);

    /**
     * Paginated find all with relationships
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE p.deletedAt IS NULL")
    Page<Post> findAll(Pageable pageable);

    /**
     * Paginated search by title
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND p.deletedAt IS NULL")
    Page<Post> findAllByTitleContainingIgnoreCase(
            @Param("keyword") String keyword,
            Pageable pageable);

    /**
     * Count posts by category
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.category.id = :categoryId AND p.deletedAt IS NULL")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * Count posts by author
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :authorId AND p.deletedAt IS NULL")
    long countByAuthorId(@Param("authorId") Long authorId);

    /**
     * Find recent posts (for homepage)
     */
    @EntityGraph(attributePaths = {"category", "author", "thumbnail"})
    @Query("SELECT p FROM Post p WHERE p.status = 'published' AND p.deletedAt IS NULL " +
            "ORDER BY p.createdAt DESC")
    List<Post> findRecentPublishedPosts(Pageable pageable);
}