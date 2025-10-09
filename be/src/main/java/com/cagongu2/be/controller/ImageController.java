package com.cagongu2.be.controller;

import com.cagongu2.be.model.Image;
import com.cagongu2.be.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @GetMapping("/{type}")
    public ResponseEntity<Image> getCurrentImage(@PathVariable String type) {
        Image image = imageService.getCurrentImageByType(type);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(image);
    }

    @PostMapping("/{type}")
    public ResponseEntity<Image> uploadImage(
            @PathVariable String type,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Image savedImage = imageService.createInfoImage(file, type);
        return ResponseEntity.ok(savedImage);
    }
}
