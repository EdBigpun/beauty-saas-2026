"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react"; // Usaremos la librería premium directamente

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
  icon: string;
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

  // =========================================================
  // MAPEO DE ÍCONOS PREMIUM (LUCIDE REACT)
  // Lee el NOMBRE del servicio, no el emoji, para que no se repitan.
  // =========================================================
  const getServiceIcon = (service: Service) => {
    // Clases maestras: Grandes (w-10 h-10), color cian, y brillo de neón (drop-shadow)
    const baseClasses = "w-10 h-10 text-[#4BE6CB] drop-shadow-[0_0_10px_rgba(75,230,203,0.8)]";
    const name = service.name.toLowerCase();

    // Asignación inteligente por nombre
    if (name.includes("barba") && name.includes("cabello")) return <Icons.UserSquare className={baseClasses} />;
    if (name.includes("cabello")) return <Icons.Scissors className={baseClasses} />;
    if (name.includes("barba")) return <Icons.User className={baseClasses} />;
    if (name.includes("orilla")) return <Icons.Ruler className={baseClasses} />; // La regla profesional
    
    return <Icons.Sparkles className={baseClasses} />; // Fallback por si acaso
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/api/services`)
      .then((res) => res.json())
      .then((data: Service[]) => setServices(data.sort((a, b) => a.id - b.id)))
      .catch((err) => console.error(err));

    fetch(`${apiUrl}/api/users`)
      .then((res) => res.json())
      .then((data: Barber[]) => setBarbers(data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN')))
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#4BE6CB]/30 relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: "html { scroll-behavior: smooth; }" }} />

      <div className="fixed inset-0 z-0 pointer-events-none bg-transparent">
        <div className="absolute inset-0 bg-[url('/fondo-cyber.png')] bg-[length:100%_auto] bg-left-top bg-no-repeat opacity-100"></div>
      </div>

      <nav className="fixed w-full top-0 z-50 bg-transparent h-20 border-b border-[#1C4B42]/30 pt-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1C4B42] to-black rounded-lg flex items-center justify-center border border-[#4BE6CB]/30 group-hover:border-[#4BE6CB] transition-all shadow-[0_0_20px_rgba(75,230,203,0.1)]">
              <span className="text-xl font-bold font-serif text-white leading-none mt-1">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tighter text-white leading-none mt-1 drop-shadow-md">ESTILO26</span>
              <span className="text-[8px] tracking-[0.2em] text-[#4BE6CB] uppercase">Grooming Studio</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            {["INICIO", "SERVICIOS", "GALERÍA", "UBICACIÓN"].map((item) => ( 
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-[#4BE6CB] transition-colors tracking-widest drop-shadow-md">{item}</a> 
            ))}
            <Link href="/admin" className="px-6 py-2 bg-transparent border border-[#4BE6CB]/50 text-[#4BE6CB] rounded-full hover:bg-[#4BE6CB]/20 hover:text-white transition-all backdrop-blur-md">LOGIN</Link>
          </div>
        </div>
      </nav>

      <section id="inicio" className="relative z-10 pt-28 pb-16 px-6 min-h-[95vh] flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center w-full max-w-4xl mx-auto px-4 mt-2" 
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-16 leading-tight text-white uppercase drop-shadow-2xl selection:bg-emerald-500/30">
            Domina tu presencia.<br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4BE6CB] to-[#1C4B42] drop-shadow-[0_0_20px_rgba(75,230,203,0.3)]">
              Define tu estilo.
            </span>
          </h1>
          
          <p className="text-zinc-200 text-lg md:text-2xl max-w-2xl mx-auto mb-20 font-medium tracking-wide drop-shadow-lg leading-relaxed">
            Grooming de precisión, estilo y carácter para hombres que proyectan poder.
          </p>

          <div className="mt-12 mb-20">
            <p className="text-[#4BE6CB] text-xs md:text-sm max-w-lg mx-auto tracking-widest uppercase font-semibold opacity-90 leading-relaxed drop-shadow-md">
              Reserva tu cita en estilo26 y transforma con técnica milimétrica y atención profesional.
            </p>
          </div>

          <a href="#servicios" className="inline-block px-12 py-4 mb-24 bg-[#050505]/40 border-2 border-[#1C4B42] text-[#4BE6CB] font-bold text-base md:text-lg rounded-full hover:bg-[#1C4B42]/60 hover:text-white hover:border-[#4BE6CB] hover:shadow-[0_0_30px_rgba(75,230,203,0.4)] transition-all uppercase tracking-widest backdrop-blur-md shadow-lg">
            Reserva tu cita
          </a>

          <div className="mt-12 mb-16">
            <p className="text-[#4BE6CB] font-bold tracking-[0.4em] uppercase text-xs md:text-sm opacity-80 drop-shadow-md">
              Precisión &bull; Estilo &bull; Presencia
            </p>
          </div>
        </motion.div>
      </section>

      <section className="bg-transparent relative z-10 pb-20 pt-10">
        <div id="servicios" className="w-full max-w-3xl mx-auto bg-[#101111]/90 backdrop-blur-xl border border-[#1C4B42]/50 rounded-3xl p-1 shadow-[0_0_50px_rgba(0,0,0,0.8)] scroll-mt-32 relative z-30">
          
          <div className="flex border-b border-[#1C4B42]/30 bg-black/60 rounded-t-3xl overflow-hidden">
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all cursor-default ${step >= 1 ? 'text-[#4BE6CB] bg-[#1C4B42]/20' : 'text-zinc-600'}`}>01. SERVICIOS</div>
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all cursor-default ${step >= 2 ? 'text-[#4BE6CB] bg-[#1C4B42]/20' : 'text-zinc-600'}`}>02. AGENDA</div>
            <div className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all cursor-default ${step >= 3 ? 'text-[#4BE6CB] bg-[#1C4B42]/20' : 'text-zinc-600'}`}>03. CONFIRMAR</div>
          </div>
          
          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-md uppercase tracking-tight">Elige tus Servicios</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {services.map((service) => {
                      const isSelected = selectedServices.find(s => s.id === service.id);

                      return (
                        <div key={service.id} onClick={() => toggleService(service)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-row items-center gap-4 group ${isSelected ? 'border-[#4BE6CB] bg-[#4BE6CB]/10 scale-[1.02] shadow-[0_0_20px_rgba(75,230,203,0.2)]' : 'border-[#1C4B42]/30 hover:border-[#1C4B42] bg-[#14171B]'}`}>
                          <div className="flex-1 min-w-0 flex items-center gap-5">
                            
                            {/* CONTENEDOR DEL ÍCONO PROFESIONAL DE LUCIDE */}
                            <div className={`shrink-0 flex items-center justify-center w-16 h-16 bg-[#050505]/60 rounded-xl border ${isSelected ? 'border-[#4BE6CB] shadow-[0_0_15px_rgba(75,230,203,0.3)]' : 'border-[#1C4B42]/50 group-hover:border-[#4BE6CB]/50'} transition-all`}>
                              {getServiceIcon(service)}
                            </div>
                            
                            <div>
                              <div className="font-bold text-lg md:text-xl mb-1 text-white leading-tight break-words pr-2 drop-shadow-sm">{service.name}</div>
                              <div className="text-sm text-zinc-400 font-medium group-hover:text-white transition-colors">{service.durationMinutes} min</div>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-[#4BE6CB] shrink-0 drop-shadow-md">C$ {service.price}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-[#1C4B42]/30">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Estimado</div>
                      <div className="text-3xl font-black text-white">C$ {totalPrice}</div>
                    </div>
                    <button onClick={() => setStep(2)} disabled={selectedServices.length === 0} className="px-8 py-4 bg-[#4BE6CB] text-black font-bold rounded-xl hover:bg-[#3bc4ac] transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(75,230,203,0.3)]">Continuar ➔</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-md">Personaliza tu Cita</h3>
                  <div className="space-y-6 mb-8">
                    <div>
                        <label className="block text-[10px] font-bold text-[#4BE6CB] mb-3 uppercase tracking-widest">Selecciona Profesional</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div onClick={() => setSelectedBarber("")} className={`p-4 rounded-xl border-2 text-center cursor-pointer font-bold text-sm transition-all ${selectedBarber === "" ? 'border-[#4BE6CB] bg-[#4BE6CB]/20 text-white' : 'border-[#1C4B42]/50 bg-[#14171B] text-zinc-400 hover:border-[#1C4B42] hover:text-white'}`}>Cualquiera</div>
                            {barbers.map(b => ( 
                              <div key={b.id} onClick={() => setSelectedBarber(b.id.toString())} className={`p-4 rounded-xl border-2 text-center cursor-pointer font-bold text-sm transition-all ${selectedBarber === b.id.toString() ? 'border-[#4BE6CB] bg-[#4BE6CB]/20 text-white' : 'border-[#1C4B42]/50 bg-[#14171B] text-zinc-400 hover:border-[#1C4B42] hover:text-white'}`}>{b.username}</div> 
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-[#4BE6CB] mb-3 uppercase tracking-widest">Fecha</label>
                        <input type="date" style={{ colorScheme: "dark" }} className="w-full bg-[#101111] border-2 border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-lg transition-all font-bold backdrop-blur-sm" onChange={(e) => setSelectedDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#4BE6CB] mb-3 uppercase tracking-widest">Hora</label>
                        <select className="w-full bg-[#101111] border-2 border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-lg appearance-none cursor-pointer transition-all font-bold backdrop-blur-sm" onChange={(e) => setSelectedTime(e.target.value)}>
                          <option value="">-- Seleccionar --</option>
                          {timeSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option> )}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-4 border border-[#1C4B42]/50 text-zinc-300 font-bold rounded-xl hover:bg-[#1C4B42]/20 hover:text-white uppercase tracking-widest text-sm transition-all backdrop-blur-md">Atrás</button>
                    <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="flex-1 px-8 py-4 bg-[#4BE6CB] text-black font-bold rounded-xl hover:bg-[#3bc4ac] transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(75,230,203,0.3)]">SIGUIENTE ➔</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6 text-white drop-shadow-md">Tus Datos</h3>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-[10px] font-bold text-[#4BE6CB] mb-2 uppercase tracking-widest">Nombre Completo</label>
                      <input type="text" placeholder="Ej: Carlos Pérez" className="w-full bg-[#101111] border-2 border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-lg placeholder:text-zinc-500 transition-all font-medium backdrop-blur-sm" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#4BE6CB] mb-2 uppercase tracking-widest">Teléfono / WhatsApp</label>
                      <input type="tel" placeholder="Ej: 8888-8888" className="w-full bg-[#101111] border-2 border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-lg placeholder:text-zinc-500 transition-all font-medium backdrop-blur-sm" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="bg-[#14171B] border border-[#1C4B42] p-6 rounded-2xl mb-6 backdrop-blur-sm">
                      <h4 className="text-[#4BE6CB] font-bold tracking-widest uppercase mb-4 text-xs drop-shadow-sm">Resumen de Cita</h4>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-[#1C4B42]/30 gap-4">
                          <div>
                            <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Fecha y Hora</p>
                            <p className="text-xl font-black text-white capitalize">{formatDate(selectedDate)}</p>
                            <p className="text-lg text-[#4BE6CB] font-bold">a las {formatTime(selectedTime)}</p>
                          </div>
                          <div className="md:text-right">
                            <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Profesional</p>
                            <p className="text-xl font-bold text-white">{getBarberName()}</p>
                          </div>
                      </div>
                      <div className="space-y-2">
                        {selectedServices.map(s => ( 
                          <div key={s.id} className="flex justify-between text-zinc-300 text-base font-medium">
                            <span>{s.name}</span>
                            <span className="font-bold text-white">C$ {s.price}</span>
                          </div> 
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#1C4B42]/30 flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total a Pagar</span>
                        <span className="text-3xl font-black text-[#4BE6CB] drop-shadow-md">C$ {totalPrice}</span>
                      </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="px-6 py-4 border border-[#1C4B42]/50 text-zinc-300 font-bold rounded-xl hover:bg-[#1C4B42]/20 hover:text-white uppercase tracking-widest text-sm transition-all backdrop-blur-md">Atrás</button>
                    <button onClick={handleConfirmBooking} className="flex-1 px-8 py-4 bg-[#4BE6CB] text-black font-black rounded-xl hover:bg-[#3bc4ac] transition-all shadow-[0_0_30px_rgba(75,230,203,0.4)] uppercase tracking-widest text-sm">CONFIRMAR RESERVA ✅</button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <div className="w-24 h-24 bg-[#4BE6CB]/20 border-2 border-[#4BE6CB] rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_50px_rgba(75,230,203,0.4)] animate-pulse">✅</div>
                  <h3 className="text-4xl font-black mb-4 text-white tracking-tight drop-shadow-[0_0_15px_rgba(75,230,203,0.5)]">¡Reserva Exitosa!</h3>
                  <div className="bg-[#14171B] border border-[#1C4B42] rounded-2xl p-6 max-w-lg mx-auto mb-8 backdrop-blur-md">
                      <p className="text-zinc-300 text-base leading-relaxed">Gracias por confiar en <span className="text-[#4BE6CB] font-bold">Estilo26</span>, <span className="text-white font-bold">{clientName}</span>.<br/>Tu cita está confirmada para el:</p>
                      <p className="text-xl font-black text-white mt-3 uppercase tracking-wide drop-shadow-sm">{formatDate(selectedDate)}</p>
                      <p className="text-lg text-[#4BE6CB] font-bold drop-shadow-sm">a las {formatTime(selectedTime)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button onClick={() => { setStep(1); setSelectedServices([]); setClientName(""); setClientPhone(""); }} className="px-6 py-4 bg-[#1C4B42]/60 text-white font-bold rounded-xl border border-[#4BE6CB] hover:bg-[#4BE6CB] hover:text-black transition-all shadow-lg uppercase tracking-widest text-xs">📅 Agendar Otra</button>
                      <button onClick={() => window.location.href = "/"} className="px-6 py-4 bg-transparent border border-zinc-600 text-zinc-300 font-bold rounded-xl hover:bg-black/50 hover:text-white transition-all uppercase tracking-widest text-xs backdrop-blur-md">🏠 Volver al Inicio</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECCIONES INFERIORES: RESTAURADAS A TAMAÑO GIGANTE EXACTO
          ========================================================= */}
      <section id="galería" className="relative z-10 py-20 px-6 max-w-7xl mx-auto border-t border-[#1C4B42]/30 scroll-mt-24 bg-transparent mt-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 uppercase tracking-tighter drop-shadow-lg leading-tight">Nuestra <span className="text-[#4BE6CB]">Galería</span></h2>
          <p className="text-zinc-400 font-medium text-lg">Próximamente: Las mejores transformaciones de Estilo26.</p>
        </div>
      </section>
      
      <section id="ubicación" className="relative z-10 py-20 px-6 max-w-7xl mx-auto border-t border-[#1C4B42]/30 scroll-mt-24 bg-transparent">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 uppercase tracking-tighter drop-shadow-lg leading-tight">Dónde <span className="text-[#4BE6CB]">Encontrarnos</span></h2>
          <p className="text-zinc-400 font-medium text-lg">Estelí, Nicaragua. Integración con Google Maps próximamente.</p>
        </div>
      </section>
      
      {/* EL FOOTER IMPONENTE QUE PEDISTE (NO TOCADO) */}
      <footer className="relative z-10 bg-transparent py-10 text-center text-zinc-300 text-xs md:text-sm font-bold tracking-[0.2em] uppercase drop-shadow-md">
        <p>&copy; 2026 <span className="text-white font-extrabold tracking-[0.3em]">ESTILO26 GROOMING STUDIO</span>. TODOS LOS DERECHOS RESERVADOS.</p>
      </footer>
    </div>
  );
}
