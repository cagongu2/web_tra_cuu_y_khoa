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
                      "fields": [
                        "title^10",
                        "name^5",
                        "content^1"
                      ],
                      "operator": "and",
                      "fuzziness": "AUTO"
                    }
                  }
                ],
                "should": [
                  {
                    "multi_match": {
                      "query": "?0",
                      "fields": ["title", "name"],
                      "type": "phrase",
                      "boost": 20
                    }
                  },
                  {
                    "match_phrase": {
                      "content": {
                        "query": "?0",
                        "boost": 5
                      }
                    }
                  }
                ]
              }
            }
            """)
    List<PostDocument> searchPosts(String keyword);
}
