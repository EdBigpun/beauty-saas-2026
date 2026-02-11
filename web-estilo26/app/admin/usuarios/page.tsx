"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newEmail, setNewEmail] = useState(""); 
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState("BARBERO");
  
  const [showPass, setShowPass] = useState(false);

  // GUARDIA DE SEGURIDAD
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token !== "permitido") {
      router.push("/admin");
    }
  }, [router]);

  // CARGA DE DATOS
  useEffect(() => {
    fetch("http://localhost:9090/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Fallo al cargar");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando usuarios:", error);
        setLoading(false);
      });
  }, []);

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(pass);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPass)) {
      alert("⚠️ CONTRASEÑA DÉBIL:\nDebe tener al menos 1 Mayúscula, 1 Número y 6 caracteres.");
      return;
    }

    try {
      const res = await fetch("http://localhost:9090/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUser,
          email: newEmail,
          password: newPass,
          role: newRole
        }),
      });

      if (res.ok) {
        const userCreated = await res.json();
        setUsers([...users, userCreated]);
        
        // Reset
        setNewUser("");
        setNewEmail("");
        setNewPass("");
        setIsModalOpen(false);
        alert("¡Usuario creado con éxito! 🚀");
      } else {
        alert("Error al crear usuario. Verifica los datos.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <button onClick={() => router.push("/admin")} className="text-xl p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">⬅️</button>
          <div>
            <h1 className="text-3xl font-bold">Equipo de Trabajo</h1>
            <p className="text-emerald-400 text-sm">Gestión de Barberos y Administradores</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 mt-20 animate-pulse">Cargando equipo...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {users.map((u) => {
              const isAdmin = u.role === 'ADMIN';
              const roleColor = isAdmin ? 'text-purple-400' : 'text-blue-400';
              const roleBg = isAdmin ? 'bg-purple-500/10' : 'bg-blue-500/10';
              const borderColor = isAdmin ? 'border-purple-500/30' : 'border-white/10';
              const icon = isAdmin ? '👑' : '✂️';

              return (
                <div 
                  key={u.id}
                  className={`bg-white/5 border ${borderColor} p-6 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all shadow-lg group relative overflow-hidden flex flex-col justify-between`}
                  style={{ minHeight: '280px' }}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-all opacity-20 ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'} group-hover:opacity-30`}></div>

                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${roleBg}`}>
                        {icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white leading-tight">{u.username}</h2>
                        <span className={`text-xs font-bold tracking-widest uppercase ${roleColor}`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-2">
                      {u.email && <span className="block text-white/50 text-xs mb-2">📧 {u.email}</span>}
                      {isAdmin 
                        ? 'Acceso total: Configuración y usuarios.' 
                        : 'Acceso limitado: Agenda personal.'}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                      <button className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold text-zinc-300 transition-colors">Editar ✏️</button>
                      <button className="flex-1 py-3 bg-red-900/10 hover:bg-red-900/30 border border-red-900/30 rounded-xl text-sm font-bold text-red-400 transition-colors">Eliminar 🗑️</button>
                  </div>
                </div>
              );
            })}

            <div 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer transition-all hover:bg-emerald-500/5 group"
              style={{ minHeight: '280px' }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">+</div>
              <span className="font-bold uppercase text-sm tracking-widest">Nuevo Barbero</span>
            </div>

          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🟢 MODAL MEJORADO (UI/UX BOOST) 🟢 */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          
          <div className="bg-[#0a0a0a] border border-emerald-500/30 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.1)] relative zoom-in-95">
            
            {/* Encabezado con Icono */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-500/20 shadow-inner">
                    👤
                </div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Nuevo Usuario</h2>
                <p className="text-zinc-500 text-sm mt-1">Ingresa los datos de acceso para el sistema</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              
              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Usuario</label>
                <input 
                    type="text" 
                    value={newUser} 
                    onChange={(e) => setNewUser(e.target.value)} 
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 focus:bg-black transition-all outline-none text-lg placeholder:text-zinc-700" 
                    placeholder="Ej: JuanBarbero" 
                    required 
                />
              </div>

              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Correo Electrónico</label>
                <input 
                    type="email" 
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 focus:bg-black transition-all outline-none text-lg placeholder:text-zinc-700" 
                    placeholder="juan@ejemplo.com" 
                    required 
                />
              </div>

              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Contraseña</label>
                <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={newPass} 
                      onChange={(e) => setNewPass(e.target.value)} 
                      className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 focus:bg-black transition-all outline-none pr-14 text-lg placeholder:text-zinc-700" 
                      placeholder="••••••••" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-0 top-0 h-full px-4 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPass ? "👁️" : "🔒"}
                    </button>
                </div>
                {/* LEYENDA MEJORADA */}
                <div className="mt-2 flex gap-2 items-start bg-blue-900/20 p-2 rounded-lg border border-blue-500/20">
                    <span className="text-blue-400 text-xs">ℹ️</span>
                    <p className="text-[11px] text-blue-200/70 leading-tight">
                        Seguridad: Mínimo 6 caracteres, 1 mayúscula y 1 número.
                    </p>
                </div>
              </div>

              <div>
                <label className="text-emerald-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">Rol</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-emerald-500 outline-none appearance-none cursor-pointer text-lg">
                  <option value="BARBERO">✂️ Barbero (Acceso Limitado)</option>
                  <option value="ADMIN">👑 Administrador (Acceso Total)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors uppercase tracking-wide text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-wide text-sm">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
