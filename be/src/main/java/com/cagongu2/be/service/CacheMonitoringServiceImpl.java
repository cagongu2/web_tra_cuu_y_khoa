package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheMonitoringServiceImpl implements CacheMonitoringService {

    private final CacheManager cacheManager;

    /**
     * Log cache statistics every 5 minutes
     */
    @Override
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void logCacheStatistics() {
        log.info("=== Cache Statistics ===");

        Map<String, Integer> cacheStats = new HashMap<>();

        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                Object nativeCache = cache.getNativeCache();
                // Log cache info
                log.info("Cache: {} - Native: {}", cacheName, nativeCache.getClass().getSimpleName());
            }
        });

        log.info("========================");
    }

    /**
     * Clear specific cache
     */
    @Override
    public void clearCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.info("Cache cleared: {}", cacheName);
        } else {
            log.warn("Cache not found: {}", cacheName);
        }
    }

    /**
     * Clear all caches
     */
    @Override
    public void clearAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
        log.info("All caches cleared");
    }
}
