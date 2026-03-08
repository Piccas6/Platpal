import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, UtensilsCrossed, Sparkles, Leaf, AlertCircle, Heart, Timer, Flame } from 'lucide-react';
import ReservationModal from './ReservationModal';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MenuCard({ menu, onReservationSuccess, currentUser, onFavoriteToggle, canReserve }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    currentUser?.menus_favoritos?.includes(menu.id) || false
  );
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [countdownPhase, setCountdownPhase] = useState(''); // 'reserva' | 'recogida' | 'closed'

  // Contador regresivo
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const parseTime = (t) => {
        if (!t) return null;
        const [h, m] = t.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      };

      const reservaInicio = parseTime(menu.hora_inicio_reserva || '15:30');
      const reservaFin = parseTime(menu.hora_limite_reserva || '16:30');
      const recogidaFin = parseTime(menu.hora_limite || '18:00');

      if (now < reservaInicio) {
        const diff = reservaInicio - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
        setCountdownPhase('opening');
      } else if (now >= reservaInicio && now <= reservaFin) {
        const diff = reservaFin - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
        setCountdownPhase('reserva');
      } else if (now > reservaFin && now <= recogidaFin) {
        setCountdown('');
        setCountdownPhase('recogida');
      } else {
        setCountdown('');
        setCountdownPhase('closed');
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [menu]);

  // Si no se pasa canReserve como prop, calcularlo localmente
  const [canReserveLocal, setCanReserveLocal] = useState(true);
  
  React.useEffect(() => {
    if (canReserve === undefined) {
      const checkReservationTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour + currentMinute / 60;

        const reservaInicio = 15.5;  // 15:30 (3:30 PM)
        const reservaFin = 16.5;     // 16:30 (4:30 PM)

        setCanReserveLocal(currentTime >= reservaInicio && currentTime <= reservaFin);
      };

      checkReservationTime();
      const interval = setInterval(checkReservationTime, 60000);
      return () => clearInterval(interval);
    }
  }, [canReserve]);

  const canMakeReservation = canReserve !== undefined ? canReserve : canReserveLocal;
  
  const isOutsideReservationWindow = () => {
    try {
      const now = new Date();
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + minutes / 60;
      };

      const currentTime = now.getHours() + now.getMinutes() / 60;
      const reservaInicio = parseTime(menu.hora_inicio_reserva || '15:30');
      const reservaFin = parseTime(menu.hora_limite_reserva || '16:30');

      return currentTime < reservaInicio || currentTime > reservaFin;
    } catch (error) {
      console.error('Error parsing horarios de reserva:', error);
      return false;
    }
  };

  const isOutOfStock = menu.stock_disponible <= 0;
  const isUnavailable = isOutOfStock;

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

        // Enviar notificación personal
        try {
          await base44.integrations.Core.SendEmail({
            to: 'piccas.entrepreneurship@gmail.com',
            subject: `🎉 Nueva Reserva - ${reservaData.cafeteria}`,
            body: `
✅ Se ha realizado una nueva reserva:

👤 Usuario: ${userResp.full_name || userResp.email}
📧 Email: ${userResp.email}
📍 Cafetería: ${reservaData.cafeteria}
🏫 Campus: ${reservaData.campus}
🍽️ Menú: ${reservaData.menus_detalle}
💰 Precio: GRATIS (Bono)
🎁 Pagado con Bono de Suscripción
🔢 Código: ${reservaData.codigo_recogida}
${reservaData.envase_propio ? '♻️ Con envase propio' : ''}

---
PlatPal - Menús Sostenibles
            `.trim()
          });
        } catch (notifError) {
          console.log('⚠️ Error enviando notificación personal:', notifError);
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

      // Enviar notificación personal
      try {
        await base44.integrations.Core.SendEmail({
          to: 'piccas.entrepreneurship@gmail.com',
          subject: `💳 Nueva Reserva en Proceso - ${reservaData.cafeteria}`,
          body: `
🔄 Se ha iniciado una nueva reserva (pendiente de pago):

👤 Usuario: ${userResp.full_name || userResp.email}
📧 Email: ${userResp.email}
📍 Cafetería: ${reservaData.cafeteria}
🏫 Campus: ${reservaData.campus}
🍽️ Menú: ${reservaData.menus_detalle}
💰 Precio: €${reservaData.precio_total.toFixed(2)}
🔢 Código: ${reservaData.codigo_recogida}
${reservaData.envase_propio ? '♻️ Con envase propio (-€' + (menu.descuento_envase_propio || 0.15).toFixed(2) + ')' : ''}
${reservaData.referral_code ? '🎟️ Código referido: ' + reservaData.referral_code + ' (-€' + reservaData.referral_discount.toFixed(2) + ')' : ''}

⚠️ Estado: Pendiente de pago en Stripe

---
PlatPal - Menús Sostenibles
          `.trim()
        });
      } catch (notifError) {
        console.log('⚠️ Error enviando notificación personal:', notifError);
      }

      if (data.checkout_url) {
        console.log('Redirecting to Stripe:', data.checkout_url);
        // Guardar reserva en localStorage para verificarla al volver de Stripe
        localStorage.setItem('pendingReservation', JSON.stringify(nuevaReserva));
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
        onReservationSuccess();
      }
    } finally {
      setIsReserving(false);
      setIsModalOpen(false);
    }
  };

  const typeLabel = getTypeLabel();

  // Verificar si hay ambas imágenes
  const hasImages = menu.imagen_url && menu.imagen_url_secundaria;

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl group border-2 ${
        isUnavailable ? 'opacity-60 border-gray-200' : 'border-emerald-100 hover:border-emerald-300'
      }`}>
        {/* Imagen(es) */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {hasImages ? (
            // Mostrar ambas imágenes lado a lado
            <div className="flex h-full">
              <div className="w-1/2 relative overflow-hidden">
                <img 
                  src={menu.imagen_url} 
                  alt={menu.plato_principal}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                  1er Plato
                </div>
              </div>
              <div className="w-1/2 relative overflow-hidden border-l-2 border-white">
                <img 
                  src={menu.imagen_url_secundaria} 
                  alt={menu.plato_secundario}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                  2do Plato
                </div>
              </div>
            </div>
          ) : menu.imagen_url ? (
            // Solo imagen principal
            <img 
              src={menu.imagen_url} 
              alt={menu.plato_principal}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            // Sin imágenes - icono por defecto
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

          {/* Estado y urgencia */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            {isOutOfStock ? (
              <Badge className="bg-red-500 text-white shadow-lg">Agotado</Badge>
            ) : isOutsideReservationWindow() ? (
              <Badge className="bg-orange-500 text-white shadow-lg">Fuera de horario</Badge>
            ) : (
              <Badge className={`shadow-lg flex items-center gap-1 ${menu.stock_disponible <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>
                {menu.stock_disponible <= 3 && <Flame className="w-3 h-3" />}
                {menu.stock_disponible} disponibles
              </Badge>
            )}
            {countdownPhase === 'reserva' && countdown && (
              <Badge className="bg-amber-500 text-white shadow-lg flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Cierra en {countdown}
              </Badge>
            )}
            {countdownPhase === 'opening' && countdown && (
              <Badge className="bg-blue-500 text-white shadow-lg flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Abre en {countdown}
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
              <span>{menu.hora_inicio_reserva || '15:30'} - {menu.hora_limite_reserva || '16:30'}</span>
            </div>
            {menu.permite_envase_propio && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                ♻️ -€{menu.descuento_envase_propio?.toFixed(2) || '0.15'} con tu envase
              </Badge>
            )}
          </div>

          {/* Botón de reserva */}
          <Button 
            onClick={() => {
              const parseTime = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours + minutes / 60;
              };

              const now = new Date();
              const currentTime = now.getHours() + now.getMinutes() / 60;
              const reservaInicio = parseTime(menu.hora_inicio_reserva || '15:30');
              const reservaFin = parseTime(menu.hora_limite_reserva || '16:30');

              if (currentTime < reservaInicio) {
                alert(`⏰ Las reservas abren a las ${menu.hora_inicio_reserva || '15:30'}. Por favor, vuelve más tarde.`);
                return;
              }
              
              if (currentTime > reservaFin) {
                alert(`⏰ Las reservas cerraron a las ${menu.hora_limite_reserva || '16:30'}. Por favor, vuelve mañana.`);
                return;
              }

              setIsModalOpen(true);
            }}
            disabled={isUnavailable}
            className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
              isUnavailable 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {isOutOfStock ? 'Agotado' : isOutsideReservationWindow() ? '🔒 Fuera de horario' : 'Reservar ahora'}
          </Button>
        </CardContent>
      </Card>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={menu}
        campus={{ id: menu.campus }}
        onConfirm={handleReserveMenu}
        isLoading={isReserving}
        currentUser={currentUser}
      />
    </>
  );
}