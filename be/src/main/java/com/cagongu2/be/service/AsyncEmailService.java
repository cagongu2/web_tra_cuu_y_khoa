package com.cagongu2.be.service;

import java.util.concurrent.CompletableFuture;

public interface AsyncEmailService {
    public CompletableFuture<Boolean> sendEmail(String to, String subject, String body);
    public void notifyNewPost(String postTitle, String authorEmail);
    public void notifyPostApproved(String postTitle, String authorEmail);
}
