package com.estilo26.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // (1) ENCRIPTADOR DE CONTRASEÑAS
    // Este es el "Bateador" que convierte "admin123" en "$2a$10$..."
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // (2) REGLAS DE TRÁFICO (El Semáforo)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilitamos CSRF porque usaremos Tokens (JWT) más adelante
                .csrf(csrf -> csrf.disable())

                // Permitimos CORS (para que Next.js en el puerto 3000 pueda hablarnos)
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new CorsConfiguration();
                    corsConfig.setAllowedOrigins(List.of("http://localhost:3000"));
                    corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(List.of("*"));
                    return corsConfig;
                }))

                // REGLAS DE ACCESO (Actualizadas)
                .authorizeHttpRequests(auth -> auth
                        // 1. Permitir ver precios (Público)
                        .requestMatchers("/api/services").permitAll()

                        // 2. Permitir agendar citas (Público)
                        .requestMatchers("/api/appointments").permitAll()

                        // 3. NUEVO: Permitir entrar al Login (Público)
                        // Si no ponemos esto, nadie podría enviar su usuario/contraseña para validarse.
                        .requestMatchers("/api/auth/login").permitAll()

                        // 4. Todo lo demás (como borrar citas) requiere estar logueado
                        .anyRequest().authenticated()
                )

                // Habilitamos Login Básico por ahora (para probar en el navegador)
                .httpBasic(basic -> {});

        return http.build();
    }
}