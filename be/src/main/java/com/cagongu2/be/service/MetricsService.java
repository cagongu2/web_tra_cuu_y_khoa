package com.cagongu2.be.service;

public interface MetricsService {
    void trackPostCreation();
    void trackPostUpdate();
    void trackPostDeletion();
    void trackUserRegistration();
    void trackLoginAttempt(boolean success);
    void trackFileUpload(boolean success);
    void recordPostSearchTime(long milliseconds);
    void trackCustomMetric(String metricName, double value, String... tags);
}
