package com.cagongu2.be.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Component("customRedis")
@RequiredArgsConstructor
@Slf4j
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisConnectionFactory redisConnectionFactory;

    @Override
    public Health health() {
        try {
            Map<String, Object> details = new HashMap<>();

            try (RedisConnection connection = redisConnectionFactory.getConnection()) {
                // Ping Redis
                String pong = connection.ping();

                if ("PONG".equals(pong)) {
                    details.put("status", "UP");
                    details.put("ping", pong);

                    // Get Redis info using RedisCommands
                    var redisCommands = connection.serverCommands();

                    // Get Redis info
                    Properties info = redisCommands.info();

                    if(info != null){
                        details.put("version", info.getProperty("redis_version"));
                        details.put("usedMemory", info.getProperty("used_memory_human"));
                        details.put("connectedClients", info.getProperty("connected_clients"));
                        details.put("uptime", info.getProperty("uptime_in_days") + " days");
                    }

                    // Get database size using RedisTemplate
                    Long dbSize = redisCommands.dbSize();
                    details.put("keysCount", dbSize);

                    return Health.up().withDetails(details).build();
                } else {
                    return Health.down()
                            .withDetail("error", "Redis ping returned unexpected response")
                            .build();
                }
            }
        } catch (Exception e) {
            log.error("Redis health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}