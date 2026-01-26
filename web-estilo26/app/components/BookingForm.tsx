"use client"; // (1) LA ORDEN MÁGICA

import { useState } from "react"; // (2) IMPORTAR MEMORIA

export default function BookingForm() {
  // (3) EL ESTADO (LA MEMORIA A CORTO PLAZO)
  // nombre: es la variable donde se guarda el texto.
  // setNombre: es la función para cambiar esa variable.
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // (4) LA LÓGICA: QUÉ PASA AL ENVIAR
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue (comportamiento antiguo de HTML)
    alert(`Enviando reserva para: ${nombre} - ${telefono}`);
    // Aquí luego conectaremos con Java
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
