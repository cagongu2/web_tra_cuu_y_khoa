package com.cagongu2.be.service;

public interface AsyncAuditService {
    void logAudit(String entityType, Long entityId, String action,
                  Long userId, String username, String oldValue,
                  String newValue, String ipAddress, String userAgent);

    void logApiAccess(String method, String uri, Long userId,
                      String username, String ipAddress, String userAgent);
}
