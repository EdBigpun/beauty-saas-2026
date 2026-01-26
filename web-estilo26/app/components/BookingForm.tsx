"use client";

import { useState } from "react";

export default function BookingForm() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  
  // (1) NUEVOS ESTADOS: Para guardar lo que elija el usuario
  const [fecha, setFecha] = useState(""); // Ej: "2026-01-26"
  const [hora, setHora] = useState("");   // Ej: "10:00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // (2) VALIDACIÓN BÁSICA: Que no manden cosas vacías
    if (!nombre || !telefono || !fecha || !hora) {
      alert("⚠️ Por favor completa todos los campos (Nombre, Teléfono, Fecha y Hora).");
      return;
    }

    // (3) CONSTRUIR LA FECHA ISO-8601
    // Java espera: "2026-01-26T10:00:00"
    // Nosotros unimos: fecha + "T" + hora + ":00"
    const fechaInicio = `${fecha}T${hora}:00`;
    
    // Calculamos el fin (por defecto 1 hora después para este ejemplo)
    // Nota: En un sistema real avanzado, esto se calcula mejor, pero para empezar:
    // Solo duplicamos la hora de inicio como referencia o la calculamos. 
    // TRUCO: Para no complicarnos con matemáticas de horas ahora mismo, 
    // mandaremos la misma fecha pero le diremos al backend (o asumiremos) que dura 1 hora.
    // O mejor aún: Java necesita un 'endTime'. Haremos un truco de texto simple:
    // Si la hora es "10:00", el fin "11:00". (Esto es simplificado, luego lo haremos robusto).
    
    // *Para no complicar el código ahora con cálculos de horas, vamos a enviar la hora de inicio
    // y en el Backend deberíamos calcular la duración. 
    // PERO, para no tocar Java hoy, enviaremos la misma fechaInicio como fin 
    // (Java podría quejarse si inicio == fin, así que sumemos 1 hora a lo bruto en la mente del usuario
    // o simplemente enviemos una hora hardcoded diferente SOLO para el fin por ahora
    // para probar que la fecha de INICIO si cambia).*
    
    // CORRECCIÓN PROFESIONAL: Vamos a usar objetos Date de JS para sumar 1 hora correctamente.
    const start = new Date(fechaInicio);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Sumar 1 hora (60min * 60seg * 1000ms)
    const fechaFin = end.toISOString().slice(0, 19); // Formato simple "2026-01-26T11:00:00"

    const datosParaEnviar = {
      clientName: nombre,
      clientPhone: telefono,
      clientNotes: "Reserva web dinámica",
      startTime: fechaInicio, // ¡AHORA SÍ ES DINÁMICO!
      endTime: fechaFin,      // Calculado automáticamente +1 hora
      status: "PENDING"
    };

    try {
      const respuesta = await fetch("http://localhost:9090/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaEnviar),
      });

      if (respuesta.ok) {
        alert(`✅ ¡Cita Agendada! \nFecha: ${fecha} \nHora: ${hora}`);
        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
      } else {
        // (4) AQUÍ ENTRA LA LÓGICA DE "OCUPADO"
        // Si Java devuelve 400 Bad Request, suele ser porque la fecha está ocupada (según nuestra regla).
        alert("❌ HORARIO OCUPADO: Ya existe una cita a esa hora. Por favor intenta otra hora.");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 w-full max-w-md mx-auto">
      
      {/* CAMPO NOMBRE */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Tu Nombre</label>
        <input 
          type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      {/* CAMPO TELÉFONO */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Teléfono</label>
        <input 
          type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
          placeholder="Ej: 8888-8888"
        />
      </div>

      {/* (5) NUEVOS CAMPOS DE FECHA Y HORA (GRID DE 2 COLUMNAS) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Fecha</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
            min="2026-01-01" // Opcional: Bloquear fechas pasadas
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Hora</label>
          <input 
            type="time" 
            value={hora} 
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
            step="1800" // Saltos de 30 minutos (opcional)
          />
        </div>
      </div>

      <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all">
        Confirmar Reserva
      </button>

    </form>
  );
}