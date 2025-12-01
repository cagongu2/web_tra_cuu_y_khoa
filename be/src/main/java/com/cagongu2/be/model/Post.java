package com.cagongu2.be.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "slug")
        },
        indexes = {
                @Index(name = "idx_post_slug", columnList = "slug"),
                @Index(name = "idx_post_status", columnList = "status"),
                @Index(name = "idx_post_category", columnList = "category_id"),
                @Index(name = "idx_post_author", columnList = "author_id"),
                @Index(name = "idx_post_created", columnList = "created_at"),
                @Index(name = "idx_post_status_created", columnList = "status,created_at")
        })
@SQLDelete(sql = "UPDATE posts SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String slug;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @NotBlank
    @Pattern(regexp = "^(draft|published|archived|pending_review)$")
    @Column(nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    @NotNull
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "footer_id")
    @JsonIgnore
    private Footer footer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @JsonBackReference
    @NotNull
    private User author;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "thumbnail_id")
    @JsonManagedReference
    private Image thumbnail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Audit fields
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "deleted_by")
    private Long deletedBy;

    // Version for optimistic locking
    @Version
    @Column(name = "version")
    private Long version;

    // Content metadata for medical content
    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "source_citation", columnDefinition = "TEXT")
    private String sourceCitation;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
