"use client"; // (1) LA ORDEN MÁGICA

import { useState } from "react"; // (2) IMPORTAR MEMORIA

export default function BookingForm() {
  // (3) EL ESTADO (LA MEMORIA A CORTO PLAZO)
  // nombre: es la variable donde se guarda el texto.
  // setNombre: es la función para cambiar esa variable.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // (4) LA LÓGICA DE CONEXIÓN (INTEGRACIÓN BACKEND)
  // Agregamos 'async' antes de los paréntesis.
  // ¿Por qué? Porque hablar con el servidor toma tiempo (milisegundos) y no queremos congelar la pantalla.
  // 'async' nos permite usar 'await' (esperar) dentro.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 1. Detenemos la recarga automática del navegador.

    // 2. EMPAQUETADO DE DATOS
    // Creamos un objeto JavaScript con la estructura EXACTA que espera tu clase Java 'Appointment'.
    // Si los nombres no coinciden (ej: clientName vs nombreCliente), Java lo rechazará.
    const reserva = {
      clientName: nombre, // Valor que viene del input (useState)
      clientPhone: telefono, // Valor que viene del input (useState)
      clientNotes: "Reserva desde Web", // Valor fijo por ahora
      startTime: "2026-09-20T10:00:00", // Fecha fija para prueba (luego la haremos dinámica)
      endTime: "2026-09-20T11:00:00",
      status: "PENDING", // El Enum que Java espera (en inglés)
    };

    try {
      // 3. EL ENVÍO (FETCH)
      // 'fetch' es como enviar un mensajero en moto.
      // await: Le decimos al código "Espera aquí hasta que el mensajero vuelva con la respuesta".
      const respuesta = await fetch("http://localhost:9090/api/appointments", {
        method: "POST", // Verbo HTTP: Queremos CREAR información.
        headers: {
          "Content-Type": "application/json", // Le avisamos a Java: "Te estoy enviando texto en formato JSON".
        },
        body: JSON.stringify(reserva), // Transformamos el objeto JS a texto plano (JSON) para que viaje por el cable.
      });

      // 4. LA RESPUESTA
      // Cuando el mensajero vuelve, revisamos si trae buenas noticias.
      if (respuesta.ok) {
        alert("✅ ÉXITO: Tu cita se guardó en la Base de Datos.");
        // Limpiamos los campos visuales para que el usuario sepa que terminó.
        setNombre("");
        setTelefono("");
      } else {
        // Si Java responde con error (400 o 500), entramos aquí.
        alert(
          "❌ ERROR: El servidor rechazó la reserva (Revisa horarios o datos).",
        );
      }
    } catch (error) {
      // 5. MANEJO DE DESASTRES
      // Si el servidor está apagado o no hay internet, el código salta directamente aquí.
      console.error("Error de red:", error);
      alert(
        "⚠️ ERROR CRÍTICO: No hay conexión con el Backend (¿Está encendido IntelliJ?).",
      );
    }
  };

  return (
    // (5) LA VISTA (JSX)
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 w-full max-w-md mx-auto"
    >
      {/* CAMPO NOMBRE */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Tu Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)} // (6) CAPTURAR LO QUE ESCRIBE
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      {/* CAMPO TELÉFONO */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">
          Teléfono / WhatsApp
        </label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="Ej: 8888-8888"
        />
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <button
        type="submit"
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all"
      >
        Confirmar Reserva
      </button>
    </form>
  );
}
