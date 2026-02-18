"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- 1. INTERFACE (El contrato de datos) ---
interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  services: { name: string; price: number }[];
  barberName?: string;
}

export default function CitasPage() {
  const router = useRouter();

  // --- 2. ESTADOS (La memoria de la página) ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // NUEVOS ESTADOS PARA EL MODAL (VENTANA EMERGENTE)
  // selectedCita: Guarda la cita a la que le diste click. Si es null, el modal está cerrado.
  const [selectedCita, setSelectedCita] = useState<Appointment | null>(null);
  // processing: Para saber si estamos guardando cambios (para deshabilitar botones y que no den doble click)
  const [processing, setProcessing] = useState(false);

  // --- 3. HELPER (Formato de Hora) ---
  const formatTime = (timeString: string) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  // --- 4. FUNCIÓN PARA CARGAR DATOS (Lectura) ---
  const fetchAppointments = () => {
    setLoading(true);
    fetch("http://localhost:9090/api/appointments")
      .then((res) => {
        if (!res.ok) throw new Error("Error al conectar");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setAppointments(data);
        else setAppointments([]);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setErrorMsg("Error al cargar agenda");
        setLoading(false);
      });
  };

  // Cargar al inicio
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }
    fetchAppointments();
  }, [router]);

  // --- 5. FUNCIÓN PARA ACTUALIZAR ESTADO (Escritura) ---
  // Esta función llama a nuestro nuevo endpoint PUT en Java
  const updateStatus = async (newStatus: string) => {
    if (!selectedCita) return; // Seguridad: si no hay cita seleccionada, no hacer nada.

    setProcessing(true); // Encendemos "Cargando..."

    try {
      // Llamada PUT a la API
      // Fíjate en la URL: /api/appointments/{ID}/status?status={NUEVO_ESTADO}
      const res = await fetch(
        `http://localhost:9090/api/appointments/${selectedCita.id}/status?status=${newStatus}`,
        { method: "PUT" }
      );

      if (res.ok) {
        // Si salió bien:
        alert("¡Estado actualizado!");
        setSelectedCita(null); // Cerramos el modal
        fetchAppointments();   // Recargamos la lista para ver el cambio
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setProcessing(false); // Apagamos "Cargando..."
    }
  };

  // --- 6. RENDERIZADO (Lo visual) ---
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans relative">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin")} className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all">⬅️</button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Agenda <span className="text-emerald-500">Maestra</span></h1>
              <p className="text-zinc-400">Control de operaciones.</p>
            </div>
          </div>
          <div className="bg-zinc-900 px-6 py-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-zinc-500 text-xs font-bold uppercase block">Total</span>
            <span className="text-3xl font-black text-white">{appointments.length}</span>
          </div>
        </div>

        {/* LOADING / ERROR */}
        {loading && <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">CARGANDO...</div>}
        {errorMsg && <div className="text-center py-10 text-red-400 bg-red-900/20 rounded-xl border border-red-900/50">{errorMsg}</div>}

        {/* LISTA DE CITAS */}
        {!loading && !errorMsg && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-full text-center py-20 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">Agenda vacía.</div>
            ) : (
              appointments.map((cita) => (
                <div key={cita.id} className="bg-[#0f0f0f] border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                  {/* Decoración */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>

                  {/* Header Tarjeta */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">FECHA</p>
                      <p className="text-lg font-bold text-white">{cita.appointmentDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">HORA</p>
                      <div className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700 inline-block">
                        <p className="text-xl font-black text-white">{formatTime(cita.appointmentTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="mb-6 pb-6 border-b border-zinc-800 relative z-10">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">CLIENTE</p>
                    <h3 className="text-2xl font-bold text-white mb-1">{cita.clientName}</h3>
                    <p className="text-zinc-400 font-mono text-sm">📞 {cita.clientPhone}</p>
                  </div>

                  {/* Servicios y Barbero */}
                  <div className="space-y-3 mb-6 relative z-10">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">SERVICIOS</p>
                        <div className="flex flex-wrap gap-2">
                            {cita.services && cita.services.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-xs text-zinc-300">{s.name}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">PROFESIONAL</p>
                        <p className="text-emerald-400 font-bold text-sm">✂️ {cita.barberName || "Cualquiera"}</p>
                    </div>
                  </div>

                  {/* Footer Tarjeta: Botón Gestionar */}
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800 relative z-10">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded border 
                        ${cita.status === 'COMPLETADA' ? 'bg-green-900/20 text-green-500 border-green-900' : 
                          cita.status === 'CANCELADA' ? 'bg-red-900/20 text-red-500 border-red-900' : 
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                        {cita.status}
                    </span>
                    
                    {/* ACCIÓN: Al dar click aquí, guardamos la cita en "selectedCita", lo que abre el Modal */}
                    <button 
                        onClick={() => setSelectedCita(cita)}
                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                        GESTIONAR →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- 7. EL MODAL (VENTANA EMERGENTE) --- */}
      {/* Solo se muestra si "selectedCita" NO es null */}
      {selectedCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-zinc-700 w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Botón Cerrar (X) */}
                <button 
                    onClick={() => setSelectedCita(null)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Gestionar Cita</h2>
                <p className="text-zinc-400 mb-6 text-sm">
                    Cliente: <span className="text-emerald-400 font-bold">{selectedCita.clientName}</span>
                </p>

                {/* Botones de Acción */}
                <div className="space-y-3">
                    <button 
                        onClick={() => updateStatus("COMPLETADA")}
                        disabled={processing}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        ✅ Marcar como COMPLETADA
                    </button>

                    <button 
                        onClick={() => updateStatus("CANCELADA")}
                        disabled={processing}
                        className="w-full py-4 bg-red-900/50 border border-red-800 hover:bg-red-900 text-red-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        ❌ Cancelar Cita
                    </button>
                    
                    <button 
                         onClick={() => updateStatus("NO ASISTIÓ")}
                         disabled={processing}
                         className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all"
                    >
                        ⚠️ No Asistió (No Show)
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => setSelectedCita(null)} className="text-zinc-500 hover:text-white text-sm underline">
                        Volver sin cambios
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}
