package com.cagongu2.be.service;

import com.cagongu2.be.dto.footer.request.FooterRequest;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import com.cagongu2.be.mapper.FooterMapper;
import com.cagongu2.be.model.Footer;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.repository.FooterRepository;
import com.cagongu2.be.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FooterServiceImpl implements FooterService {
    private final FooterMapper footerMapper;
    private final FooterRepository footerRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public FooterResponse createFooter(FooterRequest request) {
        Footer footer = footerMapper.toEntity(request);

        var listPostId = request.getPostIds();

        if (listPostId != null && !listPostId.isEmpty()) {
            List<Post> posts = validateAndGetPosts(listPostId);
            addPostsToFooter(footer, posts);
        }

        Footer savedFooter = footerRepository.save(footer);
        return footerMapper.toResponse(savedFooter);
    }

    @Override
    @Transactional
    public FooterResponse updateFooter(Long id, FooterRequest request) {
        Footer existingFooter = footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id));

        footerMapper.updateEntityFromRequest(request, existingFooter);
        updatePostList(existingFooter, request.getPostIds());

        Footer updatedFooter = footerRepository.save(existingFooter);
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

    @Override
    public List<FooterResponse> getAllFooter() {
        return footerRepository.findAll().stream().map(footerMapper::toResponse).toList();
    }

    @Override
    public FooterResponse getFooterById(Long id) {
        return footerMapper.toResponse(footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id)));
    }

    @Override
    public List<FooterResponse> getFooterByStatus(Boolean isActive) {
        return footerRepository.findByIsActive(isActive).stream()
                .map(footerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteFooter(Long id) {
        Footer footer = footerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Footer not found with id: " + id));
        footerRepository.delete(footer);
    }
}
