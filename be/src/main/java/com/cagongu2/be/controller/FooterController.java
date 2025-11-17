package com.cagongu2.be.controller;

import com.cagongu2.be.dto.footer.request.FooterRequest;
import com.cagongu2.be.dto.footer.response.FooterResponse;
import com.cagongu2.be.service.FooterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.List;

@RestController
@RequestMapping("/api/footers")
@RequiredArgsConstructor
@Validated
public class FooterController {
    private final FooterService footerService;

    @PostMapping
    public ResponseEntity<FooterResponse> createFooter(
            @Valid @RequestBody FooterRequest request) {
        FooterResponse response = footerService.createFooter(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FooterResponse> updateFooter(
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody FooterRequest request) {
        FooterResponse response = footerService.updateFooter(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FooterResponse>> getAllFooters() {
        List<FooterResponse> responses = footerService.getAllFooter();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FooterResponse> getFooterById(
            @PathVariable @Min(1) Long id) {
        FooterResponse response = footerService.getFooterById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<List<FooterResponse>> getFootersByStatus(
            @RequestParam Boolean isActive) {
        List<FooterResponse> responses = footerService.getFooterByStatus(isActive);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/active")
    public ResponseEntity<List<FooterResponse>> getActiveFooter() {
        List<FooterResponse> activeFooters = footerService.getFooterByStatus(true);
        if (activeFooters.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(activeFooters);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFooter(
            @PathVariable @Min(1) Long id) {
        footerService.deleteFooter(id);
        return ResponseEntity.noContent().build();
    }
}