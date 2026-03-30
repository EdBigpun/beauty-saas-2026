package com.estilo26.api.model;

/**
 * Define el ciclo de vida exacto de una Cita.
 */
public enum AppointmentStatus {
    PENDIENTE,  // Cliente reservó, pero no ha llegado
    EN_PROCESO, // El barbero lo está atendiendo
    COMPLETADA, // Terminó, pagó y se registró en caja
    CANCELADA,  // Cliente no llegó o llamó para cancelar
    REPROGRAMADA
}
