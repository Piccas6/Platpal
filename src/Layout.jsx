
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, MapPin, UtensilsCrossed, HelpCircle, User, ChefHat, Target, UserCircle, Settings, UserCheck, BarChart3, Gift, Bug, Building2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navigationItems = [
  { title: "Inicio", url: createPageUrl("Home"), icon: Home },
  { title: "Campus", url: createPageUrl("Campus"), icon: MapPin },
  { title: "Menús", url: createPageUrl("Menus"), icon: UtensilsCrossed },
  { title: "Bonos", url: createPageUrl("Bonos"), icon: Gift },
  { title: "Impacto", url: createPageUrl("Impact"), icon: Target },
  { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
];

const analyticsNav = [
    { title: "Analíticas", url: createPageUrl("AnalyticsDashboard"), icon: BarChart3 }
];

const managerNav = [
    { title: "Mi Dashboard", url: createPageUrl("ManagerDashboard"), icon: UserCheck }
];

const cafeteriaNav = [
    { title: "Mi Panel", url: createPageUrl("CafeteriaDashboard"), icon: ChefHat }
];

const adminNav = [
    { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: Settings },
    { title: "Crear Cafetería", url: createPageUrl("CrearCafeteria"), icon: Plus },
    { title: "Aprobar Cafeterías", url: createPageUrl("AdminCafeteriaApproval"), icon: Building2 }
];

const debugNav = [
    { title: "🔧 Diagnóstico", url: createPageUrl("SystemCheck"), icon: Bug }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({
    app_role: 'user', 
    full_name: 'Estudiante',
    email: null
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [testRole, setTestRole] = useState(null);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('platpal_language') || 'es';
  });
  const [pageVisibility, setPageVisibility] = useState({
    systemCheck: false
  });

  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        if (!user.app_role) {
          await base44.auth.updateMe({ app_role: 'user' });
          user.app_role = 'user';
        }
        setCurrentUser(user);
        setIsLoggedIn(true);

        // FIXED: Nueva lógica de redirección al onboarding
        // Solo redirigir si:
        // 1. Es rol cafeteria
        // 2. NO ha completado onboarding
        // 3. NO tiene cafeterías asignadas
        // 4. NO está ya en la página de onboarding
        if (
          user.app_role === 'cafeteria' && 
          !user.onboarding_completado &&
          (!user.cafeterias_asignadas || user.cafeterias_asignadas.length === 0) &&
          location.pathname !== createPageUrl("CafeteriaOnboarding")
        ) {
          console.log('🔄 Redirigiendo a onboarding - usuario sin cafeterías');
          setShouldRedirectToOnboarding(true);
        }
      } catch (error) {
        setCurrentUser({ 
          app_role: 'user', 
          full_name: 'Estudiante',
          email: null
        });
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }, [location.pathname]);

  // Fetch page visibility settings solo una vez, no en cada cambio de ruta
  useEffect(() => {
    const fetchPageVisibility = async () => {
      try {
        const cached = sessionStorage.getItem('platpal_page_visibility');
        if (cached) {
          setPageVisibility(JSON.parse(cached));
          return;
        }

        const settings = await base44.entities.AppSettings.list();
        const visibilitySetting = settings.find(s => s.setting_key === 'page_visibility');
        const visibility = {
          systemCheck: visibilitySetting?.setting_value?.systemCheck || false
        };
        
        setPageVisibility(visibility);
        sessionStorage.setItem('platpal_page_visibility', JSON.stringify(visibility));
      } catch (error) {
        if (!error.message?.includes('Rate limit')) {
          console.error('Error fetching page visibility:', error);
        }
        setPageVisibility({ systemCheck: false });
      }
    };
    fetchPageVisibility();
  }, []);

  useEffect(() => {
    localStorage.setItem('platpal_language', language);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
  }, [language]);

  useEffect(() => {
    if (shouldRedirectToOnboarding) {
      window.location.href = createPageUrl("CafeteriaOnboarding");
      setShouldRedirectToOnboarding(false);
    }
  }, [shouldRedirectToOnboarding]);

  const handleLogin = async () => {
    try {
      await base44.auth.redirectToLogin();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser({ 
      app_role: 'user', 
      full_name: 'Estudiante',
      email: null
    });
    setIsLoggedIn(false);
    setTestRole(null);
  };
  
  const effectiveRole = testRole || currentUser?.app_role || 'user';

  const visibleDebugNav = debugNav.filter(item => {
    if (item.title === "🔧 Diagnóstico" && !pageVisibility.systemCheck) return false;
    return true;
  });

  return (
    <SidebarProvider>
      <style>{`
          :root {
            --primary-green: #10B981; --primary-green-hover: #059669;
            --primary-orange: #F59E0B; --primary-orange-hover: #D97706;
            --neutral-50: #F9FAFB; --neutral-100: #F3F4F6;
            --neutral-200: #E5E7EB; --neutral-600: #4B5563;
            --neutral-800: #1F2937; --neutral-900: #111827;
          }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <Sidebar className="border-r border-gray-100/80 backdrop-blur-xl bg-white/90">
          <SidebarHeader className="border-b border-gray-100/50 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-10 h-10 relative flex-shrink-0">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                  alt="PlatPal Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">PlatPal</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Menús sostenibles</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-emerald-50 text-emerald-700 shadow-sm' : ''}`}>
                        <Link 
                          to={item.url} 
                          className="flex items-center gap-4 px-4 py-3"
                          onClick={() => {
                            if (item.title === "Menús") {
                              localStorage.removeItem('selectedCampus');
                            }
                          }}
                        >
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  {isLoggedIn && (effectiveRole === 'manager' || effectiveRole === 'admin') && managerNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-teal-50 hover:text-teal-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-teal-50 text-teal-700 shadow-sm' : ''}`}>
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3"><item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {isLoggedIn && (effectiveRole === 'manager' || effectiveRole === 'admin') && analyticsNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : ''}`}>
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3"><item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  {isLoggedIn && (effectiveRole === 'cafeteria' || effectiveRole === 'admin') && cafeteriaNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-emerald-50 text-emerald-700 shadow-sm' : ''}`}>
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3"><item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {isLoggedIn && effectiveRole === 'admin' && adminNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-purple-50 text-purple-700 shadow-sm' : ''}`}>
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3"><item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {isLoggedIn && visibleDebugNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={`group hover:bg-pink-50 hover:text-pink-700 transition-all duration-300 rounded-2xl mb-2 text-gray-700 font-medium ${location.pathname === item.url ? 'bg-pink-50 text-pink-700 shadow-sm' : ''}`}>
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3"><item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100/50 p-4 space-y-4 mt-auto">
            <div className="px-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full h-8 text-xs border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoggedIn && (currentUser?.app_role === 'admin') && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => setTestRole('user')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${effectiveRole === 'user' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:bg-gray-200'}`}><User className="w-3 h-3" />Est.</button>
                    <button onClick={() => setTestRole('manager')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${effectiveRole === 'manager' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:bg-gray-200'}`}><UserCheck className="w-3 h-3" />Man.</button>
                    <button onClick={() => setTestRole('cafeteria')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${effectiveRole === 'cafeteria' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:bg-gray-200'}`}><ChefHat className="w-3 h-3" />Caf.</button>
                    <button onClick={() => setTestRole('admin')} className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1 ${effectiveRole === 'admin' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:bg-gray-200'}`}><Settings className="w-3 h-3" />Admin</button>
                </div>
            )}
            
            {isLoggedIn ? (
              <div>
                <Link to={createPageUrl("Profile")} className="block p-2 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"><span className="text-white font-medium text-sm">{currentUser?.full_name?.[0] || 'U'}</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{currentUser?.full_name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{effectiveRole.replace('_', ' ')}</p>
                    </div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="w-full text-left text-sm text-gray-600 hover:text-gray-800 transition-colors mt-2 px-2">Cerrar sesión</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-emerald-700" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-emerald-900 text-sm">Navegando como Estudiante</p>
                      <p className="text-xs text-emerald-700">Inicia sesión para reservar</p>
                    </div>
                  </div>
                </div>
                <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3 px-4 font-semibold transition-colors duration-200">Iniciar Sesión</button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4 md:hidden sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative flex-shrink-0">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                    alt="PlatPal Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">PlatPal</h2>
              </div>
              <div className="flex items-center gap-3">
                <SidebarTrigger className="!w-10 !h-10 !bg-gradient-to-br !from-emerald-500 !to-emerald-600 !rounded-2xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !flex !items-center !justify-center group hover:!scale-105 !text-white !border-none" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {React.cloneElement(children, { testRole: testRole, user: currentUser, isLoggedIn: isLoggedIn })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
