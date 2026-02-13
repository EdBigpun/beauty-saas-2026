package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalTime;

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment createAppointment(Appointment nuevaCita) {

        // 1. LÓGICA DE NEGOCIO: CALCULAR HORA DE FIN
        // Sumamos los minutos de cada servicio que eligió el cliente
        int totalMinutes = nuevaCita.getServices().stream()
                .mapToInt(Service::getDurationMinutes)
                .sum();

        if (totalMinutes == 0) totalMinutes = 30; // Seguridad por si viene vacío

        // Calculamos: Hora Inicio + Duración = Hora Fin
        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);

        // Guardamos ese dato en el modelo (Ahora sí existe el campo)
        nuevaCita.setEndTime(horaFin);

        // 2. VALIDAR SI ESTÁ OCUPADO
        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaCita.getAppointmentDate(),
                nuevaCita.getAppointmentTime()
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está reservado.");
        }

        // 3. ESTADO INICIAL
        nuevaCita.setStatus("PENDIENTE");

        // 4. GUARDAR EN LA BASE DE DATOS
        return appointmentRepository.save(nuevaCita);
    }
}
