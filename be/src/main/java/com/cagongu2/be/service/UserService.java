package com.cagongu2.be.service;

import com.cagongu2.be.dto.user.request.UserRequest;
import com.cagongu2.be.dto.user.response.UserResponse;

import java.io.IOException;
import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request) throws IOException;

    UserResponse  updateUser(Long id, UserRequest request) throws IOException;

    UserResponse  getUserById(Long id);

    UserResponse  getUserByUsername(String username);

    UserResponse  getUserByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<UserResponse > getAllUsers();
}
