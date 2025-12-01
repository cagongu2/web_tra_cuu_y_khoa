package com.cagongu2.be.health;

import com.cagongu2.be.repository.elasticsearch.PostSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component("elasticsearch")
@RequiredArgsConstructor
@Slf4j
public class ElasticsearchHealthIndicator implements HealthIndicator {

    private final PostSearchRepository postSearchRepository;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();

            // Count documents
            long count = postSearchRepository.count();
            details.put("indexedDocuments", count);
            details.put("status", "UP");

            return Health.up().withDetails(details).build();

        } catch (Exception e) {
            log.error("Elasticsearch health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}