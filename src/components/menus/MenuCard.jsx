
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, UtensilsCrossed, Sparkles, Leaf, AlertCircle, Heart, Loader2 } from 'lucide-react';
import ReservationModal from './ReservationModal';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MenuCard({ menu, onReservationSuccess, currentUser, onFavoriteToggle }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    currentUser?.menus_favoritos?.includes(menu.id) || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  
  const isPastDeadline = () => {
    // FIXED: Safety check for undefined hora_limite_reserva
    if (!menu.hora_limite_reserva) {
      return false; // Si no tiene hora límite, considerarlo disponible
    }

    try {
      const now = new Date();
      const [hours, minutes] = menu.hora_limite_reserva.split(':');
      const deadline = new Date();
      deadline.setHours(parseInt(hours), parseInt(minutes), 0);
      return now > deadline;
    } catch (error) {
      console.error('Error parsing hora_limite_reserva:', menu.hora_limite_reserva, error);
      return false; // En caso de error, considerarlo disponible
    }
  };

  const isOutOfStock = menu.stock_disponible <= 0;
  const isUnavailable = isPastDeadline() || isOutOfStock;

  const getTypeLabel = () => {
    if (menu.es_sorpresa) return { text: 'Menú Sorpresa', icon: Sparkles, color: 'bg-purple-100 text-purple-800' };
    if (menu.es_vegano) return { text: 'Vegano', icon: Leaf, color: 'bg-green-100 text-green-800' };
    if (menu.es_vegetariano) return { text: 'Vegetariano', icon: Leaf, color: 'bg-green-100 text-green-800' };
    return null;
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    
    if (!currentUser || !currentUser.id) {
      alert("Debes iniciar sesión para marcar menús como favoritos.");
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const currentFavorites = currentUser.menus_favoritos || [];
      let newFavorites;
      
      if (currentFavorites.includes(menu.id)) {
        newFavorites = currentFavorites.filter(id => id !== menu.id);
        setIsFavorite(false);
      } else {
        newFavorites = [...currentFavorites, menu.id];
        setIsFavorite(true);
      }
      
      await base44.auth.updateMe({
        menus_favoritos: newFavorites
      });
      
      if (onFavoriteToggle) {
        onFavoriteToggle(menu.id, !isFavorite);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      alert("Hubo un error al actualizar tus favoritos.");
      setIsFavorite(!isFavorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

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

        if (menu && menu.stock_disponible > 0) {
          await base44.entities.Menu.update(menu.id, {
            stock_disponible: menu.stock_disponible - 1
          });
        }

        await base44.auth.updateMe({
          creditos_menu_bono: userResp.creditos_menu_bono - 1
        });

        console.log('✅ Bono descontado, nuevo saldo:', userResp.creditos_menu_bono - 1);

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
            menu: menu,
            usoBono: true
          }
        });

        if (onReservationSuccess) {
          onReservationSuccess();
        }

        return;
      }

      console.log('🚀 Iniciando proceso de reserva con Stripe...');

      const nuevaReserva = await base44.entities.Reserva.create({
        ...reservaData,
        student_email: userResp.email,
        student_name: userResp.full_name || userResp.email,
        estado: 'pendiente',
        payment_status: 'pending'
      });
      console.log('✅ Reserva inicial creada para Stripe:', nuevaReserva.id);

      if (menu && menu.stock_disponible > 0) {
        await base44.entities.Menu.update(menu.id, {
          stock_disponible: menu.stock_disponible - 1
        });
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
      
      if (onReservationSuccess) {
        onReservationSuccess(); // Call success to re-fetch menus or update UI after potential stock changes even if payment failed
      }
    } finally {
      setIsReserving(false);
      setIsModalOpen(false);
    }
  };

  const typeLabel = getTypeLabel();

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl group border-2 ${
        isUnavailable ? 'opacity-60 border-gray-200' : 'border-emerald-100 hover:border-emerald-300'
      }`}>
        {/* Imagen */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {menu.imagen_url ? (
            <img 
              src={menu.imagen_url} 
              alt={menu.plato_principal}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-20 h-20 text-gray-300" />
            </div>
          )}
          
          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {typeLabel && (
              <Badge className={`${typeLabel.color} flex items-center gap-1 shadow-md`}>
                <typeLabel.icon className="w-3 h-3" />
                {typeLabel.text}
              </Badge>
            )}
            {menu.tipo_cocina && (
              <Badge variant="secondary" className="bg-white/90 text-gray-800 shadow-md">
                {menu.tipo_cocina}
              </Badge>
            )}
          </div>

          {/* Botón de favorito */}
          {currentUser && currentUser.id && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isTogglingFavorite}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          )}

          {/* Estado */}
          <div className="absolute bottom-3 left-3">
            {isOutOfStock ? (
              <Badge className="bg-red-500 text-white shadow-lg">Agotado</Badge>
            ) : isPastDeadline() ? (
              <Badge className="bg-orange-500 text-white shadow-lg">Tiempo límite</Badge>
            ) : (
              <Badge className="bg-emerald-500 text-white shadow-lg">
                {menu.stock_disponible} disponibles
              </Badge>
            )}
          </div>

          {/* Precio */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">€2.99</span>
              {menu.precio_original > 2.99 && (
                <span className="text-sm text-gray-500 line-through">€{menu.precio_original.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Título y cafetería */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {menu.plato_principal}
            </h3>
            <p className="text-gray-600 text-sm mb-3">{menu.plato_secundario}</p>
            
            {/* Nombre de cafetería sin enlace */}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{menu.cafeteria}</span>
            </div>
          </div>

          {/* Alergenos */}
          {menu.alergenos && menu.alergenos.length > 0 && !menu.alergenos.includes('ninguno') && (
            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800 mb-1">Contiene:</p>
                  <p className="text-xs text-amber-700">
                    {menu.alergenos.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Hasta {menu.hora_limite_reserva}</span>
            </div>
            {menu.permite_envase_propio && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                ♻️ -€{menu.descuento_envase_propio?.toFixed(2) || '0.15'} con tu envase
              </Badge>
            )}
          </div>

          {/* Botón de reserva */}
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={isUnavailable}
            className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
              isUnavailable 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {isOutOfStock ? 'Agotado' : isPastDeadline() ? 'Tiempo límite alcanzado' : 'Reservar ahora'}
          </Button>
        </CardContent>
      </Card>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={menu}
        campus={{ id: menu.campus }} // Assuming menu.campus holds the ID
        onConfirm={handleReserveMenu}
        isLoading={isReserving}
        currentUser={currentUser}
      />
    </>
  );
}
