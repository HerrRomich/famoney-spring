package com.hrrm.famoneys.jaxrs;

import org.springframework.core.io.Resource;

public interface ApiSpecification {

    String getName();

    String getApiPath();

    String getDescription();

    Resource getSpecificationResource();

}
