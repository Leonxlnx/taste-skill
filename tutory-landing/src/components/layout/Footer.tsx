export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-sora font-bold text-text-base/90 tracking-tight">Tutory</span>
        <p className="font-dm-sans text-sm text-text-base/40">
          {new Date().getFullYear()} Tutory. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="font-dm-sans text-sm text-text-base/50 hover:text-text-base/80 transition-colors">
            Privacidad
          </a>
          <a href="#" className="font-dm-sans text-sm text-text-base/50 hover:text-text-base/80 transition-colors">
            Terminos
          </a>
        </div>
      </div>
    </footer>
  )
}
