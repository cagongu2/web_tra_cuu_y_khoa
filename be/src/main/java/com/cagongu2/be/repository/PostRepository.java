package com.cagongu2.be.repository;

import com.cagongu2.be.dto.post.response.PostResponse;
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

    Page<Post> findAll(Pageable pageable);
    Page<Post> findAllByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}