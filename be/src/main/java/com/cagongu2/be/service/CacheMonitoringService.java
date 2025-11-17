package com.cagongu2.be.service;

public interface CacheMonitoringService {
    void logCacheStatistics();
    void clearCache(String cacheName);
    void clearAllCaches();
}
