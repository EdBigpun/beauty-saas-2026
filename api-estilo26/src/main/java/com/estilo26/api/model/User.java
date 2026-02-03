package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity // (1)
@Table(name = "users") // (2)
@Data // (3)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // (4) Nombre de usuario único. No permitimos dos "juan.perez".
    @Column(nullable = false, unique = true)
    private String username;

    // (5) La contraseña irá encriptada, por eso no limitamos el largo.
    @Column(nullable = false)
    private String password;

    // (6) Vital para recuperación de contraseña (Soporte).
    @Column(nullable = false, unique = true)
    private String email;

    // (7) Roles: "ADMIN" o "BARBER"
    // Esto nos permitirá filtrar qué puede ver cada quién.
    @Column(nullable = false)
    private String role;
}
