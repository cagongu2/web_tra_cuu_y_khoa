package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    @Value("${upload.base-path}")
    private String basePath;

    // Security constraints
    private static final List<String> ALLOWED_EXTENSIONS =
            Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    @Override
    public String uploadFile(MultipartFile file, String type) throws IOException {
        log.info("Starting file upload for type: {}", type);

        // 1. Validate file is not null or empty
        if (file == null || file.isEmpty()) {
            log.warn("Attempted to upload null or empty file");
            throw new IllegalArgumentException("File is null or empty");
        }

        // 2. Validate size
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("File size exceeds limit: {} bytes (max: {} bytes)",
                    file.getSize(), MAX_FILE_SIZE);
            throw new IllegalArgumentException(
                    String.format("File too large. Maximum size is %d MB", MAX_FILE_SIZE / 1024 / 1024)
            );
        }

        // 3. Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            log.warn("Invalid content type: {}", contentType);
            throw new IllegalArgumentException(
                    "Invalid file type. Only images (JPG, PNG, GIF, WebP) are allowed"
            );
        }

        // 4. Validate extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            log.warn("File has no filename");
            throw new IllegalArgumentException("File must have a filename");
        }

        String ext = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            log.warn("Invalid file extension: {}", ext);
            throw new IllegalArgumentException(
                    "Invalid file extension. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS)
            );
        }

        // 5. Sanitize type parameter - prevent path traversal
        String safeType = sanitizeType(type);
        if (safeType.isBlank()) {
            log.warn("Invalid type parameter after sanitization: {}", type);
            throw new IllegalArgumentException("Invalid upload type");
        }

        // 6. Validate file content (magic bytes) - prevent file type spoofing
        validateFileContent(file, ext);

        // 7. Create upload directory
        Path uploadPath = Paths.get(basePath, safeType);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("Created upload directory: {}", uploadPath);
        }

        // 8. Generate safe filename
        String fileName = UUID.randomUUID() + "." + ext.toLowerCase();
        Path filePath = uploadPath.resolve(fileName);

        // 9. Ensure file path is within upload directory (extra safety)
        if (!filePath.normalize().startsWith(uploadPath.normalize())) {
            log.error("Path traversal attempt detected: {}", filePath);
            throw new SecurityException("Invalid file path");
        }

        // 10. Upload file
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File uploaded successfully: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", fileName, e);
            throw new IOException("Failed to upload file: " + e.getMessage(), e);
        }

        // 11. Return relative path
        String relativePath = "images/" + safeType + "/" + fileName;
        log.info("File upload completed. Relative path: {}", relativePath);

        return relativePath;
    }

    /**
     * Extract file extension from filename
     */
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    /**
     * Sanitize type parameter to prevent path traversal
     */
    private String sanitizeType(String type) {
        if (type == null) {
            return "";
        }
        // Remove any characters that are not alphanumeric, underscore, or hyphen
        return type.replaceAll("[^a-zA-Z0-9_-]", "");
    }

    /**
     * Validate file content by checking magic bytes (file signature)
     * This prevents attackers from uploading malicious files with fake extensions
     */
    private void validateFileContent(MultipartFile file, String expectedExtension) throws IOException {
        byte[] fileHeader = new byte[12]; // Read first 12 bytes for magic number check

        try {
            int bytesRead = file.getInputStream().read(fileHeader);
            if (bytesRead < 2) {
                throw new IllegalArgumentException("File is too small or corrupted");
            }
        } catch (IOException e) {
            log.error("Failed to read file header", e);
            throw new IOException("Failed to validate file content", e);
        }

        // Check magic bytes based on expected extension
        boolean isValid;
        String detectedType;

        switch (expectedExtension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                // JPEG magic bytes: FF D8 FF
                isValid = (fileHeader[0] == (byte) 0xFF &&
                        fileHeader[1] == (byte) 0xD8 &&
                        fileHeader[2] == (byte) 0xFF);
                detectedType = "JPEG";
                break;

            case "png":
                // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
                isValid = (fileHeader[0] == (byte) 0x89 &&
                        fileHeader[1] == (byte) 0x50 &&
                        fileHeader[2] == (byte) 0x4E &&
                        fileHeader[3] == (byte) 0x47);
                detectedType = "PNG";
                break;

            case "gif":
                // GIF magic bytes: 47 49 46 38 (GIF8)
                isValid = (fileHeader[0] == (byte) 0x47 &&
                        fileHeader[1] == (byte) 0x49 &&
                        fileHeader[2] == (byte) 0x46 &&
                        fileHeader[3] == (byte) 0x38);
                detectedType = "GIF";
                break;

            case "webp":
                // WebP magic bytes: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
                isValid = (fileHeader[0] == (byte) 0x52 &&
                        fileHeader[1] == (byte) 0x49 &&
                        fileHeader[2] == (byte) 0x46 &&
                        fileHeader[3] == (byte) 0x46 &&
                        fileHeader[8] == (byte) 0x57 &&
                        fileHeader[9] == (byte) 0x45 &&
                        fileHeader[10] == (byte) 0x42 &&
                        fileHeader[11] == (byte) 0x50);
                detectedType = "WebP";
                break;

            default:
                log.warn("Unknown extension for validation: {}", expectedExtension);
                throw new IllegalArgumentException("Unsupported file type: " + expectedExtension);
        }

        if (!isValid) {
            log.warn("File content does not match extension. Expected: {}, Detected: {}",
                    expectedExtension, detectedType);
            throw new IllegalArgumentException(
                    "File content does not match its extension. Possible file type spoofing."
            );
        }

        log.debug("File content validated successfully: {}", detectedType);
    }
}