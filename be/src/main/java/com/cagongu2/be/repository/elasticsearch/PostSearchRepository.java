package com.cagongu2.be.repository.elasticsearch;

import com.cagongu2.be.model.elasticsearch.PostDocument;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface PostSearchRepository extends ElasticsearchRepository<PostDocument, Long> {
    @Query("""
            {
              "bool": {
                "must": [
                  {
                    "multi_match": {
                      "query": "?0",
                      "fields": ["title^10", "name^3", "content^0.1"],
                      "minimum_should_match": "100%"
                    }
                  }
                ],
                "should": [
                  {
                    "match_phrase": {
                      "title": {
                        "query": "?0",
                        "boost": 5
                      }
                    }
                  },
                  {
                    "term": {
                      "title.keyword": {
                        "value": "?0",
                        "boost": 10
                      }
                    }
                  }
                ]
              }
            }
            """)
    List<PostDocument> searchPosts(String keyword);
}
