package com.cagongu2.be.dto.footer.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FooterRequest {
    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 100, message = "Company name must be between 2 and 100 characters")
    private String companyName;

    @NotBlank(message = "Company full name is required")
    @Size(min = 5, max = 200, message = "Company full name must be between 5 and 200 characters")
    private String companyFullName;

    @Size(max = 1000, message = "Company description must not exceed 1000 characters")
    private String companyDescription;

    @NotBlank(message = "Office address is required")
    @Size(min = 10, max = 300, message = "Office address must be between 10 and 300 characters")
    private String officeAddress;

    @NotBlank(message = "Hotline is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$",
            message = "Hotline must be valid phone number")
    private String hotline;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Copyright text is required")
    @Size(max = 200, message = "Copyright text must not exceed 200 characters")
    private String copyrightText;

    @Size(max = 100, message = "Working hours must not exceed 100 characters")
    private String workingHours;

    @Size(max = 50, message = "Business license must not exceed 50 characters")
    @Pattern(regexp = "^[0-9-]*$",
            message = "Business license can only contain numbers and hyphens")
    private String businessLicense;

    // Optional list of post IDs to link in footer
    private List<@Positive(message = "Post ID must be positive") Long> postIds;

    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
            message = "Facebook URL must be valid")
    private String facebookUrl;

    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
            message = "YouTube URL must be valid")
    private String youtubeUrl;

    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$",
            message = "Twitter URL must be valid")
    private String twitterUrl;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
