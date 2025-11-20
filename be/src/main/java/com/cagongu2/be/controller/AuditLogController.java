package com.cagongu2.be.controller;

import com.cagongu2.be.model.AuditLog;
import com.cagongu2.be.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')")
public class AuditLogController {
    private final AuditLogRepository auditLogRepository;

    /**
     * Get all audit logs with pagination
     */
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(
                page, size, Sort.by("timestamp").descending()
        );

        return ResponseEntity.ok(auditLogRepository.findAll(pageable));
    }

    /**
     * Get audit logs for specific entity
     */
    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByEntity(
            @PathVariable String type,
            @PathVariable Long id) {

        return ResponseEntity.ok(
                auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(type, id)
        );
    }

    /**
     * Get audit logs by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable)
        );
    }

    /**
     * Get audit logs by action
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByAction(
            @PathVariable String action) {

        return ResponseEntity.ok(
                auditLogRepository.findByActionOrderByTimestampDesc(action)
        );
    }

    /**
     * Get audit logs in date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<AuditLog>> getAuditLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);

        return ResponseEntity.ok(
                auditLogRepository.findByDateRange(start, end)
        );
    }
}
