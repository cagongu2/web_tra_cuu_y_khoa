package com.cagongu2.be.interceptor;

import com.cagongu2.be.context.RequestContextInfo;
import com.cagongu2.be.context.RequestContextService;
import com.cagongu2.be.service.AsyncAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuditInterceptor implements HandlerInterceptor {

    private final AsyncAuditService asyncAuditService;
    private final RequestContextService requestContextService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {

        // Only log authenticated requests to sensitive endpoints
        if (shouldAudit(request)) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                String method = request.getMethod();
                String uri = request.getRequestURI();

                // Async logging to not block request
                try {
                    RequestContextInfo ctx = requestContextService.getInfo();
                    asyncAuditService.logApiAccess(
                            method,
                            uri,
                            ctx.getUserId(),
                            ctx.getUsername(),
                            ctx.getIp(),
                            ctx.getUserAgent()
                    );
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
}