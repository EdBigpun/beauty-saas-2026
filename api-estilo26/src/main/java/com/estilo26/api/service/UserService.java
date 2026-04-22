package com.estilo26.api.service;

import com.estilo26.api.model.User;
import com.estilo26.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ------------------------------------------------------------------------
    // CABLE 1 REPARADO: El controlador espera que se llame "findAllActive"
    // ------------------------------------------------------------------------
    public List<User> findAllActive() {
        return userRepository.findByIsActiveTrueOrderByIdAsc();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ------------------------------------------------------------------------
    // CABLE 2 REPARADO: El controlador espera que se llame "saveUser"
    // ------------------------------------------------------------------------
    public User saveUser(User user) {
        // ESCUDO DE DEFENSA: Forzamos el estado activo si llega vacío desde React
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setRole(userDetails.getRole());

            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }

            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setIsActive(false);
        userRepository.save(user);
    }
}
