import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ChefHat, Package, TrendingUp, Euro, QrCode, Building2, Trash2, Settings, Mic } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { DropdownMenuCustom } from "@/components/ui/dropdown-menu-custom";
import { Switch } from "@/components/ui/switch";
import SurpriseRequestsPanel from "@/components/cafeteria/SurpriseRequestsPanel";
import VoiceStockButton from "@/components/cafeteria/VoiceStockButton";
import VoiceConfirmationModal from "@/components/cafeteria/VoiceConfirmationModal";
import VoiceSuccessNotification from "@/components/cafeteria/VoiceSuccessNotification";

export default function CafeteriaDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    totalMenusHoy: 0,
    menusVendidos: 0,
    ingresosHoy: 0,
    pedidosPendientes: 0
  });
  const [availableCafeterias, setAvailableCafeterias] = useState([]);
  const [selectedCafeteriaId, setSelectedCafeteriaId] = useState(null);
  const [selectedCafeteriaData, setSelectedCafeteriaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Voice mode states
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(() => {
    return localStorage.getItem('voice_mode_enabled') === 'true';
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [pendingCommand, setPendingCommand] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allCafeterias = await base44.entities.Cafeteria.list();
        let userCafeterias = [];

        if (currentUser?.app_role === 'admin') {
          userCafeterias = allCafeterias.filter(c => c.activa);
        } else if (currentUser?.cafeterias_asignadas?.length > 0) {
          userCafeterias = allCafeterias.filter(c =>
            currentUser.cafeterias_asignadas.includes(c.id) && c.activa
          );
        }

        setAvailableCafeterias(userCafeterias);

        if (userCafeterias.length > 0) {
          const firstCafe = userCafeterias[0];
          setSelectedCafeteriaId(firstCafe.id);
          setSelectedCafeteriaData(firstCafe);
        }
      } catch (error) {
        console.error("Error cargando usuario:", error);
        navigate(createPageUrl("Home"));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const loadData = useCallback(async () => {
    if (!selectedCafeteriaData) return;

    try {
      const cafeteriaName = selectedCafeteriaData.nombre;
      const today = new Date().toISOString().split('T')[0];

      const [todayMenus, allReservations] = await Promise.all([
        base44.entities.Menu.filter({ 
          cafeteria: cafeteriaName, 
          fecha: today 
        }),
        base44.entities.Reserva.filter({ cafeteria: cafeteriaName }, '-created_date', 200)
      ]);

      console.log('🍽️ Menús de hoy cargados:', todayMenus.length);
      setMenus(todayMenus);

      const cafeteriaReservations = allReservations.filter(r => r.cafeteria === cafeteriaName);
      setReservations(cafeteriaReservations);

      const totalMenusHoy = todayMenus.reduce((sum, m) => sum + m.stock_total, 0);
      const menusVendidos = cafeteriaReservations.filter(r =>
        r.payment_status === 'completed' && r.created_date?.startsWith(today)
      ).length;
      const ingresosHoy = cafeteriaReservations
        .filter(r => r.payment_status === 'completed' && r.created_date?.startsWith(today))
        .reduce((sum, r) => sum + (r.precio_total || 0), 0);
      const pedidosPendientes = cafeteriaReservations.filter(r =>
        r.estado === 'pagado' && r.created_date?.startsWith(today)
      ).length;

      setStats({ totalMenusHoy, menusVendidos, ingresosHoy, pedidosPendientes });
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [selectedCafeteriaData]);

  useEffect(() => {
    if (selectedCafeteriaData) loadData();
  }, [loadData, selectedCafeteriaData]);

  // Recargar datos cuando se vuelva desde EditMenu
  useEffect(() => {
    if (location.state?.refreshData) {
      console.log('🔄 Recargando datos del dashboard...');
      loadData();
      // Limpiar el state para que no se recargue continuamente
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loadData]);

  const handleCafeteriaChange = (id) => {
    const cafe = availableCafeterias.find(c => c.id === id);
    if (cafe) {
      setSelectedCafeteriaId(id);
      setSelectedCafeteriaData(cafe);
    }
  };

  const handleDeleteMenu = async (menu) => {
    try {
      // Si el menú tiene hijos recurrentes (es un menú padre)
      const childMenus = await base44.entities.Menu.filter({ menu_padre_id: menu.id });
      
      if (childMenus.length > 0) {
        const confirmDelete = window.confirm(
          `Este menú es parte de una serie recurrente con ${childMenus.length + 1} menús.\n\n¿Quieres eliminar toda la serie recurrente?`
        );
        
        if (confirmDelete) {
          // Borrar todos los hijos
          await Promise.all(childMenus.map(child => base44.entities.Menu.delete(child.id)));
          // Borrar el padre
          await base44.entities.Menu.delete(menu.id);
          alert('✅ Serie recurrente eliminada completamente');
        } else {
          return;
        }
      } else {
        // Menú individual o hijo de serie
        const confirmDelete = window.confirm(
          `¿Estás seguro de eliminar este menú?\n\n${menu.plato_principal} + ${menu.plato_secundario}`
        );
        
        if (confirmDelete) {
          await base44.entities.Menu.delete(menu.id);
          alert('✅ Menú eliminado');
        } else {
          return;
        }
      }
      
      // Recargar datos
      await loadData();
    } catch (error) {
      console.error('Error eliminando menú:', error);
      alert('Error al eliminar el menú');
    }
  };

  const handleVoiceCommand = async (transcript) => {
    try {
      console.log('🎤 Comando de voz recibido:', transcript);
      
      // Crear conversación con el agente de IA
      const conversation = await base44.agents.createConversation({
        agent_name: "stock_manager",
        metadata: {
          cafeteria: selectedCafeteriaData?.nombre,
          user: user?.email
        }
      });

      // Enviar el comando al agente
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: transcript
      });

      // Suscribirse a las actualizaciones de la conversación
      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const lastMessage = data.messages[data.messages.length - 1];
        
        if (lastMessage?.role === 'assistant' && lastMessage?.content) {
          console.log('🤖 Respuesta del agente:', lastMessage.content);
          
          // Parsear la respuesta del agente para extraer la confirmación
          const response = lastMessage.content;
          
          // Buscar patrones de confirmación
          if (response.includes('Confirmar:') || response.includes('confirmas')) {
            // Extraer información del comando
            const match = response.match(/(\d+)\s+(?:unidades|raciones)?\s+de\s+(.+?)\s*\(Stock actual:\s*(\d+)\)/i);
            
            if (match) {
              const [, quantity, dishName, currentStock] = match;
              const newStock = parseInt(currentStock) + parseInt(quantity);
              
              setPendingCommand({
                dishName: dishName.trim(),
                currentStock: parseInt(currentStock),
                newStock: newStock,
                changeDescription: `+${quantity} unidades`,
                conversationId: conversation.id,
                originalTranscript: transcript
              });
              
              setShowConfirmModal(true);
            }
          } else if (response.includes('múltiples menús') || response.includes('opciones')) {
            alert(`🤔 ${response}\n\nIntenta ser más específico con el nombre del plato.`);
          } else if (response.includes('no encontré') || response.includes('No encontré')) {
            alert(`❌ ${response}`);
          }
          
          unsubscribe();
        }
      });

    } catch (error) {
      console.error('Error procesando comando de voz:', error);
      alert('Error al procesar el comando. Intenta de nuevo.');
    }
  };

  const handleConfirmVoiceUpdate = async () => {
    try {
      setShowConfirmModal(false);
      
      // Buscar el menú y actualizarlo
      const matchingMenus = menus.filter(m => 
        m.plato_principal.toLowerCase().includes(pendingCommand.dishName.toLowerCase()) ||
        m.plato_secundario.toLowerCase().includes(pendingCommand.dishName.toLowerCase())
      );

      if (matchingMenus.length > 0) {
        const menuToUpdate = matchingMenus[0];
        await base44.entities.Menu.update(menuToUpdate.id, {
          stock_disponible: pendingCommand.newStock
        });

        // Mostrar notificación de éxito
        setSuccessMessage(`${pendingCommand.dishName}: ${pendingCommand.currentStock} → ${pendingCommand.newStock}`);
        setShowSuccessNotification(true);

        // Recargar datos
        await loadData();
      }

      setPendingCommand(null);
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar el stock');
    }
  };

  const toggleVoiceMode = (enabled) => {
    setVoiceModeEnabled(enabled);
    localStorage.setItem('voice_mode_enabled', enabled);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <OrbitalLoader message="Cargando panel..." />
      </div>
    );
  }

  if (availableCafeterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center border-b">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">¡Bienvenido a PlatPal!</CardTitle>
            <p className="text-gray-600 mt-2">No tienes cafeterías asignadas</p>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-gray-700 mb-4">Contacta con el equipo de PlatPal para registrar tu cafetería.</p>
            <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedCafeteriaData?.nombre || 'Panel Cafetería'}
            </h1>
            <p className="text-gray-600">Gestiona menús y pedidos</p>

            {availableCafeterias.length > 1 && (
              <div className="mt-4">
                <DropdownMenuCustom
                  options={availableCafeterias.map(cafe => ({
                    value: cafe.id,
                    label: cafe.nombre,
                    onClick: () => handleCafeteriaChange(cafe.id),
                    Icon: <Building2 className="w-5 h-5 text-emerald-600" />,
                    content: (
                      <div>
                        <p className="font-semibold">{cafe.nombre}</p>
                        <p className="text-xs text-gray-500">Campus {cafe.campus}</p>
                      </div>
                    )
                  }))}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">{selectedCafeteriaData?.nombre}</p>
                      <p className="text-xs text-gray-500">Campus {selectedCafeteriaData?.campus}</p>
                    </div>
                  </div>
                </DropdownMenuCustom>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Link to={createPageUrl("PublishMenu")} state={{ selectedCafeteria: selectedCafeteriaData }}>
              <Button className="bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Publicar Menú
              </Button>
            </Link>
            <Link to={createPageUrl("VoicePublishMenu")}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Mic className="w-4 h-4 mr-2" />
                Publicar por Voz
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Menús Hoy</p>
              <p className="text-3xl font-bold">{stats.totalMenusHoy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Vendidos</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.menusVendidos}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-amber-600">€{stats.ingresosHoy.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <QrCode className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pedidosPendientes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to={createPageUrl("PickupPanel")}>
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Panel Recogida
            </Button>
          </Link>
          <Button 
            variant={showVoiceSettings ? "default" : "outline"}
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Modo Voz
          </Button>
        </div>

        {/* Voice Settings Panel */}
        {showVoiceSettings && (
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Modo Voz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2">
                <div>
                  <p className="font-semibold text-gray-900">Habilitar comandos rápidos</p>
                  <p className="text-sm text-gray-600">Actualiza el stock usando tu voz</p>
                </div>
                <Switch 
                  checked={voiceModeEnabled}
                  onCheckedChange={toggleVoiceMode}
                />
              </div>
              
              {voiceModeEnabled && (
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">💡 Comandos disponibles:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• "Añade 10 raciones de pasta"</li>
                    <li>• "Pon 5 más de ensalada"</li>
                    <li>• "Incrementa el stock de pollo en 15"</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Solicitudes de Menú Sorpresa */}
        <SurpriseRequestsPanel cafeteriaName={selectedCafeteriaData?.nombre} />

        {/* Pedidos Pendientes */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-orange-600" />
              Pendientes de Recogida
              {stats.pedidosPendientes > 0 && (
                <Badge className="bg-orange-500">{stats.pedidosPendientes}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0])).length > 0 ? (
              <div className="space-y-3">
                {reservations
                  .filter(r => r.estado === 'pagado' && r.created_date?.startsWith(new Date().toISOString().split('T')[0]))
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border-2 border-orange-100">
                      <div>
                        <div className="font-mono font-bold text-xl text-orange-700 mb-1">{r.codigo_recogida}</div>
                        <p className="font-semibold text-gray-900">{r.student_name || r.student_email}</p>
                        <p className="text-sm text-gray-600">{r.menus_detalle}</p>
                        {r.pagado_con_bono && <Badge className="mt-1 bg-purple-100 text-purple-800">Bono</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {r.pagado_con_bono ? 'Gratis' : `€${r.precio_total?.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay pedidos pendientes</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menús de Hoy */}
        <Card>
          <CardHeader>
            <CardTitle>Menús de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {menus.length > 0 ? (
              <div className="space-y-4">
                {menus.map((menu) => (
                  <div key={menu.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-2 hover:border-emerald-300 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{menu.plato_principal}</h3>
                      <p className="text-base text-gray-600 mt-1">+ {menu.plato_secundario}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className="text-base px-3 py-1">
                          Stock: {menu.stock_disponible}/{menu.stock_total}
                        </Badge>
                        {menu.es_recurrente && (
                          <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1">Recurrente</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to={createPageUrl("EditMenu")} state={{ menu }}>
                        <Button size="lg" variant="outline" className="h-12 px-6 text-base font-semibold">
                          Editar
                        </Button>
                      </Link>
                      <Button 
                        size="lg"
                        variant="destructive"
                        onClick={() => handleDeleteMenu(menu)}
                        className="h-12 w-12"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No hay menús publicados hoy</p>
                <Link to={createPageUrl("PublishMenu")}>
                  <Button className="mt-4 bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Menú
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Voice Stock Button */}
      <VoiceStockButton 
        onVoiceCommand={handleVoiceCommand}
        isEnabled={voiceModeEnabled}
      />

      {/* Voice Confirmation Modal */}
      <VoiceConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingCommand(null);
        }}
        onConfirm={handleConfirmVoiceUpdate}
        command={pendingCommand}
      />

      {/* Voice Success Notification */}
      <VoiceSuccessNotification
        isVisible={showSuccessNotification}
        message={successMessage}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  );
}