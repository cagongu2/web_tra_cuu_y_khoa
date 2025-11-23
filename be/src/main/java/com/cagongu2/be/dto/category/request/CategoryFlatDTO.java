package com.cagongu2.be.dto.category.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryFlatDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Boolean isActive;
    private Long parentId;
}