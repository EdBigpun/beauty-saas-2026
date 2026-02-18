"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- 1. EL CONTRATO (INTERFACE) ---
// Aquí definimos la "forma" de los datos.
// Si Java manda "barberName", aquí debemos declararlo para poder usarlo.
interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  services: { name: string; price: number }[];
  barberName?: string; // (Nuevo) El ? significa que no es obligatorio (puede ser null)
}

export default function CitasPage() {
  const router = useRouter();

  // --- 2. MEMORIA DEL COMPONENTE (STATE) ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 3. HERRAMIENTA DE FORMATO DE HORA ---
  // Recibe "15:00:00" y devuelve "03:00 PM"
  // Explicación: Cortamos el string, convertimos a número y calculamos AM/PM.
  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // Si es 0 (medianoche), mostrar 12
    return `${h}:${m} ${ampm}`;
  };

  // --- 4. CARGA DE DATOS (USE EFFECT) ---
  useEffect(() => {
    // A. Seguridad: ¿Tienes permiso?
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }

    // B. Petición al Backend (GET)
    fetch("http://localhost:9090/api/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Error al conectar con el servidor");
        return res.json();
      })
      .then((data) => {
        // C. Validación: ¿Es una lista real?
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setAppointments([]); // Si falla, lista vacía para no romper la app
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMsg("No se pudo cargar la agenda.");
        setLoading(false);
      });
  }, [router]);

  // --- 5. RENDERIZADO (LO VISUAL) ---
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all"
            >
              ⬅️
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                Agenda <span className="text-emerald-500">Maestra</span>
              </h1>
              <p className="text-zinc-400">Visión global de todas las reservas.</p>
            </div>
          </div>
          
          {/* CONTADOR DE CITAS */}
          <div className="bg-zinc-900 px-6 py-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-zinc-500 text-xs font-bold uppercase block">Total</span>
            <span className="text-3xl font-black text-white">{appointments.length}</span>
          </div>
        </div>

        {/* ESTADOS DE CARGA / ERROR */}
        {loading && <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">CARGANDO DATOS...</div>}
        {errorMsg && <div className="text-center py-10 text-red-400 bg-red-900/20 rounded-xl border border-red-900/50">{errorMsg}</div>}

        {/* GRILLA DE TARJETAS */}
        {!loading && !errorMsg && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {appointments.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
                No hay citas programadas hoy.
              </div>
            ) : (
              appointments.map((cita) => (
                <div 
                  key={cita.id} 
                  className="bg-[#0f0f0f] border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all relative overflow-hidden group"
                >
                  {/* Decoración Fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>

                  {/* CABECERA TARJETA (FECHA Y HORA) */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">FECHA</p>
                      <p className="text-lg font-bold text-white">{cita.appointmentDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">HORA</p>
                      <div className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700 inline-block">
                        <p className="text-xl font-black text-white">
                          {formatTime(cita.appointmentTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CUERPO TARJETA (CLIENTE) */}
                  <div className="mb-6 pb-6 border-b border-zinc-800 relative z-10">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">CLIENTE</p>
                    <h3 className="text-2xl font-bold text-white mb-1">{cita.clientName}</h3>
                    <p className="text-zinc-400 font-mono text-sm flex items-center gap-2">
                      📞 {cita.clientPhone}
                    </p>
                  </div>

                  {/* SERVICIOS */}
                  <div className="space-y-3 mb-6 relative z-10">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">SERVICIOS</p>
                        <div className="flex flex-wrap gap-2">
                            {cita.services && cita.services.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-xs text-zinc-300">
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* BARBERO (LA SECCIÓN NUEVA) */}
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">PROFESIONAL</p>
                        <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                            ✂️ {cita.barberName || "Cualquiera"}
                        </p>
                    </div>
                  </div>

                  {/* FOOTER (ESTADO) */}
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800 relative z-10">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[10px] font-bold uppercase tracking-widest">
                        {cita.status}
                    </span>
                    <button className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        GESTIONAR →
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
