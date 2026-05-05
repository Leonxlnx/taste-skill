import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text-base font-dm-sans">
      <Navbar />
      <main>
        <Hero />
        {/* Sections: profesores, estudiantes, precios — to be added in later sessions */}
        <div id="profesores" />
        <div id="estudiantes" />
        <div id="precios" />
        <div id="registro" />
      </main>
      <Footer />
    </div>
  )
}
