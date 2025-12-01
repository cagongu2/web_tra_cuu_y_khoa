package com.cagongu2.be.config;

import com.cagongu2.be.config.redis.CleanJsonRedisSerializer;
import com.cagongu2.be.config.redis.ListJsonRedisSerializer;
import com.cagongu2.be.dto.category.request.CategoryFlatDTO;
import com.cagongu2.be.dto.category.request.GetAllCategoriesAndPostDTO;
import com.cagongu2.be.dto.category.response.CategoryResponse;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import com.cagongu2.be.dto.post.request.PostDTO;
import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.model.Image;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Value("${spring.redis.password}")
    private String redisPassword;

    @Value("${spring.redis.database}")
    private int redisDatabase;

    @Value("${spring.redis.timeout}")
    private long redisTimeout;

    /**
     * Redis Connection Factory with connection pooling
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        // Redis standalone configuration
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        redisConfig.setDatabase(redisDatabase);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }

        // Connection pool configuration
        LettucePoolingClientConfiguration poolConfig = LettucePoolingClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(redisTimeout))
                .poolConfig(new GenericObjectPoolConfig())
                .build();

        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig, poolConfig);

        log.info("Redis connection factory configured: {}:{}", redisHost, redisPort);

        return factory;
    }

    /**
     * Template for String values only
     * Usage: Simple counters, flags, text data
     */
    @Bean("customStringRedisTemplate")
    public RedisTemplate<String, String> customStringRedisTemplate(
            RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();

        log.info("customStringRedisTemplate configured");
        return template;
    }

    /**
     * Template for Long values (counters, IDs)
     */
    @Bean
    public RedisTemplate<String, Long> longRedisTemplate(
            RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, Long> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        CleanJsonRedisSerializer<Long> longSerializer = new CleanJsonRedisSerializer<>(Long.class);

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(longSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(longSerializer);

        template.afterPropertiesSet();

        log.info("LongRedisTemplate configured");
        return template;
    }

    /**
     * Template for CategoryResponse (clean JSON, no @class)
     */
    @Bean
    public RedisTemplate<String, CategoryResponse> categoryResponseRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, CategoryResponse.class, "CategoryResponse");
    }

    /**
     * Template for List<CategoryResponse>
     */
    @Bean
    public RedisTemplate<String, List<CategoryResponse>> categoryListRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createListTemplate(connectionFactory, CategoryResponse.class, "List<CategoryResponse>");
    }

    /**
     * Template for GetAllCategoriesAndPostDTO
     */
    @Bean
    public RedisTemplate<String, GetAllCategoriesAndPostDTO> categoryWithPostsRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, GetAllCategoriesAndPostDTO.class, "GetAllCategoriesAndPostDTO");
    }

    /**
     * Template for CategoryFlatDTO
     */
    @Bean
    public RedisTemplate<String, CategoryFlatDTO> categoryFlatRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, CategoryFlatDTO.class, "CategoryFlatDTO");
    }

    /**
     * Template for FooterResponse
     */
    @Bean
    public RedisTemplate<String, FooterResponse> footerRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, FooterResponse.class, "FooterResponse");
    }

    /**
     * Template for PostDTO
     */
    @Bean
    public RedisTemplate<String, PostDTO> postDtoRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, PostDTO.class, "PostDTO");
    }

    /**
     * Template for List<PostDTO>
     */
    @Bean
    public RedisTemplate<String, List<PostDTO>> postListRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createListTemplate(connectionFactory, PostDTO.class, "List<PostDTO>");
    }

    /**
     * Template for PostResponse
     */
    @Bean
    public RedisTemplate<String, PostResponse> postResponseRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, PostResponse.class, "PostResponse");
    }

    /**
     * Template for UserResponse
     */
    @Bean
    public RedisTemplate<String, UserResponse> userResponseRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, UserResponse.class, "UserResponse");
    }

    /**
     * Template for Image entity
     */
    @Bean
    public RedisTemplate<String, Image> imageRedisTemplate(
            RedisConnectionFactory connectionFactory) {
        return createTypedTemplate(connectionFactory, Image.class, "Image");
    }

    /**
     * Create typed RedisTemplate for single objects
     */
    private <T> RedisTemplate<String, T> createTypedTemplate(
            RedisConnectionFactory connectionFactory,
            Class<T> type,
            String typeName) {

        RedisTemplate<String, T> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        CleanJsonRedisSerializer<T> valueSerializer = new CleanJsonRedisSerializer<>(type);

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(valueSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(valueSerializer);

        template.afterPropertiesSet();

        log.info("RedisTemplate configured for type: {}", typeName);
        return template;
    }

    /**
     * Create typed RedisTemplate for List<T>
     */
    private <T> RedisTemplate<String, List<T>> createListTemplate(
            RedisConnectionFactory connectionFactory,
            Class<T> elementType,
            String typeName) {

        RedisTemplate<String, List<T>> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        ListJsonRedisSerializer<T> listSerializer = new ListJsonRedisSerializer<>(elementType);

        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(listSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(listSerializer);

        template.afterPropertiesSet();

        log.info("RedisTemplate configured for type: {}", typeName);
        return template;
    }

    /**
     * Cache Manager with different TTLs for different cache types
     */
    @Bean
    @Primary
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Use CleanJsonRedisSerializer for cache values
        CleanJsonRedisSerializer<Object> cleanSerializer =
                new CleanJsonRedisSerializer<>(Object.class);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                cleanSerializer))
                .disableCachingNullValues();

        // Custom TTL for different cache types
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Categories - Long TTL (rarely change)
        cacheConfigurations.put("categories",
                defaultConfig.entryTtl(Duration.ofHours(24)));

        // Footer - Long TTL
        cacheConfigurations.put("footers",
                defaultConfig.entryTtl(Duration.ofHours(12)));

        // Posts - Medium TTL
        cacheConfigurations.put("posts",
                defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Post by slug - Medium TTL
        cacheConfigurations.put("postBySlug",
                defaultConfig.entryTtl(Duration.ofMinutes(30)));

        // Users - Short TTL (sensitive data)
        cacheConfigurations.put("users",
                defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Search results - Short TTL
        cacheConfigurations.put("searchResults",
                defaultConfig.entryTtl(Duration.ofMinutes(5)));

        // Images metadata - Long TTL
        cacheConfigurations.put("images",
                defaultConfig.entryTtl(Duration.ofHours(6)));

        RedisCacheManager cacheManager = RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();

        log.info("Redis CacheManager configured with custom TTLs");

        return cacheManager;
    }
}