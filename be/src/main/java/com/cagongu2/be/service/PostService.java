package com.cagongu2.be.service;

import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.dto.post.request.PostRequest;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.elasticsearch.PostDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;

public interface PostService {
    PostResponse createPost(PostRequest postResponse) throws IOException;

    List<PostDocument> searchPosts(String text);

    Page<PostResponse> getAllPosts(Pageable pageable);

    Page<PostResponse> searchPostResponsesByTitle(String keyword, Pageable pageable);

    PostResponse getPostById(Long id);

    PostResponse getPostBySlug(String slug);

    List<PostResponse> getPostsByCategory(Long categoryId);

    List<PostResponse> getPostsByAuthor(Long authorId);

    List<PostResponse> getPostsByStatus(String status);

    PostResponse updatePost(Long id, PostRequest request) throws IOException;

    void deletePost(Long id);
}
