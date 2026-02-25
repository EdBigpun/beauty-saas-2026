"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ClientDTO {
  clientName: string;
  clientPhone: string;
  totalVisits: number;
  preferredBarber: string; 
}

interface Barber {
  id: number;
  username: string;
  role: string;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClientDTO[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarber, setFilterBarber] = useState("TODOS");

  const VISITAS_PARA_VIP = 5;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
      return;
    }

    // LÓGICA JEDI: Uso de variable de entorno
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // 1. Cargar Clientes
    fetch(`${apiUrl}/api/clients/vip`)
      .then((res) => {
        if (!res.ok) throw new Error("Error API");
        return res.json();
      })
      .then((data) => {
        setClientes(data);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg("Error al cargar la base de clientes.");
        setLoading(false);
      });

    // 2. Cargar Barberos
    fetch(`${apiUrl}/api/users`)
      .then((res) => res.json())
      .then((data: Barber[]) => {
        const onlyBarbers = data.filter(u => u.role === 'BARBERO' || u.role === 'ADMIN');
        setBarbers(onlyBarbers);
      })
      .catch(err => console.error(err));
  }, [router]);

  const clientesFiltrados = clientes.filter(cliente => {
    const matchesSearch = cliente.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cliente.clientPhone.includes(searchTerm);
    const matchesBarber = filterBarber === "TODOS" || cliente.preferredBarber === filterBarber || (cliente.preferredBarber === 'admin' && filterBarber === 'admin');

    return matchesSearch && matchesBarber;
  });

  const totalClientes = clientesFiltrados.length;
  const totalVIPs = clientesFiltrados.filter(c => c.totalVisits >= VISITAS_PARA_VIP).length;
  
  const abrirWhatsApp = (telefono: string, nombre: string) => {
    const numeroLimpio = telefono.replace(/\D/g, ''); 
    const mensaje = `¡Hola ${nombre}! Te extrañamos en Estilo26. ✂️ ¿Te gustaría agendar un corte esta semana?`;
    window.open(`https://wa.me/505${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="relative z-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-zinc-800 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.push("/admin")} className="text-2xl p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:bg-emerald-500 hover:text-black transition-all">⬅️</button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                Clientes <span className="text-amber-500">VIP 👑</span>
              </h1>
              <p className="text-zinc-400">Panel de control de lealtad.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Filtrar Barbero</label>
                <select className="bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-emerald-500 font-bold uppercase cursor-pointer min-w-[150px]" value={filterBarber} onChange={(e) => setFilterBarber(e.target.value)}>
                    <option value="TODOS">🌍 TODOS</option>
                    {barbers.map(b => ( <option key={b.id} value={b.username}>✂️ {b.username}</option> ))}
                </select>
            </div>
            <div className="flex flex-col flex-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Buscar Cliente</label>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-zinc-500">🔍</span>
                    <input type="text" placeholder="Nombre o Tel..." className="w-full bg-zinc-900 border border-zinc-700 text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                <span className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2 relative z-10">Total Filtrados</span>
                <span className="text-5xl font-black text-white relative z-10">{totalClientes}</span>
            </div>
            <div className="bg-[#1a1500] border border-amber-900/30 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                <span className="text-amber-600/80 font-black uppercase text-[10px] tracking-widest mb-2 relative z-10">Total VIPs</span>
                <span className="text-5xl font-black text-amber-500 relative z-10 flex items-center gap-2">{totalVIPs} <span className="text-2xl">👑</span></span>
            </div>
        </div>

        {loading && <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">CARGANDO BASE DE DATOS...</div>}
        {errorMsg && <div className="text-center py-10 text-red-400 bg-red-900/20 rounded-xl border border-red-900/50">{errorMsg}</div>}

        {!loading && !errorMsg && (
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 gap-4 p-5 bg-black/50 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 md:col-span-4">Cliente</div>
                <div className="col-span-3 hidden md:block">Barbero Principal</div>
                <div className="col-span-3 text-center">Citas</div>
                <div className="col-span-3 md:col-span-2 text-center">Acción</div>
            </div>

            {clientesFiltrados.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">No se encontraron clientes para esta búsqueda.</div>
            ) : (
                <div className="divide-y divide-zinc-800/50">
                    {clientesFiltrados.map((cliente, index) => {
                        const isVip = cliente.totalVisits >= VISITAS_PARA_VIP;
                        const barberoMask = cliente.preferredBarber === 'admin' ? 'Carlos Pérez' : (cliente.preferredBarber || 'Cualquiera');

                        return (
                            <div key={index} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-zinc-900/40 transition-colors group">
                                <div className="col-span-1 text-center text-zinc-700 font-black text-xs">{index + 1}</div>
                                
                                <div className="col-span-5 md:col-span-4">
                                    <p className={`font-black text-lg mb-1 ${isVip ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-white'}`}>
                                        {cliente.clientName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-zinc-400 font-mono text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 inline-block">
                                            {cliente.clientPhone}
                                        </p>
                                        {isVip ? (
                                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded">👑 VIP</span>
                                        ) : (
                                            <span className="bg-zinc-800/50 text-zinc-500 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded">REGULAR</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-600 text-[10px] md:hidden mt-2 font-bold uppercase">✂️ {barberoMask}</p>
                                </div>
                                
                                <div className="col-span-3 hidden md:block">
                                    <p className="text-emerald-500/80 font-bold text-xs uppercase tracking-wider flex items-center gap-1">✂️ {barberoMask}</p>
                                </div>
                                
                                <div className="col-span-3 text-center">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border ${isVip ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-900 border-zinc-700 text-white group-hover:border-emerald-500/50 transition-colors'}`}>
                                        {cliente.totalVisits}
                                    </div>
                                </div>
                                
                                <div className="col-span-3 md:col-span-2 flex justify-center">
                                    <button onClick={() => abrirWhatsApp(cliente.clientPhone, cliente.clientName)} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95 flex items-center gap-2" title="Enviar WhatsApp">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
