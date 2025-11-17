package com.cagongu2.be.interceptor;

import com.cagongu2.be.model.AuditLog;
import com.cagongu2.be.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuditInterceptor implements HandlerInterceptor {

    private final AuditLogRepository auditLogRepository;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        // Only log authenticated requests to sensitive endpoints
        if (shouldAudit(request)) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                String userId = authentication.getName();
                String username = authentication.getPrincipal().toString();
                String method = request.getMethod();
                String uri = request.getRequestURI();
                String ipAddress = getClientIP(request);
                String userAgent = request.getHeader("User-Agent");

                // Async logging to not block request
                try {
                    AuditLog auditLog = AuditLog.builder()
                            .entityType("API_ACCESS")
                            .entityId(0L)
                            .action(method)
                            .userId(Long.parseLong(userId))
                            .username(username)
                            .timestamp(LocalDateTime.now())
                            .ipAddress(ipAddress)
                            .userAgent(userAgent)
                            .changesSummary(method + " " + uri)
                            .build();

                    auditLogRepository.save(auditLog);
                } catch (Exception e) {
                    log.error("Failed to log audit", e);
                }
            }
        }

        return true;
    }

    /**
     * Determine if request should be audited
     */
    private boolean shouldAudit(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Audit all write operations
        if ("POST".equals(method) || "PUT".equals(method) || "DELETE".equals(method)) {
            return true;
        }

        // Audit sensitive read operations
        return uri.contains("/api/users") ||
                uri.contains("/api/footers") ||
                uri.contains("/api/upload");
    }

    /**
     * Get client IP address
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}