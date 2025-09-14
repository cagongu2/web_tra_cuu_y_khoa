package com.cagongu2.be.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {
    private static final String BASE_PATH = "D:/web_tra_cuu_y_khoa/images";

    @PostMapping("/{type}")
    public ResponseEntity<?> uploadFile(
            @PathVariable String type, // ex: "posts" | "banner"
            @RequestParam("file") MultipartFile file) {

        try {
            Path uploadPath = Paths.get(BASE_PATH, type);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Original file name
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // retrieve relative path to FE use getImgUrl
            String relativePath = "images/" + type + "/" + fileName;

            return ResponseEntity.ok(Map.of("relativePath", relativePath));


        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }
}
