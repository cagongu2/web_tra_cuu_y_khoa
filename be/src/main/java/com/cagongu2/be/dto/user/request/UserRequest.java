package com.cagongu2.be.dto.user.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String phone;
    private Boolean isActive;
    private MultipartFile file;
}
