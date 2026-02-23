"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
}

interface Barber {
  id: number;
  username: string;
  role: string;
}

export default function Home() {
  const [step, setStep] = useState(1); 
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState(""); 
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/api/services`)
      .then((res) => res.json())
      .then((data: Service[]) => {
        const sortedServices = data.sort((a, b) => a.id - b.id);
        setServices(sortedServices);
      })
      .catch((err) => console.error(err));

    fetch(`${apiUrl}/api/users`)
      .then((res) => res.json())
      .then((data: Barber[]) => {
        const onlyBarbers = data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN');
        setBarbers(onlyBarbers);
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleService = (service: Service) => {
    if (selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

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
  const timeSlots = generateTimeSlots();

  const getBarberName = () => {
    if (!selectedBarber) return "Cualquiera";
    const barber = barbers.find(b => b.id.toString() === selectedBarber);
    return barber ? barber.username : "Cualquiera";
  };

  const handleConfirmBooking = async () => {
    if (!clientName || !clientPhone) { alert("⚠️ Faltan tus datos personales."); return; }
    const bookingData = { clientName, clientPhone, appointmentDate: selectedDate, appointmentTime: selectedTime, services: selectedServices, barberName: getBarberName(), status: "PENDIENTE" };
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/appointments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData) });
      if (res.ok) setStep(4); else alert("Error del servidor: " + await res.text());
    } catch (error) { alert("No se pudo conectar con el servidor."); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      <style dangerouslySetContent={{ __html: `html { scroll-behavior: smooth; }` }} />
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-black rounded-lg flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"><span className="text-xl font-bold font-serif">E</span></div>
            <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">ESTILO26</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            {["INICIO", "SERVICIOS", "GALERÍA", "UBICACIÓN"].map((item) => ( <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors tracking-widest">{item}</a> ))}
            <Link href="/admin" className="px-5 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">ADMIN LOGIN</Link>
          </div>
        </div>
      </nav>

      <section id="inicio" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20 mask-image-gradient"></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center max-w-6xl mx-auto mb-16">
          <span className="text-emerald-500 font-bold tracking-[0.3em] text-xs mb-4 block animate-pulse">ESTELÍ, NICARAGUA</span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 leading-none">TU ESTILO <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-600">DEFINITIVO</span></h1>
          <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-10">Más que una barbería, somos un club de caballeros. Experiencia premium, cortes de precisión y el ambiente que mereces.</p>
        </motion.div>

        <div id="servicios" className="relative z-20 w-full max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden scroll-mt-24">
          <div className="flex border-b border-white/5 bg-black/40">
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all ${step >= 1 ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-600'}`}>01. SERVICIOS</div>
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all ${step >= 2 ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-600'}`}>02. AGENDA</div>
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all ${step >= 3 ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-600'}`}>03. CONFIRMAR</div>
          </div>
          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-bold mb-8 text-white">Elige tus Servicios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {services.map((service) => {
                      const isSelected = selectedServices.find(s => s.id === service.id);
                      return (
                        /* --- MAGIA CSS: flex-row, justify-between, items-start, flex-1, shrink-0 --- */
                        <div key={service.id} onClick={() => toggleService(service)} className={`p-6 md:p-8 rounded-2xl border-2 cursor-pointer transition-all flex flex-row justify-between items-start gap-4 group ${isSelected ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xl md:text-2xl mb-1 text-white leading-tight break-words pr-2">{service.name}</div>
                            <div className="text-sm md:text-base text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">{service.durationMinutes} min</div>
                          </div>
                          <div className="text-2xl md:text-3xl font-black text-emerald-400 shrink-0 mt-1 md:mt-0">C$ {service.price}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <div className="text-right"><div className="text-xs text-zinc-500 uppercase font-bold">Total Estimado</div><div className="text-3xl font-bold">C$ {totalPrice}</div></div>
                    <button onClick={() => setStep(2)} disabled={selectedServices.length === 0} className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50">CONTINUAR ➔</button>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-bold mb-8 text-white">Personaliza tu Cita</h3>
                  <div className="space-y-8 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Selecciona Profesional</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div onClick={() => setSelectedBarber("")} className={`p-5 rounded-xl border-2 text-center cursor-pointer font-bold text-lg transition-all ${selectedBarber === "" ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/30 hover:text-zinc-200'}`}>Cualquiera</div>
                            {barbers.map(b => ( <div key={b.id} onClick={() => setSelectedBarber(b.id.toString())} className={`p-5 rounded-xl border-2 text-center cursor-pointer font-bold text-lg transition-all ${selectedBarber === b.id.toString() ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/30 hover:text-zinc-200'}`}>{b.username}</div> ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><label className="block text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Fecha</label><input type="date" style={{ colorScheme: "dark" }} className="w-full bg-black border-2 border-zinc-800 p-5 rounded-xl text-white focus:border-emerald-500 outline-none text-xl transition-all font-bold" onChange={(e) => setSelectedDate(e.target.value)} /></div>
                      <div><label className="block text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest">Hora</label><select className="w-full bg-black border-2 border-zinc-800 p-5 rounded-xl text-white focus:border-emerald-500 outline-none text-xl appearance-none cursor-pointer transition-all font-bold" onChange={(e) => setSelectedTime(e.target.value)}><option value="">-- Seleccionar --</option>{timeSlots.map((slot) => ( <option key={slot.value} value={slot.value}>{slot.label}</option> ))}</select></div>
                    </div>
                  </div>
                  <div className="flex gap-4"><button onClick={() => setStep(1)} className="px-6 py-4 border border-white/10 rounded-xl hover:bg-white/5">Atrás</button><button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50">SIGUIENTE ➔</button></div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-3xl font-bold mb-8 text-white">Tus Datos</h3>
                  <div className="space-y-4 mb-8">
                    <div><label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Nombre Completo</label><input type="text" placeholder="Ej: Carlos Pérez" className="w-full bg-black border-2 border-zinc-800 p-6 rounded-xl text-white focus:border-emerald-500 outline-none text-xl placeholder:text-zinc-700 transition-all" value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
                    <div><label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Teléfono / WhatsApp</label><input type="tel" placeholder="Ej: 8888-8888" className="w-full bg-black border-2 border-zinc-800 p-6 rounded-xl text-white focus:border-emerald-500 outline-none text-xl placeholder:text-zinc-700 transition-all" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></div>
                  </div>
                  <div className="bg-emerald-900/10 border border-emerald-500/30 p-8 rounded-2xl mb-6">
                      <h4 className="text-emerald-400 font-bold tracking-widest uppercase mb-6 text-sm">Resumen de Cita</h4>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-white/10 gap-4">
                          <div><p className="text-zinc-400 text-sm uppercase mb-1">Fecha y Hora</p><p className="text-2xl font-bold text-white capitalize">{formatDate(selectedDate)}</p><p className="text-xl text-emerald-400 font-bold mt-1">a las {formatTime(selectedTime)}</p></div>
                          <div className="md:text-right"><p className="text-zinc-400 text-sm uppercase mb-1">Profesional</p><p className="text-2xl font-bold text-white">{getBarberName()}</p></div>
                      </div>
                      <div className="space-y-3">{selectedServices.map(s => ( <div key={s.id} className="flex justify-between text-zinc-300 text-lg"><span>{s.name}</span><span className="font-bold">C$ {s.price}</span></div> ))}</div>
                      <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-xl font-bold text-zinc-400">Total a Pagar</span><span className="text-4xl font-black text-white">C$ {totalPrice}</span></div>
                  </div>
                  <div className="flex gap-4"><button onClick={() => setStep(2)} className="px-6 py-4 border border-white/10 rounded-xl hover:bg-white/5">Atrás</button><button onClick={handleConfirmBooking} className="flex-1 px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">CONFIRMAR RESERVA ✅</button></div>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                  <div className="w-28 h-28 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.6)] animate-pulse">✅</div>
                  <h3 className="text-5xl font-black mb-6 text-white tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">¡Reserva Exitosa!</h3>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg mx-auto mb-10 backdrop-blur-md">
                      <p className="text-zinc-300 text-lg leading-relaxed">Gracias por confiar en <span className="text-emerald-400 font-bold">Estilo26</span>, <span className="text-white font-bold">{clientName}</span>.<br/>Tu cita está confirmada para el:</p>
                      <p className="text-2xl font-black text-white mt-4 uppercase tracking-wide">{formatDate(selectedDate)}</p>
                      <p className="text-xl text-emerald-400 font-bold">a las {formatTime(selectedTime)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={() => { setStep(1); setSelectedServices([]); setClientName(""); setClientPhone(""); }} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 uppercase tracking-widest text-sm">📅 Agendar Otra</button>
                      <button onClick={() => window.location.href = "/"} className="px-8 py-4 bg-transparent border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 hover:text-white transition-all uppercase tracking-widest text-sm">🏠 Volver al Inicio</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="galería" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 scroll-mt-24"><div className="text-center"><h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Nuestra <span className="text-emerald-500">Galería</span></h2><p className="text-zinc-500">Próximamente: Las mejores transformaciones de Estilo26.</p></div></section>
      <section id="ubicación" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5 scroll-mt-24"><div className="text-center"><h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Dónde <span className="text-emerald-500">Encontrarnos</span></h2><p className="text-zinc-500">Estelí, Nicaragua. Integración con Google Maps próximamente.</p></div></section>
      <footer className="bg-black py-10 border-t border-white/10 text-center text-zinc-500 text-sm"><p>&copy; 2026 Estilo26. Todos los derechos reservados.</p></footer>
    </div>
  );
}
