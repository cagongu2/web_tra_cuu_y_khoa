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
import com.cagongu2.be.util.HtmlSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostSearchRepository postSearchRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final PostMapper postMapper;
    private final HtmlSanitizer htmlSanitizer;

    /**
     * Create post - Evict related caches
     */
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "posts", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    public PostResponse createPost(PostRequest request) throws IOException {
        log.info("Creating new post: {}", request.getName());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID"));

        User author = userRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid author ID"));

        // Sanitize HTML content
        String sanitizedContent = htmlSanitizer.sanitize(request.getContent());

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
        post.setContent(sanitizedContent);
        post.setStatus(request.getStatus());
        post.setCategory(category);
        post.setAuthor(author);
        post.setThumbnail(image);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        Post saved = postRepository.save(post);
        log.info("Post created with ID: {}", saved.getId());

        // Index to Elasticsearch
        PostDocument document = PostDocument.builder()
                .id(saved.getId())
                .name(request.getName())
                .title(request.getTitle())
                .content(sanitizedContent)
                .slug(request.getSlug())
                .thumbnail_url(image != null ? image.getUrl() : null)
                .build();

        postSearchRepository.save(document);

        PostResponse response = postMapper.toPostResponse(saved);
        if (image != null) {
            response.setThumbnail_url(image.getUrl());
        }

        return response;
    }

    /**
     * Search posts - Cacheable with short TTL
     */
    @Override
    @Cacheable(value = "searchResults", key = "#text")
    public List<PostDocument> searchPosts(String text) {
        log.info("Searching posts with query: {} (cache miss)", text);
        return postSearchRepository.searchPosts(text);
    }

    /**
     * Get all posts with pagination - Cacheable
     */
    @Override
    @Cacheable(value = "posts", key = "'page:' + #pageable.pageNumber + ':size:' + #pageable.pageSize")
    public Page<PostResponse> getAllPosts(Pageable pageable) {
        log.info("Fetching all posts page: {} (cache miss)", pageable.getPageNumber());
        return postRepository.findAll(pageable).map(postMapper::toPostResponse);
    }

    /**
     * Search posts by title - Cacheable
     */
    @Override
    @Cacheable(value = "searchResults",
            key = "'title:' + #keyword + ':' + #pageable.pageNumber")
    public Page<PostResponse> searchPostResponsesByTitle(String keyword, Pageable pageable) {
        log.info("Searching posts by title: {} (cache miss)", keyword);
        return postRepository.findAllByTitleContainingIgnoreCase(keyword, pageable)
                .map(postMapper::toPostResponse);
    }

    /**
     * Get post by ID - Cacheable
     */
    @Override
    @Cacheable(value = "posts", key = "#id", unless = "#result == null")
    public PostResponse getPostById(Long id) {
        log.info("Fetching post by ID: {} (cache miss)", id);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + id));
        return postMapper.toPostResponse(post);
    }

    /**
     * Get post by slug - Cacheable
     */
    @Override
    @Cacheable(value = "postBySlug", key = "#slug", unless = "#result == null")
    public PostResponse getPostBySlug(String slug) {
        log.info("Fetching post by slug: {} (cache miss)", slug);
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Not found post has slug: " + slug));
        return postMapper.toPostResponse(post);
    }

    /**
     * Get posts by category - Cacheable
     */
    @Override
    @Cacheable(value = "posts", key = "'category:' + #categoryId")
    public List<PostResponse> getPostsByCategory(Long categoryId) {
        log.info("Fetching posts by category: {} (cache miss)", categoryId);
        return postRepository.findByCategoryId(categoryId).stream()
                .map(postMapper::toPostResponse)
                .toList();
    }

    /**
     * Get posts by author - Cacheable
     */
    @Override
    @Cacheable(value = "posts", key = "'author:' + #authorId")
    public List<PostResponse> getPostsByAuthor(Long authorId) {
        log.info("Fetching posts by author: {} (cache miss)", authorId);
        return postRepository.findByAuthorId(authorId).stream()
                .map(postMapper::toPostResponse)
                .toList();
    }

    /**
     * Get posts by status - Not cached (admin only, changes frequently)
     */
    @Override
    public List<PostResponse> getPostsByStatus(String status) {
        log.info("Fetching posts by status: {}", status);
        return postRepository.findByStatus(status).stream()
                .map(postMapper::toPostResponse)
                .toList();
    }

    /**
     * Update post - Evict related caches
     */
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "posts", key = "#id"),
            @CacheEvict(value = "posts", allEntries = true),
            @CacheEvict(value = "postBySlug", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    public PostResponse updatePost(Long id, PostRequest request) throws IOException {
        log.info("Updating post ID: {}", id);

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found post has ID: " + id));

        if (StringUtils.hasText(request.getTitle())) {
            post.setTitle(request.getTitle());
        }

        if (StringUtils.hasText(request.getSlug())) {
            post.setSlug(request.getSlug());
        }

        if (StringUtils.hasText(request.getContent())) {
            String sanitizedContent = htmlSanitizer.sanitize(request.getContent());
            post.setContent(sanitizedContent);
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

        Post updated = postRepository.save(post);
        log.info("Post updated: {}", updated.getId());

        // Update Elasticsearch
        PostResponse response = postMapper.toPostResponse(updated);
        PostDocument document = PostDocument.builder()
                .id(updated.getId())
                .title(updated.getTitle())
                .name(updated.getName())
                .content(updated.getContent())
                .slug(updated.getSlug())
                .thumbnail_url(response.getThumbnail_url())
                .build();

        postSearchRepository.save(document);

        if (updated.getThumbnail() != null) {
            response.setThumbnail_url(updated.getThumbnail().getUrl());
        }

        return response;
    }

    /**
     * Delete post - Evict all related caches
     */
    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "posts", key = "#id"),
            @CacheEvict(value = "posts", allEntries = true),
            @CacheEvict(value = "postBySlug", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    public void deletePost(Long id) {
        log.info("Deleting post ID: {}", id);

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found post has ID: " + id));

        postRepository.delete(post);
        postSearchRepository.deleteById(post.getId());

        log.info("Post deleted: {}", id);
    }
}
