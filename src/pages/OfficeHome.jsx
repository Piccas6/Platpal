import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OfficeChatWidget from "@/components/office/OfficeChatWidget";
import { 
  ArrowRight, 
  Building2,
  Clock,
  Truck,
  CheckCircle,
  Package,
  Euro,
  Leaf,
  BarChart3,
  Users,
  Zap,
  Shield,
  TrendingUp,
  X
} from "lucide-react";

export default function OfficeHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              <Leaf className="w-4 h-4" />
              Sostenibilidad empresarial real
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
            Menús sostenibles para tu equipo
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4 font-light">
            Sin logística. Sin complicaciones.
          </p>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Conectamos tu oficina con cafeterías locales que preparan comida de calidad. 
            Tú eliges cuándo y cómo la reciben. Nosotros nos encargamos del resto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a href="mailto:piccas.entrepreneurship@gmail.com?subject=Solicitud%20de%20prueba%20gratuita%20-%20PlatPal%20Oficinas">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all group">
                Solicitar prueba gratuita
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            
            <a href="https://wa.me/34624297636?text=Hola,%20quiero%20información%20sobre%20PlatPal%20Oficinas" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-7 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Hablar por WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Sin permanencia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Prueba sin compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Impacto medible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black mb-2">500+</div>
              <div className="text-blue-100">Menús servidos este mes</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">2.4 ton</div>
              <div className="text-blue-100">CO₂ evitadas</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">15+</div>
              <div className="text-blue-100">Empresas confían en nosotros</div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué es PlatPal Oficinas */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Alimentación corporativa reinventada
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-xl text-center">
              PlatPal Oficinas no es un catering. No es un comedor de empresa. 
              Es la forma más eficiente de dar de comer bien a tu equipo, sin asumir logística ni contratos rígidos.
            </p>
            
            <p className="text-lg">
              <strong>Conectamos empresas con cafeterías locales</strong> que ya preparan comida de calidad cada día. 
              En lugar de que esa comida se desperdicie por no venderse a tiempo, <strong>la recuperamos y la llevamos 
              a tu oficina en formato packs corporativos</strong>.
            </p>

            <div className="text-center py-8">
              <p className="text-2xl font-bold text-gray-900">
                Tu equipo come bien. Las cafeterías optimizan. El planeta respira.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600">Tres pasos simples para empezar</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-xl mx-auto">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Elige tu pack mensual</h3>
              <p className="text-gray-600 leading-relaxed">
                Decide cuántos menús necesitas al mes: 20, 50 o 100. Sin ataduras, sin permanencia.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-xl mx-auto">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recoge o recibe</h3>
              <p className="text-gray-600 leading-relaxed">
                Tu equipo puede recoger los menús en la cafetería más cercana o recibir la entrega vía Glovo. Tú decides.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mb-6 shadow-xl mx-auto">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Recibe tu informe de impacto</h3>
              <p className="text-gray-600 leading-relaxed">
                Cada mes: comidas recuperadas, CO₂ evitado, ahorro de agua. Sin esfuerzo, tu empresa suma impacto real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios clave */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              ¿Por qué PlatPal Oficinas?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-green-100 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sostenibilidad real</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cada menú que compras es una comida que no se desperdicia. Impacto medible, informes mensuales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Eficiencia operativa</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sin alta en Glovo, sin contratos con proveedores, sin gestión diaria. Todo automatizado desde tu dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Control total</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dashboard corporativo donde ves consumo, próximos pedidos, historial y facturas. Todo en un solo lugar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Apoyo local</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cada pack apoya a cafeterías de tu ciudad. Economía circular en acción.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Qué NO es */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Claridad ante todo
            </h2>
            <p className="text-xl text-gray-600">Esto NO es PlatPal Oficinas</p>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-gray-200 hover:border-red-200 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No es un catering tradicional</h4>
                  <p className="text-gray-600">
                    No cocinamos ni distribuimos. Conectamos empresas con cafeterías que ya tienen la comida lista.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-red-200 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No son sobras ni excedentes de baja calidad</h4>
                  <p className="text-gray-600">
                    Son menús completos, recién preparados, con los mismos estándares de cualquier restaurante. 
                    Simplemente, los recuperamos antes de que caduquen.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-red-200 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No requiere alta en plataformas de delivery</h4>
                  <p className="text-gray-600">
                    Si eliges recibir vía Glovo, nosotros gestionamos todo. Tú solo pagas el pack, sin dar de alta tu empresa en ningún sitio.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-red-200 transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">No es un servicio diario garantizado</h4>
                  <p className="text-gray-600">
                    Trabajamos con disponibilidad real de las cafeterías. Eso significa flexibilidad, no rigidez.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-green-900 mb-2">✅ Es una solución inteligente</h4>
                  <p className="text-green-800">
                    Para equipos que quieren comer bien, sin asumir logística ni compromisos pesados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inversión con retorno */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Inversión con retorno
            </h2>
          </div>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                PlatPal Estudiantes está pensado para volumen individual y alta rotación en campus universitarios. 
                Es un modelo masivo, con márgenes ajustados.
              </p>

              <p className="text-lg font-semibold text-gray-900 mb-4">
                PlatPal Oficinas opera de forma diferente:
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Entregas coordinadas a una misma ubicación',
                  'Gestión de packs corporativos (facturación, informes, dashboard)',
                  'Opcionalidad de envío a oficina vía Glovo',
                  'Servicio de atención y soporte empresarial',
                  'Informes de impacto personalizados para tu equipo'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white rounded-xl p-6 border-2 border-blue-300">
                <p className="text-xl font-bold text-gray-900 mb-3">
                  El valor no está solo en el menú. Está en liberarte de la gestión.
                </p>
                <p className="text-gray-700">
                  Comparado con un menú de catering tradicional (12-15€) o un vale comida (9-11€), 
                  <strong> PlatPal Oficinas es más eficiente, más sostenible y mucho más simple</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Opciones de entrega */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Flexibilidad en la última milla
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-blue-200 hover:shadow-2xl transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Opción 1: Recogida en cafetería</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Tu equipo recoge en la cafetería asociada más cercana, en horario de tarde. 
                  Sin esperas, sin costes adicionales.
                </p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sin coste adicional</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Opción 2: Entrega vía Glovo</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nosotros coordinamos la entrega con Glovo. Tú no te das de alta, no gestionas nada. Solo recibes.
                </p>
                <p className="text-sm text-gray-500 italic">
                  *Coste de envío variable según ubicación y volumen. Te informamos antes de confirmar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impacto medible */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Sostenibilidad que se ve
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Tu informe mensual incluye:</h4>
                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle, text: 'Comidas recuperadas', color: 'text-green-600' },
                      { icon: Leaf, text: 'Toneladas de CO₂ evitadas', color: 'text-green-600' },
                      { icon: TrendingUp, text: 'Litros de agua ahorrados', color: 'text-blue-600' },
                      { icon: Users, text: 'Cafeterías locales apoyadas', color: 'text-orange-600' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900 mb-6">
                Sin esfuerzo, tu equipo suma.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Datos reales para compartir en newsletters, redes sociales o informes de sostenibilidad corporativa.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-gray-700 leading-relaxed italic">
                  "Cada mes recibimos nuestro informe de impacto. Es perfecto para nuestras comunicaciones 
                  de responsabilidad social y a nuestro equipo le encanta ver el impacto real que generamos."
                </p>
                <p className="text-sm text-gray-600 mt-3">— Startup Tech, Madrid</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Casos de uso */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Ideal para
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-100 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Startups y equipos remotos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Vuestro equipo no está todos los días en la oficina, pero cuando viene, queréis darles algo bueno. 
                  PlatPal se adapta a vuestra flexibilidad.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Coworkings y espacios compartidos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ofrecer comida de calidad a tus coworkers sin asumir logística ni stock. 
                  Solo compras lo que necesitas, cuando lo necesitas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pymes con conciencia ESG</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cada pack es un impacto real en vuestros objetivos de sostenibilidad. 
                  Sin greenwashing, con datos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Empieza en 5 minutos
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Dinos cuántos menús necesitas al mes y tu ubicación. Te montamos una prueba piloto sin compromiso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:piccas.entrepreneurship@gmail.com?subject=Solicitud%20de%20prueba%20gratuita%20-%20PlatPal%20Oficinas">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-12 py-7 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all">
                Solicitar prueba gratuita
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </a>
            
            <a href="https://wa.me/34624297636?text=Hola,%20quiero%20información%20sobre%20PlatPal%20Oficinas" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-7 rounded-full text-lg font-semibold">
                Hablar con el equipo
              </Button>
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Pago seguro con Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>Informes mensuales</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Soporte directo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Volver a estudiantes */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 font-medium">
            ← Volver a PlatPal Estudiantes
          </Link>
        </div>
      </section>

      {/* Chat Widget */}
      <OfficeChatWidget />
    </div>
  );
}