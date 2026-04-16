package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.repository.AppointmentRepository;
import com.estilo26.api.repository.ServiceRepository;
import com.estilo26.api.dto.ClientDTO;
import com.estilo26.api.model.AppointmentStatus;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal; // IMPORTACIÓN NECESARIA PARA LOS CEROS FINANCIEROS
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment createAppointment(Appointment nuevaCita) {

        // =========================================================
        // ESCUDO DE DEFENSA (NUEVO)
        // Protegemos a la base de datos seteando en CERO los campos
        // financieros que llegan vacíos al momento de crear una cita.
        // =========================================================
        if (nuevaCita.getTotalServicesCost() == null) nuevaCita.setTotalServicesCost(BigDecimal.ZERO);
        if (nuevaCita.getTipAmount() == null) nuevaCita.setTipAmount(BigDecimal.ZERO);
        if (nuevaCita.getDiscountApplied() == null) nuevaCita.setDiscountApplied(BigDecimal.ZERO);
        if (nuevaCita.getFinalTotalPaid() == null) nuevaCita.setFinalTotalPaid(BigDecimal.ZERO);

        // También protegemos la variable de reprogramación
        if (nuevaCita.getRescheduled() == null) nuevaCita.setRescheduled(false);
        // =========================================================

        // 1. Extraer solo los IDs que mandó React
        List<Long> serviceIds = nuevaCita.getServices().stream()
                .map(Service::getId)
                .collect(Collectors.toList());

        // 2. Buscar los servicios COMPLETOS en PostgreSQL
        List<Service> realServices = serviceRepository.findAllById(serviceIds);

        // 3. Asignar esos servicios reales a la cita
        nuevaCita.setServices(realServices);

        // 4. Calcular el tiempo total usando los datos reales
        int totalMinutes = realServices.stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 30)
                .sum();

        if (totalMinutes == 0) totalMinutes = 30;

        // 5. Calcular la hora en que el cliente saldrá de la silla
        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);
        nuevaCita.setEndTime(horaFin);

        // 6. Verificar si la hora está libre
        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaCita.getAppointmentDate(),
                nuevaCita.getAppointmentTime()
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está reservado.");
        }

        // 7. Sellar como pendiente y guardar
        nuevaCita.setStatus(AppointmentStatus.PENDIENTE);
        return appointmentRepository.save(nuevaCita);
    }

    public Appointment updateStatus(Long id, String newStatus) {
        return appointmentRepository.findById(id)
                .map(cita -> {
                    cita.setStatus(AppointmentStatus.valueOf(newStatus.toUpperCase()));
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
        cita.setStatus(AppointmentStatus.PENDIENTE);
        cita.setRescheduled(true);

        return appointmentRepository.save(cita);
    }

    public List<ClientDTO> getVIPClients() {
        return appointmentRepository.findTopVIPClients();
    }
}
