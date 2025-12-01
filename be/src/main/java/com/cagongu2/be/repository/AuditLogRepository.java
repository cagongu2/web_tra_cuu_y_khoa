package com.cagongu2.be.repository;

import com.cagongu2.be.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by entity type and ID
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(
            String entityType, Long entityId);

    /**
     * Find audit logs by user ID
     */
    Page<AuditLog> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);

    /**
     * Find audit logs by action
     */
    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    /**
     * Find audit logs within date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate " +
            "ORDER BY a.timestamp DESC")
    List<AuditLog> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Find recent audit logs for a specific entity
     */
    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :entityType " +
            "AND a.entityId = :entityId ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentByEntity(
            @Param("entityType") String entityType,
            @Param("entityId") Long entityId,
            Pageable pageable);
}