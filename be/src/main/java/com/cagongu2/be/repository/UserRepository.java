package com.cagongu2.be.repository;

import com.cagongu2.be.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find by username with roles eagerly loaded (fix N+1)
     */
    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsername(String username);

    /**
     * Find by email with roles eagerly loaded
     */
    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByEmail(String email);

    /**
     * Find by ID with all relationships loaded
     */
    @EntityGraph(attributePaths = {"posts", "avatar", "roles"})
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findWithDetailsById(Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    /**
     * Find all users with roles (for admin listing)
     */
    @EntityGraph(attributePaths = {"roles"})
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    java.util.List<User> findAllWithRoles();
}