package com.cagongu2.be.service;

import com.cagongu2.be.dto.PostResponse;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.User;
import com.cagongu2.be.repository.CategoryRepository;
import com.cagongu2.be.repository.PostRepository;
import com.cagongu2.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public Post createPost(PostResponse postResponse) {
        Category category = categoryRepository.findById(postResponse.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        User author = userRepository.findById(postResponse.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));

        Post post = new Post();
        post.setName(postResponse.getName());
        post.setTitle(postResponse.getTitle());
        post.setSlug(postResponse.getSlug());
        post.setContent(postResponse.getContent());
        post.setStatus(postResponse.getStatus());
        post.setCategory(category);
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Override
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        Page<PostResponse> posts = postRepository.findAllPostResponses(pageable);
        return posts;
    }


    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + id));
    }

    @Override
    public Post getPostBySlug(String slug) {
        return postRepository.findBySlug(slug).orElseThrow(() -> new RuntimeException("Not found post has slug: " + slug));
    }

    @Override
    public List<Post> getPostsByCategory(Long categoryId) {
        return postRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Post> getPostsByAuthor(Long authorId) {
        return postRepository.findByAuthorId(authorId);
    }

    @Override
    public List<Post> getPostsByStatus(String status) {
        return postRepository.findByStatus(status);
    }

    @Override
    public Post updatePost(Long id, PostResponse postResponse) {
        Post post = getPostById(id);

        if (StringUtils.hasText(postResponse.getTitle())) {
            post.setTitle(postResponse.getTitle());
        }

        if (StringUtils.hasText(postResponse.getSlug())) {
            post.setSlug(postResponse.getSlug());
        }

        if (StringUtils.hasText(postResponse.getContent())) {
            post.setContent(postResponse.getContent());
        }

        if (StringUtils.hasText(postResponse.getStatus())) {
            post.setStatus(postResponse.getStatus());
        }

        if (StringUtils.hasText(postResponse.getName())) {
            post.setName(postResponse.getName());
        }

        if (postResponse.getCategoryId() != null) {
            Category category = categoryRepository.findById(postResponse.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));
            post.setCategory(category);
        }

        if (postResponse.getAuthorId() != null) {
            User author = userRepository.findById(postResponse.getAuthorId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));
            post.setAuthor(author);
        }

        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Override
    public void deletePost(Long id) {
        Post post = getPostById(id);
        postRepository.delete(post);
    }
}
