package com.cagongu2.be.service;

import com.cagongu2.be.dto.UserDTO;
import com.cagongu2.be.model.User;

import java.util.List;

public interface UserService {
    User createUser(UserDTO userDTO);

    User updateUser(Long id, UserDTO userDTO);

    User getUserById(Long id);

    User getUserByUsername(String username);

    User getUserByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> getAllUsers();
}
