package com.estilo26.api.config;

import com.estilo26.api.model.Service;
import com.estilo26.api.repository.ServiceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final ServiceRepository serviceRepository;

    public DataLoader(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Solo sembramos si la base de datos está totalmente vacía
        if (serviceRepository.count() == 0) {
            System.out.println("🚀 Base de datos vacía. Sembrando lista de precios oficial...");

            // 1. Corte de Cabello
            Service corte = new Service();
            corte.setName("Corte de Cabello");
            corte.setDescription("Corte clásico, moderno, fade, etc.");
            corte.setPrice(new BigDecimal("200.00"));
            corte.setDurationMinutes(45); // Estimamos 45 min (ajustable después)

            // 2. Barba
            Service barba = new Service();
            barba.setName("Barba");
            barba.setDescription("Perfilado, afeitado o rebaje");
            barba.setPrice(new BigDecimal("150.00"));
            barba.setDurationMinutes(30);

            // 3. Cejas (Lo que faltaba)
            Service cejas = new Service();
            cejas.setName("Cejas");
            cejas.setDescription("Limpieza y delineado de cejas");
            cejas.setPrice(new BigDecimal("100.00"));
            cejas.setDurationMinutes(15);

            // Guardamos la lista oficial
            serviceRepository.saveAll(List.of(corte, barba, cejas));

            System.out.println("✅ Lista de precios (Corte, Barba, Cejas) creada exitosamente.");
        } else {
            System.out.println("ℹ️ Ya existen servicios. No se tocó nada.");
        }
    }
}