package com.estilo26.api.model; // Confirmado: Usamos 'model'

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Data
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ej: "Corte de Cabello"

    private String description; // Ej: "Estilo clásico o moderno con tijera"

    @Column(nullable = false)
    private BigDecimal price; // Ej: 200.00

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes; // Ej: 30
}
