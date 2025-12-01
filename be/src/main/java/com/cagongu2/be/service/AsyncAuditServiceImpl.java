package com.cagongu2.be.service;

import com.cagongu2.be.model.AuditLog;
import com.cagongu2.be.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncAuditServiceImpl implements AsyncAuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log audit asynchronously to not block main request
     */
    @Override
    @Async("taskExecutor")
    @Transactional
    public void logAudit(String entityType, Long entityId, String action, Long userId, String username, String oldValue, String newValue, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .action(action)
                    .userId(userId)
//                    .username(username)
                    .timestamp(LocalDateTime.now())
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: {} {} by user {}", action, entityType, userId);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    /**
     * Log API access asynchronously
     */
    @Override
    @Async("taskExecutor")
    @Transactional
    public void logApiAccess(String method, String uri, Long userId, String username, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType("API_ACCESS")
                    .entityId(0L)
                    .action(method)
                    .userId(userId)
//                    .username(username)
                    .timestamp(LocalDateTime.now())
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .changesSummary(method + " " + uri)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to log API access", e);
        }
    }
}
