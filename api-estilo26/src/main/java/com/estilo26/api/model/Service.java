package com.estilo26.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * -------------------------------------------------------------
 * Entidad Service (Servicios de Barbería)
 * Representa los productos del catálogo (Corte, Barba, etc.)
 * -------------------------------------------------------------
 */
@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer durationMinutes;

    // Almacena el valor de identificación visual (ej. "✂️" o "Scissors")
    private String icon;

    // --- NUEVO: ESTRATEGIA DE SOFT DELETE PARA SERVICIOS ---
    // Evita romper citas pasadas que incluyeron un servicio que ya no ofrecemos
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true; // <-- La magia de la "B" mayúscula (Wrapper Class)
}
