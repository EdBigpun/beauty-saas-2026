package com.estilo26.api.controller;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // 1. GET: VER TODAS LAS CITAS
    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    // 2. POST: CREAR CITA (Ahora soporta isWalkIn si lo mandas desde React)
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

    // ========================================================================
    // 3. PUT: ACTUALIZAR ESTADO Y HACER CHECKOUT (ARQUEO)
    // ========================================================================
    // Mantenemos el endpoint original, pero lo potenciamos.
    // React podrá mandar parámetros opcionales para los pagos:
    // /api/appointments/{id}/status?status=COMPLETADA&paymentMethod=EFECTIVO&discount=0&tip=50
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            // (Opcional) Si React no los manda, el backend no colapsa y asume CERO.
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) BigDecimal discount,
            @RequestParam(required = false) BigDecimal tip
    ) {
        try {
            // Llamamos a nuestro nuevo Motor de Checkout en el servicio
            Appointment updatedAppointment = appointmentService.checkoutAppointment(id, status, paymentMethod, discount, tip);
            return ResponseEntity.ok(updatedAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. PUT: REAGENDAR
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> reschedule(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam String time
    ) {
        try {
            Appointment updated = appointmentService.rescheduleAppointment(id, date, time);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
