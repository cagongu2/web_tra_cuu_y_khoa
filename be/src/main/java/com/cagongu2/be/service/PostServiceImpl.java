package com.cagongu2.be.service;

import com.cagongu2.be.dto.PostDTO;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.User;
import com.cagongu2.be.repository.CategoryRepository;
import com.cagongu2.be.repository.PostRepository;
import com.cagongu2.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    public Post createPost(PostDTO postDTO) {
        Category category = categoryRepository.findById(postDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        User author = userRepository.findById(postDTO.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));

        Post post = new Post();
        post.setName(postDTO.getName());
        post.setTitle(postDTO.getTitle());
        post.setSlug(postDTO.getSlug());
        post.setContent(postDTO.getContent());
        post.setStatus(postDTO.getStatus());
        post.setCategory(category);
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAll();
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
    public Post updatePost(Long id, PostDTO postDTO) {
        Post post = getPostById(id);

        if (StringUtils.hasText(postDTO.getTitle())) {
            post.setTitle(postDTO.getTitle());
        }

        if (StringUtils.hasText(postDTO.getSlug())) {
            post.setSlug(postDTO.getSlug());
        }

        if (StringUtils.hasText(postDTO.getContent())) {
            post.setContent(postDTO.getContent());
        }

        if (StringUtils.hasText(postDTO.getStatus())) {
            post.setStatus(postDTO.getStatus());
        }

        if (StringUtils.hasText(postDTO.getName())) {
            post.setName(postDTO.getName());
        }

        if (postDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(postDTO.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));
            post.setCategory(category);
        }

        if (postDTO.getAuthorId() != null) {
            User author = userRepository.findById(postDTO.getAuthorId())
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
