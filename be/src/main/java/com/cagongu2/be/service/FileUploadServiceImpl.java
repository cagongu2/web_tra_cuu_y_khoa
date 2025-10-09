package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {
    @Value("${upload.base-path}")
    private String basePath;

    public String uploadFile(MultipartFile file, String type) throws IOException {

        Path uploadPath = Paths.get(basePath, type);

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

        return relativePath;
    }
}
