package com.estilo26.api.controller;

import com.estilo26.api.model.User;
import com.estilo26.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Indica que este controlador atiende peticiones web devolviendo JSON
@RequestMapping("/api/users") // La ruta base (http://localhost:9090/api/users)
public class UserController {

    @Autowired
    private UserService userService; // Conectamos con el Cerebro (Service)

    // ==========================================
    // PUERTA 1: LEER TODOS (GET)
    // ==========================================
    @GetMapping
    public List<User> getAllUsers() {
        // Pedimos solo los activos
        return userService.findAllActive();
    }

    // ==========================================
    // PUERTA 2: CREAR NUEVO (POST)
    // ==========================================
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User newUser = userService.saveUser(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==========================================
    // PUERTA 3: EDITAR EXISTENTE (PUT)
    // ==========================================
    // El {id} significa que la URL será tipo: /api/users/5
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            // Le pasamos el ID de la URL y los datos del cuerpo (JSON) al Cerebro
            User savedUser = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            // Si el Cerebro dice "No encontrado", devolvemos error 404 Not Found
            return ResponseEntity.notFound().build();
        }
    }

    // ==========================================
    // PUERTA 4: ELIMINAR (SOFT DELETE)
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            // Ejecutamos el borrado lógico
            userService.softDeleteUser(id);
            // Devolvemos 200 OK, pero sin cuerpo de respuesta (Void)
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
