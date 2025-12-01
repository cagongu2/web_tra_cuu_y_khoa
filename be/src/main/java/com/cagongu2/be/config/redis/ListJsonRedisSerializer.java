package com.cagongu2.be.config.redis;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Serializer for List<T> collections
 * Produces clean JSON arrays without @class metadata
 *
 * Usage:
 * ListJsonRedisSerializer<PostDTO> serializer = new ListJsonRedisSerializer<>(PostDTO.class);
 */
@Slf4j
public class ListJsonRedisSerializer<T> extends CleanJsonRedisSerializer<List<T>> {

    private final Class<T> elementType;

    /**
     * @param elementType The type of elements in the list (e.g., PostDTO.class)
     */
    public ListJsonRedisSerializer(Class<T> elementType) {
        super(createListType(elementType));
        this.elementType = elementType;
        log.debug("Created ListJsonRedisSerializer for List<{}>", elementType.getSimpleName());
    }

    /**
     * Create JavaType for List<T>
     */
    private static <T> JavaType createListType(Class<T> elementType) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper.getTypeFactory()
                .constructCollectionType(List.class, elementType);
    }

    /**
     * Get element type (useful for debugging)
     */
    public Class<T> getElementType() {
        return elementType;
    }
}