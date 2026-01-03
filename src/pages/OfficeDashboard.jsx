import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import withOfficeAuth from '../components/auth/withOfficeAuth';
import OfficeChatWidget from '@/components/office/OfficeChatWidget';
import { 
  Building2, 
  Package, 
  Euro,
  TrendingUp,
  Calendar,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

function OfficeDashboard({ user }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    activeSubscriptions: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const orders = await base44.entities.OfficeOrder.list('-created_date', 50);
      const subscriptions = await base44.entities.OfficeSubscription.list();

      const activeSubscriptions = subscriptions.filter(s => 
        s.subscription_status === 'active' && s.cliente_email === user.email
      );

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.precio_total || 0), 0);
      const pendingOrders = orders.filter(o => o.estado === 'pendiente').length;

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        activeSubscriptions: activeSubscriptions.length
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    const variants = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      pagado: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      enviado: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      entregado: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    const variant = variants[estado] || variants.pendiente;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.bg} ${variant.text} gap-1`}>
        <Icon className="w-3 h-3" />
        {estado}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Office</h1>
              <p className="text-gray-600">{user.company_name || user.email}</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Gastado</p>
              <p className="text-3xl font-bold text-green-600">€{stats.totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Suscripciones</p>
              <p className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to={createPageUrl('OfficeMenus')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UtensilsCrossed className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Ver Menús</h3>
                    <p className="text-sm text-gray-600">Disponibles hoy</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('OfficePacks')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Ver Packs</h3>
                    <p className="text-sm text-gray-600">Planes corporativos</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Profile')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                    <p className="text-sm text-gray-600">Configuración</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Pedidos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.menu_detalle}</p>
                        <p className="text-sm text-gray-600">{order.cafeteria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.estado)}
                      <p className="text-lg font-bold text-gray-900 mt-1">€{order.precio_total?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No tienes pedidos aún</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <OfficeChatWidget />
    </div>
  );
}

export default withOfficeAuth(OfficeDashboard);