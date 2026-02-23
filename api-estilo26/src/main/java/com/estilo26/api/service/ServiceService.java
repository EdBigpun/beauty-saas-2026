package com.estilo26.api.service;

import com.estilo26.api.model.Service;
import com.estilo26.api.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public Service createService(Service service) {
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

    // --- LA LÓGICA DE ELIMINAR ---
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}
