package com.estilo26.api.config;

import com.estilo26.api.model.Service;
import com.estilo26.api.model.User;
import com.estilo26.api.repository.ServiceRepository;
import com.estilo26.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder; // (1) IMPORTANTE
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // (2) Nueva herramienta inyectada

    // (3) Constructor actualizado: Ahora pedimos el PasswordEncoder también
    public DataLoader(ServiceRepository serviceRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. SEMBRAR SERVICIOS
        if (serviceRepository.count() == 0) {
            System.out.println("🚀 Sembrando servicios...");
            Service corte = new Service();
            corte.setName("Corte de Cabello");
            corte.setPrice(new BigDecimal("200.00"));
            corte.setDurationMinutes(45);

            Service barba = new Service();
            barba.setName("Barba");
            barba.setPrice(new BigDecimal("150.00"));
            barba.setDurationMinutes(30);

            Service cejas = new Service();
            cejas.setName("Cejas");
            cejas.setPrice(new BigDecimal("100.00"));
            cejas.setDurationMinutes(15);

            serviceRepository.saveAll(List.of(corte, barba, cejas));
        }

        // 2. SEMBRAR USUARIO ADMIN
        if (userRepository.count() == 0) {
            System.out.println("👤 Creando usuario administrador inicial...");
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@estilo26.com");
            admin.setRole("ADMIN");

            // (4) EL CAMBIO CRÍTICO:
            // Antes: admin.setPassword("admin123");  <-- ESTO ESTABA MAL
            // Ahora: Usamos el encoder para convertir "admin123" en "$2a$10$..."
            admin.setPassword(passwordEncoder.encode("admin123"));

            userRepository.save(admin);
            System.out.println("✅ Usuario 'admin' creado con contraseña ENCRIPTADA.");
        }
    }
}
