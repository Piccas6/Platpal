import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter, Star, StarOff, Loader2, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MenuCard from "../components/menus/MenuCard";
import ReservationModal from "../components/menus/ReservationModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import RecommendedMenus from "../components/menus/RecommendedMenus";

export default function Menus() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [allMenus, setAllMenus] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);

  const [filters, setFilters] = useState({
    tipo_cocina: 'all',
    es_vegetariano: false,
    es_vegano: false,
    sin_gluten: false,
    solo_favoritos: false
  });

  const loadMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedMenus = await base44.entities.Menu.list('-created_date');
      setAllMenus(fetchedMenus);
      const fetchedReservations = await base44.entities.Reserva.list();
      setReservations(fetchedReservations);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const campusData = localStorage.getItem('selectedCampus');
    if (campusData) {
      setSelectedCampus(JSON.parse(campusData));
    }
    
    loadMenus();
    fetchCurrentUser();
  }, [loadMenus]);

  const applyFilters = useCallback((menuList) => {
    let filtered = [...menuList];
    
    if (filters.tipo_cocina !== 'all') {
        filtered = filtered.filter(m => m.tipo_cocina === filters.tipo_cocina);
    }
    
    if (filters.es_vegetariano) {
        filtered = filtered.filter(m => m.es_vegetariano === true);
    }
    if (filters.es_vegano) {
        filtered = filtered.filter(m => m.es_vegano === true);
    }
    if (filters.sin_gluten) {
        filtered = filtered.filter(m => m.sin_gluten === true);
    }
    
    if (filters.solo_favoritos && currentUser?.cafeterias_favoritas) {
        filtered = filtered.filter(m => currentUser.cafeterias_favoritas.includes(m.cafeteria));
    }
    
    return filtered;
  }, [filters, currentUser]);

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (selectedCampus) {
        let filteredByLocation = allMenus.filter(m => {
            if (m.campus !== selectedCampus.id) return false;
            return m.fecha === today;
        });
        
        filteredByLocation = applyFilters(filteredByLocation);
        setMenus(filteredByLocation);
    } else {
        let availableMenus = allMenus.filter(menu => {
            return menu.fecha === today;
        });
        
        availableMenus = applyFilters(availableMenus);
        setMenus(availableMenus);
    }
  }, [selectedCampus, allMenus, applyFilters]);

  const fetchCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser({
        ...user,
        menus_favoritos: user.menus_favoritos || [],
        cafeterias_favoritas: user.cafeterias_favoritas || []
      });
    } catch (error) {
      setCurrentUser({
        app_role: 'user',
        full_name: 'Estudiante',
        email: null,
        id: null,
        saved_menus_count: 0,
        weekly_saved_menus: 0,
        achievements: [],
        cafeterias_favoritas: [],
        creditos_menu_bono: 0,
        menus_favoritos: []
      });
    }
  };

  const openReservationModal = (menu) => {
    setSelectedMenu(menu);
    setShowReservationModal(true);
  };

  const handleReservationSuccess = useCallback(() => {
    console.log("Reservation successful! Refreshing menus.");
    loadMenus();
    setShowReservationModal(false);
    setSelectedMenu(null);
  }, [loadMenus]);

  const handleReserveMenu = async (reservaData) => {
    setIsReserving(true);
    
    try {
      const userResp = await base44.auth.me();
      
      if (reservaData.usar_bono) {
        console.log('🎁 Usando bono para reserva...');
        
        if (!userResp.creditos_menu_bono || userResp.creditos_menu_bono <= 0) {
          alert('❌ No tienes bonos disponibles');
          setIsReserving(false);
          return;
        }

        const nuevaReserva = await base44.entities.Reserva.create({
          ...reservaData,
          student_email: userResp.email,
          student_name: userResp.full_name || userResp.email,
          estado: 'pagado',
          payment_status: 'completed',
          pagado_con_bono: true
        });

        console.log('✅ Reserva creada con bono:', nuevaReserva.id);

        const menuToUpdate = allMenus.find(m => m.id === reservaData.menu_id);
        if (menuToUpdate && menuToUpdate.stock_disponible > 0) {
          const updatedMenu = await base44.entities.Menu.update(menuToUpdate.id, {
            stock_disponible: menuToUpdate.stock_disponible - 1
          });
          setAllMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
          console.log('📊 Menú actualizado, nuevo stock:', updatedMenu.stock_disponible);
        }

        await base44.auth.updateMe({
          creditos_menu_bono: userResp.creditos_menu_bono - 1
        });

        console.log('✅ Bono descontado, nuevo saldo:', userResp.creditos_menu_bono - 1);
        setCurrentUser(prev => ({...prev, creditos_menu_bono: (prev.creditos_menu_bono || 0) - 1}));

        try {
          const platos = reservaData.menus_detalle.split(' + ');
          await base44.entities.AnalyticsEvent.create({
            event_type: 'sale',
            cafeteria_name: reservaData.cafeteria,
            plato_principal: platos[0] || 'Menú',
            plato_secundario: platos[1] || '',
            is_surprise: reservaData.menus_detalle.includes('Sorpresa'),
            precio: 0,
            pagado_con_bono: true
          });
        } catch (analyticsErr) {
          console.log('⚠️ Error guardando analíticas:', analyticsErr);
        }

        try {
          console.log('📧 Enviando emails de confirmación...');
          await base44.functions.invoke('sendReservationEmails', {
            reserva_id: nuevaReserva.id
          });
          console.log('✅ Emails enviados correctamente');
        } catch (emailError) {
          console.warn('⚠️ Error enviando emails (no crítico):', emailError);
        }

        navigate(createPageUrl('Confirmation'), {
          state: {
            reserva: nuevaReserva,
            campus: selectedCampus,
            menu: menuToUpdate,
            usoBono: true
          }
        });

        return;
      }

      console.log('🚀 Iniciando proceso de reserva con Stripe...');
      console.log('📦 Datos de reserva:', reservaData);

      const nuevaReserva = await base44.entities.Reserva.create({
        ...reservaData,
        student_email: userResp.email,
        student_name: userResp.full_name || userResp.email,
        estado: 'pendiente',
        payment_status: 'pending'
      });
      console.log('✅ Reserva inicial creada para Stripe:', nuevaReserva.id);

      const menuToUpdate = allMenus.find(m => m.id === reservaData.menu_id);
      if (menuToUpdate && menuToUpdate.stock_disponible > 0) {
        const updatedMenu = await base44.entities.Menu.update(menuToUpdate.id, {
          stock_disponible: menuToUpdate.stock_disponible - 1
        });
        setAllMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
        console.log('📊 Menú actualizado, nuevo stock:', updatedMenu.stock_disponible);
      }

      const { data } = await base44.functions.invoke('createCheckoutSession', {
        reserva_id: nuevaReserva.id,
        menus_detalle: reservaData.menus_detalle,
        cafeteria: reservaData.cafeteria,
        campus: reservaData.campus,
        precio_total: reservaData.precio_total,
        codigo_recogida: reservaData.codigo_recogida,
        envase_propio: reservaData.envase_propio
      });

      if (data.checkout_url) {
        console.log('Redirecting to Stripe:', data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No se recibió URL de pago de Stripe.');
      }

    } catch (error) {
      console.error("❌ Error completo en handleReserveMenu:", error);
      
      let errorMessage = 'Error al procesar la reserva. ';
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details})`;
        }
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Inténtalo de nuevo.';
      }
      
      alert(errorMessage);
      await loadMenus();
    } finally {
      setIsReserving(false);
    }
  };

  const toggleFavoriteCafeteria = async (cafeteriaName) => {
    if (!currentUser || !currentUser.id) {
        alert("Debes iniciar sesión para marcar cafeterías como favoritas.");
        return;
    }
    
    const currentFavorites = currentUser.cafeterias_favoritas || [];
    let newFavorites;
    
    if (currentFavorites.includes(cafeteriaName)) {
        newFavorites = currentFavorites.filter(c => c !== cafeteriaName);
    } else {
        newFavorites = [...currentFavorites, cafeteriaName];
    }
    
    try {
        await base44.auth.updateMe({
            cafeterias_favoritas: newFavorites
        });
        setCurrentUser(prev => ({...prev, cafeterias_favoritas: newFavorites}));
    } catch (error) {
        console.error("Error updating favorites:", error);
        alert("Hubo un error al actualizar tus favoritos.");
    }
  };

  const isFavorite = (cafeteriaName) => {
    return currentUser?.cafeterias_favoritas?.includes(cafeteriaName) || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl(selectedCampus ? "Campus" : "Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {selectedCampus ? 'Menús de hoy' : 'Todos los menús de hoy'}
            </h1>
            {selectedCampus && (
              <p className="text-gray-600 mt-1">
                {selectedCampus.nombre || 'Campus'} • Ofertas para hoy
              </p>
            )}
            {!selectedCampus && (
                 <p className="text-gray-600 mt-1">
                    Ofertas de hoy en todos los campus
                </p>
            )}
          </div>
        </div>

        {/* Recomendaciones personalizadas */}
        {currentUser && currentUser.id && !isLoading && (
          <RecommendedMenus
            currentUser={currentUser}
            allMenus={allMenus}
            allReservations={reservations}
            onReservationSuccess={handleReservationSuccess}
            onFavoriteToggle={(menuId, isFavorite) => {
              setCurrentUser(prev => ({
                ...prev,
                menus_favoritos: isFavorite 
                  ? [...(prev.menus_favoritos || []), menuId]
                  : (prev.menus_favoritos || []).filter(id => id !== menuId)
              }));
            }}
          />
        )}

        {/* Filtros */}
        <Card className="mb-6 border-2">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Filtrar Menús</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label className="text-sm mb-2 block">Tipo de Cocina</Label>
                        <Select 
                            value={filters.tipo_cocina} 
                            onValueChange={(value) => setFilters(prev => ({...prev, tipo_cocina: value}))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="mediterranea">Mediterránea</SelectItem>
                                <SelectItem value="italiana">Italiana</SelectItem>
                                <SelectItem value="asiatica">Asiática</SelectItem>
                                <SelectItem value="mexicana">Mexicana</SelectItem>
                                <SelectItem value="vegetariana">Vegetariana</SelectItem>
                                <SelectItem value="casera">Casera</SelectItem>
                                <SelectItem value="internacional">Internacional</SelectItem>
                                <SelectItem value="rapida">Comida Rápida</SelectItem>
                                <SelectItem value="otra">Otra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-3">
                        <Label className="text-sm block">Opciones Dietéticas</Label>
                        <div className="flex flex-wrap gap-2">
                            <Badge 
                                variant={filters.es_vegetariano ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setFilters(prev => ({...prev, es_vegetariano: !prev.es_vegetariano}))}
                            >
                                🥗 Vegetariano
                            </Badge>
                            <Badge 
                                variant={filters.es_vegano ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setFilters(prev => ({...prev, es_vegano: !prev.es_vegano}))}
                            >
                                🌱 Vegano
                            </Badge>
                            <Badge 
                                variant={filters.sin_gluten ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setFilters(prev => ({...prev, sin_gluten: !prev.sin_gluten}))}
                            >
                                🌾 Sin Gluten
                            </Badge>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <Label className="text-sm block">Otros</Label>
                        <Badge 
                            variant={filters.solo_favoritos ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setFilters(prev => ({...prev, solo_favoritos: !prev.solo_favoritos}))}
                        >
                            {filters.solo_favoritos ? <Star className="w-3 h-3 mr-1 fill-current" /> : <StarOff className="w-3 h-3 mr-1" />}
                            Solo Favoritos
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Lista de menús */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : menus.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onReserve={openReservationModal}
                isFavorite={isFavorite(menu.cafeteria)}
                onToggleFavorite={toggleFavoriteCafeteria}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900 mb-2">
                No hay menús disponibles
              </p>
              <p className="text-gray-600 mb-6">
                {filters.tipo_cocina !== 'all' || filters.es_vegetariano || filters.es_vegano || filters.sin_gluten || filters.solo_favoritos
                  ? 'Intenta ajustar los filtros para ver más opciones'
                  : 'Vuelve más tarde para ver nuevas ofertas'}
              </p>
              <Link to={createPageUrl("Campus")}>
                <Button variant="outline">
                  Explorar Campus
                </Button>
              </Link>
            </div>
          </Card>
        )}

        <ReservationModal 
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          menu={selectedMenu}
          campus={selectedCampus}
          onConfirm={handleReserveMenu}
          isLoading={isReserving}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}