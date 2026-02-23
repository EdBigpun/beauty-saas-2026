package com.estilo26.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal; // IMPORTANTE: Importamos la clase para dinero

@Entity
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    // RESTAURADO: Volvemos a usar BigDecimal para que el DataLoader no llore
    private BigDecimal price;

    private Integer durationMinutes;

    // LA COLUMNA ICONO (Con el salvavidas para los servicios viejos)
    @Column(columnDefinition = "varchar(255) default '✂️'")
    private String icon;

    // --- CONSTRUCTOR VACÍO ---
    public Service() {}

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // GETTER Y SETTER DE PRECIO (Ahora usan BigDecimal)
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
