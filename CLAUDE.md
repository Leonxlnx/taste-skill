# CLAUDE.md — Guía de desarrollo de Tutory

Este archivo es la memoria de arquitectura del proyecto. Léelo al inicio de cada sesión.

---

## Contexto del negocio

**Tutory** es una plataforma SaaS de enseñanza de inglés que conecta estudiantes con sus profesores personales. No es una app de ejercicios genérica — es el espacio de trabajo donde el profe gestiona todo el aprendizaje de sus estudiantes.

**Modelo de negocio:** Freemium. Acceso básico gratuito, plan Pro próximamente.

**URL en producción:** https://tutory.vercel.app

**Flujo operativo:**
1. Los docentes inician sesión en el portal web
2. Ven sus estudiantes asignados, su plan de estudios y materiales
3. Las tutorías son por Zoom — el portal es el CRM/LMS que rodea la clase
4. Los estudiantes también acceden al portal para ver tareas, quizzes y su progreso

---

## Estado actual de la app (mayo 2026)

La app funciona en producción. Rutas implementadas:

| Ruta | Rol requerido | Descripción |
|------|--------------|-------------|
| `/login` | Público | Login con email + password |
| `/` | Autenticado | Redirige según rol |
| `/admin` | admin | Panel de administración |
| `/teacher` | teacher | Dashboard del profe |
| `/teacher/classes` | teacher | Gestión de clases |
| `/teacher/resources` | teacher | Recursos para estudiantes |
| `/teacher/messages` | teacher | Chat con estudiantes |
| `/student` | student | Dashboard del estudiante |
| `/student/topic/:id` | student | Lector de temas/unidades |

**Lo que NO existe aún:** landing page pública. Sin sesión, `/` redirige directamente a `/login`. La landing page es la próxima pieza a construir.

---

---

## Stack decidido para Tutory

```
Frontend:  React 18 + Vite + TailwindCSS
Backend:   Supabase (Postgres + Auth + Storage + Realtime)
Deploy:    Vercel (frontend) + Supabase Cloud (backend)
CI/CD:     GitHub Actions
```

**Decisiones de diseño:**
- Design tokens del template (verde `#86ef86`, dark/light mode) se conservan como referencia visual
- Fuentes: Sora (headings) + DM Sans (body) — igual que la plantilla
- Auth: Supabase Auth con email/password (Google OAuth por implementar)
- La app es una SPA con React Router

**Tokens de diseño:**
```
Color primario:   #86ef86  (verde claro)
Color secundario: #166534  (verde oscuro)
Fondo dark:       #0a0a0a
Fondo light:      #ffffff
Texto dark mode:  #f0fdf4
Font headings:    Sora
Font body:        DM Sans
Border radius:    8px (cards), 4px (badges)
```

---

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `admin` | Dueño del negocio — vista global, configura todo |
| `teacher` | Docente — ve y gestiona sus estudiantes asignados |
| `student` | Estudiante — ve su contenido, entrega tareas, hace quizzes |

---

## Modelo de datos (Supabase / Postgres)

```sql
-- Núcleo
users            (id, email, role, name, avatar_url, created_at)
teachers         (id → users.id, bio, phone)
students         (id → users.id, teacher_id → teachers.id, plan_id, active, phone)
groups           (id, name, teacher_id, created_at)
group_members    (group_id, student_id)

-- Contenido
study_plans      (id, name, description, created_at)
units            (id, plan_id, title, order)
topics           (id, unit_id, title, content_html, order)
topic_questions  (id, topic_id, question, options jsonb, correct_index)

-- Actividad
quizzes          (id, teacher_id, title, date, questions jsonb)
quiz_results     (id, quiz_id, student_id, answers jsonb, score, taken_at)
tasks            (id, teacher_id, student_id, title, description, due_date, status)
task_submissions (id, task_id, student_id, text, voice_url, images jsonb, submitted_at)
resources        (id, teacher_id, student_id nullable, title, url, type, created_at)

-- Clases
class_sessions   (id, student_id, teacher_id, scheduled_date, status, notes)
  -- status: scheduled | taken | no_show | cancelled | rescheduled | holiday
cycles           (id, student_id, start_date, end_date, min_classes, tokens)

-- Comunicación
messages         (id, sender_id, receiver_id, body, sent_at, read_at)
alerts           (id, type, data jsonb, resolved, created_at)
```

---

## Estructura de carpetas objetivo

```
tutory/
├── src/
│   ├── app/                  # Rutas y layout raíz
│   │   ├── App.tsx
│   │   └── router.tsx
│   ├── features/             # Un folder por dominio
│   │   ├── auth/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── quizzes/
│   │   ├── tasks/
│   │   ├── resources/
│   │   ├── study-plans/
│   │   ├── messages/
│   │   └── admin/
│   ├── components/           # UI compartido (Button, Card, Badge…)
│   ├── lib/
│   │   ├── supabase.ts       # cliente de supabase
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/           # SQL de migraciones
│   └── seed.sql
├── public/
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Secuencia de sesiones de desarrollo

### Sesión 1 — Setup del proyecto
**Prompt:** "Inicializa el proyecto Tutory: crea la estructura de carpetas con Vite + React + TypeScript + TailwindCSS. Configura los design tokens del tema (verde #86ef86, modo dark/light, fuentes Sora y DM Sans). Crea un layout vacío con header y sidebar. Instala y configura el cliente de Supabase."

**Entregables:**
- `package.json` con dependencias
- `vite.config.ts`, `tailwind.config.ts`
- `src/lib/supabase.ts`
- Layout base con theme toggle
- `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

---

### Sesión 2 — Auth y roles
**Prompt:** "Implementa el sistema de autenticación con Supabase Auth. Login con email + contraseña. Al iniciar sesión, leer el rol del usuario desde la tabla `users` y redirigir: admin → /admin, teacher → /teacher, student → /student. Incluye pantalla de login estilizada igual a la plantilla (login.html). Protege las rutas con un guard de auth."

**Entregables:**
- `features/auth/LoginPage.tsx`
- `AuthGuard` component
- Router con rutas protegidas por rol
- Tabla `users` en Supabase con políticas RLS básicas

---

### Sesión 3 — Base de datos y migraciones
**Prompt:** "Crea todas las migraciones SQL de Supabase para el modelo de datos completo de Tutory (ver CLAUDE.md). Incluye políticas RLS: admin ve todo, teacher ve solo sus estudiantes, student ve solo sus datos. Crea un seed con datos de prueba: 1 admin, 2 teachers, 4 students."

**Entregables:**
- `supabase/migrations/001_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/seed.sql`

---

### Sesión 4 — Vista Teacher: listado de estudiantes
**Prompt:** "Construye la vista principal del docente. Al entrar, ve una lista de sus estudiantes con: nombre, foto, plan activo, próxima clase y badges de alertas pendientes. Al hacer click en un estudiante se abre su perfil completo con tabs: Plan, Recursos, Tareas, Quizzes, Clases, Mensajes."

**Entregables:**
- `features/teachers/TeacherDashboard.tsx`
- `features/students/StudentCard.tsx`
- `features/students/StudentProfile.tsx` con tabs

---

### Sesión 5 — Plan de estudios y Topics
**Prompt:** "Implementa el módulo de plan de estudios. El docente puede asignar un plan a un estudiante. El plan tiene unidades y cada unidad tiene topics con contenido HTML y preguntas de opción múltiple. El estudiante puede leer el topic y responder las preguntas, guardando progreso en `topic_questions`."

---

### Sesión 6 — Tareas
**Prompt:** "Construye el módulo de tareas. El docente crea tareas para estudiantes individuales o grupos con título, descripción, fecha límite. El estudiante las ve en su portal, puede responder con texto libre, adjuntar imágenes o audio. El docente da feedback escrito. Implementa notificaciones de badge cuando hay feedback nuevo."

---

### Sesión 7 — Quizzes diarios
**Prompt:** "Implementa el módulo de quizzes. El docente crea quizzes con preguntas de opción múltiple asignados a una fecha. El estudiante hace el quiz del día desde su home. Los resultados se guardan y el docente puede ver el historial de scores."

---

### Sesión 8 — Gestión de clases y calendario
**Prompt:** "Implementa el módulo de clases (class_sessions). El docente ve el calendario de sus sesiones. Puede marcar una clase como tomada, no-show, cancelada. Si cae en festivo colombiano o se cancela, se genera un evento de 'reagendar'. Los ciclos (`cycles`) tienen un mínimo de clases; si no se cumple, el sistema alerta."

---

### Sesión 9 — Recursos y mensajes
**Prompt:** "Implementa el módulo de recursos (links, PDFs, videos) que el docente puede subir globalmente o asignar a un estudiante. Implementa el chat interno entre docente y estudiante con badge de mensajes no leídos. Usa Supabase Realtime para que los mensajes lleguen en tiempo real."

---

### Sesión 10 — Vista Admin y pulido final
**Prompt:** "Construye el panel de admin: lista de todos los docentes y estudiantes, alertas del sistema, métricas básicas (clases tomadas este mes, tareas pendientes, quizzes completados). Agrega el toggle de dark/light mode global. Prueba el flujo completo de punta a punta con los datos del seed."

---

### Sesión 11 — Deploy
**Prompt:** "Configura el deploy de Tutory. Frontend en Vercel: conecta el repo de GitHub, configura las env vars de Supabase. Aplica las migraciones de Supabase Cloud. Configura GitHub Actions para correr los tests en cada PR. Documenta los pasos en README.md."

---

## Lo que NO puede hacer Claude (pendientes manuales)

1. **Crear el proyecto en Supabase Cloud** — debes entrar a supabase.com, crear un proyecto y copiar las credenciales a `.env`
2. **Conectar el repo a Vercel** — debes autorizar Vercel con tu cuenta de GitHub
3. **Configurar dominio personalizado** — requiere acceso a tu registrador de DNS (ej. Namecheap, Cloudflare)
4. **Integrar Zoom** — necesita credenciales OAuth de la Zoom Marketplace app (se puede hacer en sesión futura)
5. **Configurar storage de archivos** — Supabase Storage necesita ser activado manualmente en el dashboard
6. **Pasarela de pagos** — si en el futuro quieren cobrar directamente desde Tutory (Stripe, PayU, etc.)
7. **Subir las credenciales al repo** — nunca commitear el `.env` real, solo `.env.example`

---

## Convenciones del código

- TypeScript strict mode activado
- Componentes: PascalCase, un componente por archivo
- Hooks propios en `src/hooks/use*.ts`
- Llamadas a Supabase solo dentro de hooks o server actions, nunca en el render
- Estilos: Tailwind utility classes, sin CSS modules ni styled-components
- Nombrar ramas: `feature/<nombre>`, `fix/<nombre>`
- Commits en inglés, presente imperativo: "Add teacher dashboard", "Fix quiz submission"
