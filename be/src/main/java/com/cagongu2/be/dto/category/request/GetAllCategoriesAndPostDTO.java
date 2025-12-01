package com.cagongu2.be.dto.category.request;

import com.cagongu2.be.dto.post.request.PostDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAllCategoriesAndPostDTO {
    private Long id;
    private String name;
    private Boolean isActive;
    private Long parentId;
    @Builder.Default
    private List<PostDTO> postList = new ArrayList<>();
}