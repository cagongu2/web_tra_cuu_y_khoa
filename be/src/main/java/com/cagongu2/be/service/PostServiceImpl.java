package com.cagongu2.be.service;

import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.dto.post.request.PostRequest;
import com.cagongu2.be.mapper.PostMapper;
import com.cagongu2.be.model.Category;
import com.cagongu2.be.model.Image;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.User;
import com.cagongu2.be.model.elasticsearch.PostDocument;
import com.cagongu2.be.repository.CategoryRepository;
import com.cagongu2.be.repository.PostRepository;
import com.cagongu2.be.repository.UserRepository;
import com.cagongu2.be.repository.elasticsearch.PostSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final PostSearchRepository postSearchRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final PostMapper postMapper;

    @Override
    @Transactional
    public PostResponse createPost(PostRequest request) throws IOException {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));

        Image image = null;

        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String thumbnail_url = fileUploadService.uploadFile(request.getFile(), "thumbnail");

            image = Image.builder()
                    .url(thumbnail_url)
                    .type("thumbnail")
                    .build();
        }

        Post post = new Post();
        post.setName(request.getName());
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug());
        post.setContent(request.getContent());
        post.setStatus(request.getStatus());
        post.setCategory(category);
        post.setAuthor(author);
        post.setThumbnail(image);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        var saved = postRepository.save(post);

        PostResponse response = postMapper.toPostResponse(saved);
        if (image != null) {
            response.setThumbnail_url(image.getUrl());
        }

        PostDocument document = PostDocument.builder()
                .id(saved.getId())
                .name(request.getName())
                .title(request.getTitle())
                .content(request.getContent())
                .slug(request.getSlug())
                .thumbnail_url(response.getThumbnail_url())
                .build();

        return response;
    }

    @Override
    public List<PostDocument> searchPosts(String text) {
        return postSearchRepository.searchPosts(text);
    }

    @Override
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(postMapper::toPostResponse);
    }

    @Override
    public Page<PostResponse> searchPostResponsesByTitle(String keyword, Pageable pageable) {
        return postRepository.findAllByTitleContainingIgnoreCase(keyword, pageable).map(postMapper::toPostResponse);
    }


    @Override
    public PostResponse getPostById(Long id) {
        return postMapper.toPostResponse( postRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + id)));
    }

    @Override
    public PostResponse getPostBySlug(String slug) {
        return postMapper.toPostResponse(postRepository.findBySlug(slug).orElseThrow(() -> new RuntimeException("Not found post has slug: " + slug)));
    }

    @Override
    public List<PostResponse> getPostsByCategory(Long categoryId) {
        return postRepository.findByCategoryId(categoryId).stream().map(postMapper::toPostResponse).toList();
    }

    @Override
    public List<PostResponse> getPostsByAuthor(Long authorId) {
        return postRepository.findByAuthorId(authorId).stream().map(postMapper::toPostResponse).toList();
    }

    @Override
    public List<PostResponse> getPostsByStatus(String status) {
        return postRepository.findByStatus(status).stream().map(postMapper::toPostResponse).toList();
    }

    @Override
    @Transactional
    public PostResponse updatePost(Long id, PostRequest request) throws IOException {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found post has ID: " + id));

        if (StringUtils.hasText(request.getTitle())) {
            post.setTitle(request.getTitle());
        }

        if (StringUtils.hasText(request.getSlug())) {
            post.setSlug(request.getSlug());
        }

        if (StringUtils.hasText(request.getContent())) {
            post.setContent(request.getContent());
        }

        if (StringUtils.hasText(request.getStatus())) {
            post.setStatus(request.getStatus());
        }

        if (StringUtils.hasText(request.getName())) {
            post.setName(request.getName());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));
            post.setCategory(category);
        }

        if (request.getAuthorId() != null) {
            User author = userRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));
            post.setAuthor(author);
        }

        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String thumbnailUrl = fileUploadService.uploadFile(request.getFile(), "thumbnail");
            Image newImage = Image.builder()
                    .url(thumbnailUrl)
                    .type("thumbnail")
                    .build();
            post.setThumbnail(newImage);
        }

        post.setUpdatedAt(LocalDateTime.now());

        var updated = postRepository.save(post);

        PostResponse response = postMapper.toPostResponse(updated);
        if (updated.getThumbnail() != null) {
            response.setThumbnail_url(updated.getThumbnail().getUrl());
        }

        PostDocument document = PostDocument.builder()
                .id(updated.getId())
                .title(request.getTitle())
                .name(request.getName())
                .content(request.getContent())
                .slug(request.getSlug())
                .thumbnail_url(response.getThumbnail_url())
                .build();

        postSearchRepository.save(document);

        return response;
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found post has ID: " + id));
        postRepository.delete(post);
        postSearchRepository.deleteById(post.getId());
    }
}
