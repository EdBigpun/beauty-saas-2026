"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
}

interface Appointment {
  id: number;
  clientName: string;
  clientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  services: Service[];
  status: string;
  barberName: string;
  rescheduled: boolean;
}

interface Barber {
  id: number;
  username: string;
  role: string;
}

export default function CitasPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterBarber, setFilterBarber] = useState("TODOS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; // OPERADOR RESTAURADO: Convierte 13 en 1
    h = h ? h : 12; // Si es 0, lo convierte en 12
    return `${h}:${m} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
  };

  const fetchAppointments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/appointments`);
      if (!res.ok) throw new Error("Error en red");
      const data = await res.json();
      
      const sortedData = data.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime();
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime();
        return dateA - dateB;
      });
      
      setAppointments(sortedData);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }

    fetchAppointments();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/api/users`)
      .then((res) => res.json())
      .then((data: Barber[]) => {
        const onlyBarbers = data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN');
        setBarbers(onlyBarbers);
      })
      .catch(err => console.error(err));
  }, [router]);

  // --- ARREGLO JEDI 1: Cambio de 'newStatus' a 'status' ---
  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/appointments/${id}/status?status=${nuevoEstado}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        setAppointments(appointments.map(app => app.id === id ? { ...app, status: nuevoEstado } : app));
        closeModal();
      } else {
        const errorText = await res.text();
        alert(`El servidor rechazó el cambio.\nMotivo: ${errorText}`);
      }
    } catch (error) {
      alert("Error crítico: No se pudo conectar con el servidor backend.");
    }
  };

  // --- ARREGLO JEDI 2: Cambio de 'newDate/newTime' a 'date/time' ---
  const reagendarCita = async () => {
    if (!selectedAppt || !newDate || !newTime) {
      alert("Debes seleccionar una nueva fecha y hora.");
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/appointments/${selectedAppt.id}/reschedule?date=${newDate}&time=${newTime}`, {
        method: "PUT",
      });

      if (res.ok) {
        alert("✅ Cita reagendada con éxito.");
        fetchAppointments();
        closeModal();
      } else {
        const errorText = await res.text();
        alert("Error: " + errorText);
      }
    } catch (error) {
      alert("Error de conexión al servidor");
    }
  };

  const openModal = (app: Appointment) => {
    setSelectedAppt(app);
    setIsRescheduleMode(false);
    setNewDate("");
    setNewTime("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppt(null);
    setIsRescheduleMode(false);
  };

  const citasFiltradas = appointments.filter(app => {
    if (filterBarber === "TODOS") return true;
    if (filterBarber === "admin" && app.barberName === "admin") return true;
    return app.barberName === filterBarber;
  });

  const citasPendientes = citasFiltradas.filter(a => a.status === 'PENDIENTE');
  const citasCompletadas = citasFiltradas.filter(a => a.status === 'COMPLETADA');
  const citasHistorial = citasFiltradas.filter(a => a.status === 'CANCELADA' || a.status === 'NO_SHOW');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'COMPLETADA': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'CANCELADA': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'NO_SHOW': return 'text-zinc-400 bg-zinc-800 border-zinc-700';
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-800';
    }
  };

  const generateTimeSlots = () => {
    const times = [];
    for (let i = 8; i <= 20; i++) { 
      const period = i >= 12 ? 'PM' : 'AM';
      let displayHour = i > 12 ? i - 12 : i;
      if (displayHour === 0) displayHour = 12;
      times.push({ value: `${i.toString().padStart(2, '0')}:00`, label: `${displayHour}:00 ${period}` });
      if (i < 20) times.push({ value: `${i.toString().padStart(2, '0')}:30`, label: `${displayHour}:30 ${period}` });
    }
    return times;
  };

  const renderTarjetaCita = (app: Appointment) => {
    const isToday = new Date(app.appointmentDate).toDateString() === new Date().toDateString();
    const displayBarber = app.barberName === 'admin' ? 'Carlos Pérez (Admin)' : app.barberName;

    return (
      <div key={app.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
        <div className="px-6 py-4 border-b border-zinc-800/50 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
              {app.status}
            </span>
            {app.rescheduled && (
              <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                🔄 Reagendado
              </span>
            )}
          </div>
          {app.status === 'PENDIENTE' && (
            <button onClick={() => openModal(app)} className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">
              Gestionar ➔
            </button>
          )}
        </div>

        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fecha</p>
              <p className={`text-lg font-black capitalize ${isToday ? 'text-emerald-400' : 'text-white'}`}>
                {isToday ? "HOY" : formatDate(app.appointmentDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Hora</p>
              <div className="bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-lg">
                <p className="text-xl font-black text-white">{formatTime(app.appointmentTime)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Cliente</p>
            <p className="text-2xl font-black text-white">{app.clientName}</p>
            <a href={`https://wa.me/505${app.clientPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-400 font-mono text-sm mt-1 transition-colors">
              📞 {app.clientPhone}
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-zinc-800/50">
            {app.services.map(s => (
              <span key={s.id} className="text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-md">
                {s.name}
              </span>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Profesional</p>
            <p className="text-sm font-bold text-emerald-500/80 uppercase tracking-wider flex items-center gap-2">
              ✂️ {displayBarber}
            </p>
          </div>
        </div>

        {app.status === 'COMPLETADA' && (
          <div className="bg-emerald-900/10 py-3 text-center border-t border-emerald-900/20">
            <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">✅ Historial Completado</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-zinc-800 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => router.push("/admin")} className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all">⬅️</button>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Agenda <span className="text-emerald-500">Maestra</span></h1>
                <p className="text-zinc-500 text-sm mt-1">Control de operaciones.</p>
              </div>
            </div>

            <div className="flex flex-col w-full md:w-auto">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Filtrar por:</label>
                <select 
                    className="bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase cursor-pointer min-w-[200px]"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#1a1300] border border-amber-900/30 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-amber-500 font-black uppercase text-[10px] tracking-widest mb-2">Pendientes</span>
            <span className="text-4xl font-black text-white">{citasPendientes.length}</span>
          </div>
          <div className="bg-[#001a09] border border-emerald-900/30 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-2">Completadas</span>
            <span className="text-4xl font-black text-white">{citasCompletadas.length}</span>
          </div>
          <div className="bg-[#1a0000] border border-red-900/30 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-2">Canceladas</span>
            <span className="text-4xl font-black text-white">{citasFiltradas.filter(a => a.status === 'CANCELADA').length}</span>
          </div>
          <div className="bg-[#0f0f0f] border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest mb-2">No Asistió</span>
            <span className="text-4xl font-black text-white">{citasFiltradas.filter(a => a.status === 'NO_SHOW').length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">Sincronizando agenda...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl">Error al cargar agenda</div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4 mb-8 mt-4">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h2 className="text-amber-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    🗓️ Próximas Citas (Pendientes)
                </h2>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            {citasPendientes.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 font-bold mb-10">No hay citas pendientes.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {citasPendientes.map(renderTarjetaCita)}
                </div>
            )}

            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h2 className="text-emerald-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    ✅ Citas Completadas
                </h2>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            {citasCompletadas.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 font-bold mb-10">Aún no hay citas completadas.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {citasCompletadas.map(renderTarjetaCita)}
                </div>
            )}

            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <h2 className="text-zinc-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    📚 Historial (Canceladas / No Asistió)
                </h2>
                <div className="h-px bg-zinc-800 flex-1"></div>
            </div>

            {citasHistorial.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 font-bold">El historial está vacío.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {citasHistorial.map(renderTarjetaCita)}
                </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            
            <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white tracking-tighter">
                {isRescheduleMode ? "🗓️ Reagendar Cita" : "Gestionar Cita"}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 border-b border-zinc-800 bg-black/20">
              <p className="text-sm text-zinc-400">Cliente: <span className="font-bold text-white">{selectedAppt.clientName}</span></p>
              <p className="text-sm text-zinc-400 mt-1">Fecha Actual: {formatDate(selectedAppt.appointmentDate)} a las {formatTime(selectedAppt.appointmentTime)}</p>
            </div>

            <div className="p-6">
              {!isRescheduleMode ? (
                <div className="space-y-3">
                  <button onClick={() => actualizarEstado(selectedAppt.id, 'COMPLETADA')} className="w-full py-4 bg-emerald-600 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                    ✅ Marcar COMPLETADA
                  </button>
                  <button onClick={() => setIsRescheduleMode(true)} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                    🗓️ Reagendar Cita
                  </button>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 mt-3">
                    <button onClick={() => actualizarEstado(selectedAppt.id, 'CANCELADA')} className="py-4 bg-red-900/20 text-red-500 border border-red-900/50 font-bold rounded-xl hover:bg-red-900/40 transition-colors">
                      ❌ Cancelar
                    </button>
                    <button onClick={() => actualizarEstado(selectedAppt.id, 'NO_SHOW')} className="py-4 bg-zinc-900 text-orange-500 border border-zinc-700 font-bold rounded-xl hover:bg-zinc-800 transition-colors">
                      ⚠️ No Show
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nueva Fecha</label>
                    <input type="date" style={{ colorScheme: "dark" }} className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl text-white focus:border-blue-500 outline-none font-bold transition-colors" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Nueva Hora</label>
                    <select className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl text-white focus:border-blue-500 outline-none font-bold appearance-none transition-colors" value={newTime} onChange={(e) => setNewTime(e.target.value)}>
                      <option value="">Seleccionar Hora</option>
                      {generateTimeSlots().map(slot => ( <option key={slot.value} value={slot.value}>{slot.label}</option> ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-8">
                    <button onClick={() => setIsRescheduleMode(false)} className="py-4 bg-zinc-900 text-zinc-400 font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancelar</button>
                    <button onClick={reagendarCita} className="py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-all">💾 Guardar Cambio</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
