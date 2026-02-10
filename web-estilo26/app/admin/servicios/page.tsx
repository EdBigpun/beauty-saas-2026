"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADO DEL MODAL ---
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Guardamos temporalmente LOS DOS valores
  const [tempPrice, setTempPrice] = useState("");
  const [tempDuration, setTempDuration] = useState(""); // <--- NUEVO CAMPO

  useEffect(() => {
    fetch("http://localhost:9090/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // --- ABRIR MODAL ---
  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setTempPrice(service.price.toString());
    setTempDuration(service.durationMinutes.toString()); // <--- CARGAMOS LA DURACIÓN ACTUAL
  };

  // --- GUARDAR CAMBIOS ---
  const handleSave = async () => {
    if (!editingService) return;

    try {
      const res = await fetch(`http://localhost:9090/api/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // ENVIAMOS AMBOS DATOS ACTUALIZADOS
        body: JSON.stringify({ 
          ...editingService, 
          price: parseFloat(tempPrice),
          durationMinutes: parseInt(tempDuration) // <--- ENVIAMOS LA NUEVA DURACIÓN
        }),
      });

      if (res.ok) {
        // ACTUALIZACIÓN OPTIMISTA EN LA TABLA
        const updatedServices = services.map((s) => 
          s.id === editingService.id 
            ? { ...s, price: parseFloat(tempPrice), durationMinutes: parseInt(tempDuration) } 
            : s
        );
        setServices(updatedServices);
        setEditingService(null);
        alert("¡Servicio actualizado correctamente!");
      } else {
        alert("Error del servidor al guardar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar.");
    }
  };

  const getFixedDescription = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("corte")) return "Estilo clásico o moderno, con lavado y peinado incluido.";
    if (n.includes("barba")) return "Perfilado con navaja, toalla caliente y aceites esenciales.";
    if (n.includes("cejas")) return "Limpieza y diseño de cejas para una mirada nítida.";
    return "Servicio profesional con los mejores estándares.";
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("corte")) return "✂️";
    if (n.includes("barba")) return "🧔";
    if (n.includes("cejas")) return "👁️";
    return "✨";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <button onClick={() => router.push("/admin")} className="text-xl p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">⬅️</button>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Precios</h1>
            <p className="text-emerald-400 text-sm">Lista Oficial en Córdobas (C$)</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '100%' }}>
            
            {services.map((s) => (
              <div key={s.id} 
                className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all shadow-lg"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '280px', textAlign: 'left' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-gray-800 p-2 rounded">{getIcon(s.name)}</span>
                      <h2 className="text-xl font-bold">{s.name}</h2>
                    </div>
                    <span className="text-emerald-400 font-bold text-xl">C$ {s.price}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm leading-relaxed" style={{ textAlign: 'left' }}>
                    {getFixedDescription(s.name)}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                  {/* Aquí mostramos la duración actual */}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    ⏱️ {s.durationMinutes} min
                  </span>
                  
                  <button 
                    onClick={() => handleEditClick(s)} 
                    className="text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors flex items-center gap-2"
                  >
                    Editar ✏️
                  </button>
                </div>
              </div>
            ))}

            <div 
              onClick={() => alert("Crear Nuevo (Pendiente)")}
              className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer transition-all"
              style={{ height: '280px' }}
            >
              <div className="text-5xl mb-2">+</div>
              <span className="font-bold uppercase text-sm">Nuevo Servicio</span>
            </div>

          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🟢 EL MODAL (AHORA CON 2 CAMPOS) 🟢 */}
      {/* ======================================================== */}
      {editingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          
          <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            <h2 className="text-2xl font-bold mb-1 text-white">Editar Servicio</h2>
            <p className="text-emerald-400 text-sm mb-6 uppercase tracking-widest font-bold">
              {editingService.name}
            </p>

            {/* CAMPO 1: PRECIO */}
            <label className="text-zinc-500 text-xs uppercase font-bold mb-2 block">Precio (C$)</label>
            <input 
              type="number" 
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white text-xl focus:border-emerald-500 outline-none mb-6"
            />

            {/* CAMPO 2: DURACIÓN (NUEVO) */}
            <label className="text-zinc-500 text-xs uppercase font-bold mb-2 block">Duración (Minutos)</label>
            <div className="relative mb-8">
                <input 
                  type="number" 
                  value={tempDuration}
                  onChange={(e) => setTempDuration(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white text-xl focus:border-emerald-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">MIN</span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setEditingService(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>

              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
