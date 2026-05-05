import { useEffect, useRef, useState } from 'react'
import { List, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'

const navLinks = [
  { label: 'Para profesores', href: '#profesores' },
  { label: 'Para estudiantes', href: '#estudiantes' },
  { label: 'Precios', href: '#precios' },
]

function smoothScroll(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 left-0 w-full h-1 pointer-events-none" />

      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-bg/90 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent',
        ].join(' ')}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="#"
            className="font-sora font-bold text-xl text-text-base tracking-tight select-none"
          >
            Tutory
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => smoothScroll(link.href)}
                  className="font-dm-sans text-sm text-text-base/70 hover:text-text-base transition-colors duration-200"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="#registro"
              className="font-dm-sans text-sm font-medium px-4 py-2 rounded-card bg-primary text-bg hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
              Empieza gratis
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-text-base/80 hover:text-text-base p-1"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg flex flex-col pt-16"
          >
            <div className="flex flex-col gap-1 px-6 pt-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    setMenuOpen(false)
                    smoothScroll(link.href)
                  }}
                  className="font-dm-sans text-lg text-text-base/80 hover:text-text-base py-3 text-left border-b border-white/5 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="#registro"
                onClick={() => setMenuOpen(false)}
                className="mt-6 font-dm-sans text-base font-medium px-5 py-3 rounded-card bg-primary text-bg text-center hover:opacity-90 active:scale-[0.98] transition-all duration-150"
              >
                Empieza gratis
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
