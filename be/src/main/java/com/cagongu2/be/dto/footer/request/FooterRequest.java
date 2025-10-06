package com.cagongu2.be.dto.footer.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FooterRequest {
    private String companyName;
    private String companyFullName;
    private String companyDescription;
    private String officeAddress;
    private String hotline;
    private String email;
    private String copyrightText;
    private String workingHours;
    private String businessLicense;

    private List<Long> postIds;

    private String facebookUrl;
    private String youtubeUrl;
    private String twitterUrl;
    private Boolean isActive;
}
