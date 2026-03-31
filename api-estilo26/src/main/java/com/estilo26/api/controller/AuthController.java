package com.estilo26.api.controller;

import com.estilo26.api.model.User;
import com.estilo26.api.repository.UserRepository;
import com.estilo26.api.dto.LoginRequestDTO; //Nuevo
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController // (1) Le dice a Spring: "Esta clase atiende peticiones web"
@RequestMapping("/api/auth") // (2) La ruta base será localhost:9090/api/auth
@CrossOrigin(origins = "http://localhost:3000") // (3) Permite que React nos hable
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // (4) El encriptador (la licuadora)

    // Inyectamos las herramientas que necesitamos
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // (5) EL ENDPOINT DE LOGIN
    // Recibe un usuario (datos del formulario) y decide si dejarlo pasar
    @PostMapping("/login")
    // ¡CAMBIO CLAVE! Usamos LoginRequestDTO en lugar de User
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {

        // A. Buscamos al usuario por su nombre
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User userDb = userOptional.get();

            // B. VERIFICACIÓN DE CONTRASEÑA
            if (passwordEncoder.matches(loginRequest.getPassword(), userDb.getPassword())) {

                // --- NUEVO FILTRO DE SEGURIDAD ---
                // Si la clave es correcta, pero el usuario fue eliminado (Soft Delete), no lo dejamos pasar.
                if (userDb.getIsActive() != null && !userDb.getIsActive()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuario desactivado");
                }

                // C. Si coincide y está activo: ¡ÉXITO!
                return ResponseEntity.ok("Login Exitoso");
            }
        }

        // D. Si no encontramos al usuario O la clave no coincide: ERROR
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales Incorrectas");
    }
}
