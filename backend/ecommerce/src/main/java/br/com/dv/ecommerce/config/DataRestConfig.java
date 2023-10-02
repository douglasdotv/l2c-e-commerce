package br.com.dv.ecommerce.config;

import br.com.dv.ecommerce.entity.Country;
import br.com.dv.ecommerce.entity.Product;
import br.com.dv.ecommerce.entity.ProductCategory;
import br.com.dv.ecommerce.entity.State;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class DataRestConfig implements RepositoryRestConfigurer {

    private final EntityManager entityManager;

    public DataRestConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        HttpMethod[] unsupportedActions = {
                HttpMethod.PUT,
                HttpMethod.POST,
                HttpMethod.DELETE
        };

        // Disable HTTP methods PUT, POST and DELETE for Product, ProductCategory, State and Country
        disableHttpMethods(Product.class, config, unsupportedActions);
        disableHttpMethods(ProductCategory.class, config, unsupportedActions);
        disableHttpMethods(State.class, config, unsupportedActions);
        disableHttpMethods(Country.class, config, unsupportedActions);

        // Expose entity ids
        exposeIds(config);
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

    private void exposeIds(RepositoryRestConfiguration config) {
        Class<?>[] domainTypes = entityManager.getMetamodel().getEntities().stream()
                .map(EntityType::getJavaType)
                .toArray(Class<?>[]::new);

        config.exposeIdsFor(domainTypes);
    }

}
