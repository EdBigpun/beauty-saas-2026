"use client";

// 1. IMPORTACIONES
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Scissors, UserPlus, Loader2, Mail, Pencil, Trash2, ArrowLeft, Eye, EyeOff, Lock, Info, Plus, CalendarDays, SprayCan, GraduationCap } from "lucide-react";

// 2. CONTRATO DE DATOS
interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
}

export default function UsuariosPage() {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // ESTADOS CREAR
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newRole, setNewRole] = useState('BARBERO')
  const [showPass, setShowPass] = useState(false)

  // ESTADOS EDITAR
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editUser, setEditUser] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('BARBERO')
  const [editPass, setEditPass] = useState('')
  const [showEditPass, setShowEditPass] = useState(false)

  // ==========================================
  // LÓGICA DE NEGOCIO Y SEGURIDAD
  // ==========================================

  const currentUserRole = 'ADMIN'
  const isSuperUser =
    currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER'

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token !== 'permitido') {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    fetch('http://localhost:9090/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Fallo al cargar')
        return res.json()
      })
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error cargando usuarios:', error)
        setLoading(false)
      })
  }

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/
    return regex.test(pass)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword(newPass)) {
      alert(
        '⚠️ CONTRASEÑA DÉBIL:\nDebe tener al menos 1 Mayúscula, 1 Número y 6 caracteres.',
      )
      return
    }
    try {
      const res = await fetch('http://localhost:9090/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser,
          email: newEmail,
          password: newPass,
          role: newRole,
        }),
      })
      if (res.ok) {
        const userCreated = await res.json()
        setUsers([...users, userCreated])
        setNewUser('')
        setNewEmail('')
        setNewPass('')
        setIsModalOpen(false)
        alert('¡Usuario creado con éxito! 🚀')
      } else {
        alert('Error al crear usuario. Verifica los datos.')
      }
    } catch (error) {
      console.error('Error de red:', error)
      alert('Error de conexión.')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmacion = window.confirm(
      '¿Estás seguro de eliminar a este usuario del sistema?',
    )
    if (!confirmacion) return

    try {
      const res = await fetch(`http://localhost:9090/api/users/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setUsers(users.filter((user) => user.id !== id))
        alert('🗑️ Usuario eliminado correctamente.')
      } else {
        const errorText = await res.text()
        console.error('Error del Backend (Java):', errorText)
        alert(
          `Error en la base de datos al eliminar. Código de Error: ${res.status}. \nRevisa la pestaña "Console" en DevTools (F12) para más detalles.`,
        )
      }
    } catch (error) {
      console.error('Error de Red:', error)
      alert('Error de conexión al servidor.')
    }
  }

  const openEditModal = (user: User) => {
    setEditingUserId(user.id)
    setEditUser(user.username)
    setEditEmail(user.email || '')
    setEditRole(user.role)
    setEditPass('')
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editPass !== '' && !validatePassword(editPass)) {
      alert(
        '⚠️ NUEVA CONTRASEÑA DÉBIL:\nDebe tener al menos 1 Mayúscula, 1 Número y 6 caracteres.',
      )
      return
    }

    const payload: any = {
      username: editUser,
      email: editEmail,
      role: editRole,
    }
    if (editPass !== '') {
      payload.password = editPass
    }

    try {
      const res = await fetch(
        `http://localhost:9090/api/users/${editingUserId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      if (res.ok) {
        fetchUsers()
        setIsEditModalOpen(false)
        alert('✏️ Usuario actualizado correctamente.')
      } else {
        alert('Error al actualizar usuario. Revisa el backend.')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión al actualizar.')
    }
  }

  // ==========================================
  // FUNCIONES VISUALES DE ROLES
  // ==========================================

  const getRoleIcon = (role: string) => {
    const roleUpper = role.toUpperCase()
    if (roleUpper === 'ADMIN')
      return (
        <ShieldAlert className="w-8 h-8 text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
      )
    if (roleUpper === 'MANAGER')
      return (
        <CalendarDays className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
      )
    if (roleUpper === 'BARBERO')
      return (
        <Scissors className="w-8 h-8 text-[#4BE6CB] drop-shadow-[0_0_10px_rgba(75,230,203,0.5)]" />
      )
    if (roleUpper === 'ASSISTANT')
      return (
        <SprayCan className="w-8 h-8 text-pink-400 drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
      )
    if (roleUpper === 'APPRENTICE')
      return (
        <GraduationCap className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
      )
    return <UserPlus className="w-8 h-8 text-zinc-400" />
  }

  // ==========================================
  // DICCIONARIO DE NEGOCIO: Multi-Tenant Híbrido
  // ==========================================

  const translateRole = (role: string) => {
    const roleUpper = role.toUpperCase()
    if (roleUpper === 'ADMIN') return 'DUEÑO DE MARCA / BARBERÍA'
    if (roleUpper === 'MANAGER') return 'GESTOR DE LOCAL / CAJA'
    if (roleUpper === 'BARBERO') return 'BARBERO INDEPENDIENTE'
    if (roleUpper === 'ASSISTANT') return 'ASISTENTE OPERATIVO'
    if (roleUpper === 'APPRENTICE') return 'APRENDIZ EN FORMACIÓN'
    return role
  }

  const getAccessDescription = (role: string) => {
    const roleUpper = role.toUpperCase()
    // 1. EL ADMIN (El Rey de la Isla o Dueño del Local)
    if (roleUpper === 'ADMIN')
      return 'Control absoluto del SaaS: Estadísticas globales, catálogos, arqueo de caja y gestión de permisos del equipo.'

    // 2. EL MANAGER (La mano derecha)
    if (roleUpper === 'MANAGER')
      return 'Control de piso: Gestión de la agenda general de la barbería, cobro a clientes y bloqueo manual de horarios.'

    // 3. EL BARBERO (El Modelo de "Alquiler de Silla" o "Solitario")
    // Aquí está el arreglo crucial que pediste: Se aclara que SÍ pueden gestionar toda su agenda.
    if (roleUpper === 'BARBERO')
      return 'Control total de agenda propia: Marcar citas completadas, reprogramar en 1 clic, bloqueo de horarios y panel de comisiones generadas.'

    // 4. EL ASISTENTE (El que prepara al cliente)
    if (roleUpper === 'ASSISTANT')
      return 'Acceso en tiempo real a la cola de espera y servicios express (sin cita) para agilizar el flujo de trabajo.'

    // 5. EL APRENDIZ
    if (roleUpper === 'APPRENTICE')
      return 'Visualización de agenda personal y registro de cortes bajo supervisión del Dueño de Marca.'

    return 'Usuario estándar del sistema.'
  }

  // ==========================================
  // RENDERIZADO VISUAL DEL DOM
  // ==========================================
  return (
    // Fondo negro puro como en la captura original.
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-[#4BE6CB]/30">
      {/* Contenedor central ancho (max-w-[1400px]) para que todo respire */}
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-800">
          <button
            onClick={() => router.push('/admin')}
            className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-300" />
          </button>
          <div>
            {/* Tamaños de letra grandes restaurados */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Equipo de Trabajo
            </h1>
            <p className="text-[#4BE6CB] text-sm md:text-base font-medium mt-1">
              Gestión de Roles, Accesos y Usuarios del SaaS
            </p>
          </div>
        </div>

        {/* LISTA DE USUARIOS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold uppercase text-sm">Cargando equipo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((u) => {
              const isAdmin = u.role.toUpperCase() === 'ADMIN'

              return (
                <div
                  key={u.id}
                  // Tarjeta con borde sutil y efecto hover de elevación (-translate-y-1)
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all shadow-lg group relative overflow-hidden flex flex-col"
                  style={{ minHeight: '300px' }}
                >
                  {/* Brillo de fondo restaurado (Púrpura para Admin, Azul para otros) */}
                  <div
                    className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-all pointer-events-none ${isAdmin ? 'bg-purple-500' : 'bg-[#4BE6CB]'}`}
                  ></div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    {/* Contenedor del ícono más grande */}
                    <div
                      className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isAdmin ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}
                    >
                      {getRoleIcon(u.role)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white leading-tight truncate">
                        {u.username}
                      </h2>
                      <span
                        className={`text-xs font-bold tracking-widest uppercase mt-1 ${isAdmin ? 'text-purple-400' : 'text-blue-400'}`}
                      >
                        {translateRole(u.role)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/50 text-sm mb-4 relative z-10">
                    <Mail className="w-4 h-4" />
                    <span>{u.email || 'Sin correo registrado'}</span>
                  </div>

                  {/* Letras más legibles (text-sm) y espaciado relajado (leading-relaxed) */}
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium relative z-10 flex-1">
                    {getAccessDescription(u.role)}
                  </p>

                  {/* CONTROL DE ACCESO VISUAL: Solo Admin/Manager ve estos botones */}
                  {isSuperUser && (
                    <div className="flex gap-3 mt-auto pt-6 border-t border-white/5 relative z-10">
                      <button
                        onClick={() => openEditModal(u)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase"
                      >
                        Editar <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-900/10 border border-red-900/30 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors text-sm font-bold tracking-widest uppercase"
                      >
                        Eliminar <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* BOTÓN NUEVO BARBERO */}
            {isSuperUser && (
              <div
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-zinc-500 hover:border-[#4BE6CB] hover:text-[#4BE6CB] cursor-pointer transition-all hover:bg-[#4BE6CB]/5 group"
                style={{ minHeight: '300px' }}
              >
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="font-bold uppercase text-sm tracking-widest text-zinc-400 group-hover:text-white">
                  Añadir Empleado
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL DE CREACIÓN */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#4BE6CB]/30 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(75,230,203,0.1)] relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#4BE6CB]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#4BE6CB]/20 shadow-inner">
                <UserPlus className="w-8 h-8 text-[#4BE6CB]" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide uppercase">
                Nuevo Empleado
              </h2>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-base"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-base"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Contraseña
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-4 pl-12 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-0 top-0 h-full px-4 text-zinc-500"
                  >
                    {showPass ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-3 flex gap-2 items-start bg-blue-900/20 p-3 rounded-xl border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
                    Seguridad: Mínimo 6 caracteres, 1 mayúscula y 1 número.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Rol Operativo
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-[#4BE6CB] outline-none text-sm font-bold tracking-widest uppercase"
                >
                  <option value="ADMIN">Administrador / Dueño</option>
                  <option value="MANAGER">Recepcionista / Gestor</option>
                  <option value="BARBERO">Barbero Profesional</option>
                  <option value="ASSISTANT">Asistente de Barbería</option>
                  <option value="APPRENTICE">Aprendiz</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#4BE6CB] hover:bg-[#3bc4ac] text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(75,230,203,0.3)]"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL DE EDICIÓN */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-orange-500/30 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(251,146,60,0.1)] relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20 shadow-inner">
                <Pencil className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide uppercase">
                Editar Usuario
              </h2>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={editUser}
                  onChange={(e) => setEditUser(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-orange-500 outline-none text-base"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-orange-500 outline-none text-base"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Rol Operativo
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl text-white focus:border-orange-500 outline-none text-sm font-bold tracking-widest uppercase"
                >
                  <option value="ADMIN">Administrador / Dueño</option>
                  <option value="MANAGER">Recepcionista / Gestor</option>
                  <option value="BARBERO">Barbero Profesional</option>
                  <option value="ASSISTANT">Asistente de Barbería</option>
                  <option value="APPRENTICE">Aprendiz</option>
                </select>
              </div>

              {/* RESET DE CONTRASEÑA */}
              <div className="pt-4 border-t border-zinc-800 mt-4">
                <label className="text-orange-400/80 text-xs uppercase tracking-widest font-bold mb-2 block ml-1">
                  Cambiar Contraseña (Opcional)
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-zinc-500" />
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    value={editPass}
                    onChange={(e) => setEditPass(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 p-4 pl-12 rounded-xl text-white focus:border-orange-500 outline-none text-sm placeholder:text-zinc-600"
                    placeholder="Dejar en blanco para no cambiar"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-0 top-0 h-full px-4 text-zinc-500 hover:text-orange-400"
                  >
                    {showEditPass ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {editPass.length > 0 && (
                  <div className="mt-3 flex gap-2 items-start bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                    <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-200/70 leading-relaxed font-medium">
                      Seguridad: Mínimo 6 caracteres, 1 mayúscula y 1 número.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(251,146,60,0.3)]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
