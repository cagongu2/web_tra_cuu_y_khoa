package com.cagongu2.be.repository;

import com.cagongu2.be.model.Footer;
import org.mapstruct.Mapper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FooterRepository extends JpaRepository<Footer, Long> {
    List<Footer> findByIsActive(Boolean isActive);
}
