package com.cagongu2.be.scheduler;

import com.cagongu2.be.service.AlertingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class HealthCheckScheduler {

    private final Map<String, HealthIndicator> healthIndicators;
    private final AlertingService alertingService;

    /**
     * Check all health indicators every 5 minutes
     */
    @Scheduled(fixedRate = 300000, initialDelay = 60000) // 5 minutes
    public void checkSystemHealth() {
        log.debug("Running scheduled health check...");

        healthIndicators.forEach((name, indicator) -> {
            try {
                Health health = indicator.health();

                if (health.getStatus().getCode().equals("DOWN")) {
                    log.error("Health check FAILED: {} - Status: {}",
                            name, health.getStatus());

                    alertingService.sendCriticalAlert(
                            "Health Check Failed: " + name,
                            "Details: " + health.getDetails().toString(),
                            null
                    );
                } else if (health.getStatus().getCode().equals("OUT_OF_SERVICE")) {
                    log.warn("Health check OUT_OF_SERVICE: {}", name);

                    alertingService.sendWarningAlert(
                            "Service Out of Service: " + name,
                            "Details: " + health.getDetails().toString()
                    );
                } else {
                    log.debug("Health check PASSED: {} - Status: {}",
                            name, health.getStatus());
                }

            } catch (Exception e) {
                log.error("Error checking health indicator: {}", name, e);

                alertingService.sendCriticalAlert(
                        "Health Check Error: " + name,
                        "Failed to execute health check",
                        e
                );
            }
        });

        log.debug("Scheduled health check completed");
    }

    /**
     * Check disk space every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void checkDiskSpace() {
        HealthIndicator diskSpaceIndicator = healthIndicators.get("customDiskSpace");

        if (diskSpaceIndicator != null) {
            Health health = diskSpaceIndicator.health();

            if (health.getStatus().getCode().equals("DOWN")) {
                Map<String, Object> details = health.getDetails();
                String free = (String) details.get("free");
                String path = (String) details.get("path");

                alertingService.alertLowDiskSpace(
                        parseSizeToGB(free),
                        path
                );
            }
        }
    }

    /**
     * Parse size string to GB
     */
    private long parseSizeToGB(String sizeStr) {
        if (sizeStr == null) return 0;

        try {
            if (sizeStr.contains("GB")) {
                return (long) Double.parseDouble(sizeStr.replace(" GB", ""));
            } else if (sizeStr.contains("MB")) {
                return (long) (Double.parseDouble(sizeStr.replace(" MB", "")) / 1024);
            }
        } catch (NumberFormatException e) {
            log.error("Failed to parse size: {}", sizeStr);
        }

        return 0;
    }
}