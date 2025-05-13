package com.hiremate.config; // ✅ Change if you use a different package

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class ResumeWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resumePath = Paths.get(System.getProperty("user.dir"), "uploads", "resumes").toUri().toString();

        registry.addResourceHandler("/uploads/resumes/**")
                .addResourceLocations(resumePath)
                .setCachePeriod(0); // Optional for dev
    }
}
