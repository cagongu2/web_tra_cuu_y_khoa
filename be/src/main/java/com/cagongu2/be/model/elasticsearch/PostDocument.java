package com.cagongu2.be.model.elasticsearch;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "post-index")
public class PostDocument {
    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String name;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Text)
    private String content;

    @Field(type = FieldType.Keyword)
    private String slug;

    @Field(type = FieldType.Text)
    private String thumbnail_url;
}
