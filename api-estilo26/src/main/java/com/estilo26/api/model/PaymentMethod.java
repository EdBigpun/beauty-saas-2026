package com.estilo26.api.model;

/**
 * -------------------------------------------------------------
 * ENUM: PaymentMethod (Métodos de Pago)
 * -------------------------------------------------------------
 * ¿Por qué usamos un Enum en lugar de un String?
 * Seguridad (Type Safety). Garantiza que la base de datos solo
 * reciba estos 4 valores exactos, evitando errores de tipeo desde React
 * (ej. que un usuario escriba "tarjeta" en minúscula y rompa el arqueo de caja).
 */
public enum PaymentMethod {
    PENDIENTE,      // La cita aún no se ha pagado
    EFECTIVO,       // Va directo a la caja registradora física
    TARJETA,        // POS / Banco
    TRANSFERENCIA   // Banco / Billetera móvil
}
