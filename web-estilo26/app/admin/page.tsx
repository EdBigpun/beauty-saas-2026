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
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-gray-800">
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
            className="px-6 py-3 bg-red-900/30 border border-red-900 hover:bg-red-800 hover:text-white text-red-400 rounded-xl text-sm font-bold uppercase transition-colors"
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
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all group text-left shadow-2xl hover:-translate-y-1"
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
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4">
              Gestionar Citas →
            </span>
          </button>

          {/* 2. RUTA: HISTORIAL DE CITAS */}
          <button
            onClick={() => router.push('/admin/citas')}
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all group text-left shadow-2xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
              <ClipboardList className="w-8 h-8 text-[#4BE6CB]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Historial de Citas
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Tabla analítica de todas las citas pasadas y futuras.
              </p>
            </div>
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4">
              Ver Historial →
            </span>
          </button>

          {/* 3. RUTA: SERVICIOS */}
          <button
            onClick={() => router.push('/admin/servicios')}
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all group text-left shadow-2xl hover:-translate-y-1"
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
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4">
              Configurar Servicios →
            </span>
          </button>

          {/* 4. RUTA: STAFF Y BARBEROS */}
          <button
            onClick={() => router.push('/admin/usuarios')}
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all group text-left shadow-2xl hover:-translate-y-1"
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
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4">
              Gestionar Staff →
            </span>
          </button>

          {/* 5. RUTA: CLIENTES VIP (Restaurada) */}
          <button
            onClick={() => router.push('/admin/clientes')}
            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl flex flex-col items-start gap-6 hover:border-[#4BE6CB]/50 hover:bg-[#4BE6CB]/5 transition-all group text-left shadow-2xl hover:-translate-y-1"
          >
            <div className="w-16 h-16 bg-[#4BE6CB]/10 group-hover:bg-[#4BE6CB]/20 rounded-2xl flex items-center justify-center border border-[#4BE6CB]/30 transition-colors">
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
            <span className="text-[#4BE6CB] text-sm font-bold uppercase tracking-widest mt-auto pt-4">
              Ver Reportes →
            </span>
          </button>

          {/* 6. TARJETA: PRÓXIMAMENTE */}
          <div className="bg-[#0a0a0a]/50 border border-white/5 p-8 rounded-3xl flex flex-col items-start gap-6 text-left shadow-2xl opacity-80 cursor-default">
            <div className="w-16 h-16 bg-purple-900/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Rocket className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wider">
                Próximamente
              </h3>
              <p className="text-base text-zinc-500 mt-2">
                Nuevas funciones de marketing y contabilidad automática en
                desarrollo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
