package com.cagongu2.be.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Footer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Builder.Default
    @OneToMany(mappedBy = "footer", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Post> postList = new ArrayList<>();

    private String facebookUrl;

    private String youtubeUrl;

    private String twitterUrl;

    @Builder.Default
    private Boolean isActive = true;
}
