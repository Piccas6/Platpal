import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  ArrowRight, 
  UtensilsCrossed,
  Wallet,
  Sparkles,
  PartyPopper,
  Users,
  Leaf,
  ChevronRight,
  LogIn,
  Lock,
  Download,
  Search,
  CreditCard,
  CheckCircle2,
  ChefHat
} from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('es');
  const [displayMenus, setDisplayMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalStudents: 0,
    co2Saved: 0
  });

  const texts = {
    es: {
      hero: {
        title: "Come increíble por solo 2,99€",
        subtitle: "Rescata deliciosos menús de las cafeterías de tu campus antes de que se desperdicien.",
        cta: "Ver menús disponibles",
        cafeteriaLogin: "Acceso Cafeterías",
        investorLink: "¿Eres inversor? Descubre nuestro potencial"
      },
      stats: {
        meals: "Menús salvados",
        students: "Estudiantes activos",
        impact: "Kg CO₂ evitados",
        impactLabel: "Impacto en tiempo real"
      },
      howItWorks: {
        title: "Cómo funciona",
        step1: {
          title: "Elige tu menú",
          desc: "Explora los menús disponibles del día."
        },
        step2: {
          title: "Reserva y paga",
          desc: "Pago rápido y seguro online."
        },
        step3: {
          title: "Recoge y disfruta",
          desc: "Muestra tu código en la cafetería."
        }
      },
      featured: {
        title: "Menús disponibles hoy",
        subtitle: "Platos deliciosos esperándote cada día",
        noMenus: "No hay menús disponibles hoy",
        noMenusDesc: "¡Vuelve mañana para ver nuevas ofertas!"
      },
      why: {
        title: "¿Por qué PlatPal?",
        benefit1: {
          title: "Ahorra dinero",
          desc: "Comida de calidad a precio único."
        },
        benefit2: {
          title: "Platos nuevos",
          desc: "Varía tu rutina cada día."
        },
        benefit3: {
          title: "Ayuda al planeta",
          desc: "Cada menú cuenta para el medio ambiente."
        }
      },
      ctaEnd: {
        title: "¿Listo para empezar?",
        subtitle: "Únete a la comunidad de estudiantes que comen bien y ayudan al planeta.",
        cta: "Explorar menús"
      },
      footer: {
        description: "Menús sostenibles para estudiantes",
        links: "Enlaces",
        campus: "Campus",
        community: "Comunidad", 
        impact: "Impacto",
        support: "Soporte",
        faq: "FAQ",
        contact: "Contacto",
        privacy: "Privacidad", 
        terms: "Términos",     
        message: "Tu elección importa",
        messageDesc: "Al elegir PlatPal, no solo ahorras dinero en comida deliciosa, sino que también contribuyes a reducir el desperdicio alimentario y apoyas a organizaciones benéficas locales.",
        rights: "Todos los derechos reservados"
      }
    },
    en: {
      hero: {
        title: "Eat amazing for just €2.99",
        subtitle: "Rescue delicious meals from your campus cafeterias before they're wasted.",
        cta: "See available menus",
        cafeteriaLogin: "Cafeteria Access",
        investorLink: "Are you an investor? Discover our potential"
      },
      stats: {
        meals: "Meals saved",
        students: "Active students",
        impact: "Kg CO₂ avoided",
        impactLabel: "Real-time impact"
      },
      howItWorks: {
        title: "How it works",
        step1: {
          title: "Choose your meal",
          desc: "Explore today's available menus."
        },
        step2: {
          title: "Reserve & pay",
          desc: "Quick and secure online payment."
        },
        step3: {
          title: "Pick up & enjoy",
          desc: "Show your code at the cafeteria."
        }
      },
      featured: {
        title: "Available today",
        subtitle: "Delicious dishes waiting for you every day",
        noMenus: "No menus available today",
        noMenusDesc: "Come back tomorrow for new offers!"
      },
      why: {
        title: "Why PlatPal?",
        benefit1: {
          title: "Save money",
          desc: "Quality food at a fixed price."
        },
        benefit2: {
          title: "New dishes",
          desc: "Change your routine every day."
        },
        benefit3: {
          title: "Help the planet",
          desc: "Every meal counts for the environment."
        }
      },
      ctaEnd: {
        title: "Ready to start?",
        subtitle: "Join the community of students eating well and helping the planet.",
        cta: "Explore menus"
      },
      footer: {
        description: "Sustainable meals for students",
        links: "Links",
        campus: "Campus",
        community: "Community", 
        impact: "Impact",
        support: "Support",
        faq: "FAQ",
        contact: "Contact",
        privacy: "Privacy Policy", 
        terms: "Terms of Service", 
        message: "Your choice matters",
        messageDesc: "By choosing PlatPal, you not only save money on delicious food, but also contribute to reducing food waste and support local charities.",
        rights: "All rights reserved"
      }
    }
  };

  const t = texts[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('platpal_language') || 'es';
    setLanguage(savedLanguage);

    const handleLanguageChange = (e) => {
      setLanguage(e.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

        // Estadísticas fijas (públicas sin restricciones de permisos)
        const newStats = {
          totalMeals: 53,
          totalStudents: 42,
          co2Saved: 168
        };

        console.log('📊 Estadísticas actualizadas:', newStats);
        setStats(newStats);

        // Cargar menús destacados (entidad pública)
        const allMenus = await base44.entities.Menu.list('-created_date', 50);
        const todaysMenus = allMenus.filter(menu => 
          menu.fecha === today && 
          menu.stock_disponible > 0 && 
          menu.imagen_url
        );

        const shuffled = todaysMenus.sort(() => 0.5 - Math.random());
        setDisplayMenus(shuffled.slice(0, 3));

      } catch (error) {
        console.log('📊 Error cargando datos:', error.message);
        setDisplayMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Actualizar automáticamente cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCafeteriaLogin = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (isAuthenticated) {
        const user = await base44.auth.me();
        
        if (user.app_role === 'cafeteria' || user.app_role === 'admin' || user.app_role === 'manager') {
          navigate(createPageUrl("CafeteriaDashboard"));
        } else {
          alert('No tienes permisos para acceder al panel de cafeterías. Si eres administrador de una cafetería, contacta con soporte.');
        }
      } else {
        await base44.auth.redirectToLogin(window.location.pathname);
      }
    } catch (error) {
      console.error('Error en acceso cafeterías:', error);
      await base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  useEffect(() => {
    document.title = "PlatPal - Menús Sostenibles desde 2,99€ | Ahorra y Ayuda al Planeta";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <AuroraBackground className="absolute inset-0" showRadialGradient={true} />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center"
        >
          {/* Logo */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-2xl sm:rounded-[20px] p-3 sm:p-5 border border-gray-200 flex items-center justify-center hover:border-emerald-300 transition-colors duration-300">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                  alt="PlatPal Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Título y subtítulo */}
          <div className="mb-8 sm:mb-10 space-y-3 sm:space-y-4 px-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>
          
          {/* Selector de Vertical */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
            <Button 
              variant="outline"
              className="bg-emerald-50 border-2 border-emerald-600 text-emerald-700 font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base"
            >
              👨‍🎓 Para Estudiantes
            </Button>
            <OfficeAccessButton />
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center items-center px-4">
            <Link to={createPageUrl("Menus")} className="w-full sm:w-auto">
              <ButtonColorful label={t.hero.cta} icon={ArrowRight} />
            </Link>
          </div>

          {/* Investor Link & Cafeteria Access */}
          <div className="mt-4 sm:mt-6 px-4 flex flex-col items-center gap-3">
            <button
              onClick={handleCafeteriaLogin}
              className="text-sm text-gray-600 hover:text-emerald-600 transition-colors inline-flex items-center gap-2 group font-medium"
            >
              <ChefHat className="w-4 h-4" />
              <span className="border-b border-transparent group-hover:border-emerald-600 transition-all">{t.hero.cafeteriaLogin}</span>
            </button>
            <Link to={createPageUrl("InvestorForm")} className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 group">
              <span className="border-b border-transparent group-hover:border-gray-700 transition-all text-center">
                {t.hero.investorLink}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-20 md:mt-24">
            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 font-semibold uppercase tracking-wider">
              {t.stats.impactLabel}
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-2">
              {/* Stat 1 - Menús */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-white rounded-xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <UtensilsCrossed className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {isLoading ? (
                    <OrbitalLoader className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <>
                      <div className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                        {stats.totalMeals}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-600 font-medium">{t.stats.meals}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Stat 2 - Estudiantes */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-white rounded-xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {isLoading ? (
                    <OrbitalLoader className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <>
                      <div className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                        {stats.totalStudents}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-600 font-medium">{t.stats.students}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Stat 3 - CO2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-white rounded-xl sm:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {isLoading ? (
                    <OrbitalLoader className="w-6 h-6 sm:w-8 sm:h-8" />
                  ) : (
                    <>
                      <div className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                        {stats.co2Saved}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-600 font-medium">{t.stats.impact}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="relative py-12 sm:py-20 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-emerald-100 to-amber-100 rounded-full">
              <span className="text-sm font-bold text-emerald-700">Simple y Rápido</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              En 3 simples pasos, ahorra dinero y ayuda al planeta
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-amber-200 to-blue-200 opacity-30"></div>

            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative h-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-100 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl">
                    1
                  </div>
                </div>
                <div className="mt-8 sm:mt-12">
                  <div className="mb-4 flex justify-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-8 h-8 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 text-center">{t.howItWorks.step1.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">{t.howItWorks.step1.desc}</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative h-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-100 hover:border-amber-400 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl">
                    2
                  </div>
                </div>
                <div className="mt-8 sm:mt-12">
                  <div className="mb-4 flex justify-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 text-center">{t.howItWorks.step2.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">{t.howItWorks.step2.desc}</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative h-full bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-100 hover:border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl">
                    3
                  </div>
                </div>
                <div className="mt-8 sm:mt-12">
                  <div className="mb-4 flex justify-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 text-center">{t.howItWorks.step3.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">{t.howItWorks.step3.desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Menus */}
      <section className="relative py-12 sm:py-20 md:py-24 overflow-hidden">
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/80 to-white"></div>
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80" 
            alt="Delicious food"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-10 sm:mb-16">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">{t.featured.title}</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600">{t.featured.subtitle}</p>
            </div>
            
            {isLoading ? (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                {[1,2,3].map(i => (
                  <Card key={i} className="rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        <OrbitalLoader />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayMenus.length > 0 ? (
              <div className="grid gap-5 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {displayMenus.map((menu, i) => (
                      <Link key={i} to={createPageUrl("Menus")} className="block">
                        <Card className="group overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-emerald-300 hover:-translate-y-2 cursor-pointer">
                            <CardContent className="p-0">
                                <div className="aspect-[16/10] sm:aspect-[4/3] relative overflow-hidden">
                                    <img 
                                      src={menu.imagen_url}
                                      alt={menu.plato_principal}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all"></div>
                                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                      <div className="bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg group-hover:scale-110 transition-transform">
                                        -65%
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
                                        <h3 className="text-white text-base sm:text-lg md:text-xl font-bold mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">{menu.plato_principal}</h3>
                                        <p className="text-white/90 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                                          <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                          <span className="truncate">{menu.cafeteria}</span>
                                        </p>
                                        <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <span className="text-xs sm:text-sm font-semibold">Ver menú</span>
                                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                      </Link>
                  ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-2 border-dashed">
                <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.featured.noMenus}
                </h3>
                <p className="text-gray-600">
                  {t.featured.noMenusDesc}
                </p>
              </Card>
            )}
            
            {displayMenus.length > 0 && (
              <div className="text-center mt-8 sm:mt-12">
                <Link to={createPageUrl("Menus")}>
                  <Button size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 sm:px-10 py-5 sm:py-6 rounded-full text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all group">
                    Ver todos los menús
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.why.title}</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                <div className="p-8 md:p-10 text-center bg-gradient-to-br from-emerald-50 to-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Wallet className="w-8 h-8 md:w-10 md:h-10 text-white"/>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{t.why.benefit1.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{t.why.benefit1.desc}</p>
                </div>
                <div className="p-8 md:p-10 text-center bg-gradient-to-br from-amber-50 to-white rounded-3xl border-2 border-amber-100 hover:border-amber-300 hover:shadow-2xl transition-all duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <PartyPopper className="w-8 h-8 md:w-10 md:h-10 text-white"/>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{t.why.benefit2.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{t.why.benefit2.desc}</p>
                </div>
                <div className="p-8 md:p-10 text-center bg-gradient-to-br from-blue-50 to-white rounded-3xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 sm:col-span-2 md:col-span-1">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white"/>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{t.why.benefit3.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{t.why.benefit3.desc}</p>
                </div>
            </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-br from-emerald-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t.ctaEnd.title}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t.ctaEnd.subtitle}
          </p>
          <Link to={createPageUrl("Menus")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-50 px-10 sm:px-12 py-6 sm:py-7 rounded-full text-base sm:text-lg font-bold shadow-2xl hover:scale-105 transition-all">
              {t.ctaEnd.cta}
              <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                    alt="PlatPal" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold">PlatPal</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t.footer.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-base">{t.footer.links}</h4>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl("Menus")} className="block text-gray-400 hover:text-white transition-colors">{t.footer.campus}</Link>
                <Link to={createPageUrl("Impact")} className="block text-gray-400 hover:text-white transition-colors">{t.footer.impact}</Link>
                <Link to={createPageUrl("FAQ")} className="block text-gray-400 hover:text-white transition-colors">{t.footer.faq}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-base">{t.footer.support}</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:contacto@platpal.com" className="block text-gray-400 hover:text-white transition-colors">{t.footer.contact}</a>
                <Link to={createPageUrl("PrivacyPolicy")} className="block text-gray-400 hover:text-white transition-colors">{t.footer.privacy}</Link>
                <Link to={createPageUrl("TermsOfService")} className="block text-gray-400 hover:text-white transition-colors">{t.footer.terms}</Link>
              </div>
            </div>
            
            <NewsletterForm language={language} />
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} PlatPal. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente Office Access Button
function OfficeAccessButton() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleClick = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.app_role === 'admin') {
        navigate(createPageUrl("OfficeHome"));
      } else {
        alert('🚧 Esta sección está en construcción y pronto estará disponible. Por ahora solo accesible para administradores.');
      }
    } catch {
      alert('🚧 Esta sección está en construcción y pronto estará disponible.');
    }
  };

  // Solo mostrar si el usuario es admin
  if (user?.app_role !== 'admin') {
    return null;
  }

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      className="border-2 border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 font-semibold px-6 py-3 rounded-full transition-all"
    >
      🏢 Para Oficinas
    </Button>
  );
}

// Componente Newsletter
function NewsletterForm({ language }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const texts = {
    es: {
      title: 'Newsletter',
      description: 'Recibe las mejores ofertas',
      placeholder: 'tu@email.com',
      button: 'Suscribirme',
      success: '¡Suscrito correctamente!',
      error: 'Error al suscribirse',
      invalid: 'Email inválido'
    },
    en: {
      title: 'Newsletter',
      description: 'Get the best offers',
      placeholder: 'your@email.com',
      button: 'Subscribe',
      success: 'Subscribed successfully!',
      error: 'Error subscribing',
      invalid: 'Invalid email'
    }
  };

  const t = texts[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage(t.invalid);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await base44.entities.NewsletterSubscription.create({
        email,
        preferencias_idioma: language
      });
      
      setMessage(t.success);
      setEmail('');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setMessage(t.error);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="col-span-2 md:col-span-1">
      <h4 className="font-semibold mb-3 text-base">{t.title}</h4>
      <p className="text-gray-400 text-sm mb-3">
        {t.description}
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          disabled={isSubmitting}
        />
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm py-2"
        >
          {isSubmitting ? <OrbitalLoader className="w-4 h-4" /> : t.button}
        </Button>
        {message && (
          <p className={`text-xs mt-2 ${message.includes('Error') || message.includes('inválido') || message.includes('Invalid') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}