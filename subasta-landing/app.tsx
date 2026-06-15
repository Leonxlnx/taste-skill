'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

/**
 * BRIEF INFERENCE (taste-skill Section 0)
 * Reading this as: B2C financial services landing for price-conscious leads,
 * with trust-first + conversion-focused language, leaning toward
 * Tailwind v4 utilities + Motion micro-interactions + professional-premium aesthetic.
 *
 * DIALS (taste-skill Section 1)
 * DESIGN_VARIANCE: 7 - offset professional, controlled asymmetry
 * MOTION_INTENSITY: 5 - fluid micro-interactions, not cinematic
 * VISUAL_DENSITY: 3 - airy, breathing space, premium feel
 */

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2D5016] to-[#5FA55D] rounded-lg"></div>
            <span className="font-bold text-lg text-gray-900">SubastaFácil</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cómo funciona</button>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Preguntas</button>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Testimonios</button>
          </div>
          <button className="px-6 py-2 bg-[#D4E157] text-gray-900 font-semibold rounded-lg hover:bg-[#C5D845] transition-all duration-200 text-sm">
            Contacta
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-6 bg-[#D4E157]/10 px-4 py-2 rounded-full border border-[#D4E157]/30">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5FA55D]">
                  15 min • Videollamada gratuita
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                La propiedad que encontraste
                <span className="block text-[#5FA55D]">es más que un precio</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-gray-600 mb-8 max-w-[520px] leading-relaxed">
                Descubre por qué es una oportunidad real. Nuestros expertos analizarán tu propiedad específica en una llamada personalizada. Sin costos ocultos. Sin sorpresas.
              </p>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#D4E157] text-gray-900 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mb-8"
              >
                Reservar videollamada
              </motion.button>

              {/* Meta Stats */}
              <div className="flex gap-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">21K+</div>
                  <div className="text-sm text-gray-600">Propiedades</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Años</div>
                </div>
              </div>
            </motion.div>

            {/* Visual Asset */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[500px] hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016] via-[#5FA55D] to-[#7FC97D] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <svg className="w-full h-full opacity-10" viewBox="0 0 400 500" preserveAspectRatio="none">
                  <path d="M0,250 Q100,200 200,250 T400,250" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M0,300 Q100,250 200,300 T400,300" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M0,350 Q100,300 200,350 T400,350" stroke="white" strokeWidth="2" fill="none" />
                </svg>
                <div className="absolute bottom-0 right-0 text-white/80 text-center pb-8">
                  <div className="text-4xl">🏠</div>
                  <p className="text-sm mt-2">Tu oportunidad</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative gradient blur */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4E157]/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            ¿Por qué la mayoría pierde oportunidades?
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl">
            No es porque no sean buenas decisiones. Es por actuar sin información correcta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Dudas legales",
                description: "¿Costos ocultos? ¿Procesos? ¿Regulaciones?",
                icon: "⚖️"
              },
              {
                title: "Falta de asesoramiento",
                description: "Actúan solos sin saber los riesgos fiscales o legales.",
                icon: "📋"
              },
              {
                title: "Miedo a perder dinero",
                description: "No saben si es ganga real o si hay problemas ocultos.",
                icon: "⚠️"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-[#5FA55D]/30 transition-colors"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Nosotros hacemos diferente
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl">
            Te guiamos en cada paso para que tomes decisiones con confianza.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {[
                { title: "Análisis de tu propiedad", desc: "Sabrás si es oportunidad real o hay factores ocultos" },
                { title: "Proyección de rentabilidad", desc: "Cálculos reales de cuánto podrías ganar" },
                { title: "Plan paso a paso", desc: "Exactamente qué hacer desde ahora hasta tener la propiedad" },
                { title: "Protección legal", desc: "Equipo de abogados protegiendo tu inversión" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#D4E157]">
                      <span className="text-gray-900 font-bold">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-[#2D5016]/5 to-[#5FA55D]/10 rounded-2xl p-12 flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tu equipo dedicado</h3>
                <p className="text-gray-600">Abogado • Asesor fiscal • Gestor especializado</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#2D5016]/5 to-[#5FA55D]/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Qué ganas en 15 minutos
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl">
            Una videollamada que puede cambiar tu situación financiera.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔍", title: "Análisis profundo", desc: "Tu propiedad específica evaluada por expertos" },
              { icon: "💰", title: "Proyección real", desc: "Cuánto puedes ganar y cuál es el mejor plan" },
              { icon: "📋", title: "Hoja de ruta", desc: "Pasos claros desde hoy hasta tener la propiedad" },
              { icon: "🛡️", title: "Protección total", desc: "Cómo estás protegido legalmente en cada paso" },
              { icon: "👥", title: "Tu equipo", desc: "Conocerás quién será tu abogado y asesor" },
              { icon: "✨", title: "Sin compromiso", desc: "Es una consulta. Tú decides después" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white p-8 rounded-xl border border-gray-200"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Números que hablan
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl">
            Más de 15 años ganando la confianza de inversores.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { num: "21,000+", label: "Propiedades exitosas" },
              { num: "15+", label: "Años en el mercado" },
              { num: "98%", label: "Satisfacción de clientes" },
              { num: "4.8★", label: "Calificación promedio" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-[#5FA55D] mb-2">{stat.num}</div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Encontré una propiedad barata pero no sabía cómo empezar. El equipo me explicó todo en una llamada. Hoy tengo una propiedad rentando.",
                author: "Carlos M.",
                role: "Inversor, Madrid"
              },
              {
                quote: "Tenía miedo de todas las complejidades legales. Su abogado disipó cada duda. El proceso fue transparente y rápido.",
                author: "María L.",
                role: "Primera inversión, Barcelona"
              },
              {
                quote: "Sus asesoradores me salvaron de cometer un error. Parecía increíble pero había problemas ocultos. Con ellos encontré mejor oportunidad.",
                author: "Juan P.",
                role: "Inversor experimentado, Valencia"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl border-l-4 border-[#D4E157]"
              >
                <div className="text-[#D4E157] mb-4">★★★★★</div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            El proceso es simple
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-xl">
            Desde ahora hasta tener tu propiedad: 4 pasos claros.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: "Videollamada", desc: "15 minutos con experto analizando TU propiedad" },
              { num: 2, title: "Plan personalizado", desc: "Análisis escrito con costos, fiscalidad y estrategia" },
              { num: 3, title: "Acompañamiento", desc: "Equipo se encarga de toda la documentación legal" },
              { num: 4, title: "Propiedad tuya", desc: "Transferencia completa. Eres dueño sin dudas" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#D4E157] text-gray-900 font-bold text-xl flex items-center justify-center mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-[#D4E157] to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Resolvemos tus dudas antes de la llamada.
          </p>

          <div className="space-y-4">
            {[
              {
                q: "¿Cuánto cuesta la videollamada?",
                a: "Es totalmente gratuita. Sin costos, sin compromisos, sin obligación."
              },
              {
                q: "¿Cuánto tiempo tarda desde la llamada hasta tener la propiedad?",
                a: "Típicamente 2-4 meses. En la llamada te explicamos la timeline exacta para tu propiedad."
              },
              {
                q: "¿Qué pasa si decido no continuar después?",
                a: "Absolutamente nada. Es una consulta. Tendrás la información que necesitas con nosotros o sin nosotros."
              },
              {
                q: "¿Cuáles son los costos reales?",
                a: "Varían según la propiedad, pero incluyen aranceles judiciales, gastos legales y fiscales. Te damos el desglose completo."
              },
              {
                q: "¿Qué pasa si no gano la subasta?",
                a: "Te ayudamos a identificar la SIGUIENTE oportunidad. Acceso a catálogo exclusivo de propiedades."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="border border-gray-200 rounded-lg overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-left">{item.q}</span>
                  <span className="text-[#5FA55D] font-bold text-xl ml-4">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4 bg-gray-50 text-gray-600"
                  >
                    {item.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#2D5016] to-[#1a3a0d] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            No esperes a que se la compre otro
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
          >
            Las oportunidades reales en subastas tienen tiempo limitado. Asegúrate ahora con una consulta gratuita.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-[#D4E157] text-gray-900 font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-200 mb-6"
          >
            Reservar mi videollamada
          </motion.button>

          <p className="text-sm text-green-200">
            ✓ Gratuita • ✓ Sin compromiso • ✓ Respuesta en 24 horas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 pb-8 border-t border-gray-800">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#D4E157] rounded-lg"></div>
                <span className="font-bold text-white">SubastaFácil</span>
              </div>
              <p className="text-sm">Acompañamiento en subastas judiciales desde 2009.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition">Términos y condiciones</a>
              <a href="#" className="hover:text-white transition">Política de privacidad</a>
              <a href="#" className="hover:text-white transition">Contacto</a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">
            © 2024 SubastaFácil. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
