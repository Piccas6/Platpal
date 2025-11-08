import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Award, Sparkles, TrendingUp, Globe, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RankingLeaderboard from '../components/community/RankingLeaderboard';
import CommunityFeed from '../components/community/CommunityFeed';
import CreatePost from '../components/community/CreatePost';
import PersonalImpact from '../components/community/PersonalImpact';
import GlobalImpact from '../components/community/GlobalImpact';

export default function CommunityPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    activeMembers: 0,
    menusSaved: 0,
    co2Avoided: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }

      const [allUsers, allReservations] = await Promise.all([
        base44.entities.User.filter({ app_role: 'user' }),
        base44.entities.Reserva.list('-created_date')
      ]);

      const completedReservations = allReservations.filter(r => r.payment_status === 'completed');
      const activeUsers = allUsers.filter(u => u.saved_menus_count > 0);

      setGlobalStats({
        activeMembers: activeUsers.length,
        menusSaved: completedReservations.length,
        co2Avoided: (completedReservations.length * 0.3).toFixed(1)
      });

    } catch (error) {
      console.error("Error loading community data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando comunidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header mejorado y responsive */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-amber-500 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 mb-6 md:mb-8 shadow-2xl">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                  Comunidad PlatPal
                </h1>
                <p className="text-white/90 text-sm md:text-base">
                  Unidos salvando comida y el planeta 🌍
                </p>
              </div>
            </div>
            
            {/* Stats Cards - Responsive y animadas */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                <p className="text-white/80 text-xs md:text-sm mb-1">Miembros</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{globalStats.activeMembers}</p>
                <div className="mt-2 flex items-center gap-1 text-emerald-200 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>Activos</span>
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                <p className="text-white/80 text-xs md:text-sm mb-1">Menús</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{globalStats.menusSaved}</p>
                <div className="mt-2 flex items-center gap-1 text-amber-200 text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Salvados</span>
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                <p className="text-white/80 text-xs md:text-sm mb-1">CO₂ (kg)</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{globalStats.co2Avoided}</p>
                <div className="mt-2 flex items-center gap-1 text-green-200 text-xs">
                  <Globe className="w-3 h-3" />
                  <span>Evitado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs mejoradas y responsive */}
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/90 backdrop-blur-lg sticky top-0 z-40 shadow-lg rounded-2xl">
            <TabsTrigger 
              value="feed" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ranking" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Award className="w-4 h-4" />
              <span>Top</span>
            </TabsTrigger>
            <TabsTrigger 
              value="impact" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Mi Impacto</span>
            </TabsTrigger>
            <TabsTrigger 
              value="global" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Globe className="w-4 h-4" />
              <span>Global</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Feed */}
          <TabsContent value="feed" className="mt-4 md:mt-6">
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}
                <CommunityFeed refreshTrigger={refreshTrigger} />
              </div>

              {/* Sidebar - oculto en móvil, visible en desktop */}
              <div className="hidden lg:block space-y-6">
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900 text-base">
                      <Award className="w-5 h-5" />
                      Top 3 Esta Semana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RankingLeaderboard limit={3} />
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-900 text-base">💡 Consejo del Día</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold text-emerald-700">¿Sabías que...</span> cada menú que salvas equivale a ahorrar 300g de CO₂. ¡Tú marcas la diferencia!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Ranking */}
          <TabsContent value="ranking" className="mt-4 md:mt-6">
            <Card className="border-2 border-amber-200 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                    Ranking Semanal
                  </CardTitle>
                  <p className="text-xs md:text-sm text-gray-500">Actualizado en tiempo real</p>
                </div>
              </CardHeader>
              <CardContent>
                <RankingLeaderboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Mi Impacto */}
          <TabsContent value="impact" className="mt-4 md:mt-6">
            <PersonalImpact user={currentUser} isAuthenticated={isAuthenticated} />
          </TabsContent>

          {/* Tab: Impacto Global */}
          <TabsContent value="global" className="mt-4 md:mt-6">
            <GlobalImpact globalStats={globalStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}