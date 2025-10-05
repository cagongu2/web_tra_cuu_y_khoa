package com.cagongu2.be.service;

import com.cagongu2.be.model.Image;
import com.cagongu2.be.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {
    private final ImageRepository imageRepository;
    private final FileUploadService fileUploadService;

    @Override
    public Image getCurrentImageByType(String type) {
        return imageRepository.findAllByType(type).stream().findFirst().orElse(null);
    }

    @Override
    @Transactional
    public Image createInfoImage(MultipartFile file, String type) throws IOException {
        // banner, logo and favicon
        Image currentImg = getCurrentImageByType(type);

        if (currentImg != null) {
            deleteImg(currentImg);
            imageRepository.delete(currentImg);
        }

        String url = fileUploadService.uploadFile(file, type);

        Image newImg = Image.builder()
                .type(type)
                .url(url)
                .build();

        return imageRepository.save(newImg);
    }

    private static void deleteImg(Image img) {
        File file = new File(img.getUrl());
        if (file.exists()) {
            if (file.delete()) {
                System.out.println("Xóa thành công: " + img.getUrl());
            } else {
                System.out.println("Không thể xóa file: " + img.getUrl());
            }
        } else {
            System.out.println("File không tồn tại: " + img.getUrl());
        }
    }
}
