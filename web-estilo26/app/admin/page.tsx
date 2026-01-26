"use client"; // (1) Necesitamos interactividad para pedir datos al cargar

import { useEffect, useState } from "react";

// (2) LA INTERFAZ (EL CONTRATO)
// TypeScript necesita saber qué forma tienen los datos que vienen de Java.
// Esto debe coincidir con tu Clase Java 'Appointment' y el DTO.
interface Cita {
  id: number;
  clientName: string;
  clientPhone: string;
  startTime: string; // Java manda la fecha como texto (String)
  status: string;
}

export default function AdminPanel() {
  // (3) EL ESTADO DE LA LISTA
  // Aquí guardaremos las citas cuando lleguen del servidor.
  // Al principio, es una lista vacía ([]).
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // (4) EL EFECTO (USE EFFECT) - EL MOMENTO DE CARGA
  // useEffect se ejecuta automáticamente cuando la página se abre por primera vez.
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        // Hacemos el viaje al puerto 9090 (GET es el default, no hay que especificarlo)
        const respuesta = await fetch("http://localhost:9090/api/appointments");

        if (respuesta.ok) {
          // Si Java dice OK, convertimos el texto JSON a objetos JavaScript
          const data = await respuesta.json();
          setCitas(data); // Guardamos los datos en la memoria (Estado)
        } else {
          console.error("Error al cargar citas");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        setCargando(false); // Ya terminamos de cargar (sea éxito o error)
      }
    };

    cargarCitas(); // Ejecutamos la función
  }, []); // Los corchetes vacíos [] significan: "Ejecútate solo UNA vez al abrir la página"

  // (5) LA VISTA (RENDERIZADO)
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-emerald-400">
        Panel de Barbero 💈
      </h1>

      {/* Mensaje de carga si el mensajero no ha vuelto */}
      {cargando && (
        <p className="text-zinc-500">Cargando libreta de citas...</p>
      )}

      {/* Si ya cargó pero no hay citas */}
      {!cargando && citas.length === 0 && (
        <p className="text-zinc-500">
          No hay citas agendadas hoy. ¡A descansar! 😴
        </p>
      )}

      {/* (6) LA TABLA DE DATOS */}
      <div className="grid gap-4">
        {/* map: Es un bucle. "Por cada cita en la lista, dibuja esta tarjeta" */}
        {citas.map((cita) => (
          <div
            key={cita.id} // Identificador único para React
            className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center hover:border-emerald-500 transition-colors"
          >
            <div>
              <h3 className="font-bold text-lg">{cita.clientName}</h3>
              <p className="text-zinc-400 text-sm">{cita.clientPhone}</p>
            </div>

            <div className="text-right">
              {/* Convertimos la fecha fea de Java a algo legible */}
              <p className="text-emerald-400 font-mono">
                {new Date(cita.startTime).toLocaleString()}
              </p>
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                {cita.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
