package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;

// IMPORTANTE: Importamos las clases de tiempo para evitar errores
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // 1. LEER TODAS LAS CITAS
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // 2. CREAR CITA (Lógica original intacta)
    public Appointment createAppointment(Appointment nuevaCita) {
        // Calcular hora fin
        int totalMinutes = nuevaCita.getServices().stream()
                .mapToInt(Service::getDurationMinutes)
                .sum();
        if (totalMinutes == 0) totalMinutes = 30;

        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);
        nuevaCita.setEndTime(horaFin);

        // Validar disponibilidad
        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaCita.getAppointmentDate(),
                nuevaCita.getAppointmentTime()
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está reservado.");
        }

        // Guardar
        nuevaCita.setStatus("PENDIENTE");
        return appointmentRepository.save(nuevaCita);
    }

    // 3. ACTUALIZAR ESTADO (Para el botón gestionar)
    public Appointment updateStatus(Long id, String newStatus) {
        return appointmentRepository.findById(id)
                .map(cita -> {
                    cita.setStatus(newStatus);
                    return appointmentRepository.save(cita);
                })
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
    }

    // 4. REAGENDAR CITA (CORREGIDO Y ÚNICO)
    public Appointment rescheduleAppointment(Long id, String newDate, String newTime) {
        // A. Buscar la cita original
        Appointment cita = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // B. CONVERSIONES (Texto del Frontend -> Objeto Java)
        // Convertimos "2026-02-20" a LocalDate
        LocalDate nuevaFecha = LocalDate.parse(newDate);

        // Convertimos "15:30" a LocalTime
        LocalTime nuevaHora = LocalTime.parse(newTime);

        // Parche por si la hora viene corta ("15:30" -> "15:30:00")
        if (newTime.length() == 5) {
            nuevaHora = LocalTime.parse(newTime + ":00");
        }

        // C. VALIDACIÓN (Usando Objetos Reales)
        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaFecha,
                nuevaHora
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está ocupado.");
        }

        // D. ACTUALIZAR DATOS
        cita.setAppointmentDate(nuevaFecha);
        cita.setAppointmentTime(nuevaHora);

        // Recalcular hora fin (Sumamos 30 min al objeto hora)
        cita.setEndTime(nuevaHora.plusMinutes(30));

        // Al reagendar, vuelve a ser Pendiente
        cita.setStatus("PENDIENTE");

        return appointmentRepository.save(cita);
    }
}
