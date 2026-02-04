"use client";
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ESTADOS DEL FORMULARIO
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado del ojito
  const [cargando, setCargando] = useState(false);

  // PERSISTENCIA DE SESIÓN
  useEffect(() => {
    const sesionGuardada = localStorage.getItem("adminToken");
    if (sesionGuardada === "permitido") {
      setIsAuthenticated(true);
    }
  }, []);

  // LÓGICA DE LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password 
        }),
      });

      if (respuesta.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("adminToken", "permitido");
      } else {
        alert("🚫 Usuario o Contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Error: El servidor Java no responde en el puerto 9090");
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setPassword("");
    setUsername("");
  };

  // =================================================================
  // 1. PANTALLA DE LOGIN (DISEÑO GLASSMORPHISM CON OJITO)
  // =================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-emerald-950 relative overflow-hidden">
        
        {/* Luces de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-2">💈</div>
            <h1 className="text-3xl font-bold text-white tracking-wider">ESTILO<span className="text-emerald-400">26</span></h1>
            <p className="text-zinc-400 text-sm mt-2">Acceso Administrativo Seguro</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* INPUT USUARIO */}
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Usuario</label>
              <input 
                type="text" 
                placeholder="Ej: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-black/30 border border-zinc-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* INPUT CONTRASEÑA CON OJITO */}
            <div className="relative">
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Contraseña</label>
              <input 
                type={showPassword ? "text" : "password"} // Aquí cambia el tipo dinámicamente
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-black/30 border border-zinc-700 rounded-lg text-white focus:border-emerald-500 outline-none transition-all pr-12"
              />
              {/* BOTÓN DEL OJITO */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all ${cargando ? "bg-zinc-700" : "bg-gradient-to-r from-emerald-600 to-emerald-800 hover:scale-[1.02]"}`}
            >
              {cargando ? "Validando..." : "Ingresar al Sistema"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =================================================================
  // 2. DASHBOARD / PANEL DE CONTROL (DISEÑO MEJORADO)
  // =================================================================
  return (
    // Usamos el mismo fondo para continuidad visual
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-emerald-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 backdrop-blur-sm">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Panel de Control
            </h1>
            <p className="text-emerald-400 mt-1">Sesión activa: {username || "Administrador"}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all hover:scale-105"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* GRILLA DE TARJETAS (Efecto Cristal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* TARJETA 1: PRECIOS */}
          <div className="group bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-emerald-900/20">
            <div className="bg-emerald-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
              💰
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Gestión de Precios</h2>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Actualiza los costos de cortes y servicios en tiempo real. Sincronizado con la App del cliente.
            </p>
            <span className="text-emerald-400 text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
              Configurar Servicios &rarr;
            </span>
          </div>

          {/* TARJETA 2: CLIENTES */}
          <div className="group bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-blue-900/20">
            <div className="bg-blue-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Clientes VIP</h2>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Analiza quiénes son tus clientes más fieles y recompénsalos. Estadísticas mensuales.
            </p>
            <span className="text-blue-400 text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
              Ver Reportes &rarr;
            </span>
          </div>

           {/* TARJETA 3: PRÓXIMAMENTE */}
           <div className="group bg-white/5 border border-white/5 p-8 rounded-2xl backdrop-blur-md opacity-50 hover:opacity-100 transition-all border-dashed">
            <div className="bg-purple-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-2xl">
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Próximamente</h2>
            <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
              Nuevas funciones de marketing y contabilidad automática en desarrollo.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
