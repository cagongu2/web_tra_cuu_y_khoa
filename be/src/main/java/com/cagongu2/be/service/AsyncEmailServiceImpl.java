package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class AsyncEmailServiceImpl implements AsyncEmailService {

    private final EmailSenderService emailSenderService;

    /**
     * Send email asynchronously
     */
    @Override
    @Async("taskExecutor")
    public CompletableFuture<Boolean> sendEmail(String to, String subject, String body) {
        try {
            log.info("Sending email to: {}", to);

            emailSenderService.send(to, subject, body);

            // Simulate email sending
//            Thread.sleep(1000);

            log.info("Email sent successfully to: {}", to);
            return CompletableFuture.completedFuture(true);

        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Send notification email for new post
     */
    @Override
    @Async("taskExecutor")
    public void notifyNewPost(String postTitle, String authorEmail) {
        log.info("Sending new post notification for: {}", postTitle);

        String subject = "New Post Published: " + postTitle;
        String body = "Your post '" + postTitle + "' has been published successfully.";

        sendEmail(authorEmail, subject, body);
    }

    /**
     * Send notification email for post approval
     */
    @Override
    @Async("taskExecutor")
    public void notifyPostApproved(String postTitle, String authorEmail) {
        log.info("Sending post approval notification for: {}", postTitle);

        String subject = "Post Approved: " + postTitle;
        String body = "Your post '" + postTitle + "' has been approved by an administrator.";

        sendEmail(authorEmail, subject, body);
    }
}
