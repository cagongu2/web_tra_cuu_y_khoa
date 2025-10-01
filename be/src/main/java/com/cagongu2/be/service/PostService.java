package com.cagongu2.be.service;

import com.cagongu2.be.dto.PostResponse;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.elasticsearch.PostDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    Post createPost(PostResponse postResponse);
    List<PostDocument> searchPosts(String text);
    Page<PostResponse> getAllPosts(Pageable pageable);
    Page<PostResponse> searchPostResponsesByTitle(String keyword ,Pageable pageable);
    Post getPostById(Long id);
    Post getPostBySlug(String slug);
    List<Post> getPostsByCategory(Long categoryId);
    List<Post> getPostsByAuthor(Long authorId);
    List<Post> getPostsByStatus(String status);
    Post updatePost(Long id, PostResponse postResponse);
    void deletePost(Long id);
}
