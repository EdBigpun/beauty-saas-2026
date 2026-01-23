package com.estilo26.api.repository;

import com.estilo26.api.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository // (1) Le dice a Spring: "Este es el encargado de hablar con la BD".
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // (2) ¡Aquí ocurre la magia de Spring Data!
    // Solo con escribir el nombre del método correctamente, Spring CREA el SQL por ti.

    // Buscar citas por fecha (Para evitar duplicados)
    // SQL automático: SELECT * FROM appointments WHERE start_time = ? AND end_time = ?
    boolean existsByStartTimeAndEndTime(LocalDateTime start, LocalDateTime end);

    // Buscar citas de un cliente específico por su teléfono
    List<Appointment> findByClientPhone(String phone);

    // Buscar citas futuras (Para los recordatorios de WhatsApp)
    // SQL automático: SELECT * FROM appointments WHERE start_time > ?
    List<Appointment> findByStartTimeAfter(LocalDateTime now);
}
