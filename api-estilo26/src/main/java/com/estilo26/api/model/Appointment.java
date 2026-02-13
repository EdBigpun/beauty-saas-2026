package com.estilo26.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String clientPhone;

    private LocalDate appointmentDate; // Fecha (Ej: 2026-02-12)
    private LocalTime appointmentTime; // Hora Inicio (Ej: 10:00)

    // 👇👇 AQUÍ ESTABA EL FALTANTE 👇👇
    private LocalTime endTime;         // Hora Fin (Ej: 11:00)

    @ManyToMany
    @JoinTable(
            name = "appointment_services",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<Service> services;

    private String status = "PENDIENTE";

    // --- CONSTRUCTOR VACÍO ---
    public Appointment() {}

    // --- GETTERS Y SETTERS (Para que Java pueda leer/escribir) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    // 👇 GETTER Y SETTER PARA LA HORA FIN (NUEVO) 👇
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public List<Service> getServices() { return services; }
    public void setServices(List<Service> services) { this.services = services; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
