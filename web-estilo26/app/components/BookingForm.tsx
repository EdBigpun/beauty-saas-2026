"use client";

import { useState, useEffect } from "react";

// (1) INTERFAZ DE SERVICIO
// Definimos qué forma tienen los datos que vienen de la API de Java
interface Service {
  id: number;
  name: string; // Ej: "Corte de Cabello"
  price: number; // Ej: 200
  durationMinutes: number; // Ej: 45
}

export default function BookingForm() {
  // Estados del Formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  // (2) NUEVOS ESTADOS PARA SERVICIOS
  const [servicios, setServicios] = useState<Service[]>([]); // Lista vacía al inicio
  const [selectedServiceId, setSelectedServiceId] = useState(""); // Cuál eligió el cliente
  const [cargandoServicios, setCargandoServicios] = useState(true);

  // (3) CARGAR SERVICIOS AL INICIAR
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Pedimos la lista a la ventanilla que abriste en Java
        const res = await fetch("http://localhost:9090/api/services");
        if (res.ok) {
          const data = await res.json();
          setServicios(data); // Guardamos la lista en memoria
        }
      } catch (error) {
        console.error("Error cargando servicios:", error);
      } finally {
        setCargandoServicios(false);
      }
    };
    fetchServices();
  }, []); // [] significa: Ejecutar solo una vez al montar el componente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: Ahora también exigimos que elija un servicio
    if (!nombre || !telefono || !fecha || !hora || !selectedServiceId) {
      alert("⚠️ Por favor completa todos los campos, incluyendo el servicio.");
      return;
    }

    // (4) LÓGICA DE NEGOCIO: ENCONTRAR EL SERVICIO ELEGIDO
    // Buscamos en la lista el objeto completo que coincida con el ID seleccionado
    const servicioElegido = servicios.find(
      (s) => s.id.toString() === selectedServiceId,
    );

    if (!servicioElegido) return; // Seguridad extra

    // (5) CÁLCULO DINÁMICO DE TIEMPO
    const fechaInicio = `${fecha}T${hora}:00`;
    const start = new Date(fechaInicio);
    // ¡AQUÍ ESTÁ LA MAGIA! Sumamos la duración real del servicio (15, 30 o 45 min)
    const end = new Date(
      start.getTime() + servicioElegido.durationMinutes * 60 * 1000,
    );
    const fechaFin = end.toISOString().slice(0, 19);

    // (6) PREPARAR EL PAQUETE PARA JAVA
    // Como aún no modificamos la tabla de Citas para guardar el ID del servicio,
    // guardaremos el nombre del servicio en las "Notas" para que el barbero lo vea.
    const datosParaEnviar = {
      clientName: nombre,
      clientPhone: telefono,
      clientNotes: `Servicio: ${servicioElegido.name} (Precio: C$${servicioElegido.price})`, // Info útil
      startTime: fechaInicio,
      endTime: fechaFin,
      status: "PENDING",
    };

    try {
      const respuesta = await fetch("http://localhost:9090/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaEnviar),
      });

      if (respuesta.ok) {
        alert(
          `✅ Cita Agendada para ${servicioElegido.name}!\nPrecio estimado: C$${servicioElegido.price}`,
        );
        // Limpiar formulario
        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setSelectedServiceId("");
      } else {
        alert("❌ HORARIO OCUPADO: Ya existe una cita a esa hora.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  };

  return (
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
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      {/* CAMPO TELÉFONO */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Teléfono</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
          placeholder="Ej: 8888-8888"
        />
      </div>

      {/* (7) NUEVO CAMPO: SELECTOR DE SERVICIOS */}
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Servicio</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
        >
          <option value="">-- Selecciona un servicio --</option>
          {cargandoServicios ? (
            <option>Cargando lista...</option>
          ) : (
            servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.name} - C${servicio.price} ({servicio.durationMinutes}{" "}
                min)
              </option>
            ))
          )}
        </select>
      </div>

      {/* FECHA Y HORA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
            min="2026-01-01"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:border-emerald-500 outline-none"
            step="900" // Saltos de 15 minutos ahora (más preciso)
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all"
      >
        Confirmar Reserva
      </button>
    </form>
  );
}
