package com.cagongu2.be.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String name;
    private String title;
    private String slug;
    private String content;
    private String status;

    private Long categoryId;
    private String categoryName;

    private Long authorId;
    private String authorName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}