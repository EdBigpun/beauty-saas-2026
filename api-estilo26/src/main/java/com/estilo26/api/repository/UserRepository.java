package com.estilo26.api.repository;

import com.estilo26.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Método mágico: Spring crea el SQL automáticamente para buscar por username
    Optional<User> findByUsername(String username);
}