package com.cagongu2.be.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j(topic = "performance")
public class PerformanceLoggingAspect {

    private static final long SLOW_THRESHOLD_MS = 500;

    /**
     * Monitor database operations
     */
    @Around("execution(* com.cagongu2.be.repository..*(..))")
    public Object monitorRepositoryPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.nanoTime();

        try {
            Object result = joinPoint.proceed();
            long duration = (System.nanoTime() - startTime) / 1_000_000; // Convert to ms

            if (duration > SLOW_THRESHOLD_MS) {
                log.warn("SLOW DATABASE QUERY: {} took {}ms", methodName, duration);
            } else {
                log.debug("Database query: {} completed in {}ms", methodName, duration);
            }

            return result;
        } catch (Throwable e) {
            long duration = (System.nanoTime() - startTime) / 1_000_000;
            log.error("Database query failed: {} after {}ms", methodName, duration);
            throw e;
        }
    }

    /**
     * Monitor cache operations
     */
    @Around("@annotation(org.springframework.cache.annotation.Cacheable)")
    public Object monitorCacheHits(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.nanoTime();

        Object result = joinPoint.proceed();
        long duration = (System.nanoTime() - startTime) / 1_000_000;

        if (duration < 10) {
            log.debug("CACHE HIT: {} in {}ms", methodName, duration);
        } else {
            log.debug("CACHE MISS: {} took {}ms", methodName, duration);
        }

        return result;
    }
}