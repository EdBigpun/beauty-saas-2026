package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * -------------------------------------------------------------
 * Entidad User (Usuario del SaaS)
 * Define a dueños, administradores y empleados.
 * -------------------------------------------------------------
 */
@Entity
@Table(name = "users")
// Lombok: Genera getters, setters, constructores y patrón Builder
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
    private String password; // Se guardará encriptada con BCrypt en el futuro

    @Column(unique = true)
    private String email;

    // Los roles ahora soportan la expansión del SaaS (ADMIN, MANAGER, BARBERO, etc.)
    @Column(nullable = false)
    private String role;

    // --- NUEVO: ESTRATEGIA DE SOFT DELETE (BORRADO LÓGICO) ---
    // En lugar de borrar de la DB, lo marcaremos como "inactivo".
    // Esto previene que se rompan estadísticas financieras pasadas si despedimos a un barbero.
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
}
