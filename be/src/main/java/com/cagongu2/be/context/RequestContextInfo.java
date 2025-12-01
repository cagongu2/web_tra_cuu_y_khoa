package com.cagongu2.be.context;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RequestContextInfo {
    private Long userId;
    private String username;
    private String ip;
    private String userAgent;
}