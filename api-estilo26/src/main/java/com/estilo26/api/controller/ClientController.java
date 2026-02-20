package com.estilo26.api.controller;

import com.estilo26.api.dto.ClientDTO;
import com.estilo26.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController // Le dice a Java: "Soy un mesero, devuelvo datos JSON, no páginas web".
@RequestMapping("/api/clients") // La ruta principal. Todas las peticiones aquí empiezan con /api/clients
public class ClientController {

    @Autowired
    private AppointmentService appointmentService; // Llamamos al Chef

    // --- ENDPOINT PARA OBTENER LOS VIP ---
    // Cuando el frontend pida un GET a "http://localhost:9090/api/clients/vip"
    @GetMapping("/vip")
    public List<ClientDTO> getVIPClients() {
        // El mesero le pide el plato al chef y se lo entrega al cliente
        return appointmentService.getVIPClients();
    }
}
