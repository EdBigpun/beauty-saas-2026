package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// [FIX IDE]: Esta es la importación que seguramente faltaba y puso todo en rojo.
// Necesaria para manejar dinero (BigDecimal).
import java.math.BigDecimal;

/**
 * -------------------------------------------------------------
 * Entidad User (Usuario del SaaS)
 * Define a dueños, administradores y empleados.
 * -------------------------------------------------------------
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    // --- ESTRATEGIA DE SOFT DELETE (BORRADO LÓGICO) ---
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    // ==========================================
    // NUEVO FASE 2: MOTOR DE NÓMINA (PAYROLL)
    // ==========================================
    // [FIX BD]: Se ha eliminado "nullable = false".
    // Esto permite a PostgreSQL crear la columna sin colapsar por los usuarios
    // que ya existen en tu base de datos y que tendrán este campo vacío inicialmente.
    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal commissionPercentage = new BigDecimal("50.00");
}
