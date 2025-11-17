package com.cagongu2.be.service;

import com.cagongu2.be.dto.footer.request.FooterRequest;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import com.cagongu2.be.mapper.FooterMapper;
import com.cagongu2.be.model.Footer;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.repository.FooterRepository;
import com.cagongu2.be.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FooterServiceImpl implements FooterService {

    private final FooterMapper footerMapper;
    private final FooterRepository footerRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    @CacheEvict(value = "footers", allEntries = true)
    public FooterResponse createFooter(FooterRequest request) {
        log.info("Creating new footer");

        Footer footer = footerMapper.toEntity(request);

        var listPostId = request.getPostIds();
        if (listPostId != null && !listPostId.isEmpty()) {
            List<Post> posts = validateAndGetPosts(listPostId);
            addPostsToFooter(footer, posts);
        }

        Footer savedFooter = footerRepository.save(footer);
        log.info("Footer created with ID: {}", savedFooter.getId());

        return footerMapper.toResponse(savedFooter);
    }

    @Override
    @Transactional
    @CacheEvict(value = "footers", allEntries = true)
    public FooterResponse updateFooter(Long id, FooterRequest request) {
        log.info("Updating footer ID: {}", id);

        Footer existingFooter = footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id));

        footerMapper.updateEntityFromRequest(request, existingFooter);
        updatePostList(existingFooter, request.getPostIds());

        Footer updatedFooter = footerRepository.save(existingFooter);
        log.info("Footer updated: {}", updatedFooter.getId());

        return footerMapper.toResponse(updatedFooter);
    }

    private void updatePostList(Footer footer, List<Long> newPostIds) {
        if (newPostIds == null) {
            return;
        }

        List<Post> currentPosts = footer.getPostList();
        Set<Long> currentPostIds = currentPosts.stream()
                .map(Post::getId)
                .collect(Collectors.toSet());

        Set<Long> newPostIdsSet = new HashSet<>(newPostIds);

        // Remove posts not in new list
        List<Post> postsToRemove = currentPosts.stream()
                .filter(post -> !newPostIdsSet.contains(post.getId()))
                .toList();

        removePostsFromFooter(footer, postsToRemove);

        // Add new posts
        Set<Long> postsToAddIds = newPostIdsSet.stream()
                .filter(postId -> !currentPostIds.contains(postId))
                .collect(Collectors.toSet());

        if (!postsToAddIds.isEmpty()) {
            List<Post> postsToAdd = validateAndGetPosts(new ArrayList<>(postsToAddIds));
            addPostsToFooter(footer, postsToAdd);
        }
    }

    private List<Post> validateAndGetPosts(List<Long> postIds) {
        List<Post> posts = postRepository.findAllById(postIds);

        if (posts.size() != postIds.size()) {
            Set<Long> foundIds = posts.stream()
                    .map(Post::getId)
                    .collect(Collectors.toSet());
            List<Long> missingIds = postIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new RuntimeException("Posts not found with ids: " + missingIds);
        }

        return posts;
    }

    private void addPostsToFooter(Footer footer, List<Post> posts) {
        posts.forEach(post -> {
            post.setFooter(footer);
            footer.getPostList().add(post);
        });
    }

    private void removePostsFromFooter(Footer footer, List<Post> posts) {
        posts.forEach(post -> {
            post.setFooter(null);
            footer.getPostList().remove(post);
        });
    }

    /**
     * Get all footers - Cacheable
     */
    @Override
    @Cacheable(value = "footers", key = "'all'")
    public List<FooterResponse> getAllFooter() {
        log.info("Fetching all footers (cache miss)");
        return footerRepository.findAll().stream()
                .map(footerMapper::toResponse)
                .toList();
    }

    /**
     * Get footer by ID - Cacheable
     */
    @Override
    @Cacheable(value = "footers", key = "#id")
    public FooterResponse getFooterById(Long id) {
        log.info("Fetching footer by ID: {} (cache miss)", id);
        return footerMapper.toResponse(footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id)));
    }

    /**
     * Get footer by status - Cacheable
     */
    @Override
    @Cacheable(value = "footers", key = "'status:' + #isActive")
    public List<FooterResponse> getFooterByStatus(Boolean isActive) {
        log.info("Fetching footers by status: {} (cache miss)", isActive);
        return footerRepository.findByIsActive(isActive).stream()
                .map(footerMapper::toResponse)
                .toList();
    }

    /**
     * Delete footer - Evict cache
     */
    @Override
    @Transactional
    @CacheEvict(value = "footers", allEntries = true)
    public void deleteFooter(Long id) {
        log.info("Deleting footer ID: {}", id);
        Footer footer = footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id));
        footerRepository.delete(footer);
    }
}
