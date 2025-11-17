package com.cagongu2.be.service;

public interface EmailSenderService {
    void send(String to, String subject, String body);
}
