package com.estilo26.api.service;

import com.estilo26.api.model.Appointment;
import com.estilo26.api.model.Service;
import com.estilo26.api.model.User; // Importamos al User (Barbero)
import com.estilo26.api.model.PaymentMethod; // Importamos el método de pago
import com.estilo26.api.repository.AppointmentRepository;
import com.estilo26.api.repository.ServiceRepository;
import com.estilo26.api.repository.UserRepository; // Necesario para buscar la comisión
import com.estilo26.api.dto.ClientDTO;
import com.estilo26.api.model.AppointmentStatus;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.math.RoundingMode; // Para redondear dinero exactamente a 2 decimales
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    // INYECCIÓN DE DEPENDENCIA: Traemos el repo de usuarios para saber la comisión del barbero
    @Autowired
    private UserRepository userRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment createAppointment(Appointment nuevaCita) {

        // =========================================================
        // ESCUDO DE DEFENSA FINANCIERO
        // =========================================================
        if (nuevaCita.getTotalServicesCost() == null) nuevaCita.setTotalServicesCost(BigDecimal.ZERO);
        if (nuevaCita.getTipAmount() == null) nuevaCita.setTipAmount(BigDecimal.ZERO);
        if (nuevaCita.getDiscountApplied() == null) nuevaCita.setDiscountApplied(BigDecimal.ZERO);
        if (nuevaCita.getFinalTotalPaid() == null) nuevaCita.setFinalTotalPaid(BigDecimal.ZERO);
        if (nuevaCita.getBarberCommission() == null) nuevaCita.setBarberCommission(BigDecimal.ZERO);

        // Asignamos Walk-In a falso si no viene (Por defecto es de agenda)
        if (nuevaCita.getIsWalkIn() == null) nuevaCita.setIsWalkIn(false);
        if (nuevaCita.getRescheduled() == null) nuevaCita.setRescheduled(false);
        // =========================================================

        // 1. Extraer solo los IDs que mandó React
        List<Long> serviceIds = nuevaCita.getServices().stream()
                .map(Service::getId)
                .collect(Collectors.toList());

        // 2. Buscar los servicios COMPLETOS en la base de datos (Precio, Tiempo, Nombre)
        List<Service> realServices = serviceRepository.findAllById(serviceIds);
        nuevaCita.setServices(realServices);

        // --- MAGIA FINANCIERA EN LA CREACIÓN ---
        // Sumamos el costo total base al momento de crear la cita.
        // Así el frontend ya sabe cuánto va a costar antes de que se pague.
        BigDecimal costoBase = realServices.stream()
                .map(Service::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        nuevaCita.setTotalServicesCost(costoBase);

        // 4. Calcular el tiempo total usando los datos reales
        int totalMinutes = realServices.stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 30)
                .sum();

        if (totalMinutes == 0) totalMinutes = 30;

        // 5. Calcular la hora de salida
        LocalTime horaInicio = nuevaCita.getAppointmentTime();
        LocalTime horaFin = horaInicio.plusMinutes(totalMinutes);
        nuevaCita.setEndTime(horaFin);

        // 6. Verificar choque de horarios SOLO si NO es un Walk-In (Corte Express)
        // Los Walk-ins se atienden en el momento, a veces rompiendo la agenda estricta.
        if (!nuevaCita.getIsWalkIn()) {
            boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                    nuevaCita.getAppointmentDate(),
                    nuevaCita.getAppointmentTime()
            );

            if (ocupado) {
                throw new RuntimeException("⚠️ Ese horario ya está reservado.");
            }
        }

        // 7. Sellar como pendiente
        nuevaCita.setStatus(AppointmentStatus.PENDIENTE);
        nuevaCita.setPaymentMethod(PaymentMethod.PENDIENTE); // Aún no sabemos cómo va a pagar

        return appointmentRepository.save(nuevaCita);
    }

    // ========================================================================
    // NUEVO MOTOR FINANCIERO (CHECKOUT)
    // ========================================================================
    // Refactorizamos updateStatus para que sea el "Cobrador" oficial de la app.
    public Appointment checkoutAppointment(Long id, String newStatus, String paymentMethodStr, BigDecimal discount, BigDecimal tip) {
        return appointmentRepository.findById(id)
                .map(cita -> {
                    AppointmentStatus statusEnum = AppointmentStatus.valueOf(newStatus.toUpperCase());
                    cita.setStatus(statusEnum);

                    // SI LA CITA SE MARCA COMO COMPLETADA, SE DISPARA EL CÁLCULO DE NÓMINA
                    if (statusEnum == AppointmentStatus.COMPLETADA) {

                        // 1. Validar Método de Pago (Protegemos contra inyecciones falsas de React)
                        PaymentMethod method = PaymentMethod.EFECTIVO; // Default
                        if (paymentMethodStr != null) {
                            method = PaymentMethod.valueOf(paymentMethodStr.toUpperCase());
                        }
                        cita.setPaymentMethod(method);

                        // 2. Asignar propinas y descuentos (Si vienen null, los hacemos cero)
                        BigDecimal desc = (discount != null) ? discount : BigDecimal.ZERO;
                        BigDecimal propina = (tip != null) ? tip : BigDecimal.ZERO;

                        cita.setDiscountApplied(desc);
                        cita.setTipAmount(propina);

                        // 3. Recalcular el costo total de los servicios (Por si hubo un cambio)
                        BigDecimal totalServicios = cita.getServices().stream()
                                .map(Service::getPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        cita.setTotalServicesCost(totalServicios);

                        // 4. Matemática Financiera Inmutable:
                        // Total Final = (Servicios - Descuento) + Propina
                        BigDecimal totalFinal = totalServicios.subtract(desc).add(propina);
                        // Prevenir totales negativos si el descuento es absurdo
                        if (totalFinal.compareTo(BigDecimal.ZERO) < 0) totalFinal = BigDecimal.ZERO;
                        cita.setFinalTotalPaid(totalFinal);

                        // 5. CALCULAR COMISIÓN DEL BARBERO
                        // Buscamos al barbero en la base de datos para sacar su porcentaje secreto
                        BigDecimal porcentajeComision = new BigDecimal("50.00"); // 50% por defecto si no lo hallamos

                        if (cita.getBarberName() != null && !cita.getBarberName().isEmpty()) {
                            User barbero = userRepository.findByUsername(cita.getBarberName()).orElse(null);
                            if (barbero != null && barbero.getCommissionPercentage() != null) {
                                porcentajeComision = barbero.getCommissionPercentage();
                            }
                        }

                        // Fórmula: (Total Servicios - Descuento) * (Porcentaje / 100)
                        // IMPORTANTE: La propina NO se divide con el local. La propina va íntegra al barbero.
                        BigDecimal baseComisionable = totalServicios.subtract(desc);
                        if (baseComisionable.compareTo(BigDecimal.ZERO) < 0) baseComisionable = BigDecimal.ZERO;

                        BigDecimal comisionCorte = baseComisionable
                                .multiply(porcentajeComision)
                                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                        // Comisión Total = Su tajada del corte + Su propina completa
                        BigDecimal comisionTotal = comisionCorte.add(propina);
                        cita.setBarberCommission(comisionTotal);
                    }

                    return appointmentRepository.save(cita);
                })
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
    }

    public Appointment rescheduleAppointment(Long id, String newDate, String newTime) {
        Appointment cita = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        LocalDate nuevaFecha = LocalDate.parse(newDate);
        LocalTime nuevaHora = LocalTime.parse(newTime);
        if (newTime.length() == 5) {
            nuevaHora = LocalTime.parse(newTime + ":00");
        }

        boolean ocupado = appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                nuevaFecha,
                nuevaHora
        );

        if (ocupado) {
            throw new RuntimeException("⚠️ Ese horario ya está ocupado.");
        }

        cita.setAppointmentDate(nuevaFecha);
        cita.setAppointmentTime(nuevaHora);

        // Recalcular la hora de fin en base a los servicios reales que tiene
        int totalMinutes = cita.getServices().stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 30)
                .sum();
        if (totalMinutes == 0) totalMinutes = 30;

        cita.setEndTime(nuevaHora.plusMinutes(totalMinutes));
        cita.setStatus(AppointmentStatus.PENDIENTE);
        cita.setRescheduled(true);

        return appointmentRepository.save(cita);
    }

    public List<ClientDTO> getVIPClients() {
        return appointmentRepository.findTopVIPClients();
    }
}
