package com.estilo26.api.repository;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.dto.ClientDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByAppointmentDateAndAppointmentTime(LocalDate appointmentDate, LocalTime appointmentTime);

    // --- MAGIA ACTUALIZADA: Ahora también extraemos el Barbero Principal ---
    @Query("SELECT new com.estilo26.api.dto.ClientDTO(MAX(a.clientName), a.clientPhone, COUNT(a.id), MAX(a.barberName)) " +
            "FROM Appointment a " +
            "WHERE a.status = 'COMPLETADA' " +
            "GROUP BY a.clientPhone " +
            "ORDER BY COUNT(a.id) DESC")
    List<ClientDTO> findTopVIPClients();

}
