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

  useEffect(() => {
    fetch("http://localhost:9090/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:9090/api/users")
      .then((res) => res.json())
      .then((data: Barber[]) => {
        const staff = data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN');
        setBarbers(staff);
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

  // Generar Horas (8 AM - 8 PM) con intervalos de 30 minutos
  const generateTimeSlots = () => {
    const times = [];
    for (let i = 8; i <= 20; i++) { // De 8 a 20 horas
      const period = i >= 12 ? 'PM' : 'AM';
      let displayHour = i > 12 ? i - 12 : i;
      if (displayHour === 0) displayHour = 12;
      
      // Hora en punto (:00)
      const time00 = `${i.toString().padStart(2, '0')}:00`;
      const label00 = `${displayHour}:00 ${period}`;
      times.push({ value: time00, label: label00 });

      // Media hora (:30) - Si no es las 8 PM (cierre)
      if (i < 20) {
        const time30 = `${i.toString().padStart(2, '0')}:30`;
        const label30 = `${displayHour}:30 ${period}`;
        times.push({ value: time30, label: label30 });
      }
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
    if (!clientName || !clientPhone) {
      alert("⚠️ Faltan tus datos personales.");
      return;
    }

    const bookingData = {
      clientName,
      clientPhone,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      services: selectedServices,
      barberName: getBarberName(), // <--- ¡ESTA ES LA LÍNEA NUEVA!
      status: "PENDIENTE"
    };

    try {
      const res = await fetch("http://localhost:9090/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        setStep(4);
      } else {
        const errorText = await res.text();
        alert("Error del servidor: " + errorText);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-black rounded-lg flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-xl font-bold font-serif">E</span>
            </div>
            <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">ESTILO26</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            {["INICIO", "SERVICIOS", "GALERÍA", "UBICACIÓN"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors tracking-widest">{item}</a>
            ))}
            {/* AQUÍ ESTÁ EL BOTÓN ADMIN RESTAURADO */}
            <Link href="/admin" className="px-5 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
              ADMIN
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="inicio" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20 mask-image-gradient"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative z-10 text-center max-w-4xl mx-auto mb-16"
        >
          {/* TEXTO RESTAURADO */}
          <span className="text-emerald-500 font-bold tracking-[0.3em] text-xs mb-4 block animate-pulse">ESTELÍ, NICARAGUA</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            TU ESTILO <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-600">DEFINITIVO</span>
          </h1>
          {/* DESCRIPCIÓN LARGA RESTAURADA */}
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Más que una barbería, somos un club de caballeros. Experiencia premium, cortes de precisión y el ambiente que mereces.
          </p>
        </motion.div>

        {/* WIDGET DE RESERVA */}
        <div className="relative z-20 w-full max-w-4xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden">
          
          <div className="flex border-b border-white/5 bg-black/40">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 py-4 text-center text-xs font-bold tracking-widest transition-all ${step >= s ? 'text-emerald-400 bg-emerald-500/5' : 'text-zinc-600'}`}>
                PASO 0{s}
              </div>
            ))}
          </div>

          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* PASO 1 */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Elige tus Servicios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {services.map((service) => {
                      const isSelected = selectedServices.find(s => s.id === service.id);
                      return (
                        <div key={service.id} onClick={() => toggleService(service)} className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                          <div>
                            <div className="font-bold">{service.name}</div>
                            <div className="text-xs text-zinc-400">{service.durationMinutes} min</div>
                          </div>
                          <div className="font-bold text-emerald-400">C$ {service.price}</div>
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

              {/* PASO 2 */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Personaliza tu Cita</h3>
                  <div className="space-y-6 mb-8">
                    {/* SELECTOR DE BARBERO (NUEVO) */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Selecciona Profesional</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div onClick={() => setSelectedBarber("")} className={`p-3 rounded-lg border text-center cursor-pointer text-sm font-bold ${selectedBarber === "" ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-zinc-400'}`}>Cualquiera</div>
                            {barbers.map(b => (
                                <div key={b.id} onClick={() => setSelectedBarber(b.id.toString())} className={`p-3 rounded-lg border text-center cursor-pointer text-sm font-bold ${selectedBarber === b.id.toString() ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-zinc-400'}`}>{b.username}</div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Fecha</label><input type="date" style={{ colorScheme: "dark" }} className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 outline-none" onChange={(e) => setSelectedDate(e.target.value)} /></div>
                      <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Hora</label><select className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 outline-none" onChange={(e) => setSelectedTime(e.target.value)}><option value="">Selecciona hora</option>{timeSlots.map((slot) => (<option key={slot.value} value={slot.value}>{slot.label}</option>))}</select></div>
                    </div>
                  </div>
                  <div className="flex gap-4"><button onClick={() => setStep(1)} className="px-6 py-4 border border-white/10 rounded-xl hover:bg-white/5">Atrás</button><button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="flex-1 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50">SIGUIENTE ➔</button></div>
                </motion.div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-bold mb-6">Tus Datos</h3>
                  <div className="space-y-4 mb-8">
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Nombre Completo</label><input type="text" placeholder="Ej: Carlos Pérez" className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 outline-none" value={clientName} onChange={(e) => setClientName(e.target.value)} /></div>
                    <div><label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Teléfono / WhatsApp</label><input type="tel" placeholder="Ej: 8888-8888" className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 outline-none" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl mb-6">
                    <h4 className="font-bold text-emerald-400 mb-2">Resumen:</h4>
                    <p className="text-sm text-zinc-300">📅 {selectedDate} a las {selectedTime}</p>
                    <p className="text-sm text-zinc-300">💈 Barbero: {getBarberName()}</p>
                    <p className="text-sm text-zinc-300">✂️ {selectedServices.map(s => s.name).join(", ")}</p>
                    <p className="text-sm text-zinc-300 font-bold mt-2">Total: C$ {totalPrice}</p>
                  </div>
                  <div className="flex gap-4"><button onClick={() => setStep(2)} className="px-6 py-4 border border-white/10 rounded-xl hover:bg-white/5">Atrás</button><button onClick={handleConfirmBooking} className="flex-1 px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">CONFIRMAR RESERVA ✅</button></div>
                </motion.div>
              )}

              {/* PASO 4 */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  {/* ICONO DE ÉXITO MEJORADO */}
    <div className="w-28 h-28 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.6)] animate-pulse">
        ✅
    </div>
    {/* TÍTULO CON MÁS BRILLO */}
    <h3 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 tracking-tight drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
        ¡Reserva Exitosa!
    </h3>
                  <h3 className="text-3xl font-bold mb-4">¡Reserva Exitosa!</h3>
                  <p className="text-zinc-400 max-w-md mx-auto mb-8">Te esperamos el <span className="text-white font-bold">{selectedDate}</span> a las <span className="text-white font-bold">{selectedTime}</span>.</p>
                  <button onClick={() => { setStep(1); setSelectedServices([]); setClientName(""); setClientPhone(""); }} className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all font-bold">Hacer otra reserva</button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="bg-black py-10 border-t border-white/10 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 Estilo26. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
