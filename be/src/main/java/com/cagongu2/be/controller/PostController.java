package com.cagongu2.be.controller;

import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.dto.post.request.PostRequest;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.elasticsearch.PostDocument;
import com.cagongu2.be.service.PostService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Validated // Enable method-level validation
public class PostController {
    private final PostService postService;

    /**
     * Create post - Authenticated users only
     */
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponse> createPost(
            @Valid @ModelAttribute PostRequest request) throws IOException {
        return ResponseEntity.ok(postService.createPost(request));
    }

    /**
     * Search posts - Public access
     */
    @GetMapping("/search-post")
    public ResponseEntity<List<PostDocument>> searchPost(
            @RequestParam @jakarta.validation.constraints.NotBlank String query) {
        return ResponseEntity.ok(postService.searchPosts(query));
    }

    /**
     * Get all posts - Public access
     */
    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }

    /**
     * Search posts by title - Public access
     */
    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPostResponsesByTitle(
            @RequestParam @jakarta.validation.constraints.NotBlank String keyword,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.searchPostResponsesByTitle(keyword, pageable));
    }

    /**
     * Get post by ID - Public access
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    /**
     * Get post by slug - Public access
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<PostResponse> getPostBySlug(
            @PathVariable @jakarta.validation.constraints.Pattern(
                    regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$"
            ) String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }

    /**
     * Get posts by category - Public access
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<PostResponse>> getPostsByCategory(
            @PathVariable @Min(1) Long categoryId) {
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId));
    }

    /**
     * Get posts by author - Public access
     */
    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<PostResponse>> getPostsByAuthor(
            @PathVariable @Min(1) Long authorId) {
        return ResponseEntity.ok(postService.getPostsByAuthor(authorId));
    }

    /**
     * Get posts by status - Admin only
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<PostResponse>> getPostsByStatus(
            @PathVariable @jakarta.validation.constraints.Pattern(
                    regexp = "^(draft|published|archived|pending_review)$"
            ) String status) {
        return ResponseEntity.ok(postService.getPostsByStatus(status));
    }

    /**
     * Update post - Author or Admin only
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("@postSecurity.canEdit(#id)")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable @Min(1) Long id,
            @Valid @ModelAttribute PostRequest request) throws IOException {
        return ResponseEntity.ok(postService.updatePost(id, request));
    }

    /**
     * Delete post - Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@postSecurity.canDelete(#id)")
    public ResponseEntity<Void> deletePost(@PathVariable @Min(1) Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}


