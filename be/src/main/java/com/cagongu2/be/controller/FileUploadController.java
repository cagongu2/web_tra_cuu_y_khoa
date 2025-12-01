package com.cagongu2.be.controller;

import com.cagongu2.be.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {
    private final FileUploadService fileUploadService;

    /**
     * Upload file - Authenticated users only
     */
    @PostMapping("/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadFile(
            @PathVariable String type, // ex: "posts" | "banner"
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        try {
            String relativePath = fileUploadService.uploadFile(file, type);
            return ResponseEntity.ok(Map.of("relativePath", relativePath));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }
}
