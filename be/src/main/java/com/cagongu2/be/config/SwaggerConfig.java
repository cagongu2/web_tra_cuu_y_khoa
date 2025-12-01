package com.cagongu2.be.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Medical Content Platform")
                        .version("1.0.0")
                        .description("API documentation")
                        .contact(new Contact()
                                .name("Thai")
                                .email("hophucthai9@gmail.com")
                                .url("https://github.com/cagongu2"))
                        );
    }
}