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

  // 1. PANTALLA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center w-full max-w-sm"
        >
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-6">
            Acceso Restringido
          </h1>
          <input
            type="password"
            placeholder="Contraseña de admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-black border border-zinc-700 text-white focus:border-emerald-500 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-all"
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
    );
  }

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
