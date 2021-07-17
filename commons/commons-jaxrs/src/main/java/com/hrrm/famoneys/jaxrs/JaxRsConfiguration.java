package com.hrrm.famoneys.jaxrs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.parser.OpenAPIV3Parser;

@Configuration
public class JaxRsConfiguration {

    @Bean
    public OpenAPIV3Parser openApiParser() {
        return new OpenAPIV3Parser();
    }

}
