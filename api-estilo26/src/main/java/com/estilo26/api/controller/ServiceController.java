package com.estilo26.api.controller;

import com.estilo26.api.model.Service;
import com.estilo26.api.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
// (1) IMPORTANTE: Configuración CORS individual para este controlador
// Esto permite que el Frontend (puerto 3000) hable con este controlador sin problemas.
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // 1. GET: Obtener todos los servicios (Ya lo tenías)
    @GetMapping
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    // 2. POST: Crear un nuevo servicio (NUEVO - Esto arregla tu problema)
    @PostMapping
    public Service createService(@RequestBody Service service) {
        // Guardamos directamente usando el repositorio
        return serviceRepository.save(service);
    }

    // 3. PUT: Editar un servicio existente (NUEVO - Para que funcione el lápiz)
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody Service serviceDetails) {
        // Buscamos si existe el servicio con ese ID
        Optional<Service> optionalService = serviceRepository.findById(id);

        if (optionalService.isPresent()) {
            Service existingService = optionalService.get();

            // Actualizamos los datos
            existingService.setName(serviceDetails.getName());
            existingService.setDescription(serviceDetails.getDescription());
            existingService.setPrice(serviceDetails.getPrice());
            existingService.setDurationMinutes(serviceDetails.getDurationMinutes());

            // Guardamos los cambios
            Service updatedService = serviceRepository.save(existingService);
            return ResponseEntity.ok(updatedService);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
