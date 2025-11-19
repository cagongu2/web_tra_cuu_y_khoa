package com.cagongu2.be.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    /**
     * Counter for post creations
     */
    @Bean
    public Counter postCreationCounter(MeterRegistry registry) {
        return Counter.builder("posts.created")
                .description("Number of posts created")
                .tag("type", "medical")
                .register(registry);
    }

    /**
     * Counter for post updates
     */
    @Bean
    public Counter postUpdateCounter(MeterRegistry registry) {
        return Counter.builder("posts.updated")
                .description("Number of posts updated")
                .register(registry);
    }

    /**
     * Counter for post deletions
     */
    @Bean
    public Counter postDeletionCounter(MeterRegistry registry) {
        return Counter.builder("posts.deleted")
                .description("Number of posts deleted")
                .register(registry);
    }

    /**
     * Counter for user registrations
     */
    @Bean
    public Counter userRegistrationCounter(MeterRegistry registry) {
        return Counter.builder("users.registered")
                .description("Number of users registered")
                .register(registry);
    }

    /**
     * Counter for login attempts
     */
    @Bean
    public Counter loginAttemptCounter(MeterRegistry registry) {
        return Counter.builder("auth.login.attempts")
                .description("Number of login attempts")
                .register(registry);
    }

    /**
     * Counter for successful logins
     */
    @Bean
    public Counter loginSuccessCounter(MeterRegistry registry) {
        return Counter.builder("auth.login.success")
                .description("Number of successful logins")
                .register(registry);
    }

    /**
     * Counter for failed logins
     */
    @Bean
    public Counter loginFailureCounter(MeterRegistry registry) {
        return Counter.builder("auth.login.failure")
                .description("Number of failed login attempts")
                .register(registry);
    }

    /**
     * Timer for post search operations
     */
    @Bean
    public Timer postSearchTimer(MeterRegistry registry) {
        return Timer.builder("posts.search.time")
                .description("Time taken to search posts")
                .register(registry);
    }

    /**
     * Counter for cache hits
     */
    @Bean
    public Counter cacheHitCounter(MeterRegistry registry) {
        return Counter.builder("cache.hits")
                .description("Number of cache hits")
                .register(registry);
    }

    /**
     * Counter for cache misses
     */
    @Bean
    public Counter cacheMissCounter(MeterRegistry registry) {
        return Counter.builder("cache.misses")
                .description("Number of cache misses")
                .register(registry);
    }

    /**
     * Counter for file uploads
     */
    @Bean
    public Counter fileUploadCounter(MeterRegistry registry) {
        return Counter.builder("files.uploaded")
                .description("Number of files uploaded")
                .register(registry);
    }

    /**
     * Counter for file upload errors
     */
    @Bean
    public Counter fileUploadErrorCounter(MeterRegistry registry) {
        return Counter.builder("files.upload.errors")
                .description("Number of file upload errors")
                .register(registry);
    }
}