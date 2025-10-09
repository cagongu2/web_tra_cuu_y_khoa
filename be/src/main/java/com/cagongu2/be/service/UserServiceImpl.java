package com.cagongu2.be.service;

import com.cagongu2.be.dto.user.request.UserRequest;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.mapper.UserMapper;
import com.cagongu2.be.model.Image;
import com.cagongu2.be.model.User;
import com.cagongu2.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) throws IOException {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Image image = null;

        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String avatar_url = fileUploadService.uploadFile(request.getFile(), "avatar");

            image = Image.builder()
                    .url(avatar_url)
                    .type("thumbnail")
                    .build();
        }


        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .isActive(true)
                .avatar(image)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        var saved = userRepository.save(user);

        UserResponse response = userMapper.toUserResponse(saved);
        if (image != null) {
            response.setAvatar_url(image.getUrl());
        }

        return response;
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null) user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        if (request.getFile() != null && !request.getFile().isEmpty()) {
            String avatarUrl = fileUploadService.uploadFile(request.getFile(), "avatar");
            Image newImage = Image.builder()
                    .url(avatarUrl)
                    .type("avatar")
                    .build();
            user.setAvatar(newImage);
        }

        user.setUpdatedAt(LocalDateTime.now());

        var updated = userRepository.save(user);

        UserResponse response = userMapper.toUserResponse(updated);
        if (updated.getAvatar() != null) {
            response.setAvatar_url(updated.getAvatar().getUrl());
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }


    @Override
    public UserResponse getUserById(Long id) {
        return userMapper.toUserResponse(userRepository.findById(id).orElseThrow(() -> new RuntimeException("User has id: " + id + " not found")));
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return userMapper.toUserResponse(userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User has username: " + username + " not found")));

    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return userMapper.toUserResponse(userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User has email: " + email + " not found")));
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }
}
