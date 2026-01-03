import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import OfficeChatWidget from "@/components/office/OfficeChatWidget";
import {
  Package,
  Clock,
  Euro,
  TrendingUp,
  Building2,
  Truck,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function OfficeDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Cargar pedidos del usuario
      const allOrders = await base44.entities.OfficeOrder.list('-created_date', 50);
      const userOrders = allOrders.filter(o => o.created_by === currentUser.email);
      setOrders(userOrders);

      // Cargar suscripciones
      const allSubs = await base44.entities.OfficeSubscription.list();
      const userSubs = allSubs.filter(s => s.created_by === currentUser.email);
      setSubscriptions(userSubs);

      // Calcular estadísticas
      const totalSpent = userOrders
        .filter(o => o.payment_status === 'completed')
        .reduce((sum, o) => sum + (o.precio_total || 0), 0);

      const pendingOrders = userOrders.filter(
        o => o.estado === 'pendiente' || o.estado === 'preparando'
      ).length;

      const activeSubscriptions = userSubs.filter(
        s => s.subscription_status === 'active'
      ).length;

      setStats({
        totalOrders: userOrders.length,
        totalSpent,
        pendingOrders,
        activeSubscriptions
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      pagado: 'bg-blue-100 text-blue-800',
      preparando: 'bg-orange-100 text-orange-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado) => {
    if (estado === 'entregado') return <CheckCircle className="w-4 h-4" />;
    if (estado === 'cancelado') return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <OrbitalLoader message="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-600" />
              Dashboard Office
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus pedidos y suscripciones corporativas
            </p>
          </div>
          <Link to={createPageUrl("OfficeMenus")}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <Package className="w-4 h-4 mr-2" />
              Nuevo Pedido
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pedidos Totales</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalOrders}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Gasto Total</p>
              <p className="text-3xl font-black text-purple-600 mt-1">
                €{stats.totalSpent.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-black text-orange-600 mt-1">{stats.pendingOrders}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Suscripciones</p>
              <p className="text-3xl font-black text-green-600 mt-1">
                {stats.activeSubscriptions}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>⚡ Acceso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              <Link to={createPageUrl("OfficeMenus")} className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Package className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Ver Menús</div>
                    <div className="text-xs text-gray-500">Pedidos individuales</div>
                  </div>
                </Button>
              </Link>

              <Link to={createPageUrl("OfficePacks")} className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Ver Packs</div>
                    <div className="text-xs text-gray-500">Suscripciones</div>
                  </div>
                </Button>
              </Link>

              <Link to={createPageUrl("OfficeHome")} className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Building2 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Inicio Office</div>
                    <div className="text-xs text-gray-500">Información</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📦 Pedidos Recientes</CardTitle>
              {orders.length > 5 && (
                <Button variant="outline" size="sm">
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Aún no has hecho ningún pedido</p>
                <Link to={createPageUrl("OfficeMenus")}>
                  <Button className="bg-blue-600">
                    Hacer mi primer pedido
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getEstadoColor(order.estado)}>
                          {getEstadoIcon(order.estado)}
                          <span className="ml-1 capitalize">{order.estado}</span>
                        </Badge>
                        {order.payment_status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Pagado
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {order.menu_detalle}
                      </h4>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {order.cafeteria}
                        </span>
                        {order.servicio_entrega && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            {order.servicio_entrega === 'glovo' ? 'Glovo' : 'Just Eat'}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(order.created_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {order.direccion_entrega && (
                        <p className="text-xs text-gray-500 mt-2">
                          📍 {order.direccion_entrega}
                        </p>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-blue-600">
                        €{order.precio_total?.toFixed(2)}
                      </p>
                      {order.incluye_bebida && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Con bebida
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        {subscriptions.length > 0 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>🎁 Suscripciones Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions
                  .filter(s => s.subscription_status === 'active')
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-white rounded-xl border-2 border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {sub.cantidad_menus_mes} menús/mes
                          </h4>
                          <p className="text-sm text-gray-600">
                            {sub.empresa_nombre || 'Suscripción Office'}
                          </p>
                        </div>
                        <Badge className="bg-green-500 text-white">Activa</Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Usados este mes:</span>
                          <p className="font-semibold">
                            {sub.menus_usados_mes_actual || 0} / {sub.cantidad_menus_mes}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Próxima renovación:</span>
                          <p className="font-semibold">
                            {sub.fecha_renovacion
                              ? new Date(sub.fecha_renovacion).toLocaleDateString('es-ES')
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Precio mensual:</span>
                          <p className="font-semibold text-purple-600">
                            €{sub.precio_mensual?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Banner */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  ¿Necesitas ayuda o tienes alguna duda?
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Nuestro equipo está aquí para ayudarte con cualquier consulta sobre pedidos, 
                  facturación o suscripciones.
                </p>
                <Button variant="outline" className="bg-white">
                  Contactar soporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Widget */}
        <OfficeChatWidget />
      </div>
    </div>
  );
}