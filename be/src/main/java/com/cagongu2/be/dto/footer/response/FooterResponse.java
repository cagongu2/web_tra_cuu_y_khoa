package com.cagongu2.be.dto.footer.response;

import com.cagongu2.be.dto.post.request.PostDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FooterResponse {
    private Long id;
    private String companyName;
    private String companyFullName;
    private String companyDescription;
    private String officeAddress;
    private String hotline;
    private String email;
    private String copyrightText;
    private String workingHours;
    private String businessLicense;

    private List<PostDTO> postList;

    private String facebookUrl;
    private String youtubeUrl;
    private String twitterUrl;
    private Boolean isActive;
}
