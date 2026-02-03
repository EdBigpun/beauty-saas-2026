package com.estilo26.api.controller;

import com.estilo26.api.model.User;
import com.estilo26.api.repository.UserRepository;
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
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        // A. Buscamos al usuario por su nombre (ej: "admin")
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());

        if (userOptional.isPresent()) {
            User userDb = userOptional.get();

            // B. VERIFICACIÓN DE CONTRASEÑA (La parte clave)
            // Comparamos la clave que escribió el usuario (loginRequest.getPassword())
            // con la clave encriptada que tenemos guardada (userDb.getPassword())
            // Usamos .matches() porque no podemos desencriptar el hash, solo compararlo.
            if (passwordEncoder.matches(loginRequest.getPassword(), userDb.getPassword())) {

                // C. Si coincide: ¡ÉXITO!
                // Por ahora devolvemos "OK". En el futuro aquí devolveremos un Token JWT.
                return ResponseEntity.ok("Login Exitoso");
            }
        }

        // D. Si no encontramos al usuario O la clave no coincide: ERROR
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales Incorrectas");
    }
}
