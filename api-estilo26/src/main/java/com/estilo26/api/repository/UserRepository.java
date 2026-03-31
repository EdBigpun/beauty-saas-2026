package com.estilo26.api.repository;

import com.estilo26.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Busca a un usuario por su nombre exacto
    Optional<User> findByUsername(String username);

    // --- NUEVO: MAGIA DE SPRING DATA JPA ---
    // Le decimos al bodeguero: "Tráeme una lista de usuarios,
    // PERO SOLO los que tengan isActive en true, y ordénalos por ID".
    // Spring Boot traduce este nombre largo en código SQL automáticamente.
    List<User> findByIsActiveTrueOrderByIdAsc();
}
