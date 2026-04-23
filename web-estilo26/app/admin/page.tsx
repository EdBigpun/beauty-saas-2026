'use client'

// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Agregamos el ícono Trophy para la tarjeta de Clientes VIP
import {
  Users,
  Scissors,
  CalendarDays,
  ClipboardList,
  Rocket,
  Trophy,
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()

  // ============================================================================
  // 2. SEGURIDAD DE SESIÓN
  // ============================================================================
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token !== 'permitido') {
      router.push('/admin')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  // ============================================================================
  // 3. INTERFAZ DE USUARIO (Hub Central Completo con 6 Tarjetas)
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
