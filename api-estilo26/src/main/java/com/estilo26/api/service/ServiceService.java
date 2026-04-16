package com.estilo26.api.service;

import com.estilo26.api.model.Service;
import com.estilo26.api.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    // -------------------------------------------------------------
    // EL CAMBIO PRINCIPAL ESTÁ AQUÍ
    // -------------------------------------------------------------
    public List<Service> getAllServices() {
        // ANTES: return serviceRepository.findAll(); (Esto traía los zombies)
        // AHORA: Usamos la función que inventamos en el Paso 1.
        return serviceRepository.findByIsActiveTrueOrderByIdAsc();
    }

    public Service createService(Service service) {
        if (service.getIsActive() == null) {
            service.setIsActive(true);
        }
        return serviceRepository.save(service);
    }

    public Service updateService(Long id, Service serviceDetails) {
        return serviceRepository.findById(id).map(service -> {
            service.setName(serviceDetails.getName());
            service.setDescription(serviceDetails.getDescription());
            service.setPrice(serviceDetails.getPrice());
            service.setDurationMinutes(serviceDetails.getDurationMinutes());
            service.setIcon(serviceDetails.getIcon());
            return serviceRepository.save(service);
        }).orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    public void deleteService(Long id) {
        Service existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado con ID: " + id));

        // El Soft Delete: Solo le quitamos la "vida" poniéndolo en false.
        existingService.setIsActive(false);
        serviceRepository.save(existingService);
    }
}
