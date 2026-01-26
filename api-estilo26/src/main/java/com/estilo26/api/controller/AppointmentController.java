package com.estilo26.api.controller;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // (1)
@RequestMapping("/api/appointments") // (2)
@CrossOrigin(origins = "http://localhost:3000") // (3)
public class AppointmentController {

    @Autowired // (4)
    private AppointmentService appointmentService;

    // CAPACIDAD: AGENDAR UNA CITA
    @PostMapping // (5)
    public ResponseEntity<Appointment> agendarCita(@RequestBody Appointment cita) { // (6)
        try {
            Appointment nuevaCita = appointmentService.createAppointment(cita);
            return ResponseEntity.ok(nuevaCita); // (7)
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build(); // (8)
        }
    }

    // CAPACIDAD: VER TODAS LAS CITAS
    @GetMapping // (9)
    public List<Appointment> verAgenda() {
        return appointmentService.getAllAppointments();
    }

    // Endpoint para Confirmar: PUT /api/appointments/{id}/confirm
    @PutMapping("/{id}/confirm")
    public Appointment confirmAppointment(@PathVariable Long id) {
        return appointmentService.confirmAppointment(id);
    }

    // Endpoint para Borrar: DELETE /api/appointments/{id}
    @DeleteMapping("/{id}")
    public void deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
    }
}
