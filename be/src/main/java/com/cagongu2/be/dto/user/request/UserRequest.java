package com.cagongu2.be.dto.user.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {

    // Only for update
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$",
            message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required", groups = CreateValidation.class)
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
            groups = CreateValidation.class)
    private String password;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$",
            message = "Phone number must be 10-15 digits")
    private String phone;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // File validation will be done in FileUploadService
    private MultipartFile file;

    // Validation groups
    public interface CreateValidation {}
    public interface UpdateValidation {}
}
