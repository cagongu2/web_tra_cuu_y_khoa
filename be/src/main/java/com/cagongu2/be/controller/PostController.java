package com.cagongu2.be.controller;

import com.cagongu2.be.dto.PostResponse;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.elasticsearch.PostDocument;
import com.cagongu2.be.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostResponse postResponse) {
        Post createdPost = postService.createPost(postResponse);
        return ResponseEntity.ok(createdPost);
    }

    @GetMapping("/search-post")
    public ResponseEntity<List<PostDocument>> searchPost(@RequestParam String query){
        return  ResponseEntity.ok(postService.searchPosts(query));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page,size);
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostResponse>> searchPostResponsesByTitle(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.searchPostResponsesByTitle(keyword, pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Post> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Post>> getPostsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId));
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Post>> getPostsByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(postService.getPostsByAuthor(authorId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Post>> getPostsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(postService.getPostsByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody PostResponse postResponse) {
        Post updatedPost = postService.updatePost(id, postResponse);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

}
