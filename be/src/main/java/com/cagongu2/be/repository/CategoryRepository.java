package com.cagongu2.be.repository;

import com.cagongu2.be.dto.CategoryFlatDTO;
import com.cagongu2.be.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Category c WHERE c.level = :level")
    List<Category> findByLevel(@Param("level") int level);

    @Query("SELECT new com.cagongu2.be.dto.CategoryFlatDTO(c.id, c.name) FROM Category c")
    List<CategoryFlatDTO> findAllFlat();

}