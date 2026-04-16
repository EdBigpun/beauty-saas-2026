package com.estilo26.api.repository;

import com.estilo26.api.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// IMPORTANTE: Importamos List porque nuestra función devolverá una "Lista" de servicios
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    // Le enseñamos a Spring Boot nuestra regla Anti-Zombies.
    // Al escribirla así, Java automáticamente la traduce a SQL seguro.
    List<Service> findByIsActiveTrueOrderByIdAsc();
}
