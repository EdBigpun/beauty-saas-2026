package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.math.BigDecimal;

/**
 * -------------------------------------------------------------
 * Entidad Appointment (Cita / Registro Financiero)
 * -------------------------------------------------------------
 */
@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;
    private String clientPhone;

    @Column(nullable = false)
    private LocalDate appointmentDate;
    @Column(nullable = false)
    private LocalTime appointmentTime;
    private LocalTime endTime;

    // ==========================================
    // CORRECCIÓN MAGISTRAL AQUÍ:
    // Cambiamos "boolean" por "Boolean" para que Jackson
    // no colapse si React no envía este dato.
    // ==========================================
    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean rescheduled = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "appointment_services",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<Service> services;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDIENTE;

    private String barberName;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalServicesCost = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tipAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountApplied = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal finalTotalPaid = BigDecimal.ZERO;
}
