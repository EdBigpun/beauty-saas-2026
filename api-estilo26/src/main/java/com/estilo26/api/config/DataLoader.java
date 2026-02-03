package com.estilo26.api.config;

import com.estilo26.api.model.Service;
import com.estilo26.api.model.User;
import com.estilo26.api.repository.ServiceRepository;
import com.estilo26.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository; // Nuevo: Inyectamos el repositorio de usuarios

    public DataLoader(ServiceRepository serviceRepository, UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. SEMBRAR SERVICIOS (Lógica existente)
        if (serviceRepository.count() == 0) {
            System.out.println("🚀 Base de datos vacía. Sembrando lista de precios oficial...");
            Service corte = new Service();
            corte.setName("Corte de Cabello");
            corte.setDescription("Corte clásico, moderno, fade, etc.");
            corte.setPrice(new BigDecimal("200.00"));
            corte.setDurationMinutes(45);

            Service barba = new Service();
            barba.setName("Barba");
            barba.setDescription("Perfilado, afeitado o rebaje");
            barba.setPrice(new BigDecimal("150.00"));
            barba.setDurationMinutes(30);

            Service cejas = new Service();
            cejas.setName("Cejas");
            cejas.setDescription("Limpieza y delineado de cejas");
            cejas.setPrice(new BigDecimal("100.00"));
            cejas.setDurationMinutes(15);

            serviceRepository.saveAll(List.of(corte, barba, cejas));
            System.out.println("✅ Servicios creados.");
        }

        // 2. SEMBRAR USUARIO ADMIN (Nueva lógica)
        if (userRepository.count() == 0) {
            System.out.println("👤 Creando usuario administrador inicial...");
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@estilo26.com");
            admin.setRole("ADMIN");
            // NOTA: En el futuro aquí usaremos passwordEncoder.encode("admin123")
            // Por ahora guardamos texto plano para probar la conexión básica
            admin.setPassword("admin123");

            userRepository.save(admin);
            System.out.println("✅ Usuario 'admin' creado con éxito.");
        }
    }
}