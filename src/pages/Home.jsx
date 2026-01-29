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
  Download
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
        
        // Cargar datos públicos (no requieren autenticación)
        const [allReservations, allUsers, allMenus] = await Promise.all([
          base44.entities.Reserva.list('-created_date', 500),
          base44.entities.User.list(),
          base44.entities.Menu.list('-created_date', 50)
        ]);

        const completedReservations = allReservations.filter(r => r.payment_status === 'completed');
        const students = allUsers.filter(u => u.app_role === 'user');
        const co2Saved = completedReservations.length * 2.5;

        const newStats = {
          totalMeals: completedReservations.length,
          totalStudents: students.length,
          co2Saved: Math.round(co2Saved)
        };

        console.log('📊 Estadísticas actualizadas:', newStats);

        setStats(newStats);

        // Cargar menús destacados
        const todaysMenus = allMenus.filter(menu => 
          menu.fecha === today && 
          menu.stock_disponible > 0 && 
          menu.imagen_url
        );

        const shuffled = todaysMenus.sort(() => 0.5 - Math.random());
        setDisplayMenus(shuffled.slice(0, 3));

      } catch (error) {
        console.log('📊 Error cargando estadísticas:', error.message);
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center"
        >
          {/* Logo minimalista */}
          <div className="mb-12 flex justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                alt="PlatPal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Título y subtítulo minimalista */}
          <div className="mb-16 space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto font-light">
              {t.hero.subtitle}
            </p>
          </div>
          
          {/* Selector de Vertical */}
          <div className="flex justify-center gap-3 mb-8">
            <Button 
              variant="outline"
              className="bg-emerald-50 border-2 border-emerald-600 text-emerald-700 font-semibold px-6 py-3 rounded-full"
            >
              👨‍🎓 Para Estudiantes
            </Button>
            <OfficeAccessButton />
          </div>

          {/* CTA Buttons minimalistas */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-8">
            <Link to={createPageUrl("Menus")}>
              <Button 
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-7 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t.hero.cta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button 
              onClick={handleCafeteriaLogin}
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-300 text-gray-700 hover:border-emerald-600 hover:text-emerald-600 px-12 py-7 rounded-full text-lg font-semibold transition-all"
            >
              <LogIn className="mr-2 w-5 h-5" />
              {t.hero.cafeteriaLogin}
            </Button>
          </div>

          {/* Investor Link */}
          <div className="mt-6">
            <Link to={createPageUrl("InvestorForm")} className="text-sm text-gray-600 hover:text-emerald-600 transition-colors inline-flex items-center gap-2 group">
              <span className="border-b border-transparent group-hover:border-emerald-600 transition-all">
                {t.hero.investorLink}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats minimalistas */}
          <div className="mt-24">
            <p className="text-sm text-gray-500 mb-10 font-medium uppercase tracking-wide">
              {t.stats.impactLabel}
            </p>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Stat 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                {isLoading ? (
                  <OrbitalLoader className="w-8 h-8" />
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.totalMeals}
                    </div>
                    <div className="text-sm text-gray-600">{t.stats.meals}</div>
                  </>
                )}
              </div>

              {/* Stat 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {isLoading ? (
                  <OrbitalLoader className="w-8 h-8" />
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.totalStudents}
                    </div>
                    <div className="text-sm text-gray-600">{t.stats.students}</div>
                  </>
                )}
              </div>

              {/* Stat 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                {isLoading ? (
                  <OrbitalLoader className="w-8 h-8" />
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.co2Saved}
                    </div>
                    <div className="text-sm text-gray-600">{t.stats.impact}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works - Minimalista */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900">
              {t.howItWorks.title}
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.howItWorks.step1.title}</h3>
              <p className="text-gray-600 text-lg">{t.howItWorks.step1.desc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.howItWorks.step2.title}</h3>
              <p className="text-gray-600 text-lg">{t.howItWorks.step2.desc}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.howItWorks.step3.title}</h3>
              <p className="text-gray-600 text-lg">{t.howItWorks.step3.desc}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Menus */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900 mb-4">{t.featured.title}</h2>
                <p className="text-xl text-gray-600">{t.featured.subtitle}</p>
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
              <div className="grid gap-8 md:grid-cols-3">
                  {displayMenus.map((menu, i) => (
                      <Card key={i} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200">
                          <CardContent className="p-0">
                              <div className="aspect-[3/2] relative overflow-hidden">
                                  <img 
                                    src={menu.imagen_url}
                                    alt={menu.plato_principal}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute top-4 right-4">
                                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-full font-semibold text-sm">
                                      -65%
                                    </div>
                                  </div>
                              </div>
                              <div className="p-6">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{menu.plato_principal}</h3>
                                  <p className="text-gray-600 text-sm flex items-center gap-2">
                                    <UtensilsCrossed className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{menu.cafeteria}</span>
                                  </p>
                              </div>
                          </CardContent>
                      </Card>
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
        </div>
      </section>

      {/* Why Section - Minimalista */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-20">
                <h2 className="text-5xl font-bold text-gray-900">{t.why.title}</h2>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-8 h-8 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{t.why.benefit1.title}</h3>
                    <p className="text-gray-600 text-lg">{t.why.benefit1.desc}</p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <PartyPopper className="w-8 h-8 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{t.why.benefit2.title}</h3>
                    <p className="text-gray-600 text-lg">{t.why.benefit2.desc}</p>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-white"/>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{t.why.benefit3.title}</h3>
                    <p className="text-gray-600 text-lg">{t.why.benefit3.desc}</p>
                </div>
            </div>
        </div>
      </section>
      
      {/* Final CTA - Minimalista */}
      <section className="py-28 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            {t.ctaEnd.title}
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-light">
            {t.ctaEnd.subtitle}
          </p>
          <Link to={createPageUrl("Menus")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-7 rounded-full text-lg font-semibold shadow-lg transition-all">
              {t.ctaEnd.cta}
              <ArrowRight className="ml-3 w-5 h-5" />
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

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      className="border-2 border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 font-semibold px-6 py-3 rounded-full transition-all relative"
    >
      🏢 Para Oficinas
      {user?.app_role !== 'admin' && (
        <Lock className="w-4 h-4 ml-2 text-gray-400" />
      )}
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