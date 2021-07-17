package com.hrrm.famoneys.swaggerui.apis;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.hrrm.famoneys.jaxrs.ApiSpecification;
import com.pivovarit.function.ThrowingFunction;

import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.parser.OpenAPIV3Parser;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RestController
@RequestMapping("/spec")
public class ApisController {

    private final Map<String, Pair<ApiSpecification, OpenAPI>> specifications;
    private final OpenAPIV3Parser openApiParser;

    public ApisController(OpenAPIV3Parser openApiParser, List<ApiSpecification> specifications) {
        this.openApiParser = openApiParser;
        this.specifications = specifications.stream()
            .collect(Collectors.toMap(ApiSpecification::getName, ThrowingFunction.sneaky(spec -> Pair.of(spec,
                parseSwagger(spec)))));
    }

    private OpenAPI parseSwagger(ApiSpecification specification) throws IOException {
        try (final var specStream = specification.getSpecificationResource()
            .getInputStream()) {
            final var specString = IOUtils.toString(specStream, StandardCharsets.UTF_8);
            return openApiParser.readContents(specString)
                .getOpenAPI();
        } catch (final IOException e) {
            log.error("Es ist ein Fehler in abarbeitung von OpenApi Spezifikation: \"{}\"", specification.getName());
            throw e;
        }
    }

    @GetMapping(
            path = "apis.js",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public String getApis(HttpServletRequest request) {
        log.debug("APIS Spezifikationsliste in form von JavaScript ist abgefragt.");
        final var stringBuilder = new StringBuilder("var apis = [\r\n");
        final var apisList = specifications.values()
            .stream()
            .map(Pair::getKey)
            .map(spec -> MessageFormat.format("'{' url: \"{0}/spec/{1}.json\", name: \"{2}\" '}'", request
                .getContextPath(), spec.getName(), spec.getDescription()))
            .collect(Collectors.joining(" ,"));
        stringBuilder.append(apisList);
        stringBuilder.append("\r\n];\r\n");
        final var specificationsScript = stringBuilder.toString();
        log.debug("APIS Spezifikationsliste in form von JavaScript ist vorbereitet.");
        return specificationsScript;
    }

    @GetMapping(
            path = "{api}.json",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<String> getApi(@PathVariable String api, HttpServletRequest request) {
        log.debug("Requesting OpenAPI Spezifikation für REST-Schnittstelle \"{}\".", api);
        try {
            if (specifications.containsKey(api)) {
                final var specificationTuple = specifications.get(api);
                final var openApiSpec = specificationTuple.getValue();
                final var url = UriComponentsBuilder.fromHttpRequest(new ServletServerHttpRequest(request))
                    .replacePath(specificationTuple.getKey()
                        .getApiPath())
                    .build();
                openApiSpec.setServers(List.of(new Server().url(url.toString())));
                final var spec = Json.mapper()
                    .enable(SerializationFeature.INDENT_OUTPUT)
                    .writeValueAsString(openApiSpec);
                log.debug("OpenAPI Spezifikation für REST-Schnittstelle \"{}\" ist geliefert.", api);
                return ResponseEntity.ok(spec);
            } else {
                final var errorMessage = MessageFormat.format("Unbenkante REST-Schnittstelle: \"{0}\"", api);
                log.warn(errorMessage);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(errorMessage);
            }
        } catch (final JsonProcessingException e) {
            final var message = "OpenAPI Spezifikation konnte nicht geliefert werden.";
            log.error(message, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(message);
        }
    }

}