package com.cagongu2.be.security;

import com.cagongu2.be.model.Post;
import com.cagongu2.be.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("postSecurity")
@RequiredArgsConstructor
public class PostSecurityService {
    private final PostRepository postRepository;

    /**
     * Check if current user is the author of the post
     */
    public boolean isAuthor(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userId = authentication.getName(); // Subject from JWT

        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            return false;
        }

        return post.getAuthor().getId().toString().equals(userId);
    }

    /**
     * Check if current user can edit the post
     * (either author or admin)
     */
    public boolean canEdit(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Check if user is admin
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin"));

        if (isAdmin) {
            return true;
        }

        // Check if user is author
        return isAuthor(postId);
    }

    /**
     * Check if current user can delete the post
     */
    public boolean canDelete(Long postId) {
        // Only admin can delete posts
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin"));
    }
}
