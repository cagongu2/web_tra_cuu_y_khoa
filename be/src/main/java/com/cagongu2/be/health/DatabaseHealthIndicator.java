package com.cagongu2.be.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("customDatabase")
@RequiredArgsConstructor
@Slf4j
public class DatabaseHealthIndicator implements HealthIndicator {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();

            // Check database connection
            Long result = jdbcTemplate.queryForObject("SELECT 1", Long.class);

            if (result != null && result == 1L) {
                // Get additional database stats
                details.put("database", "MySQL");
                details.put("status", "UP");

                // Get table counts
                try {
                    Long postCount = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM posts WHERE deleted_at IS NULL", Long.class);
                    Long userCount = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM users WHERE deleted_at IS NULL", Long.class);
                    Long categoryCount = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM categories WHERE deleted_at IS NULL", Long.class);

                    details.put("postsCount", postCount);
                    details.put("usersCount", userCount);
                    details.put("categoriesCount", categoryCount);
                } catch (Exception e) {
                    log.warn("Failed to get table counts", e);
                }

                return Health.up().withDetails(details).build();
            } else {
                return Health.down()
                        .withDetail("error", "Database query returned unexpected result")
                        .build();
            }
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}