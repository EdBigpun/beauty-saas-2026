"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("adminToken");
    if (sesionGuardada === "permitido") setIsAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    // --- LÓGICA JEDI: Uso de Variable de Entorno ---
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("adminToken", "permitido");
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // =================================================================
  // 🔴 SECCIÓN DE LOGIN (LOOK CYBERPUNK INTACTO) 🔴
  // =================================================================
  if (!isAuthenticated) {
    const gradientBackground = {
      background:
        "linear-gradient(135deg, #0f172a 0%, #000000 50%, #064e3b 100%)",
    };
    const cardStyle = {
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
    };
    const inputStyle = {
      background: "rgba(0, 0, 0, 0.5)",
      border: "1px solid #1f2937",
    };

    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
        style={gradientBackground}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div
          className="p-10 rounded-3xl w-full max-w-md shadow-2xl relative z-10 transition-all"
          style={cardStyle}
        >
          <div className="text-center mb-10">
            <div className="text-7xl mb-5 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse inline-block">
              💈
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-[0.25em] drop-shadow-lg">
              ESTILO
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                26
              </span>
            </h1>
            <p className="text-zinc-500 text-xs mt-4 tracking-[0.2em] uppercase font-bold">
              Acceso Administrativo Seguro
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded-xl text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-zinc-700"
                style={inputStyle}
                placeholder="Ej: admin"
              />
            </div>

            <div className="relative">
              <label className="text-emerald-500/70 text-xs uppercase tracking-widest font-bold ml-2 mb-1 block">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all pr-14 placeholder:text-zinc-700"
                style={inputStyle}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-4 text-zinc-500 hover:text-emerald-400 transition-colors text-xl z-20 mb-[2px]"
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? "👁️" : "🔒"}
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 text-white font-bold text-lg rounded-xl hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all uppercase tracking-[0.15em] relative overflow-hidden group"
            >
              <span className="relative z-10 drop-shadow">
                {cargando ? "Validando..." : "Ingresar al Sistema"}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }
  // =================================================================
  // 🔴 FIN DE SECCIÓN DE LOGIN 🔴
  // =================================================================

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-4xl font-bold">Panel de Control</h1>
            <p className="text-emerald-400 mt-1">
              Sesión activa: {username || "Admin"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-900 text-red-200 rounded-full"
          >
            Cerrar Sesión
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            width: "100%",
          }}
        >
          <div
            onClick={() => router.push("/admin/servicios")}
            className="group bg-white/5 border border-white/10 p-8 rounded-2xl cursor-pointer hover:bg-white/10 hover:-translate-y-2 transition-all"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              minHeight: "300px",
            }}
          >
            <div className="text-4xl mb-4 bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              💰
            </div>
            <h2 className="text-2xl font-bold mb-2">Gestión de Precios</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Actualiza los costos de cortes y servicios en tiempo real.
              Sincronizado con la App del cliente.
            </p>
            <span className="text-emerald-400 font-bold mt-auto">
              Configurar Servicios &rarr;
            </span>
          </div>

          <div
            onClick={() => router.push("/admin/clientes")}
            className="group bg-white/5 border border-white/10 p-8 rounded-2xl cursor-pointer hover:bg-white/10 hover:-translate-y-2 transition-all"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              minHeight: "300px",
            }}
          >
            <div className="text-4xl mb-4 bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              🏆
            </div>
            <h2 className="text-2xl font-bold mb-2">Clientes VIP</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Analiza quiénes son tus clientes más fieles y recompénsalos.
              Estadísticas mensuales.
            </p>
            <span className="text-blue-400 font-bold mt-auto">
              Ver Reportes &rarr;
            </span>
          </div>

          <div
            className="group bg-white/5 border border-white/5 border-dashed p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              minHeight: "300px",
            }}
          >
            <div className="text-4xl mb-4 bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Nuevas funciones de marketing y contabilidad automática en
              desarrollo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
