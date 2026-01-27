package com.estilo26.api.controller;

import com.estilo26.api.model.Service;
import com.estilo26.api.repository.ServiceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController // (1) Indica que esta clase atiende peticiones web (JSON)
@RequestMapping("/api/services") // (2) La dirección base será: localhost:9090/api/services
@CrossOrigin(origins = "http://localhost:3000") // (3) Permite que tu Web (Next.js) pida datos sin bloqueo
public class ServiceController {

    private final ServiceRepository serviceRepository;

    // Inyección de Dependencias: Spring nos da el repositorio listo para usar
    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // (4) El Endpoint GET
    // Cuando alguien visite la URL, ejecutamos esto:
    @GetMapping
    public List<Service> getAllServices() {
        // Usamos el superpoder .findAll() que nos dio JpaRepository
        return serviceRepository.findAll();
    }
}