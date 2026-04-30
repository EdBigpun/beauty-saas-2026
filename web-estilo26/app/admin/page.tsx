'use client'

// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import { useState, useEffect } from 'react' // [CLASE]: Añadimos useState para la memoria local
import { useRouter } from 'next/navigation'
import {
  Users,
  Scissors,
  CalendarDays,
  ClipboardList,
  Rocket,
  Trophy,
  Lock, // [CLASE]: Íconos añadidos exclusivamente para decorar el formulario de Login
  User,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()

  // ============================================================================
  // [CLASE] 2. MEMORIA DE LA PÁGINA (STATES)
  // Aquí React guarda los datos en tiempo real mientras el usuario interactúa.
  // ============================================================================
  const [isAuthenticated, setIsAuthenticated] = useState(false) // ¿Logró entrar?
  const [isChecking, setIsChecking] = useState(true) // ¿Estamos leyendo el localStorage?
  const [username, setUsername] = useState('') // Lo que escribe en el campo Usuario
  const [password, setPassword] = useState('') // Lo que escribe en la Contraseña
  const [loginError, setLoginError] = useState(false) // Bandera para mostrar error en rojo
  const [showPassword, setShowPassword] = useState(false) // Control del "Ojito"

  // ============================================================================
  // [CLASE] 3. SEGURIDAD DE SESIÓN (EFECTO DE ARRANQUE)
  // Apenas el componente nace, revisa si el usuario ya tenía la llave guardada.
  // ============================================================================
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token === 'permitido') {
      setIsAuthenticated(true) // Si tiene la llave, marcamos como autenticado
    }
    // Una vez terminada la revisión, quitamos la pantalla de carga.
    setIsChecking(false)
  }, [])

  // ============================================================================
  // [CLASE] 4. FUNCIONES DE ACCIÓN (LOGOUT Y LOGIN)
  // ============================================================================
  const handleLogout = () => {
    localStorage.removeItem('adminToken') // Destruimos la llave
    setIsAuthenticated(false) // Forzamos a React a redibujar el formulario de Login
    setUsername('')
    setPassword('')
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault() // Evita que la página recargue al hacer "submit"

    // [CLASE]: Verificación temporal dictada por el usuario.
    // Solo si escribe exactamente esto, entrará.
    if (username === 'admin' && password === 'estilo26') {
      localStorage.setItem('adminToken', 'permitido') // Creamos la llave
      setIsAuthenticated(true) // Forzamos a React a redibujar mostrando las tarjetas
      setLoginError(false)
    } else {
      setLoginError(true) // Si falla, activamos el mensaje rojo
    }
  }

  // ============================================================================
  // [CLASE] 5A. RENDERIZADO: PANTALLA DE CARGA
  // Evita que el formulario de login parpadee un milisegundo si el usuario
  // ya estaba logueado.
  // ============================================================================
  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-[#4BE6CB] flex items-center justify-center font-bold tracking-widest uppercase animate-pulse">
        Cargando Sistema...
      </div>
    )
  }

  // ============================================================================
  // [CLASE] 5B. RENDERIZADO: FORMULARIO DE LOGIN (Si NO está autenticado)
  // Este es el diseño oscuro "Ciberpunk" inyectado.
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-[#4BE6CB]/30 relative overflow-hidden">
        {/* Luces de fondo estilo neón */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C4B42]/20 via-black to-black z-0 pointer-events-none"></div>

        {/* Contenedor Cristalino del Formulario */}
        <div className="bg-[#0a0a0a] border border-[#1C4B42]/50 p-10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(75,230,203,0.15)] hover:border-[#4BE6CB]/50">
          {/* Ícono Superior */}
          <div className="w-16 h-16 bg-[#4BE6CB]/10 border border-[#4BE6CB]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(75,230,203,0.2)] transition-transform duration-300 hover:scale-110 cursor-default">
            <Lock className="w-8 h-8 text-[#4BE6CB]" />
          </div>

          <h2 className="text-3xl font-black text-white text-center tracking-tight mb-2 uppercase">
            Acceso Restringido
          </h2>
          <p className="text-zinc-500 text-sm text-center mb-8 font-medium tracking-widest uppercase">
            Centro de Mando Estilo26
          </p>

          {/* El motor del Login apuntando a handleLogin */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo Usuario */}
            <div className="group">
              <label className="block text-[10px] font-bold text-[#4BE6CB] uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#1C4B42] group-hover:text-[#4BE6CB] transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#14171B] border-2 border-[#1C4B42]/50 py-4 pl-12 pr-4 rounded-xl text-white focus:border-[#4BE6CB] hover:border-[#1C4B42] outline-none font-bold transition-all placeholder:text-zinc-700 shadow-inner"
                  placeholder="admin"
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Contraseña con Lógica de "Ojito" */}
            <div className="group">
              <label className="block text-[10px] font-bold text-[#4BE6CB] uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#1C4B42] group-hover:text-[#4BE6CB] transition-colors" />
                </div>
                <input
                  // [CLASE]: Si showPassword es true, se muestra el texto. Si no, puntitos.
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#14171B] border-2 border-[#1C4B42]/50 py-4 pl-12 pr-12 rounded-xl text-white focus:border-[#4BE6CB] hover:border-[#1C4B42] outline-none font-bold transition-all placeholder:text-zinc-700 shadow-inner ${showPassword ? 'tracking-normal' : 'tracking-[0.3em]'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#1C4B42] hover:text-[#4BE6CB] transition-all hover:scale-110 active:scale-95 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de Error Dinámico */}
            {loginError && (
              <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-pulse">
                Credenciales Incorrectas
              </p>
            )}

            {/* Botón de Submit */}
            <button
              type="submit"
              className="w-full py-4 bg-[#4BE6CB] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#3bc4ac] hover:-translate-y-1 shadow-[0_0_20px_rgba(75,230,203,0.3)] hover:shadow-[0_10px_30px_rgba(75,230,203,0.5)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Ingresar al Sistema
            </button>
          </form>

          {/* Botón de escape hacia el landing */}
          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 py-4 bg-transparent border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest rounded-xl hover:text-white hover:bg-zinc-900 hover:-translate-y-1 transition-all duration-300 active:scale-95 cursor-pointer text-xs"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  // ============================================================================
  // [CLASE] 5C. RENDERIZADO: PANEL DE CONTROL (Si SÍ está autenticado)
  // Este es TU código intacto, respetando cada clase visual que creaste.
  // ============================================================================
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-[#4BE6CB]/30 relative">
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER SUPERIOR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 pb-6 border-b border-gray-800 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
              Panel de Control
            </h1>
            <p className="text-[#4BE6CB] text-base font-bold mt-2 tracking-widest uppercase">
              CENTRO DE MANDO SAAS
            </p>
          </div>
          <button
            onClick={handleLogout}
            // [UI FIX]: Inyección del estándar de interacción. Añadido cursor-pointer y active:scale-95. El hover rojo original se mantiene.
            className="w-full sm:w-auto px-8 py-4 sm:px-6 sm:py-3 bg-red-900/30 border border-red-900 hover:bg-red-800 hover:text-white text-red-400 rounded-xl text-sm font-bold uppercase transition-all cursor-pointer active:scale-95"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* ============================================================================ */}
        {/* GRID PRINCIPAL: 6 Tarjetas en 3 columnas perfectas */}
        {/* ============================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. RUTA: AGENDA VISUAL */}
          <button
            onClick={() => router.push('/admin/agenda')}
            // [UI FIX]: Inyectado cursor-pointer, hover:scale-[1.02] (crecimiento) y active:scale-95 (hundimiento). Se mejora la sombra en hover (hover:shadow-[0_10px_25px_rgba(75,230,203,0.15)]).
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all duration-300 group text-left shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(75,230,203,0.15)] cursor-pointer active:scale-95"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
              <CalendarDays className="w-8 h-8 text-[#4BE6CB]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Agenda Visual
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Lienzo de trabajo diario y agendamiento de clientes.
              </p>
            </div>
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4 group-hover:translate-x-1 transition-transform">
              Gestionar Citas →
            </span>
          </button>

          {/* 2. RUTA: HISTORIAL DE CITAS */}
          <button
            onClick={() => router.push('/admin/citas')}
            // [UI FIX]: Estándar de interacción (cursor, scale, shadow)
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all duration-300 group text-left shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(75,230,203,0.15)] cursor-pointer active:scale-95"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
              <ClipboardList className="w-8 h-8 text-[#4BE6CB]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Agenda Maestra
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Panel de control de operaciones. Tabla analítica de todas las
                citas pasadas y futuras.
              </p>
            </div>
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4 group-hover:translate-x-1 transition-transform">
              Ver Historial →
            </span>
          </button>

          {/* 3. RUTA: SERVICIOS */}
          <button
            onClick={() => router.push('/admin/servicios')}
            // [UI FIX]: Estándar de interacción (cursor, scale, shadow)
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all duration-300 group text-left shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(75,230,203,0.15)] cursor-pointer active:scale-95"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
              <Scissors className="w-8 h-8 text-[#4BE6CB]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Servicios
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Gestión del catálogo de cortes, precios y duraciones.
              </p>
            </div>
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4 group-hover:translate-x-1 transition-transform">
              Configurar Servicios →
            </span>
          </button>

          {/* 4. RUTA: STAFF Y BARBEROS */}
          <button
            onClick={() => router.push('/admin/usuarios')}
            // [UI FIX]: Estándar de interacción (cursor, scale, shadow)
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all duration-300 group text-left shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(75,230,203,0.15)] cursor-pointer active:scale-95"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
              <Users className="w-8 h-8 text-[#4BE6CB]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Staff y Barberos
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Administración del personal y permisos de acceso.
              </p>
            </div>
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4 group-hover:translate-x-1 transition-transform">
              Gestionar Staff →
            </span>
          </button>

          {/* 5. RUTA: CLIENTES VIP */}
          <button
            onClick={() => router.push('/admin/clientes')}
            // [UI FIX]: Estándar de interacción. Añadí un hover específico de sombra dorada para coincidir con la corona VIP.
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-300 group text-left shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(234,179,8,0.15)] cursor-pointer active:scale-95"
          >
            <div className="w-16 h-16 bg-yellow-500/10 group-hover:bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30 transition-colors">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Clientes VIP
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Analiza quiénes son tus clientes más fieles y recompénsalos.
              </p>
            </div>
            <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest mt-auto pt-4 group-hover:translate-x-1 transition-transform">
              Ver Reportes →
            </span>
          </button>

          {/* 6. TARJETA: PRÓXIMAMENTE (REDISEÑADA PARA UX) */}
          <div
            // [UI FIX]: Rediseño de "En Construcción".
            // 1. border-dashed y opacity-70 indican que no está terminado.
            // 2. cursor-not-allowed previene el clic engañoso.
            // 3. transition-all y hover:scale-[1.02] le dan vida pasiva al pasar el ratón.
            className="bg-[#0a0a0a]/50 border-2 border-dashed border-purple-500/20 p-8 rounded-3xl flex flex-col items-start gap-6 text-left shadow-2xl opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-[0_10px_25px_rgba(168,85,247,0.1)] cursor-not-allowed group"
          >
            <div className="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-900/40 transition-colors">
              <Rocket className="w-8 h-8 text-purple-400 group-hover:animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
                Próximamente{' '}
                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md border border-purple-500/30 uppercase tracking-widest">
                  En Dev
                </span>
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Nuevas funciones de marketing automatizado y contabilidad en
                desarrollo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
