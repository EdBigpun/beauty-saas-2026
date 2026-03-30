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
 * Este es el corazón transaccional del SaaS. Ahora maneja dinero.
 * -------------------------------------------------------------
 */
@Entity
@Table(name = "appointments")
// Reemplazamos los getters/setters manuales por Lombok para mantener consistencia y limpieza
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Datos del Cliente (En el futuro, esto debería ser su propia tabla Client.java)
    @Column(nullable = false)
    private String clientName;
    private String clientPhone;

    // Cronología
    @Column(nullable = false)
    private LocalDate appointmentDate;
    @Column(nullable = false)
    private LocalTime appointmentTime;
    private LocalTime endTime; // Se llena cuando el barbero termina el servicio

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean rescheduled = false;

    // Relación: Una cita puede tener múltiples servicios (Corte + Barba)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "appointment_services",
            joinColumns = @JoinColumn(name = "appointment_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private List<Service> services;

    // Estado controlado por Enum (Seguridad contra errores de tipeo)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDIENTE;

    // Guardamos el nombre del barbero temporalmente (Idealmente, sería una relación ManyToOne con User.java)
    private String barberName;

    // ==========================================
    // --- NUEVO: NÚCLEO FINANCIERO ---
    // Variables indispensables para calcular rentabilidad y caja diaria
    // ==========================================

    // Método de pago estandarizado
    // Cuánto se le cobró en total por los servicios
    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalServicesCost = BigDecimal.ZERO;

    // Propina que dejó el cliente
    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tipAmount = BigDecimal.ZERO;

    // Descuentos aplicados
    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountApplied = BigDecimal.ZERO;

    // Suma final que entró a caja
    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal finalTotalPaid = BigDecimal.ZERO;
}
