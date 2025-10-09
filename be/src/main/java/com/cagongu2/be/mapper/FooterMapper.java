package com.cagongu2.be.mapper;

import com.cagongu2.be.dto.footer.request.FooterRequest;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import com.cagongu2.be.dto.post.request.PostDTO;
import com.cagongu2.be.model.Footer;
import com.cagongu2.be.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FooterMapper {
    FooterMapper INSTANCE = Mappers.getMapper(FooterMapper.class);

    @Mapping(target = "postList", ignore = true)
    @Mapping(target = "id", ignore = true)
    Footer toEntity(FooterRequest request);

    @Mapping(source = "postList", target = "postList")
    FooterResponse toResponse(Footer footer);

    @Mapping(target = "postList", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(FooterRequest request, @MappingTarget Footer footer);

    default List<PostDTO> mapPostList(List<Post> posts) {
        if (posts == null) {
            return new ArrayList<>();
        }
        return posts.stream()
                .map(this::mapPostToDTO)
                .collect(Collectors.toList());
    }

    default PostDTO mapPostToDTO(Post post) {
        if (post == null) {
            return null;
        }
        return PostDTO.builder()
                .id(post.getId())
                .name(post.getName())
                .slug(post.getSlug())
                .build();
    }
}
