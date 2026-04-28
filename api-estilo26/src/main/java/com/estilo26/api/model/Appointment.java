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

    // --- BLOQUE FINANCIERO ORIGINAL ---
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

    // ==========================================
    // NUEVO FASE 2: CONTROL DE CAJA Y COMISIONES
    // ==========================================

    // [FIX BD]: Sin nullable = false para evitar el PSQLException.
    @Builder.Default
    @Column
    private Boolean isWalkIn = false;

    // [FIX BD]: Sin nullable = false. Enumerador para método de pago.
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column
    private PaymentMethod paymentMethod = PaymentMethod.PENDIENTE;

    // [FIX BD]: Sin nullable = false. Almacena la comisión histórica inmutable.
    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal barberCommission = BigDecimal.ZERO;
}
