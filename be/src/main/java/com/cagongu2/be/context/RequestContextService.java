package com.cagongu2.be.context;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Slf4j
public class RequestContextService {
    public RequestContextInfo getInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Long userId = null;
        String username = "anonymous";

        if (auth != null && auth.isAuthenticated()) {
            try {
                userId = Long.parseLong(auth.getName());
                username = auth.getPrincipal().toString();
            } catch (Exception e) {
                log.error("Failed to read authentication info", e);
            }
        }

        return new RequestContextInfo(
                userId,
                username,
                getClientIP(),
                getUserAgent()
        );
    }

    private String getClientIP() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) return "unknown";

        HttpServletRequest request = attributes.getRequest();
        String xfHeader = request.getHeader("X-Forwarded-For");

        return (xfHeader != null) ? xfHeader.split(",")[0] : request.getRemoteAddr();
    }

    private String getUserAgent() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) return "unknown";

        return attributes.getRequest().getHeader("User-Agent");
    }

    public String toJson(Object obj) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Failed to convert to JSON", e);
            return "{}";
        }
    }
}
