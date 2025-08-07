package com.cagongu2.be.service;

import com.cagongu2.be.dto.PostDTO;
import com.cagongu2.be.model.Post;

import java.util.List;

public interface PostService {
    Post createPost(PostDTO postDTO);
    List<Post> getAllPosts();
    Post getPostById(Long id);
    Post getPostBySlug(String slug);
    List<Post> getPostsByCategory(Long categoryId);
    List<Post> getPostsByAuthor(Long authorId);
    List<Post> getPostsByStatus(String status);
    Post updatePost(Long id, PostDTO postDTO);
    void deletePost(Long id);
}
