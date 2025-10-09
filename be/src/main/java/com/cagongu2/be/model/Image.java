package com.cagongu2.be.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private String url;

    @OneToOne(mappedBy = "thumbnail")
    @JsonBackReference
    private Post post;

    @OneToOne(mappedBy = "avatar")
    @JsonBackReference
    private User user;
}
