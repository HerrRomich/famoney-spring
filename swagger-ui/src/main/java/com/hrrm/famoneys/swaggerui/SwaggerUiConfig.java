package com.hrrm.famoneys.swaggerui;

import java.io.IOException;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class SwaggerUiConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/spec/", "/spec/**")
            .addResourceLocations("classpath:/static/api/swagger-ui")
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {

                @Override
                protected Resource getResource(String resourcePath, Resource location) throws IOException {
                    final var requestedResource = location.createRelative(resourcePath);
                    return requestedResource.exists() && requestedResource.isReadable() ? requestedResource
                            : new ClassPathResource("/static/api/swagger-ui/index.html");
                }
            });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/spec")
            .setViewName("redirect:/spec/");
    }

}
