package com.cagongu2.be.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsServiceImpl implements MetricsService {

    private final Counter postCreationCounter;
    private final Counter postUpdateCounter;
    private final Counter postDeletionCounter;
    private final Counter userRegistrationCounter;
    private final Counter loginAttemptCounter;
    private final Counter loginSuccessCounter;
    private final Counter loginFailureCounter;
    private final Counter fileUploadCounter;
    private final Counter fileUploadErrorCounter;
    private final Timer postSearchTimer;
    private final MeterRegistry meterRegistry;

    /**
     * Track post creation
     */
    @Override
    public void trackPostCreation() {
        postCreationCounter.increment();
        log.debug("Post creation tracked");
    }

    /**
     * Track post update
     */
    @Override
    public void trackPostUpdate() {
        postUpdateCounter.increment();
        log.debug("Post update tracked");
    }

    /**
     * Track post deletion
     */
    @Override
    public void trackPostDeletion() {
        postDeletionCounter.increment();
        log.debug("Post deletion tracked");
    }

    /**
     * Track user registration
     */
    @Override
    public void trackUserRegistration() {
        userRegistrationCounter.increment();
        log.debug("User registration tracked");
    }

    /**
     * Track login attempt
     */
    @Override
    public void trackLoginAttempt(boolean success) {
        loginAttemptCounter.increment();
        if (success) {
            loginSuccessCounter.increment();
            log.debug("Successful login tracked");
        } else {
            loginFailureCounter.increment();
            log.debug("Failed login tracked");
        }
    }

    /**
     * Track file upload
     */
    @Override
    public void trackFileUpload(boolean success) {
        if (success) {
            fileUploadCounter.increment();
            log.debug("File upload tracked");
        } else {
            fileUploadErrorCounter.increment();
            log.debug("File upload error tracked");
        }
    }

    /**
     * Record post search time
     */
    @Override
    public void recordPostSearchTime(long milliseconds) {
        postSearchTimer.record(milliseconds, java.util.concurrent.TimeUnit.MILLISECONDS);
        log.debug("Post search time recorded: {}ms", milliseconds);
    }

    /**
     * Track custom metric
     */
    @Override
    public void trackCustomMetric(String metricName, double value, String... tags) {
        meterRegistry.counter(metricName, tags).increment(value);
        log.debug("Custom metric tracked: {} = {}", metricName, value);
    }
}
