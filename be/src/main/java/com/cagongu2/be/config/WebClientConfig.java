package com.cagongu2.be.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Value("${slack.webhook.url}")
    private String slackUrl;

    @Bean
    public WebClient slackWebClient(WebClient.Builder builder) {
        return builder.baseUrl(slackUrl).build();
    }
}
