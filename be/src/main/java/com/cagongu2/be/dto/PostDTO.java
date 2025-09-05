package com.cagongu2.be.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private String name;
    private String title;
    private String slug;
    private String content;
    private String status;
    private Long categoryId;
    private Long authorId;
}
