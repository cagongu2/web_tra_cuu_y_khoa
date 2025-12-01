package com.cagongu2.be.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.header.HeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityHeadersConfig {

    /**
     * Add security headers to all responses
     */
    @Bean
    public List<HeaderWriter> securityHeaders() {
        return Arrays.asList(
                // Prevent clickjacking
                new StaticHeadersWriter("X-Frame-Options", "DENY"),

                // Prevent MIME sniffing
                new StaticHeadersWriter("X-Content-Type-Options", "nosniff"),

                // Enable XSS protection
                new StaticHeadersWriter("X-XSS-Protection", "1; mode=block"),

                // Referrer policy
                new StaticHeadersWriter("Referrer-Policy", "strict-origin-when-cross-origin"),

                // Content Security Policy
                new StaticHeadersWriter("Content-Security-Policy",
                        "default-src 'self'; " +
                                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                                "style-src 'self' 'unsafe-inline'; " +
                                "img-src 'self' data: https:; " +
                                "font-src 'self' data:; " +
                                "connect-src 'self'"),

                // Strict Transport Security (HTTPS only)
                new StaticHeadersWriter("Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains"),

                // Permissions Policy
                new StaticHeadersWriter("Permissions-Policy",
                        "geolocation=(), microphone=(), camera=()")
        );
    }
}