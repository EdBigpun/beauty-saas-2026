package com.estilo26.api.controller;

import com.estilo26.api.model.Service;
import com.estilo26.api.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    // Ahora llamamos al Chef que acabas de crear
    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public List<Service> getAllServices() {
        return serviceService.getAllServices();
    }

    @PostMapping
    public Service createService(@RequestBody Service service) {
        return serviceService.createService(service);
    }

    @PutMapping("/{id}")
    public Service updateService(@PathVariable Long id, @RequestBody Service serviceDetails) {
        return serviceService.updateService(id, serviceDetails);
    }

    // --- NUEVO ENDPOINT PARA BORRAR ---
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
    }
}
