'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  Scissors,
  ShieldAlert,
  ChevronDown,
  X,
} from 'lucide-react'

// CONFIGURACIÓN DE NEGOCIO
const HORARIO_APERTURA = 8
// CORRECCIÓN: Cambiamos a 21 para que el bucle dibuje hasta las 20:00 (8:00 PM) inclusive.
const HORARIO_CIERRE = 21
const INTERVALO_MINUTOS = 30
const TIMEZONE = 'America/Managua'

const BARBEROS_MOCK = [
  { id: 'ALL', name: 'Todo el Local (Vista Global)', icon: Users },
  { id: '0', name: 'Admin (Dueño / Barbero)', icon: ShieldAlert },
  { id: '1', name: 'Jose Barbero (Profesional)', icon: Scissors },
]

export default function AgendaPage() {
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState(() =>
    toZonedTime(new Date(), TIMEZONE),
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedBarberId, setSelectedBarberId] = useState('ALL')

  // NUEVO ESTADO: Controla si la ventana flotante de "Nueva Cita" está abierta o cerrada
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token !== 'permitido') {
      router.push('/admin')
    }
  }, [router])

  const prevDay = () =>
    setSelectedDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000))
  const nextDay = () =>
    setSelectedDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000))
  const goToToday = () => setSelectedDate(toZonedTime(new Date(), TIMEZONE))

  const dateDisplay = formatInTimeZone(
    selectedDate,
    TIMEZONE,
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es },
  )

  // ============================================================================
  // MAGIA MATEMÁTICA: Convertir Hora Militar (15) a Formato 12 hrs (3 PM)
  // ============================================================================
  const formatTime12h = (hour: number, minutes: string) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    // Si la hora es 0 (medianoche), mostrar 12. Si es mayor a 12 (ej. 15), restarle 12 (mostrar 3).
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let i = HORARIO_APERTURA; i < HORARIO_CIERRE; i++) {
      // Guardamos un objeto con la hora formateada para mostrarla, y el valor militar para lógica futura
      slots.push({ display: formatTime12h(i, '00'), militar: `${i}:00` })
      // Evitamos dibujar las "8:30 PM" si la barbería cierra exactamente a las 8:00 PM
      if (i < HORARIO_CIERRE - 1) {
        slots.push({ display: formatTime12h(i, '30'), militar: `${i}:30` })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const selectedBarber =
    BARBEROS_MOCK.find((b) => b.id === selectedBarberId) || BARBEROS_MOCK[0]
  const SelectedIcon = selectedBarber.icon

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-[#4BE6CB]/30 relative">
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER SUPERIOR */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="w-12 h-12 bg-[#4BE6CB]/10 border border-[#4BE6CB]/30 rounded-full flex items-center justify-center hover:bg-[#4BE6CB]/20 transition-all shadow-[0_0_15px_rgba(75,230,203,0.1)]"
            >
              <ArrowLeft className="w-6 h-6 text-[#4BE6CB]" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Agenda Central
              </h1>
              <p className="text-[#4BE6CB] text-sm md:text-base font-medium mt-1">
                Gestión de Citas, Tiempos y Flujo de Trabajo del SaaS
              </p>
            </div>
          </div>

          {/* BOTÓN CONECTADO AL ESTADO DEL MODAL */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#4BE6CB] text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#3bc4ac] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(75,230,203,0.3)]"
          >
            <Plus className="w-5 h-5" /> Nueva Cita
          </button>
        </div>

        {/* NAVEGACIÓN Y FILTROS MULTI-TENANT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={prevDay}
              className="p-2 hover:bg-[#4BE6CB]/10 rounded-lg transition-colors border border-zinc-700 hover:border-[#4BE6CB]/50 group"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-300 group-hover:text-[#4BE6CB]" />
            </button>

            <div className="flex items-center gap-3 min-w-[280px] justify-center">
              <CalendarIcon className="w-5 h-5 text-[#4BE6CB]" />
              <span className="text-lg font-bold capitalize tracking-wide text-white drop-shadow-md">
                {dateDisplay}
              </span>
            </div>

            <button
              onClick={nextDay}
              className="p-2 hover:bg-[#4BE6CB]/10 rounded-lg transition-colors border border-zinc-700 hover:border-[#4BE6CB]/50 group"
            >
              <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#4BE6CB]" />
            </button>

            <button
              onClick={goToToday}
              className="ml-2 px-4 py-2 bg-zinc-800 hover:bg-[#4BE6CB]/20 hover:text-[#4BE6CB] text-zinc-300 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Hoy
            </button>
          </div>

          {/* Selector Elegante */}
          <div className="flex items-center gap-3 w-full md:w-auto bg-black/40 p-2 rounded-xl border border-[#4BE6CB]/20 relative">
            <span className="text-xs uppercase tracking-widest font-black text-[#4BE6CB] pl-2 flex items-center gap-2">
              Agenda de:
            </span>

            <div className="relative z-50">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full md:w-72 bg-zinc-900 border border-zinc-700 py-2.5 px-4 rounded-lg text-white outline-none text-sm font-bold hover:bg-zinc-800 hover:border-[#4BE6CB]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SelectedIcon className="w-4 h-4 text-[#4BE6CB]" />
                  {selectedBarber.name}
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg overflow-hidden shadow-2xl">
                  {BARBEROS_MOCK.map((barbero) => {
                    const OptionIcon = barbero.icon
                    return (
                      <button
                        key={barbero.id}
                        onClick={() => {
                          setSelectedBarberId(barbero.id)
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800 last:border-0"
                      >
                        <OptionIcon className="w-4 h-4 text-[#4BE6CB]" />
                        {barbero.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CUADRÍCULA DEL TIEMPO */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10">
          <div className="flex border-b border-white/10 bg-black/50 p-4 relative z-20">
            <div className="w-24 shrink-0 flex items-center justify-center gap-2 text-[#4BE6CB] font-bold text-xs uppercase tracking-widest">
              <Clock className="w-4 h-4" /> Hora
            </div>
            <div className="flex-1 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest border-l border-white/5 pl-4">
              Lienzo de Trabajo
            </div>
          </div>

          <div className="h-[600px] overflow-y-auto custom-scrollbar relative pt-4 pb-10">
            {timeSlots.map((slot, index) => {
              const isHour = index % 2 === 0

              return (
                <div
                  key={slot.militar}
                  className={`flex ${isHour ? 'border-b border-white/10' : 'border-b border-white/5 border-dashed'}`}
                >
                  {/* Etiqueta de Hora 12 hrs */}
                  <div className="w-24 shrink-0 p-3 flex justify-end pr-4 text-xs font-medium text-zinc-500 relative bg-black/20">
                    {isHour && (
                      <span className="absolute -top-2.5 right-4 bg-[#0a0a0a] px-1 text-zinc-300 font-bold tracking-wider">
                        {slot.display}
                      </span>
                    )}
                  </div>

                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 border-l border-white/5 relative h-12 hover:bg-[#4BE6CB]/[0.02] transition-colors cursor-pointer group"
                  >
                    <div className="absolute inset-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[#4BE6CB] text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Agendar a las{' '}
                        {slot.display}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MODAL (VENTANA FLOTANTE) PARA NUEVA CITA */}
      {/* ============================================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Agendar Cita
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Modal (Formulario Base) */}
            <div className="p-6 flex flex-col gap-6">
              <p className="text-zinc-400 text-sm">
                *Aquí construiremos el formulario para seleccionar al Cliente,
                el Barbero y el Servicio que se realizará.*
              </p>

              <div className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center">
                <span className="text-zinc-600 font-bold uppercase text-xs tracking-widest">
                  Zona en Construcción (Hito 4.2)
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="p-6 border-t border-white/10 bg-black/50 flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-zinc-400 font-bold uppercase text-sm hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10"
              >
                Cancelar
              </button>
              <button
                disabled
                className="flex-1 py-3 bg-[#4BE6CB]/50 text-black/50 font-bold uppercase text-sm rounded-xl cursor-not-allowed"
              >
                Guardar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
