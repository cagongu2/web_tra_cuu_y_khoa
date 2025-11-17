package com.cagongu2.be.controller;

import com.cagongu2.be.service.CacheMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/cache")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')")
public class CacheAdminController {
    private final CacheMonitoringService cacheMonitoringService;

    /**
     * Clear specific cache
     */
    @DeleteMapping("/{cacheName}")
    public ResponseEntity<Map<String, String>> clearCache(@PathVariable String cacheName) {
        cacheMonitoringService.clearCache(cacheName);
        return ResponseEntity.ok(Map.of(
                "message", "Cache cleared successfully",
                "cache", cacheName
        ));
    }

    /**
     * Clear all caches
     */
    @DeleteMapping("/all")
    public ResponseEntity<Map<String, String>> clearAllCaches() {
        cacheMonitoringService.clearAllCaches();
        return ResponseEntity.ok(Map.of(
                "message", "All caches cleared successfully"
        ));
    }
}
