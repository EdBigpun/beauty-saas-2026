package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalTime;
import java.util.List; // Importante para las listas

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // MÉTODO NUEVO: LEER TODAS LAS CITAS
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // MÉTODO EXISTENTE: CREAR CITA (Sin cambios en la lógica)
    public Appointment createAppointment(Appointment nuevaCita) {
        // 1. Calcular hora fin
        int totalMinutes = nuevaCita.getServices().stream()
                .mapToInt(Service::getDurationMinutes)
                .sum();
        if (totalMinutes == 0) totalMinutes = 30;

        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);
        nuevaCita.setEndTime(horaFin);

        // 2. Validar
        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaCita.getAppointmentDate(),
                nuevaCita.getAppointmentTime()
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está reservado.");
        }

        // 3. Guardar
        nuevaCita.setStatus("PENDIENTE");
        return appointmentRepository.save(nuevaCita);
    }

    // --- NUEVO MÉTODO: ACTUALIZAR ESTADO ---
    // Recibe el ID de la cita (cuál cambiar) y el nuevo estado (qué ponerle)
    public Appointment updateStatus(Long id, String newStatus) {
        // 1. BUSCAR: Intentamos encontrar la cita en la BD por su ID.
        // .findById devuelve un "Optional" (una caja que puede estar llena o vacía)
        return appointmentRepository.findById(id)
                .map(cita -> {
                    // 2. MODIFICAR: Si la encontramos, cambiamos su estado.
                    cita.setStatus(newStatus);
                    // 3. GUARDAR: Hibernate detecta que ya existe y hace un UPDATE en vez de INSERT.
                    return appointmentRepository.save(cita);
                })
                // 4. ERROR: Si la caja estaba vacía (no existe el ID), lanzamos error.
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
    }
}
