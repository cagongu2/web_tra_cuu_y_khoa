package com.cagongu2.be.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {
    private String name;
    private String slug;
    private String description;
    private int level;
    private Boolean isActive;
    private Long parent;
}
