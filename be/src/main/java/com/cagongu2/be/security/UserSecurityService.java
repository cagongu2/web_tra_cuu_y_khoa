package com.cagongu2.be.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("userSecurity")
@RequiredArgsConstructor
public class UserSecurityService {

    /**
     * Check if current user is accessing their own data
     */
    public boolean isSelfOrAdmin(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUserId = authentication.getName();

        // Check if admin
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin"));

        // Allow if admin or accessing own data
        return isAdmin || currentUserId.equals(userId.toString());
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_admin"));
    }
}