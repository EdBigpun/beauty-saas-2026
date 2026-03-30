package com.estilo26.api.model;

/**
 * Define los métodos de pago aceptados oficialmente en Nicaragua.
 */
public enum PaymentMethod {
    EFECTIVO,
    TARJETA_CREDITO,
    TRANSFERENCIA,
    PENDIENTE_PAGO // Útil para citas reservadas que aún no terminan
}
