package br.com.dv.ecommerce.config;

import br.com.dv.ecommerce.entity.Country;
import br.com.dv.ecommerce.entity.Product;
import br.com.dv.ecommerce.entity.ProductCategory;
import br.com.dv.ecommerce.entity.State;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class RestConfig implements RepositoryRestConfigurer, WebMvcConfigurer {

    private final EntityManager entityManager;

    private final HttpMethod[] unsupportedActions = {
            HttpMethod.PUT,
            HttpMethod.POST,
            HttpMethod.PATCH,
            HttpMethod.DELETE
    };

    @Value("${allowed.origins}")
    private String[] projectAllowedOrigins;

    @Value("${spring.data.rest.base-path}")
    private String basePath;

    public RestConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    // Repository configuration
    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        disableHttpMethods(Product.class, config, unsupportedActions);
        disableHttpMethods(ProductCategory.class, config, unsupportedActions);
        disableHttpMethods(State.class, config, unsupportedActions);
        disableHttpMethods(Country.class, config, unsupportedActions);

        exposeEntityIds(config);

        cors.addMapping(basePath + "/**").allowedOrigins(projectAllowedOrigins);
    }

    private void disableHttpMethods(
            Class<?> theClass,
            RepositoryRestConfiguration config,
            HttpMethod[] unsupportedActions
    ) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure((metadata, httpMethods) -> httpMethods.disable(unsupportedActions))
                .withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(unsupportedActions));
    }

    private void exposeEntityIds(RepositoryRestConfiguration config) {
        Class<?>[] domainTypes = entityManager.getMetamodel().getEntities().stream()
                .map(EntityType::getJavaType)
                .toArray(Class<?>[]::new);

        config.exposeIdsFor(domainTypes);
    }

    // Controller configuration
    @Override
    public void addCorsMappings(CorsRegistry cors) {
        cors.addMapping(basePath + "/**").allowedOrigins(projectAllowedOrigins);
    }

}
