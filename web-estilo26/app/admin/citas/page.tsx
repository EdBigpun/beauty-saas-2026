"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- 1. INTERFACES ---
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

interface Barber {
  id: number;
  username: string;
  role: string;
}

export default function CitasPage() {
  const router = useRouter();

  // --- 2. ESTADOS ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCita, setSelectedCita] = useState<Appointment | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Filtros
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filterBarber, setFilterBarber] = useState("TODOS");

  // --- 3. HELPERS ---
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // --- 4. CARGAS DE DATOS ---
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

  const fetchBarbers = () => {
    fetch("http://localhost:9090/api/users")
      .then((res) => res.json())
      .then((data: Barber[]) => {
        const onlyBarbers = data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN');
        setBarbers(onlyBarbers);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }
    fetchAppointments();
    fetchBarbers();
  }, [router]);

  // --- 5. LÓGICA DE ACTUALIZACIÓN ---
  const updateStatus = async (newStatus: string) => {
    if (!selectedCita) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `http://localhost:9090/api/appointments/${selectedCita.id}/status?status=${newStatus}`,
        { method: "PUT" }
      );
      if (res.ok) {
        alert("¡Estado actualizado!");
        setSelectedCita(null);
        fetchAppointments();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setProcessing(false);
    }
  };

  // --- 6. LÓGICA DE FILTRADO Y SEPARACIÓN (ESTANTES) ---
  
  // 1. Primero filtramos por barbero (como antes)
  const filteredAppointments = appointments.filter((cita) => {
    if (filterBarber === "TODOS") return true;
    return (cita.barberName || "") === filterBarber;
  });

  // 2. Calculamos métricas
  const stats = {
    pendientes: filteredAppointments.filter(c => c.status === "PENDIENTE").length,
    completadas: filteredAppointments.filter(c => c.status === "COMPLETADA").length,
    canceladas: filteredAppointments.filter(c => c.status === "CANCELADA").length,
    noShow: filteredAppointments.filter(c => c.status === "NO ASISTIÓ").length,
  };

  // 3. SEPARAMOS EN BLOQUES (Aquí creamos los "Estantes")
  const pendingCitas = filteredAppointments.filter(c => c.status === "PENDIENTE");
  const completedCitas = filteredAppointments.filter(c => c.status === "COMPLETADA");
  const cancelledCitas = filteredAppointments.filter(c => c.status === "CANCELADA" || c.status === "NO ASISTIÓ");

  // --- COMPONENTE DE TARJETA (Para no repetir código) ---
  const CitaCard = ({ cita, isDimmed = false }: { cita: Appointment, isDimmed?: boolean }) => (
    <div 
        className={`border p-6 rounded-2xl transition-all relative overflow-hidden group
            ${isDimmed ? 'bg-black border-zinc-900 opacity-60 hover:opacity-100 grayscale-[50%] hover:grayscale-0' : 'bg-[#0f0f0f] border-zinc-800 hover:border-emerald-500/50'}
        `}
    >
      {/* Decoración solo si no está "tenue" */}
      {!isDimmed && (
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-6 -mt-6 transition-all group-hover:bg-emerald-500/10"></div>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">FECHA</p>
          <p className="text-lg font-bold text-white capitalize">{formatDate(cita.appointmentDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">HORA</p>
          <div className={`px-3 py-1 rounded-lg border inline-block ${!isDimmed ? 'bg-zinc-900 border-zinc-700' : 'bg-transparent border-transparent'}`}>
            <p className="text-xl font-black text-white">{formatTime(cita.appointmentTime)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 pb-6 border-b border-zinc-800 relative z-10">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">CLIENTE</p>
        <h3 className="text-2xl font-bold text-white mb-1">{cita.clientName}</h3>
        <p className="text-zinc-400 font-mono text-sm">📞 {cita.clientPhone}</p>
      </div>

      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex flex-wrap gap-2">
            {cita.services && cita.services.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-xs text-zinc-300">{s.name}</span>
            ))}
        </div>
        <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">PROFESIONAL</p>
            <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                {/* LÓGICA DE NOMBRE ADMIN: Si es 'admin', agrega (Admin) */}
                ✂️ {cita.barberName || "Cualquiera"} 
                {cita.barberName === 'admin' && <span className="text-zinc-500 text-xs font-normal ml-1">(Admin)</span>}
            </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-zinc-800 relative z-10">
        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded border 
            ${cita.status === 'COMPLETADA' ? 'bg-green-900/20 text-green-500 border-green-900' : 
              cita.status === 'CANCELADA' ? 'bg-red-900/20 text-red-500 border-red-900' : 
              cita.status === 'PENDIENTE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {cita.status}
        </span>
        
        <button 
            onClick={() => setSelectedCita(cita)}
            className={`text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1
                ${!isDimmed ? 'text-white hover:text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}
            `}
        >
            {!isDimmed ? 'GESTIONAR →' : '👁️ VER DETALLES'}
        </button>
      </div>
    </div>
  );

  // --- 7. RENDERIZADO VISUAL ---
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans relative">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-zinc-800 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.push("/admin")} className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all">⬅️</button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Agenda <span className="text-emerald-500">Maestra</span></h1>
              <p className="text-zinc-400">Control de operaciones.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Filtrar por:</label>
                <select 
                    className="bg-zinc-900 border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase"
                    value={filterBarber}
                    onChange={(e) => setFilterBarber(e.target.value)}
                >
                    <option value="TODOS">🌍 TODOS</option>
                    {barbers.map(b => (
                        <option key={b.id} value={b.username}>✂️ {b.username}</option>
                    ))}
                </select>
            </div>
          </div>
        </div>

        {/* DASHBOARD MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-xl flex flex-col items-center">
                <span className="text-yellow-500 font-bold uppercase text-xs tracking-widest">Pendientes</span>
                <span className="text-3xl font-black text-white">{stats.pendientes}</span>
            </div>
            <div className="bg-green-900/10 border border-green-700/30 p-4 rounded-xl flex flex-col items-center">
                <span className="text-emerald-500 font-bold uppercase text-xs tracking-widest">Completadas</span>
                <span className="text-3xl font-black text-white">{stats.completadas}</span>
            </div>
            <div className="bg-red-900/10 border border-red-700/30 p-4 rounded-xl flex flex-col items-center">
                <span className="text-red-500 font-bold uppercase text-xs tracking-widest">Canceladas</span>
                <span className="text-3xl font-black text-white">{stats.canceladas}</span>
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700/30 p-4 rounded-xl flex flex-col items-center">
                <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No Asistió</span>
                <span className="text-3xl font-black text-white">{stats.noShow}</span>
            </div>
        </div>

        {/* LOADING / ERROR */}
        {loading && <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">CARGANDO...</div>}
        {errorMsg && <div className="text-center py-10 text-red-400 bg-red-900/20 rounded-xl border border-red-900/50">{errorMsg}</div>}

        {!loading && !errorMsg && filteredAppointments.length === 0 && (
           <div className="col-span-full text-center py-20 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
             No hay citas registradas.
           </div>
        )}

        {/* --- ESTANTE 1: PENDIENTES (PRIORIDAD) --- */}
        {!loading && !errorMsg && pendingCitas.length > 0 && (
          <div className="mb-12">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-yellow-500/50 flex-1"></div>
                <h3 className="text-yellow-500 font-black uppercase tracking-widest text-sm">📅 Próximas Citas (Pendientes)</h3>
                <div className="h-px bg-yellow-500/50 flex-1"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCitas.map(cita => <CitaCard key={cita.id} cita={cita} />)}
             </div>
          </div>
        )}

        {/* --- ESTANTE 2: COMPLETADAS (HISTORIAL) --- */}
        {!loading && !errorMsg && completedCitas.length > 0 && (
          <div className="mb-12 opacity-80 hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h3 className="text-emerald-500 font-black uppercase tracking-widest text-sm">✅ Historial Completado</h3>
                <div className="h-px bg-zinc-800 flex-1"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCitas.map(cita => <CitaCard key={cita.id} cita={cita} isDimmed={true} />)}
             </div>
          </div>
        )}

        {/* --- ESTANTE 3: CANCELADAS / OTROS --- */}
        {!loading && !errorMsg && cancelledCitas.length > 0 && (
          <div className="mb-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h3 className="text-zinc-500 font-black uppercase tracking-widest text-sm">🗑️ Canceladas / No Asistió</h3>
                <div className="h-px bg-zinc-800 flex-1"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cancelledCitas.map(cita => <CitaCard key={cita.id} cita={cita} isDimmed={true} />)}
             </div>
          </div>
        )}

      </div>

      {/* --- MODAL --- */}
      {selectedCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-zinc-700 w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={() => setSelectedCita(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedCita.status === 'PENDIENTE' ? 'Gestionar Cita' : 'Detalles de Cita'}
                </h2>
                <div className="mb-6 text-sm text-zinc-400 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <p>Cliente: <span className="text-white font-bold">{selectedCita.clientName}</span></p>
                    <p>Fecha: <span className="text-white">{formatDate(selectedCita.appointmentDate)}</span></p>
                    <p>Estado: <span className="text-emerald-400 font-bold">{selectedCita.status}</span></p>
                </div>
                {selectedCita.status === 'PENDIENTE' ? (
                    <div className="space-y-3">
                        <button onClick={() => updateStatus("COMPLETADA")} disabled={processing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">✅ Marcar COMPLETADA</button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => updateStatus("CANCELADA")} disabled={processing} className="w-full py-3 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 font-bold rounded-xl">❌ Cancelar</button>
                            <button onClick={() => updateStatus("NO ASISTIÓ")} disabled={processing} className="w-full py-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl">⚠️ No Show</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-zinc-500 italic mb-4">Cita procesada. Solo lectura.</p>
                        <button onClick={() => updateStatus("PENDIENTE")} className="text-xs text-zinc-600 hover:text-zinc-300 underline">↺ Corregir (Volver a Pendiente)</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
