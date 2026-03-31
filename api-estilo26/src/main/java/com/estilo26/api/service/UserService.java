package com.estilo26.api.service;

import com.estilo26.api.model.User;
import com.estilo26.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // Etiqueta que define a esta clase como la Lógica de Negocio
public class UserService {

    @Autowired // Conexión automática al Almacén (Base de datos)
    private UserRepository userRepository;

    @Autowired // Conexión automática a la Licuadora de Contraseñas
    private PasswordEncoder passwordEncoder;

    // --------------------------------------------------------
    // 1. OBTENER USUARIOS ACTIVOS (El filtro anti-fantasmas)
    // --------------------------------------------------------
    public List<User> findAllActive() {
        // En lugar de usar findAll() que trae a los borrados, usamos nuestra nueva función mágica
        return userRepository.findByIsActiveTrueOrderByIdAsc();
    }

    // --------------------------------------------------------
    // 2. CREAR USUARIO (POST)
    // --------------------------------------------------------
    public User saveUser(User user) {
        // Encriptamos la contraseña antes de guardarla en la base de datos
        String passwordEncriptada = passwordEncoder.encode(user.getPassword());
        user.setPassword(passwordEncriptada);
        return userRepository.save(user);
    }

    // --------------------------------------------------------
    // 3. EDITAR USUARIO (PUT) - Lógica Defensiva
    // --------------------------------------------------------
    public User updateUser(Long id, User updatedData) {
        // A. Buscamos al usuario viejo en la DB. Si no existe, lanzamos un error que detiene todo.
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // B. Actualizamos los datos básicos que vienen del Frontend (React)
        existingUser.setUsername(updatedData.getUsername());
        existingUser.setEmail(updatedData.getEmail());
        existingUser.setRole(updatedData.getRole());

        // C. PROTECCIÓN DE CONTRASEÑA (Lo que programamos en React)
        // Solo encriptamos y cambiamos la contraseña si el admin escribió una nueva.
        // Si updatedData.getPassword() viene nulo o vacío, dejamos la contraseña vieja intacta.
        if (updatedData.getPassword() != null && !updatedData.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedData.getPassword()));
        }

        // D. Guardamos los cambios
        return userRepository.save(existingUser);
    }

    // --------------------------------------------------------
    // 4. ELIMINACIÓN LÓGICA (SOFT DELETE)
    // --------------------------------------------------------
    public void softDeleteUser(Long id) {
        // Buscamos al usuario
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // Magia del Soft Delete: Le quitamos la vida lógica, pero no lo borramos de PostgreSQL
        existingUser.setIsActive(false);

        // Guardamos el cambio (hace un UPDATE en lugar de un DELETE)
        userRepository.save(existingUser);
    }
}
