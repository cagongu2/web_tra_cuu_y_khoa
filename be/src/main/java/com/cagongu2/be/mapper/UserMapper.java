package com.cagongu2.be.mapper;

import com.cagongu2.be.dto.user.response.UserResponse;
import com.cagongu2.be.model.Post;
import com.cagongu2.be.model.Role;
import com.cagongu2.be.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "postIds", expression = "java(mapPostIds(user.getPosts()))")
    @Mapping(target = "roleSlugs", expression = "java(mapRoleSlugs(user.getRoles()))")
    @Mapping(source = "avatar.url", target = "avatar_url")
    UserResponse toUserResponse(User user);

    default List<String> mapPostIds(List<Post> posts) {
        if (posts == null) return List.of();
        return posts.stream()
                .map(post -> String.valueOf(post.getId()))
                .collect(Collectors.toList());
    }

    default List<String> mapRoleSlugs(List<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream()
                .map(Role::getSlug)
                .collect(Collectors.toList());
    }
}
