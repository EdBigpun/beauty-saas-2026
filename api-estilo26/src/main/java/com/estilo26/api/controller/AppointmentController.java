package com.estilo26.api.controller;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService; // Usamos el Servicio, no el Repo directo

    // POST: Crear nueva reserva
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            // Le pasamos la 'papa caliente' al Servicio para que valide
            Appointment nuevaCita = appointmentService.createAppointment(appointment);
            return ResponseEntity.ok(nuevaCita);
        } catch (RuntimeException e) {
            // Si el servicio dice "Horario ocupado", devolvemos error 400 con el mensaje
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
