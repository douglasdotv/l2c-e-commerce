package br.com.dv.ecommerce.config;

import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;

@Configuration
public class SecurityConfig {

    @Bean
    protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Protect "/api/orders" endpoint
        http.authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/orders/**")
                        .authenticated()
                        .anyRequest().permitAll())
                .oauth2ResourceServer()
                .jwt();

        // Add CORS filters
        http.cors();

        // Add content negotiation strategy (Accept header)
        http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy());

        // Send a 401 message to the browser
        Okta.configureResourceServer401ResponseBody(http);

        // Disable CSRF since the service is stateless
        http.csrf().disable();

        return http.build();
    }

}
