package com.cagongu2.be.config.redis;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

/**
 * Clean JSON Redis Serializer without @class type information
 * Produces clean, readable JSON in Redis without pollution
 *
 * Features:
 * - No @class metadata
 * - Support for LocalDateTime and Java 8 time types
 * - Fail-safe deserialization (ignores unknown properties)
 * - Proper error handling with logging
 */
@Slf4j
public class CleanJsonRedisSerializer<T> implements RedisSerializer<T> {

    private final JavaType type;
    private final ObjectMapper objectMapper;
    private final Class<T> clazz;

    /**
     * Constructor for single class type
     */
    public CleanJsonRedisSerializer(Class<T> type) {
        this.clazz = type;
        this.objectMapper = createObjectMapper();
        this.type = this.objectMapper.getTypeFactory().constructType(type);
    }

    /**
     * Constructor for complex JavaType (List, Map, etc.)
     */
    public CleanJsonRedisSerializer(JavaType type) {
        this.clazz = null;
        this.objectMapper = createObjectMapper();
        this.type = type;
    }

    /**
     * Create configured ObjectMapper
     */
    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Support Java 8 LocalDateTime, ZonedDateTime, etc.
        mapper.registerModule(new JavaTimeModule());

        // Disable writing dates as timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Ignore unknown properties when deserializing
        // This prevents errors when schema changes
        mapper.configure(
                com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                false
        );

        // Don't serialize null values (optional)
        mapper.setSerializationInclusion(
                com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL
        );

        return mapper;
    }

    @Override
    public byte[] serialize(T value) throws SerializationException {
        if (value == null) {
            return new byte[0];
        }

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(value);

            if (log.isDebugEnabled()) {
                String json = new String(bytes);
                log.debug("Serialized {} to Redis: {}",
                        getTypeName(),
                        json.length() > 200 ? json.substring(0, 200) + "..." : json);
            }

            return bytes;
        } catch (Exception e) {
            String errorMsg = String.format(
                    "Error serializing object of type %s: %s",
                    getTypeName(),
                    e.getMessage()
            );
            log.error(errorMsg, e);
            throw new SerializationException(errorMsg, e);
        }
    }

    @Override
    public T deserialize(byte[] bytes) throws SerializationException {
        if (bytes == null || bytes.length == 0) {
            return null;
        }

        try {
            T value = objectMapper.readValue(bytes, type);

            if (log.isDebugEnabled()) {
                log.debug("Deserialized {} from Redis: {} bytes",
                        getTypeName(),
                        bytes.length);
            }

            return value;
        } catch (Exception e) {
            String errorMsg = String.format(
                    "Error deserializing to type %s: %s",
                    getTypeName(),
                    e.getMessage()
            );
            log.error(errorMsg, e);
            log.error("Raw data: {}", new String(bytes));
            throw new SerializationException(errorMsg, e);
        }
    }

    /**
     * Get type name for logging
     */
    private String getTypeName() {
        if (clazz != null) {
            return clazz.getSimpleName();
        }
        return type.getRawClass().getSimpleName();
    }

    /**
     * Get the ObjectMapper (useful for testing)
     */
    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}