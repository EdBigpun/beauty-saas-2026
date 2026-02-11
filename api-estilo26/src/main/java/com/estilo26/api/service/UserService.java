package com.estilo26.api.service;

import com.estilo26.api.model.User;
import com.estilo26.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // 1. Etiqueta para que Spring sepa que este es el "Barbero" (Lógica)
public class UserService {

    @Autowired // Conexión automática al Almacén
    private UserRepository userRepository;

    @Autowired // Conexión automática a la Licuadora de Contraseñas
    private PasswordEncoder passwordEncoder;

    // A. Función para listar todos (Para que los veas en las tarjetas del Admin)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // B. Función para GUARDAR usuario nuevo
    public User saveUser(User user) {
        // PASO CLAVE: Antes de guardar, ENCRIPTAMOS la contraseña
        // Tomamos la password original, la codificamos y la volvemos a poner en el usuario.
        String passwordEncriptada = passwordEncoder.encode(user.getPassword());
        user.setPassword(passwordEncriptada);

        // Ahora sí, lo guardamos en el almacén (Base de Datos)
        return userRepository.save(user);
    }
}
