package com.cagongu2.be.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomJwtDecoder customJwtDecoder;

    /**
     * Public endpoints - no authentication required
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/authenticate/login",
            "/api/authenticate/register",
            "/actuator/health",
            "/actuator/info"
    };

    /**
     * Public READ-ONLY endpoints - anyone can view
     */
    private static final String[] PUBLIC_READ_ENDPOINTS = {
            "/api/posts/**",
            "/api/categories/**",
            "/api/footers/active",
            "/api/images/**",
            "/images/**",
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // Disable CSRF for stateless REST API (we'll use JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // Enable CSRF with cookie repository (for browser-based clients)
//                .csrf(csrf -> csrf
//                        .csrfTokenRepository(csrfTokenRepository())
//                        .csrfTokenRequestHandler(csrfTokenRequestHandler())
//                        // Ignore CSRF for stateless API endpoints using JWT
//                        .ignoringRequestMatchers("/api/authenticate/**")
//                )

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless session management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // Public GET endpoints
                        .requestMatchers(HttpMethod.GET, PUBLIC_READ_ENDPOINTS).permitAll()

                        // Admin endpoints - require ADMIN role
                        .requestMatchers("/api/users/**").hasRole("admin")
                        .requestMatchers("/api/footers/**").hasRole("admin")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("admin")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("admin")
                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // Post management - require authentication
                        .requestMatchers(HttpMethod.POST, "/api/posts/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/posts/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/posts/**").authenticated()

                        // File upload - require authentication
                        .requestMatchers("/api/upload/**").authenticated()

                        // Upload image - require authentication (avt)
                        .requestMatchers("/api/images/**").authenticated()

                        // Introspect and refresh - require authentication
                        .requestMatchers("/api/authenticate/introspect").authenticated()
                        .requestMatchers("/api/authenticate/refresh").authenticated()
                        .requestMatchers("/api/authenticate/logout").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // OAuth2 Resource Server with JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(customJwtDecoder)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return httpSecurity.build();
    }

    /**
     * CORS configuration - IMPORTANT: Configure for production
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // IMPORTANT: Change this in production to your actual frontend domains
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://yourdomain.com" // Add your production domain
        ));

        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Allowed headers - be specific in production
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control"
        ));

        // Expose headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Disposition"
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // How long the response from a pre-flight request can be cached
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * JWT Authentication Converter
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        // Extract roles from "scope" claim
        jwtGrantedAuthoritiesConverter.setAuthoritiesClaimName("scope");
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); // Already has ROLE_ prefix

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    /**
     * Password encoder with strength 12 for production
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Increased from 10 to 12
    }
}