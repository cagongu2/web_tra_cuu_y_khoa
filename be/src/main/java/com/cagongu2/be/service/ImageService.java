package com.cagongu2.be.service;

import com.cagongu2.be.model.Image;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ImageService {
    Image getCurrentImageByType(String type);
    Image createInfoImage(MultipartFile file, String type) throws IOException;
}
