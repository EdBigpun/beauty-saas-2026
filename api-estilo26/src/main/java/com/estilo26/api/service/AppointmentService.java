package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.repository.AppointmentRepository;
import com.estilo26.api.dto.ClientDTO;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment createAppointment(Appointment nuevaCita) {
        int totalMinutes = nuevaCita.getServices().stream()
                .mapToInt(Service::getDurationMinutes)
                .sum();
        if (totalMinutes == 0) totalMinutes = 30;

        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);
        nuevaCita.setEndTime(horaFin);

        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaCita.getAppointmentDate(),
                nuevaCita.getAppointmentTime()
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está reservado.");
        }

        nuevaCita.setStatus("PENDIENTE");
        return appointmentRepository.save(nuevaCita);
    }

    public Appointment updateStatus(Long id, String newStatus) {
        return appointmentRepository.findById(id)
                .map(cita -> {
                    cita.setStatus(newStatus);
                    return appointmentRepository.save(cita);
                })
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
    }

    public Appointment rescheduleAppointment(Long id, String newDate, String newTime) {
        Appointment cita = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        LocalDate nuevaFecha = LocalDate.parse(newDate);
        LocalTime nuevaHora = LocalTime.parse(newTime);
        if (newTime.length() == 5) {
            nuevaHora = LocalTime.parse(newTime + ":00");
        }

        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaFecha,
                nuevaHora
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está ocupado.");
        }

        cita.setAppointmentDate(nuevaFecha);
        cita.setAppointmentTime(nuevaHora);
        cita.setEndTime(nuevaHora.plusMinutes(30));
        cita.setStatus("PENDIENTE");

        // --- AQUÍ ESTÁ LA MAGIA ---
        cita.setRescheduled(true);

        return appointmentRepository.save(cita);
    }

    // --- NUEVO: OBTENER CLIENTES VIP ---
    // Este método es el "Chef" pidiéndole al "Almacén" (Repository) la lista agrupada.
    public List<ClientDTO> getVIPClients() {
        return appointmentRepository.findTopVIPClients();
    }
}
