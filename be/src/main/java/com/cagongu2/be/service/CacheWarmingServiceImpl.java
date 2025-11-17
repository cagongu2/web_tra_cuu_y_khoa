package com.cagongu2.be.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheWarmingServiceImpl implements CacheWarmingService {

    private final CategoryService categoryService;
    private final FooterService footerService;

    /**
     * Warm up cache when application starts
     */
    @Override
    @EventListener(ApplicationReadyEvent.class)
    public void warmUpCache() {
        log.info("Starting cache warm-up...");

        try {
            // Warm up categories cache
            log.info("Warming up categories cache...");
            categoryService.getAllCategoriesByLevel(0);
            categoryService.getAllCategoriesByLevel(1);
            categoryService.getAllCategoriesFlat();

            // Warm up footer cache
            log.info("Warming up footer cache...");
            footerService.getFooterByStatus(true);

            log.info("Cache warm-up completed successfully");

        } catch (Exception e) {
            log.error("Error during cache warm-up", e);
        }
    }
}
