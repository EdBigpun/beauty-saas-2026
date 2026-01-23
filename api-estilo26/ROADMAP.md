# 🗺️ Roadmap: Proyecto SaaS "Estilo26"
**Mentor:** Gemini Senior Dev | **Developer:** [Tu Nombre] | **Inicio:** 21 Enero 2026

Este documento detalla el plan de ejecución paso a paso, organizado por fases y tiempos estimados, para el desarrollo de la plataforma de gestión de citas.

---

## ✅ FASE 1: Cimientos del Backend (Backend Core)
**Fecha:** 21 - 22 Enero 2026
**Estado:** Completado 🟢

- [x] Configuración de Docker (PostgreSQL 17).
- [x] Inicialización de Spring Boot 3.5 (Java 23).
- [x] Arquitectura de capas (Controller, Service, Repository, Model).
- [x] Creación de Entidad `Appointment` (Cita).
- [x] Lógica de negocio: Prevención de choques de horario.
- [x] Primer Endpoint REST (`POST /api/appointments`).
- [x] Configuración de Git y Repositorio en GitHub.

---

## 🚀 FASE 2: Frontend "Modern Luxe" (La Cara del Negocio)
**Fecha Estimada:** 23 - 25 Enero 2026
**Objetivo:** Tener una interfaz visual donde el cliente pueda ver horas.

### Día 3: Configuración y Estructura (23 Enero)
* **09:00 - 10:00:** Inicializar Next.js 15 con TypeScript y Tailwind v4.
* **10:00 - 12:00:** Instalación de Shadcn/ui y configuración del tema (Colores, Tipografía).
* **14:00 - 16:00:** Creación del Layout Principal (Barra de navegación móvil y escritorio).
* **16:00 - 18:00:** Diseño de la "Card" de Servicio (Neuromarketing: Precio psicológico, fotos).

### Día 4: El Calendario Interactivo (24 Enero)
* **09:00 - 12:00:** Crear componente `CalendarGrid` (Bento Grid).
* **14:00 - 17:00:** Lógica visual: Que los bloques cambien de color si están ocupados.

---

## 🔗 FASE 3: Integración Fullstack (El Cerebro conecta con el Cuerpo)
**Fecha Estimada:** 26 - 27 Enero 2026

- [ ] Conectar Next.js con Spring Boot usando `fetch` o `Axios`.
- [ ] Manejo de errores visuales (Toast notifications cuando falla la reserva).
- [ ] Mostrar "Spinners" de carga para mejorar la UX.

---

## 💬 FASE 4: Notificaciones y WhatsApp (El Valor Agregado)
**Fecha Estimada:** 28 - 29 Enero 2026

- [ ] Registro en Meta for Developers (WhatsApp API).
- [ ] Crear servicio Java `WhatsAppService`.
- [ ] Configurar plantilla de mensaje: "Hola [Nombre], tu cita está confirmada...".
- [ ] Trigger automático: Al reservar con éxito -> Enviar mensaje.

---

## 🚢 FASE 5: Despliegue (Salir al mundo)
**Fecha Estimada:** 30 Enero 2026

- [ ] Dockerizar el Frontend.
- [ ] Subir base de datos a un servicio en la nube (Railway/Render).
- [ ] Desplegar Backend y Frontend.
- [ ] Pruebas finales en celular real.