"use client";
import { useState, useEffect } from "react";

interface Service {
  id: number;
  name: string;
}

export default function BookingPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  // ESTADO: Aquí guardamos la LISTA de IDs seleccionados
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState<Service[]>([]);

  // 1. CARGAMOS LOS SERVICIOS DEL BACKEND
  useEffect(() => {
    fetch("http://localhost:9090/api/services")
      .then((res) => res.json())
      .then((data) => setServicios(data))
      .catch((error) => console.error("Error cargando servicios:", error));
  }, []);

  // 2. LÓGICA DEL INTERRUPTOR (TOGGLE)
  const toggleServicio = (id: string) => {
    if (serviciosSeleccionados.includes(id)) {
      // Si ya existe, lo SACAMOS de la lista
      setServiciosSeleccionados(serviciosSeleccionados.filter((item) => item !== id));
    } else {
      // Si no existe, lo AGREGAMOS a la lista
      setServiciosSeleccionados([...serviciosSeleccionados, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviciosSeleccionados.length === 0) {
      alert("⚠️ Por favor selecciona al menos un servicio.");
      return;
    }
    setLoading(true);
    
    // Aquí iría la lógica para enviar al backend
    setTimeout(() => {
      alert(`¡Reserva enviada para ${serviciosSeleccionados.length} servicios!`);
      setLoading(false);
    }, 1500);
  };

  // ESTILOS VISUALES (Cyberpunk / Glassmorphism)
  const gradientBackground = { background: 'linear-gradient(135deg, #0f172a 0%, #000000 50%, #064e3b 100%)' };
  const cardStyle = { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' };
  const inputStyle = { background: 'rgba(0, 0, 0, 0.5)', border: '1px solid #1f2937' };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10" style={gradientBackground}>
      
      {/* Luz ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Tarjeta Principal */}
      <div className="p-8 md:p-10 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10" style={cardStyle}>
        
        {/* ENCABEZADO (Eslogan corregido) */}
        <div className="text-center mb-8">
           <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse inline-block">💈</div>
           <h1 className="text-4xl font-extrabold text-white tracking-[0.25em] drop-shadow-lg">
              ESTILO<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">26</span>
            </h1>
           {/* ESLOGAN COMPLETO RESTAURADO */}
           <p className="text-zinc-500 text-xs mt-3 tracking-[0.2em] uppercase font-bold">
             Tu estilo, tu tiempo. Reservas inteligentes.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Inputs de Nombre y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">Tu Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-4 rounded-xl text-white outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50" style={inputStyle} placeholder="Ej: Juan Pérez" required />
            </div>
            <div>
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">Teléfono</label>
              <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full p-4 rounded-xl text-white outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50" style={inputStyle} placeholder="Ej: 8888-8888" required />
            </div>
          </div>

          {/* === ZONA DE SELECCIÓN MÚLTIPLE (VISUAL MEJORADA) === */}
          <div>
            <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-3 block">
              Selecciona los servicios (Toca para agregar)
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {servicios.map((s) => {
                // Preguntamos: ¿Este servicio está en la lista de seleccionados?
                const isSelected = serviciosSeleccionados.includes(s.id.toString());
                
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleServicio(s.id.toString())}
                    // CAMBIO VISUAL DINÁMICO:
                    // Si está seleccionado: Fondo Verde + Borde Verde + Texto Blanco + Sombra
                    // Si NO: Fondo Oscuro + Texto Gris
                    className={`
                      p-4 rounded-xl cursor-pointer text-center transition-all border flex items-center justify-center gap-2 select-none
                      ${isSelected 
                        ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02] font-bold' 
                        : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-emerald-500/30 hover:text-white'}
                    `}
                  >
                    {/* Checkmark condicional */}
                    {isSelected && <span className="text-lg">✓</span>}
                    <span className="text-sm">{s.name}</span>
                  </div>
                );
              })}
            </div>
            
            {/* CONTADOR DE SERVICIOS SELECCIONADOS */}
            <p className={`text-xs mt-2 text-right transition-colors ${serviciosSeleccionados.length > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-600'}`}>
              {serviciosSeleccionados.length === 0 
                ? "Ningún servicio seleccionado" 
                : `✅ ${serviciosSeleccionados.length} servicios marcados`}
            </p>
          </div>
          {/* ================================================= */}

          {/* Inputs de Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-4 rounded-xl text-white outline-none transition-all [color-scheme:dark] focus:border-emerald-500/50" style={inputStyle} required />
            </div>
            <div>
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">Hora</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="w-full p-4 rounded-xl text-white outline-none transition-all [color-scheme:dark] focus:border-emerald-500/50" style={inputStyle} required />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 text-white font-bold text-lg rounded-xl hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all uppercase tracking-[0.15em] mt-4 relative overflow-hidden group"
          >
            <span className="relative z-10 drop-shadow">{loading ? "Procesando..." : "Confirmar Reserva"}</span>
          </button>

        </form>
      </div>
    </div>
  );
}
