package com.cagongu2.be.scheduler;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class MetricsReportScheduler {

    private final MeterRegistry meterRegistry;

    /**
     * Generate daily metrics report
     */
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    public void generateDailyReport() {
        log.info("=== DAILY METRICS REPORT ===");
        log.info("Date: {}", LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        // Posts metrics
        logMetric("posts.created", "Posts Created");
        logMetric("posts.updated", "Posts Updated");
        logMetric("posts.deleted", "Posts Deleted");

        // User metrics
        logMetric("users.registered", "Users Registered");

        // Authentication metrics
        logMetric("auth.login.attempts", "Login Attempts");
        logMetric("auth.login.success", "Successful Logins");
        logMetric("auth.login.failure", "Failed Logins");

        // File upload metrics
        logMetric("files.uploaded", "Files Uploaded");
        logMetric("files.upload.errors", "File Upload Errors");

        // Cache metrics
        logMetric("cache.hits", "Cache Hits");
        logMetric("cache.misses", "Cache Misses");

        // HTTP metrics
        logHttpMetrics();

        // Search metrics
        logTimerMetrics("posts.search.time", "Post Search Time");

        log.info("============================");
    }

    /**
     * Log counter metric
     */
    private void logMetric(String metricName, String displayName) {
        Counter counter = meterRegistry.find(metricName).counter();
        if (counter != null) {
            log.info("{}: {}", displayName, (long) counter.count());
        }
    }

    /**
     * Log timer metrics
     */
    private void logTimerMetrics(String metricName, String displayName) {
        Timer timer = meterRegistry.find(metricName).timer();
        if (timer != null) {
            log.info("{} - Count: {}, Avg: {}ms, Max: {}ms",
                    displayName,
                    timer.count(),
                    (long) timer.mean(TimeUnit.MILLISECONDS),
                    (long) timer.max(TimeUnit.MILLISECONDS));
        }
    }

    /**
     * Log HTTP metrics
     */
    private void logHttpMetrics() {
        meterRegistry.find("http.server.requests").timers().forEach(timer -> {
            String uri = timer.getId().getTag("uri");
            String status = timer.getId().getTag("status");

            if (uri != null && !uri.startsWith("/actuator")) {
                log.info("HTTP {} [{}] - Count: {}, Avg: {}ms",
                        uri,
                        status,
                        timer.count(),
                        (long) timer.mean(TimeUnit.MILLISECONDS));
            }
        });
    }

    /**
     * Generate hourly summary
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void generateHourlySummary() {
        log.debug("=== HOURLY METRICS SUMMARY ===");

        // Check for anomalies
        checkErrorRate();
        checkSlowRequests();
        checkCacheEfficiency();

        log.debug("==============================");
    }

    /**
     * Check error rate
     */
    private void checkErrorRate() {
        long totalRequests = 0;
        long errorRequests = 0;

        for (Timer timer : meterRegistry.find("http.server.requests").timers()) {
            String status = timer.getId().getTag("status");
            long count = timer.count();

            totalRequests += count;

            if (status != null && (status.startsWith("4") || status.startsWith("5"))) {
                errorRequests += count;
            }
        }

        if (totalRequests > 0) {
            double errorRate = (double) errorRequests / totalRequests * 100;
            String formattedErrorRate = String.format("%.2f", errorRate);

            log.debug("Error Rate: {}% ({}/{})", formattedErrorRate, errorRequests, totalRequests);

            if (errorRate > 5.0) {
                log.warn("HIGH ERROR RATE DETECTED: {}%", formattedErrorRate);
            }
        }
    }

    /**
     * Check for slow requests
     */
    private void checkSlowRequests() {
        meterRegistry.find("http.server.requests").timers().forEach(timer -> {
            double avgTime = timer.mean(TimeUnit.MILLISECONDS);
            String uri = timer.getId().getTag("uri");

            if (avgTime > 1000 && uri != null && !uri.startsWith("/actuator")) {
                log.warn("SLOW ENDPOINT DETECTED: {} - Avg: {}ms", uri, (long) avgTime);
            }
        });
    }

    /**
     * Check cache efficiency
     */
    private void checkCacheEfficiency() {
        Counter hits = meterRegistry.find("cache.hits").counter();
        Counter misses = meterRegistry.find("cache.misses").counter();

        if (hits != null && misses != null) {
            double hitCount = hits.count();
            double missCount = misses.count();
            double total = hitCount + missCount;

            if (total > 0) {
                double hitRate = (hitCount / total) * 100;
                String formattedHitRate = String.format("%.2f", hitRate);

                log.debug("Cache Hit Rate: {}%", formattedHitRate);

                if (hitRate < 50.0) {
                    log.warn("LOW CACHE HIT RATE: {}%", formattedHitRate);
                }
            }
        }
    }
}
