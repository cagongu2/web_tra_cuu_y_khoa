package com.cagongu2.be.repository;

import com.cagongu2.be.model.Footer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FooterRepository extends JpaRepository<Footer, Long> {
    @Query("SELECT f FROM Footer f LEFT JOIN FETCH f.postList WHERE f.isActive = :isActive")
    List<Footer> findByIsActiveWithPosts(Boolean isActive);

    @Query("SELECT f FROM Footer f LEFT JOIN FETCH f.postList")
    List<Footer> findAllWithPosts();

    @Query("SELECT f FROM Footer f LEFT JOIN FETCH f.postList WHERE f.id = :id")
    Optional<Footer> findByIdWithPosts(@Param("id") Long id);
}
