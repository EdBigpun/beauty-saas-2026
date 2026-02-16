"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 1. EL CONTRATO DE DATOS
interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  services: { name: string; price: number }[];
  barberName?: string; // Nuevo campo (el ? significa que puede venir vacío)
}

export default function CitasPage() {
  const router = useRouter();

  // 2. MEMORIA
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(""); // Nuevo: Para mostrar errores en pantalla

  // --- FUNCIÓN DE AYUDA: CONVERTIR HORA MILITAR A AM/PM ---
  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // la hora '0' es '12'
    return `${h}:${m} ${ampm}`;
  };

  // 3. CARGA DE DATOS BLINDADA
  useEffect(() => {
    // Seguridad básica
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }

    // Llamada al Backend
    fetch("http://localhost:9090/api/appointments")
      .then((res) => {
        // PASO DE SEGURIDAD 1: ¿La respuesta fue exitosa?
        if (!res.ok) {
          throw new Error(
            `Error del servidor: ${res.status} ${res.statusText}`,
          );
        }
        return res.json();
      })
      .then((data) => {
        // PASO DE SEGURIDAD 2: ¿Lo que recibimos es una lista?
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          console.error("Formato inesperado:", data);
          setAppointments([]); // Si no es lista, usamos lista vacía para no romper la app
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fallo al conectar:", error);
        setErrorMsg("No se pudo conectar con el sistema de citas.");
        setLoading(false);
      });
  }, [router]);

  // 4. RENDERIZADO
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
            >
              ⬅️
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                Agenda de <span className="text-emerald-500">Citas</span>
              </h1>
              <p className="text-zinc-400 mt-1">
                Control de reservas en tiempo real.
              </p>
            </div>
          </div>
          {/* Contador */}
          <div className="bg-zinc-900 px-6 py-3 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest block">
              Total Citas
            </span>
            <span className="text-3xl font-black text-white">
              {appointments.length}
            </span>
          </div>
        </div>

        {/* MENSAJES DE ESTADO */}
        {loading && (
          <div className="text-center py-20 animate-pulse text-emerald-500 font-bold tracking-widest uppercase">
            🔄 Cargando Agenda...
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* LISTA DE CITAS */}
        {!loading && !errorMsg && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
                <p className="text-zinc-500 text-xl">
                  📭 No hay citas registradas aún.
                </p>
              </div>
            ) : (
              appointments.map((cita) => (
                <div
                  key={cita.id}
                  className="bg-[#0f0f0f] border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-emerald-500/10"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1">
                        Fecha
                      </p>
                      <p className="text-xl font-bold text-white">
                        {cita.appointmentDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1">
                        Hora
                      </p>
                      <p className="text-2xl font-black text-white bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                        {formatTime(cita.appointmentTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-2">
                      Cliente
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {cita.clientName}
                    </h3>
                    <p className="text-zinc-400 font-mono text-sm">
                      📞 {cita.clientPhone}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-zinc-500 text-xs uppercase font-bold">
                      Servicios:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cita.services &&
                        cita.services.map((servicio, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300"
                          >
                            {servicio.name}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* --- BLOQUE NUEVO: BARBERO ASIGNADO --- */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">
                      Profesional Asignado
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💈</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {cita.barberName || "Cualquiera (Sin preferencia)"}
                      </span>
                    </div>
                  </div>
                  {/* -------------------------------------- */}

                  <div className="mt-6 pt-4 flex justify-between items-center">
                    <span className="px-4 py-2 bg-yellow-900/20 text-yellow-500 border border-yellow-900/30 rounded-lg text-xs font-bold uppercase tracking-widest">
                      {cita.status}
                    </span>
                    <button className="text-zinc-500 hover:text-white text-sm font-bold transition-colors">
                      Gestionar ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
