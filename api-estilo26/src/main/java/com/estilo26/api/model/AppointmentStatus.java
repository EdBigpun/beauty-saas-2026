package com.estilo26.api.model;

public enum AppointmentStatus {
    PENDING,    // Reserva creada, esperando confirmación
    CONFIRMED,  // Confirmada por WhatsApp
    COMPLETED,  // Servicio realizado (Cobrar)
    CANCELLED,  // Cliente canceló
    NO_SHOW     // Cliente no llegó (Importante para bloquearlo después si reincide)
}