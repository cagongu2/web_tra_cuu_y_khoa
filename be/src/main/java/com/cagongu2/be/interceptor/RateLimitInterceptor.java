package com.cagongu2.be.interceptor;

import com.cagongu2.be.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    // Store buckets per IP address
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Rate limits
    private static final int REQUESTS_PER_MINUTE = 60;
    private static final int REQUESTS_PER_HOUR = 1000;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String ip = getClientIP(request);
        Bucket bucket = resolveBucket(ip);

        if (bucket.tryConsume(1)) {
            return true;
        } else {
            log.warn("Rate limit exceeded for IP: {}", ip);
            throw new RateLimitExceededException(
                    "Rate limit exceeded. Please try again later.");
        }
    }

    /**
     * Get or create bucket for IP address
     */
    private Bucket resolveBucket(String ip) {
        return buckets.computeIfAbsent(ip, k -> createNewBucket());
    }

    /**
     * Create new bucket with rate limits
     */
    private Bucket createNewBucket() {
        // 60 requests per minute
        Bandwidth minuteLimit = Bandwidth.classic(
                REQUESTS_PER_MINUTE,
                Refill.intervally(REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
        );

        // 1000 requests per hour
        Bandwidth hourLimit = Bandwidth.classic(
                REQUESTS_PER_HOUR,
                Refill.intervally(REQUESTS_PER_HOUR, Duration.ofHours(1))
        );

        return Bucket.builder()
                .addLimit(minuteLimit)
                .addLimit(hourLimit)
                .build();
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