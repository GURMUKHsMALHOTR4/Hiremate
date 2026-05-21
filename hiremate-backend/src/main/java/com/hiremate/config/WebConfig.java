package com.hiremate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String uploadPath =
                System.getenv("UPLOAD_DIR");

        if (uploadPath == null || uploadPath.isEmpty()) {

            uploadPath =
                    System.getProperty("user.dir")
                    + "/uploads/";
        }

        if (!uploadPath.endsWith("/")) {
            uploadPath += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        "file:" + uploadPath
                );
    }
}