"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
  // Nota: Usaremos descripciones locales si la API no trae las correctas
}

export default function ServiciosPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Función para restaurar las descripciones originales que te gustaban
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
    <div className="min-h-screen bg-black text-white p-8">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <button onClick={() => router.push("/admin")} className="text-xl p-2 bg-white/10 rounded-full hover:bg-white/20">⬅️</button>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Precios</h1>
            <p className="text-emerald-400 text-sm">Lista Oficial en Córdobas (C$)</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20">Cargando...</div>
        ) : (
          /* GRID CSS PURO (Fuerza Bruta) */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px', 
            width: '100%' 
          }}>
            
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
                  
                  {/* Descripción Restaurada */}
                  <p className="text-gray-400 text-sm leading-relaxed" style={{ textAlign: 'left' }}>
                    {getFixedDescription(s.name)}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
                  <span className="text-xs text-gray-500">⏱️ {s.durationMinutes} min</span>
                  <button onClick={() => alert(`Editar: ${s.name}`)} className="text-blue-400 font-bold text-sm hover:text-blue-300">Editar ✏️</button>
                </div>
              </div>
            ))}

            {/* Botón Nuevo Servicio (+) */}
            <div 
              onClick={() => alert("Crear Nuevo")}
              className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer transition-all"
              style={{ height: '280px' }}
            >
              <div className="text-5xl mb-2">+</div>
              <span className="font-bold uppercase text-sm">Nuevo Servicio</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
