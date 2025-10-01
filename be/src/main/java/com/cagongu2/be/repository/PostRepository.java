package com.cagongu2.be.repository;

import com.cagongu2.be.dto.PostDTO;
import com.cagongu2.be.dto.PostResponse;
import com.cagongu2.be.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    List<Post> findByCategoryId(Long categoryId);

    List<Post> findByAuthorId(Long authorId);

    List<Post> findByStatus(String status);

    @Query("SELECT new com.cagongu2.be.dto.PostResponse(" +
            "p.id, p.name, p.title, p.slug, p.content, p.status, " +
            "c.id, c.name, " +
            "u.id, u.username, " +
            "p.createdAt, p.updatedAt) " +
            "FROM Post p " +
            "LEFT JOIN p.category c " +
            "LEFT JOIN p.author u")
    Page<PostResponse> findAllPostResponses(Pageable pageable);

    @Query("SELECT new com.cagongu2.be.dto.PostResponse(" +
            "p.id, p.name, p.title, p.slug, p.content, p.status, " +
            "c.id, c.name, " +
            "u.id, u.username, " +
            "p.createdAt, p.updatedAt) " +
            "FROM Post p " +
            "LEFT JOIN p.category c " +
            "LEFT JOIN p.author u " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<PostResponse> searchPostResponsesByTitle(@Param("keyword") String keyword, Pageable pageable);

}