"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BarberService {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  icon: string;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [services, setServices] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BarberService | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [icon, setIcon] = useState("✂️");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") { router.push("/admin"); return; }
    fetchServices();
  }, [router]);

  const fetchServices = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/services`);
      const data = await res.json();
      const sortedData = data.sort((a: BarberService, b: BarberService) => a.id - b.id);
      setServices(sortedData);
    } catch (error) { console.error("Error cargando servicios:", error); } finally { setLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const payload = { name, description, price: parseFloat(price), durationMinutes: parseInt(duration), icon };
    try {
      if (editingService) {
        await fetch(`${apiUrl}/api/services/${editingService.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch(`${apiUrl}/api/services`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      setIsModalOpen(false); fetchServices();
    } catch (error) { alert("Error al guardar el servicio"); }
  };

  const handleDelete = async (id: number) => {
    const confirmar = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este servicio? Si ya tiene citas asignadas podría causar conflictos.");
    if (!confirmar) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/services/${id}`, { method: "DELETE" });
      if (res.ok) setServices(services.filter(s => s.id !== id)); else alert("Error al intentar eliminar el servicio desde el servidor.");
    } catch (error) { alert("Error de conexión al eliminar."); }
  };

  const openNewModal = () => { setEditingService(null); setName(""); setDescription(""); setPrice(""); setDuration(""); setIcon("✂️"); setIsModalOpen(true); };
  const openEditModal = (s: BarberService) => { setEditingService(s); setName(s.name); setDescription(s.description); setPrice(s.price.toString()); setDuration(s.durationMinutes.toString()); setIcon(s.icon); setIsModalOpen(true); };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 pb-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.push("/admin")} className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all">⬅️</button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Gestión de <span className="text-emerald-500">Precios</span></h1>
              <p className="text-zinc-500 text-sm mt-1">Lista Oficial en Córdobas (C$)</p>
            </div>
          </div>
          <button onClick={openNewModal} className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">+ Nuevo Servicio</button>
        </div>

        {loading ? ( <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">CARGANDO SERVICIOS...</div> ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-3xl hover:border-zinc-600 transition-all flex flex-col h-full group">
                
                {/* --- MAGIA CSS: flex-start, gap-4, flex-1, shrink-0 --- */}
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-3xl bg-zinc-900 p-2 rounded-xl shrink-0">{s.icon}</span>
                    <h3 className="text-xl font-black text-white leading-tight break-words pt-1">{s.name}</h3>
                  </div>
                  <span className="text-2xl font-black text-emerald-500 tracking-tighter shrink-0 mt-1">C$ {s.price}</span>
                </div>

                <p className="text-zinc-500 text-sm mb-6 flex-grow">{s.description}</p>
                <div className="flex justify-between items-center mt-auto pt-6 border-t border-zinc-800/50">
                  <span className="bg-zinc-900/50 text-zinc-400 px-3 py-1 rounded-md text-xs font-bold font-mono border border-zinc-800">⏱️ {s.durationMinutes} min</span>
                  <div className="flex gap-3">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500/70 hover:text-red-500 text-sm font-bold transition-colors">🗑️ Borrar</button>
                    <button onClick={() => openEditModal(s)} className="text-emerald-600 hover:text-emerald-400 text-sm font-bold transition-colors">Editar ✏️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter border-b border-zinc-800 pb-4">{editingService ? "Editar Servicio" : "Nuevo Servicio"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/4"><label className="text-xs font-bold text-zinc-500 mb-1 block uppercase">Icono</label><input type="text" required value={icon} onChange={(e)=>setIcon(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-center text-xl focus:border-emerald-500 outline-none" /></div>
                <div className="flex-1"><label className="text-xs font-bold text-zinc-500 mb-1 block uppercase">Nombre</label><input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white focus:border-emerald-500 outline-none font-bold" /></div>
              </div>
              <div><label className="text-xs font-bold text-zinc-500 mb-1 block uppercase">Descripción</label><textarea required value={description} onChange={(e)=>setDescription(e.target.value)} rows={2} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-zinc-300 focus:border-emerald-500 outline-none text-sm resize-none" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-xs font-bold text-emerald-500/80 mb-1 block uppercase">Precio (C$)</label><input type="number" required value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-emerald-900/10 border border-emerald-900/30 p-3 rounded-xl text-emerald-400 font-black text-xl focus:border-emerald-500 outline-none" /></div>
                <div className="flex-1"><label className="text-xs font-bold text-zinc-500 mb-1 block uppercase">Minutos</label><input type="number" required value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white focus:border-emerald-500 outline-none text-xl font-bold" /></div>
              </div>
              <div className="flex gap-3 mt-8 pt-4">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold rounded-xl hover:bg-zinc-800 transition-all text-sm uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-black font-black rounded-xl hover:bg-emerald-500 transition-all text-sm uppercase tracking-widest shadow-lg shadow-emerald-900/30">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
