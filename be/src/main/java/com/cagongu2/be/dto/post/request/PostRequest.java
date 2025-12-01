package com.cagongu2.be.dto.post.request;

import jakarta.validation.constraints.*;
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
    @NotBlank(message = "Post name is required")
    @Size(min = 3, max = 255, message = "Post name must be between 3 and 255 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s.,!?'-]+$",
            message = "Post name contains invalid characters")
    private String name;

    @NotBlank(message = "Post title is required")
    @Size(min = 10, max = 500, message = "Post title must be between 10 and 500 characters")
    private String title;

    @NotBlank(message = "Post slug is required")
    @Size(min = 3, max = 255, message = "Slug must be between 3 and 255 characters")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @NotBlank(message = "Post content is required")
    @Size(min = 50, message = "Medical content must be at least 50 characters")
    private String content;

    @NotBlank(message = "Post status is required")
    @Pattern(regexp = "^(draft|published|archived|pending_review)$",
            message = "Status must be: draft, published, archived, or pending_review")
    private String status;

    @NotNull(message = "Category ID is required")
    @Positive(message = "Category ID must be positive")
    private Long categoryId;

    // Optional - for display only
    private String categoryName;

    @NotNull(message = "Author ID is required")
    @Positive(message = "Author ID must be positive")
    private Long authorId;

    // Optional - for display only
    private String authorName;

    // File validation will be done in FileUploadService
    private MultipartFile file;
}