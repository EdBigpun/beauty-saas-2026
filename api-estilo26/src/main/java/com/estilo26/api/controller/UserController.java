package com.estilo26.api.controller;

import com.estilo26.api.model.User;
import com.estilo26.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 1. Indica que este atiende peticiones web (JSON)
@RequestMapping("/api/users") // 2. ¡AQUÍ ESTÁ LA DIRECCIÓN! Define la puerta de entrada.
public class UserController {

    @Autowired
    private UserService userService; // Conectamos con el Barbero

    // CUANDO EL FRONTEND PIDE VER LA LISTA (GET)
    @GetMapping
    public List<User> getAllUsers() {
        // El recepcionista le pide la lista al Barbero y se la da al cliente
        return userService.findAll();
    }

    // CUANDO EL FRONTEND QUIERE CREAR UNO NUEVO (POST)
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            // Recibimos los datos del Frontend (@RequestBody)
            // Se los pasamos al Barbero para que encripte y guarde
            User newUser = userService.saveUser(user);

            // Respondemos "200 OK" y devolvemos el usuario creado
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            // Si algo falla, decimos "400 Bad Request"
            return ResponseEntity.badRequest().build();
        }
    }
}
