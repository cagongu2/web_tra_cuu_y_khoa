package com.cagongu2.be.dto.post.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private Long id;
    private String name;
    private String slug;
}
