package com.cagongu2.be.controller;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/admin/monitoring")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')")
public class MonitoringController {

    private final MeterRegistry meterRegistry;
    private final Map<String, HealthIndicator> healthIndicators;

    /**
     * Get overall system status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        // Health status
        Map<String, String> healthStatus = new HashMap<>();
        healthIndicators.forEach((name, indicator) -> {
            Health health = indicator.health();
            healthStatus.put(name, health.getStatus().getCode());
        });
        status.put("health", healthStatus);

        // Metrics summary
        status.put("metrics", getMetricsSummary());

        return ResponseEntity.ok(status);
    }

    /**
     * Get metrics summary
     */
    @GetMapping("/metrics/summary")
    public ResponseEntity<Map<String, Object>> getMetricsSummaryFromApplication() {
        return ResponseEntity.ok(getMetricsSummary());
    }

    /**
     * Get HTTP metrics
     */
    @GetMapping("/metrics/http")
    public ResponseEntity<Map<String, Object>> getHttpMetrics() {
        Map<String, Object> httpMetrics = new HashMap<>();

        meterRegistry.find("http.server.requests").timers().forEach(timer -> {
            String uri = timer.getId().getTag("uri");
            String method = timer.getId().getTag("method");
            String status = timer.getId().getTag("status");

            if (uri != null && !uri.startsWith("/actuator")) {
                String key = method + " " + uri + " [" + status + "]";

                Map<String, Object> metrics = new HashMap<>();
                metrics.put("count", timer.count());
                metrics.put("avgTime", (long) timer.mean(TimeUnit.MILLISECONDS));
                metrics.put("maxTime", (long) timer.max(TimeUnit.MILLISECONDS));
                metrics.put("totalTime", (long) timer.totalTime(TimeUnit.MILLISECONDS));

                httpMetrics.put(key, metrics);
            }
        });

        return ResponseEntity.ok(httpMetrics);
    }

    /**
     * Get cache metrics
     */
    @GetMapping("/metrics/cache")
    public ResponseEntity<Map<String, Object>> getCacheMetrics() {
        Map<String, Object> cacheMetrics = new HashMap<>();

        Counter hits = meterRegistry.find("cache.hits").counter();
        Counter misses = meterRegistry.find("cache.misses").counter();

        if (hits != null && misses != null) {
            double hitCount = hits.count();
            double missCount = misses.count();
            double total = hitCount + missCount;

            cacheMetrics.put("hits", (long) hitCount);
            cacheMetrics.put("misses", (long) missCount);
            cacheMetrics.put("total", (long) total);

            if (total > 0) {
                cacheMetrics.put("hitRate", (hitCount / total) * 100);
            } else {
                cacheMetrics.put("hitRate", 0.0);
            }
        }

        return ResponseEntity.ok(cacheMetrics);
    }

    /**
     * Get database metrics
     */
    @GetMapping("/metrics/database")
    public ResponseEntity<Map<String, Object>> getDatabaseMetrics() {
        Map<String, Object> dbMetrics = new HashMap<>();

        // Get HikariCP metrics
        meterRegistry.find("hikari.connections").gauges().forEach(gauge -> {
            String pool = gauge.getId().getTag("pool");
            String state = gauge.getId().getTag("state");

            if (pool != null && state != null) {
                String key = pool + "." + state;
                dbMetrics.put(key, (long) gauge.value());
            }
        });

        return ResponseEntity.ok(dbMetrics);
    }

    /**
     * Get JVM metrics
     */
    @GetMapping("/metrics/jvm")
    public ResponseEntity<Map<String, Object>> getJvmMetrics() {
        Map<String, Object> jvmMetrics = new HashMap<>();

        // Memory metrics
        meterRegistry.find("jvm.memory.used").gauges().forEach(gauge -> {
            String area = gauge.getId().getTag("area");
            String id = gauge.getId().getTag("id");

            if (area != null && id != null) {
                jvmMetrics.put("memory." + area + "." + id, (long) gauge.value());
            }
        });

        // Thread metrics
        Gauge liveThreadsGauge = meterRegistry.find("jvm.threads.live").gauge();
        if (liveThreadsGauge != null) {
            jvmMetrics.put("threads.live", liveThreadsGauge.value());
        }

        Gauge peakThreadsGauge = meterRegistry.find("jvm.threads.peak").gauge();
        if (peakThreadsGauge != null) {
            jvmMetrics.put("threads.peak", peakThreadsGauge.value());
        }

        return ResponseEntity.ok(jvmMetrics);
    }

    /**
     * Helper method to build metrics summary
     */
    private Map<String, Object> getMetricsSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Application metrics
        summary.put("postsCreated", getCounterValue("posts.created"));
        summary.put("postsUpdated", getCounterValue("posts.updated"));
        summary.put("postsDeleted", getCounterValue("posts.deleted"));
        summary.put("usersRegistered", getCounterValue("users.registered"));
        summary.put("loginAttempts", getCounterValue("auth.login.attempts"));
        summary.put("loginSuccess", getCounterValue("auth.login.success"));
        summary.put("loginFailure", getCounterValue("auth.login.failure"));
        summary.put("filesUploaded", getCounterValue("files.uploaded"));

        return summary;
    }

    /**
     * Get counter value
     */
    private long getCounterValue(String name) {
        Counter counter = meterRegistry.find(name).counter();
        return counter != null ? (long) counter.count() : 0;
    }
}