package com.cagongu2.be.controller;

import com.cagongu2.be.dto.user.request.UserRequest;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<UserResponse> createUser(@ModelAttribute UserRequest request) throws IOException {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @ModelAttribute UserRequest request) throws IOException {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/exists/username/{username}")
    public ResponseEntity<Boolean> existsByUsername(@PathVariable String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> existsByEmail(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
