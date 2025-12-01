package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriBuilder;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlackClient {
    private final WebClient slackWebClient;

    @Value("${slack.enabled}")
    private boolean slackEnabled;

    public void sendAlert(String alertBody) {

        if (!slackEnabled) {
            log.debug("Slack alerting is disabled. Alert not sent. Payload: {}", alertBody);
            return;
        }

        log.info("Attempting to send alert to Slack...");
        log.debug("Payload: {}", alertBody);

        slackWebClient.post()
                .uri(UriBuilder::build)
                .header("Content-Type", "application/json")
                .bodyValue(alertBody)
                .retrieve()
                .toBodilessEntity()
                .subscribe(
                        response -> {
                            log.info("Slack alert sent successfully. Status code: {}", response.getStatusCode());
                        },
                        error -> {
                            if (error instanceof WebClientResponseException responseException) {
                                log.error("Failed to send Slack alert. HTTP Status: {}, Response Body: {}",
                                        responseException.getStatusCode(),
                                        responseException.getResponseBodyAsString(),
                                        error);
                            } else {
                                log.error("Failed to send Slack alert due to connection/subscription error.", error);
                            }
                        }
                );
    }
}
