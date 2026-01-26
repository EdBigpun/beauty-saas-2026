"use client"; // (1) Obligatorio para usar useState y useEffect

import { useEffect, useState } from "react";

// Definimos qué forma tiene una Cita
interface Cita {
  id: number;
  clientName: string;
  clientPhone: string;
  startTime: string;
  status: string;
}

// (2) AQUÍ ESTÁ EL "JEFE". La función debe decir 'export default'.
export default function AdminPanel() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función para cargar citas desde Java
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

  // Cargar al iniciar la página
  useEffect(() => {
    cargarCitas();
  }, []);

  // --- LÓGICA: CONFIRMAR ---
  const handleConfirm = async (id: number) => {
    const confirmar = window.confirm("¿Deseas confirmar esta cita?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:9090/api/appointments/${id}/confirm`, {
        method: "PUT"
      });
      
      if (res.ok) {
        alert("✅ Cita confirmada");
        cargarCitas(); // Recargar la lista
      } else {
        alert("❌ Error al confirmar (Revisa el Backend)");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // --- LÓGICA: BORRAR ---
  const handleDelete = async (id: number) => {
    const confirmar = window.confirm("¿Estás seguro de ELIMINAR esta cita? No se puede deshacer.");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:9090/api/appointments/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("🗑️ Cita eliminada");
        cargarCitas(); // Recargar la lista
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // (3) EL DIBUJO DE LA PÁGINA (RETURN)
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-emerald-400">Panel de Barbero 💈</h1>
      
      {cargando && <p className="text-zinc-500">Cargando datos...</p>}

      {!cargando && citas.length === 0 && (
        <p className="text-zinc-400">No hay citas pendientes.</p>
      )}

      <div className="grid gap-4 max-w-3xl">
        {citas.map((cita) => (
          <div key={cita.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex justify-between items-center hover:border-emerald-500/50 transition-all">
            
            {/* IZQUIERDA: DATOS */}
            <div>
              <h3 className="font-bold text-xl mb-1">{cita.clientName}</h3>
              <p className="text-zinc-400 text-sm mb-2">{cita.clientPhone}</p>
              
              <div className="flex items-center gap-2">
                <p className="text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded text-sm">
                  📅 {new Date(cita.startTime).toLocaleString()}
                </p>
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  cita.status === 'CONFIRMED' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {cita.status}
                </span>
              </div>
            </div>
            
            {/* DERECHA: BOTONES */}
            <div className="flex flex-col gap-3">
              {cita.status !== 'CONFIRMED' && (
                <button 
                  onClick={() => handleConfirm(cita.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
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