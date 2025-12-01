package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertingService {

    @Value("${spring.application.name}")
    private String applicationName;

    @Value("${ENVIRONMENT:development}")
    private String environment;

    private final AsyncEmailService emailService;

    @Value("${dev.email}")
    private String devMail;

    private final SlackClient slackClient;

    /**
     * Send critical alert
     */
    @Async("taskExecutor")
    public void sendCriticalAlert(String title, String message, Throwable exception) {
        log.error("CRITICAL ALERT: {} - {}", title, message, exception);

        String alertBody = buildAlertMessage("CRITICAL", title, message, exception);

        slackClient.sendAlert(alertBody);

        // Send email to admins
        emailService.sendEmail(
                devMail,
                String.format("[CRITICAL] %s - %s", applicationName, title),
                alertBody
        );
    }

    /**
     * Send warning alert
     */
    @Async("taskExecutor")
    public void sendWarningAlert(String title, String message) {
        log.warn("WARNING ALERT: {} - {}", title, message);

        String alertBody = buildAlertMessage("WARNING", title, message, null);

        slackClient.sendAlert(alertBody);
    }

    /**
     * Send info notification
     */
    @Async("taskExecutor")
    public void sendInfoNotification(String title, String message) {
        log.info("INFO NOTIFICATION: {} - {}", title, message);

        String alertBody = buildAlertMessage("INFO", title, message, null);

        slackClient.sendAlert(alertBody);
    }

    /**
     * Build alert message
     */
    private String buildAlertMessage(String severity, String title, String message, Throwable exception) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== ALERT ===\n");
        sb.append("Application: ").append(applicationName).append("\n");
        sb.append("Environment: ").append(environment).append("\n");
        sb.append("Severity: ").append(severity).append("\n");
        sb.append("Time: ").append(LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        sb.append("Title: ").append(title).append("\n");
        sb.append("Message: ").append(message).append("\n");

        if (exception != null) {
            sb.append("\nException: ").append(exception.getClass().getName()).append("\n");
            sb.append("Error Message: ").append(exception.getMessage()).append("\n");
            sb.append("\nStack Trace:\n");
            for (StackTraceElement element : exception.getStackTrace()) {
                sb.append("  at ").append(element.toString()).append("\n");
                if (sb.length() > 2000) {
                    sb.append("  ... (truncated)\n");
                    break;
                }
            }
        }

        return sb.toString();
    }

    /**
     * Alert on high error rate
     */
    public void alertHighErrorRate(long errorCount, long totalRequests) {
        double errorRate = (double) errorCount / totalRequests * 100;

        if (errorRate > 5.0) { // 5% error rate threshold
            sendCriticalAlert(
                    "High Error Rate Detected",
                    String.format("Error rate: %.2f%% (%d errors out of %d requests)",
                            errorRate, errorCount, totalRequests),
                    null
            );
        } else if (errorRate > 2.0) {
            sendWarningAlert(
                    "Elevated Error Rate",
                    String.format("Error rate: %.2f%% (%d errors out of %d requests)",
                            errorRate, errorCount, totalRequests)
            );
        }
    }

    /**
     * Alert on high response time
     */
    public void alertHighResponseTime(String endpoint, long avgResponseTime) {
        if (avgResponseTime > 5000) { // 5 seconds
            sendCriticalAlert(
                    "Very High Response Time",
                    String.format("Endpoint %s has average response time of %dms",
                            endpoint, avgResponseTime),
                    null
            );
        } else if (avgResponseTime > 2000) { // 2 seconds
            sendWarningAlert(
                    "High Response Time",
                    String.format("Endpoint %s has average response time of %dms",
                            endpoint, avgResponseTime)
            );
        }
    }

    /**
     * Alert on low disk space
     */
    public void alertLowDiskSpace(long freeSpaceGB, String path) {
        if (freeSpaceGB < 5) { // Less than 5GB
            sendCriticalAlert(
                    "Critical Disk Space",
                    String.format("Only %d GB free on %s", freeSpaceGB, path),
                    null
            );
        } else if (freeSpaceGB < 10) {
            sendWarningAlert(
                    "Low Disk Space",
                    String.format("Only %d GB free on %s", freeSpaceGB, path)
            );
        }
    }

    /**
     * Alert on database connection issues
     */
    public void alertDatabaseIssue(String message, Throwable exception) {
        sendCriticalAlert(
                "Database Connection Issue",
                message,
                exception
        );
    }

    /**
     * Alert on Redis connection issues
     */
    public void alertRedisIssue(String message, Throwable exception) {
        sendCriticalAlert(
                "Redis Connection Issue",
                message,
                exception
        );
    }
}