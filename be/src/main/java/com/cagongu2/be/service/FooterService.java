package com.cagongu2.be.service;

import com.cagongu2.be.dto.footer.request.FooterRequest;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FooterService {
    FooterResponse createFooter(FooterRequest request);

    FooterResponse updateFooter(Long id, FooterRequest request);

    List<FooterResponse> getAllFooter();

    FooterResponse getFooterById(Long id);

    List<FooterResponse> getFooterByStatus(Boolean isActive);

    void deleteFooter(Long id);
}
