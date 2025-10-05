package com.cagongu2.be.mapper;

import com.cagongu2.be.dto.post.response.PostResponse;
import com.cagongu2.be.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostMapper INSTANCE = Mappers.getMapper(PostMapper.class);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.username", target = "authorName")
    @Mapping(source = "thumbnail.url", target = "thumbnail_url")
    PostResponse toPostResponse(Post post);
}
