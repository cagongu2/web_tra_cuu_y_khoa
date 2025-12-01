package com.cagongu2.be.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Component("customDiskSpace")
@Slf4j
public class DiskSpaceHealthIndicator implements HealthIndicator {

    @Value("${upload.base-path:/var/www/uploads}")
    private String uploadPath;

    private static final long THRESHOLD_BYTES = 1024L * 1024L * 1024L * 10L; // 10GB

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();

            File uploadDir = new File(uploadPath);

            long totalSpace = uploadDir.getTotalSpace();
            long freeSpace = uploadDir.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;

            details.put("total", formatSize(totalSpace));
            details.put("free", formatSize(freeSpace));
            details.put("used", formatSize(usedSpace));
            details.put("threshold", formatSize(THRESHOLD_BYTES));
            details.put("path", uploadPath);

            if (freeSpace < THRESHOLD_BYTES) {
                log.warn("Low disk space: {} free", formatSize(freeSpace));
                return Health.down()
                        .withDetails(details)
                        .withDetail("warning", "Disk space below threshold")
                        .build();
            }

            return Health.up().withDetails(details).build();

        } catch (Exception e) {
            log.error("Disk space health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.2f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}