package com.cagongu2.be.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.UUID;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * Pointcut for all service methods
     */
    @Pointcut("within(com.cagongu2.be.service..*)")
    public void serviceLayer() {}

    /**
     * Pointcut for all controller methods
     */
    @Pointcut("within(com.cagongu2.be.controller..*)")
    public void controllerLayer() {}

    /**
     * Log service method execution
     */
    @Around("serviceLayer()")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        long startTime = System.currentTimeMillis();

        log.debug("Entering service method: {}.{}", className, methodName);

        try {
            Object result = joinPoint.proceed();

            long executionTime = System.currentTimeMillis() - startTime;
            log.debug("Service method executed: {}.{} in {}ms",
                    className, methodName, executionTime);

            // Log slow methods (> 1 second)
            if (executionTime > 1000) {
                log.warn("SLOW SERVICE METHOD: {}.{} took {}ms",
                        className, methodName, executionTime);
            }

            return result;

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("Service method failed: {}.{} after {}ms - Error: {}",
                    className, methodName, executionTime, e.getMessage());
            throw e;
        }
    }

    /**
     * Log controller method execution with request tracking
     */
    @Around("controllerLayer()")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        // Generate request ID
        String requestId = UUID.randomUUID().toString();
        MDC.put("requestId", requestId);

        long startTime = System.currentTimeMillis();

        log.info(">>> Request: {}.{} | RequestId: {}", className, methodName, requestId);
        log.debug(">>> Parameters: {}", Arrays.toString(joinPoint.getArgs()));

        try {
            Object result = joinPoint.proceed();

            long executionTime = System.currentTimeMillis() - startTime;
            log.info("<<< Response: {}.{} | Duration: {}ms | RequestId: {}",
                    className, methodName, executionTime, requestId);

            // Log slow requests (> 500ms)
            if (executionTime > 500) {
                log.warn("SLOW REQUEST: {}.{} took {}ms | RequestId: {}",
                        className, methodName, executionTime, requestId);
            }

            return result;

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("<<< Error: {}.{} | Duration: {}ms | RequestId: {} | Error: {}",
                    className, methodName, executionTime, requestId, e.getMessage());
            throw e;

        } finally {
            MDC.remove("requestId");
        }
    }
}