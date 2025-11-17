package com.cagongu2.be.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s-]+$",
            message = "Category name contains invalid characters")
    private String name;

    @NotBlank(message = "Category slug is required")
    @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Level is required")
    @Min(value = 0, message = "Level must be 0 or 1")
    @Max(value = 1, message = "Level must be 0 or 1")
    private Integer level;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // Can be null for root categories (level 0)
    @Positive(message = "Parent ID must be positive")
    private Long parent;
}
