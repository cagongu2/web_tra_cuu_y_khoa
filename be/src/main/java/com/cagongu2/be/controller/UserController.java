package com.cagongu2.be.controller;

import com.cagongu2.be.dto.user.request.UserRequest;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;

    /**
     * Create user - Admin only
     */
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @ModelAttribute UserRequest request) throws IOException {
        return ResponseEntity.ok(userService.createUser(request));
    }

    /**
     * Update user - Self or Admin
     */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("@userSecurity.isSelfOrAdmin(#id)")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable @Min(1) Long id,
            @Valid @ModelAttribute UserRequest request) throws IOException {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /**
     * Get user by ID - Self or Admin
     */
    @GetMapping("/{id}")
    @PreAuthorize("@userSecurity.isSelfOrAdmin(#id)")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Get user by username - Admin only
     */
    @GetMapping("/by-username/{username}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<UserResponse> getUserByUsername(
            @PathVariable @Pattern(regexp = "^[a-zA-Z0-9_]+$") String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    /**
     * Get user by email - Admin only
     */
    @GetMapping("/by-email/{email}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<UserResponse> getUserByEmail(
            @PathVariable @Email String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    /**
     * Check if username exists - Public for registration validation
     */
    @GetMapping("/exists/username/{username}")
    public ResponseEntity<Boolean> existsByUsername(
            @PathVariable @Pattern(regexp = "^[a-zA-Z0-9_]+$") String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    /**
     * Check if email exists - Public for registration validation
     */
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> existsByEmail(
            @PathVariable @Email String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * Get all users - Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
