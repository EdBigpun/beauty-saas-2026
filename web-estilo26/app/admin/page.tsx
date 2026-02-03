"use client";

import { useEffect, useState } from "react";

interface Cita {
  id: number;
  clientName: string;
  clientPhone: string;
  clientNotes: string;
  startTime: string;
  status: string;
}

export default function AdminPanel() {
  // --- ESTADOS DE SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // --- ESTADOS DE DATOS ---
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- FUNCIÓN LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("🚫 Contraseña incorrecta");
    }
  };

  // --- CARGAR DATOS ---
  const cargarCitas = async () => {
    try {
      const respuesta = await fetch("http://localhost:9090/api/appointments");
      if (respuesta.ok) {
        const data = await respuesta.json();
        setCitas(data);
      }
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setCargando(false);
    }
  };

  // Efecto: Cargar solo si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      cargarCitas();
    }
  }, [isAuthenticated]);

  // --- FUNCIONES CRUD ---
  const handleConfirm = async (id: number) => {
    if (!confirm("¿Confirmar cita?")) return;
    try {
      await fetch(`http://localhost:9090/api/appointments/${id}/confirm`, {
        method: "PUT",
      });
      cargarCitas();
    } catch (error) {
      alert("Error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar cita?")) return;
    try {
      await fetch(`http://localhost:9090/api/appointments/${id}`, {
        method: "DELETE",
      });
      cargarCitas();
    } catch (error) {
      alert("Error");
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  // ... (El resto del código de arriba con los imports y estados se mantiene igual)

  // ESTADO NUEVO (Agrégalo debajo de const [password...])
  const [showPassword, setShowPassword] = useState(false); // Empieza oculto (false)

  // ... (Mantén tu handleLogin y useEffects igual) ...

  // 1. PANTALLA DE LOGIN (MODIFICADA)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center w-full max-w-sm shadow-2xl shadow-emerald-900/10"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Acceso Administrativo
          </h1>
          <p className="text-zinc-500 text-sm mb-6">
            Ingresa tus credenciales de seguridad
          </p>

          {/* CONTENEDOR DEL INPUT (Relativo para poder posicionar el ojo dentro) */}
          <div className="relative mb-6">
            <input
              // (A) AQUÍ ESTÁ LA MAGIA DEL TIPO DINÁMICO
              // Si showPassword es true, usa "text". Si es false, usa "password".
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 rounded bg-black border border-zinc-700 text-white focus:border-emerald-500 outline-none transition-all"
            />

            {/* (B) BOTÓN DEL OJITO */}
            <button
              type="button" // Importante: type="button" para que NO envíe el formulario al hacer clic
              onClick={() => setShowPassword(!showPassword)} // Invierte el valor (True <-> False)
              className="absolute right-3 top-3 text-zinc-400 hover:text-white transition-colors"
            >
              {/* Icono Condicional: Si está visible mostramos un ojo tachado, si no, un ojo normal */}
              {showPassword ? (
                /* Icono de Ojo Tachado (Ocultar) */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                /* Icono de Ojo Normal (Ver) */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-all shadow-lg shadow-emerald-900/20"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    );
  }

  // ... (El resto del return del Panel de Admin se mantiene igual)

  // 2. PANTALLA DE ADMIN (Si pasó el login)
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="flex justify-between items-center mb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400">
          Panel de Barbero 💈
        </h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
        >
          Cerrar Sesión ↪
        </button>
      </div>

      {cargando && (
        <p className="text-center text-zinc-500">Cargando libreta...</p>
      )}

      {!cargando && citas.length === 0 && (
        <p className="text-center text-zinc-500">
          No hay citas pendientes hoy.
        </p>
      )}

      <div className="grid gap-4 max-w-3xl mx-auto">
        {citas.map((cita) => (
          <div
            key={cita.id}
            className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex justify-between items-center hover:border-emerald-500/50 transition-all"
          >
            {/* DATOS */}
            <div>
              <h3 className="font-bold text-xl mb-1">{cita.clientName}</h3>

              {/* NOTAS / SERVICIO */}
              {cita.clientNotes && (
                <p className="text-yellow-200/80 text-sm font-medium mb-2 bg-yellow-900/20 px-2 py-1 rounded w-fit border border-yellow-900/30">
                  ⚡ {cita.clientNotes}
                </p>
              )}

              <p className="text-zinc-400 text-sm mb-2">
                📞 {cita.clientPhone}
              </p>

              <div className="flex items-center gap-2">
                <p className="text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded text-sm">
                  📅 {new Date(cita.startTime).toLocaleString()}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded font-bold ${
                    cita.status === "CONFIRMED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {cita.status}
                </span>
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex flex-col gap-3">
              {cita.status !== "CONFIRMED" && (
                <button
                  onClick={() => handleConfirm(cita.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Confirmar
                </button>
              )}
              <button
                onClick={() => handleDelete(cita.id)}
                className="bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
