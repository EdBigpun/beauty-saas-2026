package com.estilo26.api.repository;

import com.estilo26.api.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    // Esta interfaz hereda de JpaRepository.
    // Con esto ganamos GRATIS métodos como:
    // .save()   -> Guardar
    // .findAll() -> Buscar todos (Lista de precios)
    // .findById() -> Buscar uno
}