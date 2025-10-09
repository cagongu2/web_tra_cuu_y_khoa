package com.cagongu2.be.dto.post.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostRequest {
    private String name;
    private String title;
    private String slug;
    private String content;
    private String status;

    private Long categoryId;
    private String categoryName;

    private Long authorId;
    private String authorName;

    private MultipartFile file;
}