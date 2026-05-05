import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

const AVATAR_SEEDS = ['prof1', 'prof2', 'prof3']

const mockStudents = [
  {
    name: 'Valentina Torres',
    initials: 'VT',
    nextClass: 'Hoy 3pm',
    task: 'Tarea pendiente',
  },
  {
    name: 'Carlos Mejia',
    initials: 'CM',
    nextClass: 'Mañana 10am',
    task: 'Entregada',
  },
  {
    name: 'Sofía Ramírez',
    initials: 'SR',
    nextClass: 'Jue 5pm',
    task: 'Sin tarea',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

function StudentRow({
  student,
  index,
}: {
  student: (typeof mockStudents)[number]
  index: number
}) {
  const taskColor =
    student.task === 'Tarea pendiente'
      ? 'bg-yellow-900/40 text-yellow-300/80 border border-yellow-700/30'
      : student.task === 'Entregada'
      ? 'bg-primary/10 text-primary/80 border border-primary/20'
      : 'bg-white/5 text-white/30 border border-white/10'

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
      className="flex items-center justify-between px-4 py-3 rounded-card bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-dark-green/60 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="font-sora text-[10px] font-semibold text-primary">
            {student.initials}
          </span>
        </div>
        <span className="font-dm-sans text-sm text-text-base/80">{student.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex text-[11px] font-dm-sans px-2 py-0.5 rounded-badge bg-primary/10 text-primary/80 border border-primary/20">
          {student.nextClass}
        </span>
        <span className={`text-[11px] font-dm-sans px-2 py-0.5 rounded-badge ${taskColor}`}>
          {student.task}
        </span>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Subtle radial glow — top-left */}
      <div
        className="fixed top-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(134,239,134,0.03) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* LEFT — 60% */}
          <div className="w-full lg:w-[60%] flex flex-col items-start">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6"
            >
              <span
                className="inline-block font-dm-sans text-xs font-medium px-3 py-1.5 rounded-badge text-primary/80"
                style={{ border: '1px solid rgba(134,239,134,0.2)' }}
              >
                Para profesores de ingles
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              custom={0.05}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-sora font-bold tracking-tight text-text-base mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.05 }}
            >
              El espacio de trabajo de tu academia de ingles
            </motion.h1>

            {/* Paragraph */}
            <motion.p
              custom={0.15}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-dm-sans text-lg text-text-base/60 mb-8 max-w-xl leading-relaxed"
            >
              Gestiona estudiantes, clases, tareas y quizzes desde un solo lugar. Tus alumnos avanzan. Tu controlas.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={0.22}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <a
                href="#registro"
                className="font-dm-sans font-semibold text-sm px-6 py-3 rounded-card bg-primary text-bg hover:opacity-90 active:scale-[0.98] transition-all duration-150"
              >
                Empieza gratis
              </a>
              <button className="font-dm-sans text-sm text-text-base/70 hover:text-text-base flex items-center gap-1.5 transition-colors duration-150 group">
                Ver como funciona
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform duration-150"
                />
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={0.3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                {AVATAR_SEEDS.map((seed) => (
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=166534`}
                    alt="Profesor"
                    width={34}
                    height={34}
                    className="w-[34px] h-[34px] rounded-full border-2 border-bg bg-dark-green/50 object-cover"
                  />
                ))}
              </div>
              <p className="font-dm-sans text-sm text-text-base/50">
                <span className="text-text-base/80 font-medium">47 profesores</span> ya lo usan
              </p>
            </motion.div>
          </div>

          {/* RIGHT — 40% — Faux OS window */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[40%] flex-shrink-0"
          >
            <div
              className="rounded-[12px] overflow-hidden"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* OS title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-white/15" />
                <span className="w-3 h-3 rounded-full bg-white/15" />
                <span className="w-3 h-3 rounded-full bg-white/15" />
                <span className="font-dm-sans text-xs text-white/25 ml-auto">
                  tutory.vercel.app
                </span>
              </div>

              {/* Dashboard content */}
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sora font-semibold text-sm text-text-base/90">
                    Mis estudiantes
                  </h3>
                  <span className="font-dm-sans text-[11px] text-primary/70 px-2 py-0.5 rounded-badge bg-primary/10 border border-primary/15">
                    3 activos
                  </span>
                </div>

                {/* Student rows */}
                <div className="flex flex-col gap-2">
                  {mockStudents.map((student, i) => (
                    <StudentRow key={student.name} student={student} index={i} />
                  ))}
                </div>

                {/* Bottom stat strip */}
                <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Clases hoy', value: '4' },
                    { label: 'Tareas pend.', value: '2' },
                    { label: 'Quizzes', value: '6' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="font-sora font-bold text-lg text-text-base/90">{stat.value}</p>
                      <p className="font-dm-sans text-[11px] text-text-base/35 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
