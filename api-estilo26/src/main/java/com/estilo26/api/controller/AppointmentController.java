package com.estilo26.api.controller;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // 1. GET: VER TODAS LAS CITAS (¡Esto es lo que faltaba!)
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // 2. POST: CREAR CITA
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment nuevaCita = appointmentService.createAppointment(appointment);
            return ResponseEntity.ok(nuevaCita);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- NUEVO ENDPOINT: PUT (Actualizar) ---
    // La URL será: /api/appointments/{id}/status?status=COMPLETADA
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,      // Toma el ID de la URL
            @RequestParam String status // Toma el estado de los parámetros (?status=...)
    ) {
        try {
            Appointment updatedAppointment = appointmentService.updateStatus(id, status);
            return ResponseEntity.ok(updatedAppointment); // Devuelve la cita ya corregida
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Error 400 si no existe
        }
    }
}
