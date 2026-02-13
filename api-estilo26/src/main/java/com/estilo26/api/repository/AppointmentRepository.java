package com.estilo26.api.repository;

import com.estilo26.api.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // BÚSQUEDA MÁGICA:
    // Spring crea el SQL solo leyendo el nombre de esta función.
    // "¿Existe alguna cita con ESTA fecha y ESTA hora?"
    boolean existsByAppointmentDateAndAppointmentTime(LocalDate date, LocalTime time);
}
