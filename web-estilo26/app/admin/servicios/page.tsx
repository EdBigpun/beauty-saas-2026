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

  // --- ESTADOS MODALES ---
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("");

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

  // 🧠 LÓGICA HÍBRIDA DE DESCRIPCIONES (Explicación abajo)
  const getSmartDescription = (s: Service) => {
    // 1. Si el servicio tiene descripción en la base de datos, úsala.
    if (s.description && s.description.trim() !== "") {
      return s.description;
    }
    // 2. Si no tiene (es de los viejos), usa el texto por defecto según el nombre.
    const n = s.name.toLowerCase();
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

  // --- FUNCIONES DE CREAR Y EDITAR (Igual que antes) ---
  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setEditPrice(service.price.toString());
    setEditDuration(service.durationMinutes.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    try {
      const res = await fetch(`http://localhost:9090/api/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...editingService, 
          price: parseFloat(editPrice),
          durationMinutes: parseInt(editDuration) 
        }),
      });

      if (res.ok) {
        const updatedServices = services.map((s) => 
          s.id === editingService.id 
            ? { ...s, price: parseFloat(editPrice), durationMinutes: parseInt(editDuration) } 
            : s
        );
        setServices(updatedServices);
        setEditingService(null);
        alert("¡Servicio actualizado!");
      }
    } catch (error) { alert("Error de conexión."); }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:9090/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          price: parseFloat(newPrice),
          durationMinutes: parseInt(newDuration)
        }),
      });

      if (res.ok) {
        const createdService = await res.json();
        setServices([...services, createdService]);
        setNewName(""); setNewDesc(""); setNewPrice(""); setNewDuration("");
        setIsCreateOpen(false);
        alert("¡Servicio creado con éxito! 💈");
      }
    } catch (error) { alert("Error de conexión."); }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {services.map((s) => (
              <div key={s.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all shadow-lg flex flex-col justify-between h-[280px]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-gray-800 p-2 rounded">{getIcon(s.name)}</span>
                      <h2 className="text-xl font-bold">{s.name}</h2>
                    </div>
                    <span className="text-emerald-400 font-bold text-xl">C$ {s.price}</span>
                  </div>
                  
                  {/* AQUÍ USAMOS LA FUNCIÓN INTELIGENTE PARA LA DESCRIPCIÓN */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {getSmartDescription(s)}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                  {/* MEJORA VISUAL DE DURACIÓN: Letra más grande y brillante */}
                  <span className="text-sm font-bold text-zinc-300 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg">
                    ⏱️ {s.durationMinutes} min
                  </span>
                  
                  <button onClick={() => handleEditClick(s)} className="text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors flex items-center gap-2">Editar ✏️</button>
                </div>
              </div>
            ))}

            <div 
              onClick={() => setIsCreateOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer transition-all h-[280px] group"
            >
              <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">+</div>
              <span className="font-bold uppercase text-sm tracking-widest">Nuevo Servicio</span>
            </div>

          </div>
        )}
      </div>

      {/* LOS MODALES SIGUEN IGUAL ABAJO (NO LOS REPITO PARA NO HACER ESPAGUETI, MANTEN LOS QUE YA TENÍAS O COPIA DEL ANTERIOR SI BORRASTE TODO) */}
      {/* ... (Pega aquí los modales de Editar y Crear que te di en la respuesta anterior, son idénticos) ... */}
      {/* Si borraste todo, dime y te pego el archivo 100% completo otra vez para no fallar. */}
      {/* ===================================================================================== */}
        {editingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl relative zoom-in-95">
            <h2 className="text-2xl font-bold mb-1 text-white">Editar Servicio</h2>
            <p className="text-emerald-400 text-sm mb-6 uppercase tracking-widest font-bold">{editingService.name}</p>
            <label className="text-zinc-500 text-xs uppercase font-bold mb-2 block">Precio (C$)</label>
            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white text-xl focus:border-emerald-500 outline-none mb-6" />
            <label className="text-zinc-500 text-xs uppercase font-bold mb-2 block">Duración (Minutos)</label>
            <div className="relative mb-8">
                <input type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white text-xl focus:border-emerald-500 outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">MIN</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setEditingService(null)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-emerald-500/30 p-8 rounded-3xl w-full max-w-md shadow-2xl relative zoom-in-95">
            <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-emerald-500/20">✨</div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Crear Servicio</h2>
            </div>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Nombre</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="Ej: Afeitado Completo" required />
              </div>
              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Descripción</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="Ej: Toalla caliente y aceites..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Precio (C$)</label>
                    <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="0.00" required />
                </div>
                <div>
                    <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Minutos</label>
                    <input type="number" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none" placeholder="30" required />
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-6">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
