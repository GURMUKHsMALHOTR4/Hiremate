package com.hiremate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ Allow access to resumes from the uploads folder
        registry.addResourceHandler("/uploads/resumes/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/resumes/");
    }
}
