"use client";

// 1. IMPORTACIONES GLOBALES
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scissors, User, Ruler, Sparkles, Baby, Eye, Droplet, Crown, Clock, Pencil, Trash2, Plus, ArrowLeft, Loader2 } from "lucide-react";

// 2. CONTRATO DE DATOS
interface BarberService {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  icon: string; 
}

// ==========================================
// 3. DICCIONARIO DE ÍCONOS
// ==========================================
const iconOptionsMap = [
  { value: "✂️", label: "Corte", Icon: Scissors },
  { value: "🧔", label: "Barba", Icon: User }, 
  { value: "📐", label: "Cerquillo", Icon: Ruler },
  { value: "💈", label: "Clásico", Icon: Sparkles },
  { value: "👦", label: "Infantil", Icon: Baby },
  { value: "👁️", label: "Cejas", Icon: Eye },
  { value: "💧", label: "Lavado", Icon: Droplet },
  { value: "👑", label: "VIP", Icon: Crown }
];

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

  // ==========================================
  // LÓGICA DE NEGOCIO Y SEGURIDAD (RBAC)
  // ==========================================
  
  const currentUserRole = "ADMIN"; 
  const isSuperUser = currentUserRole === "ADMIN" || currentUserRole === "MANAGER";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") { 
      router.push("/admin"); 
      return; 
    }
    fetchServices();
  }, [router]);

  const fetchServices = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/services`);
      const data = await res.json();
      const sortedData = data.sort((a: BarberService, b: BarberService) => a.id - b.id);
      setServices(sortedData);
    } catch (error) { 
      console.error("Error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const payload = { 
      name, 
      description, 
      price: parseFloat(price), 
      durationMinutes: parseInt(duration), 
      icon 
    };

    try {
      if (editingService) {
        await fetch(`${apiUrl}/api/services/${editingService.id}`, { 
          method: "PUT", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
        });
      } else {
        await fetch(`${apiUrl}/api/services`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload) 
        });
      }
      setIsModalOpen(false); 
      fetchServices();
    } catch (error) { 
      alert("Error al guardar el servicio"); 
    }
  };

  const handleDelete = async (id: number) => {
    const confirmar = window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este servicio del catálogo?");
    if (!confirmar) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/services/${id}`, { 
        method: "DELETE" 
      });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id)); 
      } else {
        const errorText = await res.text();
        console.error("Error del Backend:", errorText);
        alert("Error en la base de datos al eliminar. Verifica si el servicio está asociado a citas existentes (F12).");
      }
    } catch (error) { 
      alert("Error de conexión."); 
    }
  };

  const openNewModal = () => { 
    setEditingService(null); 
    setName(""); setDescription(""); setPrice(""); setDuration(""); setIcon("✂️"); 
    setIsModalOpen(true); 
  };

  const openEditModal = (s: BarberService) => { 
    setEditingService(s); 
    setName(s.name); setDescription(s.description); setPrice(s.price.toString()); setDuration(s.durationMinutes.toString()); 
    const isValidEmoji = iconOptionsMap.some(opt => opt.value === s.icon);
    setIcon(isValidEmoji ? s.icon : "✂️"); 
    setIsModalOpen(true); 
  };

  const renderLucideIcon = (emojiValue: string, className: string = "w-8 h-8 text-[#4BE6CB]") => {
    const option = iconOptionsMap.find(opt => opt.value === emojiValue);
    if (option) {
      const IconComponent = option.Icon;
      return <IconComponent className={className} />;
    }
    return <Scissors className={className} />;
  };

  // ==========================================
  // RENDERIZADO VISUAL DEL DOM
  // ==========================================
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-[#4BE6CB]/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1C4B42]/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-[#1C4B42]/50 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.push("/admin")} className="w-10 h-10 bg-transparent border border-zinc-700 rounded-lg flex items-center justify-center hover:bg-[#4BE6CB] hover:text-black hover:border-[#4BE6CB] transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md">
                Gestión de <span className="text-[#4BE6CB]">Precios</span>
              </h1>
              <p className="text-[#4BE6CB] text-sm md:text-base font-bold tracking-widest mt-1">Control de Catálogo, Tarifas y Servicios del SaaS</p>
            </div>
          </div>

          {isSuperUser && (
            <button onClick={openNewModal} className="w-full md:w-auto px-8 py-4 bg-[#4BE6CB] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#3bc4ac] transition-all shadow-[0_0_20px_rgba(75,230,203,0.3)] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </button>
          )}
        </div>

        {/* LISTA DE SERVICIOS */}
        {loading ? ( 
          <div className="flex flex-col items-center justify-center py-20 text-[#4BE6CB]">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="tracking-widest font-bold uppercase text-xs">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {services.map((s) => (
                <div 
                  key={s.id} 
                  className="bg-[#0e0e0e] border border-[#1C4B42]/30 p-8 rounded-3xl hover:border-[#4BE6CB]/50 transition-all shadow-lg flex flex-col h-full group relative overflow-hidden"
                  style={{ minHeight: "300px" }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-[#1C4B42]/20 to-transparent rounded-full blur-2xl group-hover:from-[#4BE6CB]/15 transition-all pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="shrink-0 w-16 h-16 bg-[#050505]/60 rounded-2xl flex items-center justify-center shadow-inner border border-[#1C4B42]/50 group-hover:border-[#4BE6CB]/50 transition-colors">
                        {renderLucideIcon(s.icon, "w-8 h-8 text-[#4BE6CB] drop-shadow-[0_0_10px_rgba(75,230,203,0.6)]")}
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight break-words pt-1">
                        {s.name}
                      </h3>
                    </div>
                    <span className="text-3xl font-black text-[#4BE6CB] tracking-tighter shrink-0 mt-1 drop-shadow-[0_0_10px_rgba(75,230,203,0.3)]">
                      C$ {s.price}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm mb-8 flex-grow relative z-10 leading-relaxed font-medium">
                    {s.description}
                  </p>
                  
                  {/* AQUÍ ESTÁ EL ARREGLO: Contenedor inferior flexible y a prueba de choques */}
                  <div className="flex flex-wrap justify-between items-center mt-auto pt-6 border-t border-[#1C4B42]/30 relative z-10 gap-y-4 gap-x-2">
                    
                    {/* RELOJ OPTIMIZADO */}
                    <div className="flex items-center gap-2 bg-[#1C4B42]/20 text-[#4BE6CB] px-3 py-2 rounded-xl font-black text-xs border border-[#4BE6CB]/30 tracking-widest uppercase shrink-0">
                      <Clock className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">{s.durationMinutes} min</span>
                    </div>
                    
                    {/* BOTONES DE EDICIÓN CON PROTECCIÓN ANTI-CHOQUE */}
                    {isSuperUser && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => openEditModal(s)} className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 whitespace-nowrap">
                          Editar <Pencil className="w-3 h-3 shrink-0" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/30 border border-transparent hover:border-red-900/50 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 whitespace-nowrap">
                          Eliminar <Trash2 className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {/* TARJETA NUEVO SERVICIO */}
              {isSuperUser && (
                <div 
                  onClick={openNewModal}
                  className="border-2 border-dashed border-[#1C4B42]/30 rounded-3xl flex flex-col items-center justify-center gap-4 text-zinc-500 hover:border-[#4BE6CB]/50 hover:text-[#4BE6CB] cursor-pointer transition-all hover:bg-[#4BE6CB]/5 group"
                  style={{ minHeight: '300px' }}
                >
                  <div className="w-16 h-16 rounded-full border border-[#1C4B42]/50 flex items-center justify-center bg-[#050505]/60 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="font-bold uppercase text-sm tracking-widest text-zinc-400 group-hover:text-white">Añadir Servicio</span>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL AVANZADO DE CREACIÓN/EDICIÓN */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#4BE6CB]/30 rounded-3xl w-full max-w-lg p-8 md:p-10 shadow-[0_0_50px_rgba(75,230,203,0.15)] relative">
            
            <div className="text-center mb-8 border-b border-[#1C4B42]/50 pb-6">
                <div className="w-16 h-16 bg-[#4BE6CB]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4BE6CB]/20 shadow-inner">
                    {editingService ? <Pencil className="w-8 h-8 text-[#4BE6CB]" /> : <Sparkles className="w-8 h-8 text-[#4BE6CB]" />}
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide uppercase">
                  {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* SELECTOR DE ÍCONOS PREMIUM */}
              <div>
                <label className="text-zinc-400 text-[10px] font-bold mb-3 block uppercase tracking-widest ml-1">Selecciona el Ícono Visual</label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 bg-[#101111] p-4 rounded-2xl border border-[#1C4B42]/30">
                  {iconOptionsMap.map(opt => {
                    const isSelected = icon === opt.value;
                    const IconComp = opt.Icon;
                    return (
                      <button 
                        key={opt.value} 
                        type="button" 
                        onClick={() => setIcon(opt.value)} 
                        title={opt.label}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-[#4BE6CB]/20 border-[#4BE6CB] text-[#4BE6CB] scale-105 shadow-[0_0_15px_rgba(75,230,203,0.3)]' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                      >
                        <IconComp className="w-6 h-6 mb-1" />
                        <span className="text-[8px] uppercase tracking-wider font-bold truncate w-full text-center">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] font-bold mb-2 block uppercase tracking-widest ml-1">Nombre del Servicio</label>
                <input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-[#101111] border border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none font-bold text-sm placeholder:text-zinc-700" placeholder="Ej: Corte Premium" />
              </div>
              
              <div>
                <label className="text-zinc-400 text-[10px] font-bold mb-2 block uppercase tracking-widest ml-1">Descripción</label>
                <textarea required value={description} onChange={(e)=>setDescription(e.target.value)} rows={2} className="w-full bg-[#101111] border border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-sm resize-none font-medium placeholder:text-zinc-700" placeholder="Describe lo que incluye el servicio..." />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[#4BE6CB]/80 text-[10px] font-bold mb-2 block uppercase tracking-widest ml-1">Precio (C$)</label>
                  <input type="number" required value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-[#1C4B42]/20 border border-[#4BE6CB]/50 p-4 rounded-xl text-[#4BE6CB] font-black text-xl focus:border-[#4BE6CB] outline-none text-center" placeholder="0.00" />
                </div>
                <div className="flex-1">
                  <label className="text-zinc-400 text-[10px] font-bold mb-2 block uppercase tracking-widest ml-1">Tiempo (Minutos)</label>
                  <input type="number" required value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full bg-[#101111] border border-[#1C4B42]/50 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-xl font-bold text-center" placeholder="45" />
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-[#1C4B42]/30">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-4 bg-transparent border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold transition-colors text-[10px] uppercase tracking-widest">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-4 bg-[#4BE6CB] text-black font-black rounded-xl hover:bg-[#3bc4ac] transition-all text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(75,230,203,0.4)]">
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
