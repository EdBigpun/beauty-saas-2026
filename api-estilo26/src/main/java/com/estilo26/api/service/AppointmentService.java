package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.AppointmentStatus;
import com.estilo26.api.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service // (1) Indica que aquí está la Lógica de Negocio.
public class AppointmentService {

    // Inyectamos el repositorio (El bibliotecario)
    @Autowired
    private AppointmentRepository appointmentRepository;

    // MÉTODO 1: Crear una nueva cita
    public Appointment createAppointment(Appointment nuevaCita) {

        // REGLA 1: Validar que la hora no esté ocupada
        boolean ocupado = appointmentRepository.existsByStartTimeAndEndTime(
                nuevaCita.getStartTime(),
                nuevaCita.getEndTime()
        );

        if (ocupado) {
            // Si está ocupado, lanzamos un error (excepción) que detiene todo.
            throw new RuntimeException("Lo sentimos, ese horario ya está reservado.");
        }

        // REGLA 2: Toda cita nueva nace como "PENDIENTE"
        nuevaCita.setStatus(AppointmentStatus.PENDING);

        // Si pasa las reglas, guardamos en la BD
        return appointmentRepository.save(nuevaCita);
    }

    // MÉTODO 2: Listar todas las citas (Para verlas en el calendario)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Método para borrar una cita
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    // Método para confirmar una cita (Cambiar estado a CONFIRMED)
    public Appointment confirmAppointment(Long id) {
        // 1. Buscamos la cita por ID
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        // 2. Cambiamos el estado usando el Enum
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        // 3. Guardamos el cambio
        return appointmentRepository.save(appointment);
    }

}
