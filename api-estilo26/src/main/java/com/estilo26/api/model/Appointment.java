package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity // (1) Esto le dice a Java: "Convierte esta clase en una Tabla de SQL".
@Data   // (2) Lombok: Nos ahorra escribir 100 líneas de Getters y Setters.
@Table(name = "appointments") // (3) Nombre real de la tabla en Postgres.
public class Appointment {

    @Id // Marca esto como la Llave Primaria.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Autoincremental (1, 2, 3...)
    private Long id;

    // FECHAS Y HORARIOS
    // Usamos LocalDateTime porque es preciso.
    // nullable = false significa que es OBLIGATORIO tener fecha.
    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // DATOS DEL CLIENTE (Simplificado para este MVP)
    // En el futuro, esto podría ser una relación con una tabla de Usuarios.
    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String clientPhone; // CRÍTICO para la integración con WhatsApp.

    // NEUROMARKETING & EXPERIENCIA
    // Aquí guardamos "Prefiere café", "Alergia a productos fuertes".
    // Esto permite al barbero leerlo ANTES de que llegue el cliente.
    @Column(length = 500)
    private String clientNotes;

    // ESTADO DE LA CITA
    // Usamos un ENUM (Lista cerrada de opciones) para evitar errores de texto.
    // Guardamos el NOMBRE del estado (String) en la BD.
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
}
