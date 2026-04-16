'use client'

// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
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
  User as UserIcon,
  Phone,
  ScissorsSquare,
  CheckCircle2,
} from 'lucide-react'

// ============================================================================
// 2. CONFIGURACIÓN DE NEGOCIO Y MATEMÁTICAS VISUALES
// ============================================================================
const HORARIO_APERTURA = 8
const HORARIO_CIERRE = 21
const INTERVALO_MINUTOS = 30
const TIMEZONE = 'America/Managua'

// LA CLAVE DEL RENDERIZADO ESPACIAL:
// 48 píxeles de altura de fila divididos entre 30 minutos = 1.6 píxeles por minuto
const PIXELES_POR_MINUTO = 48 / 30

// ============================================================================
// 3. CONTRATOS DE DATOS (Lo que esperamos recibir de Java)
// ============================================================================
interface Empleado {
  id: number
  username: string
  role: string
}

interface Servicio {
  id: number
  name: string
  price: number
  durationMinutes: number
}

// NUEVO: Así es como React espera leer la caja de Citas que manda Java
interface CitaRespuesta {
  id: number
  clientName: string
  appointmentDate: string // Ejemplo: "2026-04-16"
  appointmentTime: string // Ejemplo: "10:00:00"
  endTime: string // Ejemplo: "10:45:00"
  barberName: string
  status: string
}

export default function AgendaPage() {
  const router = useRouter()

  // ============================================================================
  // ESTADOS DEL COMPONENTE (La memoria a corto plazo de React)
  // ============================================================================
  const [selectedDate, setSelectedDate] = useState(() =>
    toZonedTime(new Date(), TIMEZONE),
  )

  // Guardamos las listas reales que vienen de la Base de Datos
  const [dbBarberos, setDbBarberos] = useState<Empleado[]>([])
  const [dbServicios, setDbServicios] = useState<Servicio[]>([])
  // NUEVO: Aquí guardaremos todas las citas que Java nos devuelva
  const [dbCitas, setDbCitas] = useState<CitaRespuesta[]>([])

  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false)
  const [selectedMainBarberId, setSelectedMainBarberId] = useState('ALL')

  // Estados para controlar el Modal (Ventana flotante) de nueva cita
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formClientName, setFormClientName] = useState('')
  const [formClientPhone, setFormClientPhone] = useState('')
  const [formServiceId, setFormServiceId] = useState('')
  const [formEmployeeId, setFormEmployeeId] = useState('')
  const [formTime, setFormTime] = useState('')

  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const [isBarberDropdownOpen, setIsBarberDropdownOpen] = useState(false)
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)

  // ============================================================================
  // FUNCIÓN MAESTRA DE CARGA DE DATOS (Data Fetching)
  // ============================================================================
  const cargarDatos = async () => {
    try {
      // Hacemos 3 llamadas simultáneas al backend para ahorrar tiempo
      const [resUsers, resServices, resAppointments] = await Promise.all([
        fetch('http://localhost:9090/api/users'),
        fetch('http://localhost:9090/api/services'),
        fetch('http://localhost:9090/api/appointments'), // Pedimos las citas
      ])

      if (resUsers.ok && resServices.ok && resAppointments.ok) {
        const users: Empleado[] = await resUsers.json()
        const services: Servicio[] = await resServices.json()
        const appointments: CitaRespuesta[] = await resAppointments.json()

        // Filtramos para que solo salgan Barberos y Administradores
        const staffOperativo = users.filter((u) => {
          const rol = u.role.toUpperCase()
          return rol === 'ADMIN' || rol === 'BARBERO'
        })

        // Guardamos todo en la memoria de React
        setDbBarberos(staffOperativo)
        setDbServicios(services)
        setDbCitas(appointments)
      }
    } catch (error) {
      console.error('Error cargando el dashboard:', error)
    }
  }

  // Cuando entramos a la página por primera vez, ejecutamos la función de carga
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token !== 'permitido') {
      router.push('/admin')
      return
    }
    cargarDatos()
  }, [router])

  // ============================================================================
  // LÓGICA DE TIEMPO Y NAVEGACIÓN
  // ============================================================================
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

  // Guardamos la fecha seleccionada en formato "2026-04-16" para poder compararla
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

  const formatTime12h = (hour: number, minutes: string) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let i = HORARIO_APERTURA; i < HORARIO_CIERRE; i++) {
      slots.push({
        display: formatTime12h(i, '00'),
        militar: `${i.toString().padStart(2, '0')}:00`,
      })
      if (i < HORARIO_CIERRE - 1) {
        slots.push({
          display: formatTime12h(i, '30'),
          militar: `${i.toString().padStart(2, '0')}:30`,
        })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // ============================================================================
  // MATEMÁTICAS DEL RENDERIZADO (El Motor Visual de las Citas)
  // ============================================================================

  // 1. Filtramos: De todas las miles de citas, solo queremos las de la fecha actual
  // y las del barbero que seleccionamos en el filtro de arriba.
  const citasDelDia = dbCitas.filter((cita) => {
    const esMismoDia = cita.appointmentDate === selectedDateString

    let esMismoBarbero = true
    if (selectedMainBarberId !== 'ALL') {
      const barberoFiltro = dbBarberos.find(
        (b) => b.id.toString() === selectedMainBarberId,
      )
      esMismoBarbero = cita.barberName === barberoFiltro?.username
    }

    return esMismoDia && esMismoBarbero
  })

  // 2. Fórmula Matemática: Calcula cuántos píxeles empujar hacia abajo (top) y de alto (height)
  const calcularEstilosCita = (horaInicio: string, horaFin: string) => {
    const [startH, startM] = horaInicio.split(':').map(Number)
    const [endH, endM] = horaFin.split(':').map(Number)

    const minDesdeApertura = (startH - HORARIO_APERTURA) * 60 + startM
    const duracionTotal = (endH - startH) * 60 + (endM - startM)

    return {
      top: `${minDesdeApertura * PIXELES_POR_MINUTO}px`,
      height: `${duracionTotal * PIXELES_POR_MINUTO}px`,
    }
  }

  // ============================================================================
  // ACCIONES DEL USUARIO (Guardar nueva cita)
  // ============================================================================
  const openModalWithTime = (horaMilitar: string = '') => {
    setFormTime(horaMilitar)
    setFormClientName('')
    setFormClientPhone('')
    setFormServiceId('')
    setFormEmployeeId('')
    setIsServiceDropdownOpen(false)
    setIsBarberDropdownOpen(false)
    setIsTimeDropdownOpen(false)
    setIsModalOpen(true)
  }

  const handleGuardarCita = async () => {
    if (!formClientName || !formServiceId || !formEmployeeId || !formTime) {
      alert(
        '⚠️ Faltan datos: Por favor llena el Nombre, Servicio, Barbero y Hora.',
      )
      return
    }

    const barberoSeleccionado = dbBarberos.find(
      (b) => b.id.toString() === formEmployeeId,
    )
    const nombreBarbero = barberoSeleccionado
      ? barberoSeleccionado.username
      : 'Sin Asignar'

    // Empaquetamos los datos
    const payload = {
      clientName: formClientName,
      clientPhone: formClientPhone,
      appointmentDate: selectedDateString,
      appointmentTime: `${formTime}:00`,
      barberName: nombreBarbero,
      services: [{ id: parseInt(formServiceId) }],
    }

    try {
      const res = await fetch('http://localhost:9090/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        // MAGIA: En lugar de darle F5, obligamos a React a pedir las citas a Java
        // de nuevo para que la tarjeta de la cita nueva aparezca de inmediato.
        cargarDatos()
      } else {
        const errorText = await res.text()
        alert(`❌ Error del Servidor: ${errorText}`)
      }
    } catch (error) {
      console.error('Error de conexión:', error)
    }
  }

  const selectedService = dbServicios.find(
    (s) => s.id.toString() === formServiceId,
  )
  const selectedBarber = dbBarberos.find(
    (b) => b.id.toString() === formEmployeeId,
  )
  const selectedTimeDisplay =
    timeSlots.find((t) => t.militar === formTime)?.display ||
    'Seleccione hora...'
  const mainBarberDisplay =
    dbBarberos.find((b) => b.id.toString() === selectedMainBarberId)
      ?.username || 'Todo el Local (Vista Global)'

  // ============================================================================
  // LA INTERFAZ DE USUARIO (DOM)
  // ============================================================================
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
                Gestión de Citas, Tiempos y Flujo de Trabajo
              </p>
            </div>
          </div>
          <button
            onClick={() => openModalWithTime()}
            className="flex items-center gap-2 px-6 py-3 bg-[#4BE6CB] text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#3bc4ac] hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(75,230,203,0.3)]"
          >
            <Plus className="w-5 h-5" /> Nueva Cita
          </button>
        </div>

        {/* NAVEGACIÓN DE FECHA Y FILTRO DE BARBERO */}
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

          <div className="flex items-center gap-3 w-full md:w-auto bg-black/40 p-2 rounded-xl border border-[#4BE6CB]/20 relative">
            <span className="text-xs uppercase tracking-widest font-black text-[#4BE6CB] pl-2 flex items-center gap-2">
              Agenda de:
            </span>
            <div className="relative z-40">
              <button
                onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
                className="flex items-center justify-between w-full md:w-72 bg-zinc-900 border border-zinc-700 py-2.5 px-4 rounded-lg text-white outline-none text-sm font-bold hover:bg-zinc-800 hover:border-[#4BE6CB]/50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-4 h-4 text-[#4BE6CB] shrink-0" />
                  <span className="truncate">{mainBarberDisplay}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
              </button>
              {isMainDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedMainBarberId('ALL')
                      setIsMainDropdownOpen(false)
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800"
                  >
                    <Users className="w-4 h-4 text-[#4BE6CB]" /> Todo el Local
                    (Vista Global)
                  </button>
                  {dbBarberos.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedMainBarberId(emp.id.toString())
                        setIsMainDropdownOpen(false)
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800 last:border-0"
                    >
                      <Scissors className="w-4 h-4 text-[#4BE6CB]" />{' '}
                      {emp.username}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* LA CUADRÍCULA Y EL LIENZO DE CITAS */}
        {/* ============================================================================ */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10">
          {/* Cabecera de la tabla */}
          <div className="flex border-b border-white/10 bg-black/50 p-4 relative z-20">
            <div className="w-24 shrink-0 flex items-center justify-center gap-2 text-[#4BE6CB] font-bold text-xs uppercase tracking-widest">
              <Clock className="w-4 h-4" /> Hora
            </div>
            <div className="flex-1 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest border-l border-white/5 pl-4">
              Lienzo de Trabajo
            </div>
          </div>

          <div className="h-[600px] overflow-y-auto custom-scrollbar relative pt-4 pb-10">
            {/* CONTENEDOR MAESTRO RELATIVO: Base para que las citas floten correctamente */}
            <div className="relative w-full">
              {/* CAPA 1 (FONDO): Dibujamos las líneas grises de las horas */}
              {timeSlots.map((slot, index) => {
                const isHour = index % 2 === 0
                return (
                  <div
                    key={slot.militar}
                    className={`flex ${isHour ? 'border-b border-white/10' : 'border-b border-white/5 border-dashed'}`}
                  >
                    <div className="w-24 shrink-0 p-3 flex justify-end pr-4 text-xs font-medium text-zinc-500 relative bg-black/20">
                      {isHour && (
                        <span className="absolute -top-2.5 right-4 bg-[#0a0a0a] px-1 text-zinc-300 font-bold tracking-wider">
                          {slot.display}
                        </span>
                      )}
                    </div>
                    {/* Al hacer clic en una fila vacía, abrimos el modal pasándole esa hora */}
                    <div
                      onClick={() => openModalWithTime(slot.militar)}
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

              {/* CAPA 2 (FRENTE): Dibujamos las tarjetas flotantes de las citas */}
              {citasDelDia.map((cita) => {
                // Invocamos nuestra fórmula matemática
                const { top, height } = calcularEstilosCita(
                  cita.appointmentTime,
                  cita.endTime,
                )

                return (
                  <div
                    key={cita.id}
                    // Estilos de la tarjeta: Color esmeralda, bordes redondeados, sombra brillante
                    className="absolute bg-[#4BE6CB] text-black rounded-lg p-3 border border-[#3bc4ac] overflow-hidden shadow-[0_10px_30px_rgba(75,230,203,0.15)] z-30 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 hover:scale-[1.01] transition-transform cursor-pointer"
                    style={{
                      top,
                      height,
                      left: '6.5rem', // Empujamos la tarjeta hacia la derecha para que no tape la columna de la hora
                      right: '1rem', // Dejamos un margen libre a la derecha
                    }}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-sm uppercase tracking-widest truncate">
                        {cita.clientName}
                      </span>
                      <span className="bg-black/10 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase">
                        {cita.status}
                      </span>
                    </div>

                    <span className="text-xs font-medium opacity-80 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cita.appointmentTime.substring(0, 5)} -{' '}
                      {cita.endTime.substring(0, 5)}
                      <span className="mx-2">•</span>
                      <Scissors className="w-3 h-3" /> {cita.barberName}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MODAL (VENTANA FLOTANTE) PARA NUEVA CITA */}
      {/* ============================================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#4BE6CB]/30 w-full max-w-xl rounded-2xl shadow-[0_0_50px_rgba(75,230,203,0.1)] flex flex-col overflow-visible relative">
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#4BE6CB]/5">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#4BE6CB]" /> Registrar
                Cita
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1 ml-1">
                    <UserIcon className="w-3 h-3" /> Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-3.5 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-sm placeholder:text-zinc-600 transition-colors"
                    placeholder="Ej: Carlos Mejía"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1 ml-1">
                    <Phone className="w-3 h-3" /> Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-3.5 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-sm placeholder:text-zinc-600 transition-colors"
                    placeholder="Ej: +505 8888 0000"
                  />
                </div>
              </div>
              <div className="relative z-30">
                <label className="text-[#4BE6CB] text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1 ml-1">
                  <ScissorsSquare className="w-3 h-3" /> Servicio a Realizar
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsServiceDropdownOpen(!isServiceDropdownOpen)
                    setIsBarberDropdownOpen(false)
                    setIsTimeDropdownOpen(false)
                  }}
                  className="w-full bg-zinc-900/80 border border-[#4BE6CB]/30 p-3.5 rounded-xl text-white outline-none text-sm font-bold flex justify-between items-center hover:bg-zinc-800 transition-colors"
                >
                  <span
                    className={selectedService ? 'text-white' : 'text-zinc-500'}
                  >
                    {selectedService
                      ? `${selectedService.name} - C$${selectedService.price.toFixed(2)} (${selectedService.durationMinutes} min)`
                      : 'Seleccione un servicio...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#4BE6CB]" />
                </button>
                {isServiceDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-[#4BE6CB]/30 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                    {dbServicios.length === 0 ? (
                      <div className="p-4 text-sm text-zinc-500 text-center font-bold">
                        No hay servicios.
                      </div>
                    ) : (
                      dbServicios.map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => {
                            setFormServiceId(srv.id.toString())
                            setIsServiceDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800 last:border-0 flex justify-between items-center"
                        >
                          <span>
                            {srv.name}{' '}
                            <span className="text-zinc-500 ml-1">
                              ({srv.durationMinutes} min)
                            </span>
                          </span>
                          <span className="text-[#4BE6CB]">
                            C${srv.price.toFixed(2)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative z-20">
                  <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1 ml-1">
                    <Users className="w-3 h-3" /> Asignar a Barbero
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBarberDropdownOpen(!isBarberDropdownOpen)
                      setIsServiceDropdownOpen(false)
                      setIsTimeDropdownOpen(false)
                    }}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm font-bold flex justify-between items-center hover:bg-zinc-800 hover:border-[#4BE6CB]/50 transition-colors"
                  >
                    <span
                      className={
                        selectedBarber ? 'text-white' : 'text-zinc-500'
                      }
                    >
                      {selectedBarber
                        ? selectedBarber.username
                        : 'Asignar a...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>
                  {isBarberDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {dbBarberos.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            setFormEmployeeId(emp.id.toString())
                            setIsBarberDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800 last:border-0 flex items-center gap-2"
                        >
                          <Scissors className="w-4 h-4 text-[#4BE6CB]" />{' '}
                          {emp.username}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative z-10">
                  <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-1 ml-1">
                    <Clock className="w-3 h-3" /> Hora de Inicio
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimeDropdownOpen(!isTimeDropdownOpen)
                      setIsServiceDropdownOpen(false)
                      setIsBarberDropdownOpen(false)
                    }}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-3.5 rounded-xl text-white outline-none text-sm font-bold flex justify-between items-center hover:bg-zinc-800 hover:border-[#4BE6CB]/50 transition-colors"
                  >
                    <span className={formTime ? 'text-white' : 'text-zinc-500'}>
                      {selectedTimeDisplay}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </button>
                  {isTimeDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-[#0a0a0a] border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.militar}
                          type="button"
                          onClick={() => {
                            setFormTime(slot.militar)
                            setIsTimeDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-[#4BE6CB]/10 hover:text-white transition-colors border-b border-zinc-800 last:border-0 flex items-center justify-between"
                        >
                          {slot.display}
                          {formTime === slot.militar && (
                            <CheckCircle2 className="w-4 h-4 text-[#4BE6CB]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-black/50 flex gap-4 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-zinc-400 font-bold uppercase text-sm hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCita}
                className="flex-1 py-3 bg-[#4BE6CB] text-black font-bold uppercase text-sm rounded-xl hover:bg-[#3bc4ac] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(75,230,203,0.2)]"
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
