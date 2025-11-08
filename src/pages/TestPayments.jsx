import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  TestTube, 
  CreditCard,
  Database,
  Webhook,
  AlertCircle
} from "lucide-react";

export default function TestPayments() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [testMenuId, setTestMenuId] = useState('');

  const addResult = (step, status, message, details = null) => {
    setTestResults(prev => [...prev, { step, status, message, details, time: new Date().toLocaleTimeString() }]);
  };

  const runFullTest = async () => {
    setTestResults([]);
    setIsRunning(true);

    try {
      // Test 1: Verificar usuario autenticado
      addResult('1', 'running', '🔐 Verificando autenticación...');
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        addResult('1', 'success', `✅ Usuario autenticado: ${user.email}`, { role: user.app_role, name: user.full_name });
      } catch (error) {
        addResult('1', 'error', '❌ Error de autenticación', { error: error.message });
        setIsRunning(false);
        return;
      }

      // Test 2: Verificar menús disponibles
      addResult('2', 'running', '📋 Buscando menús disponibles...');
      try {
        const menus = await base44.entities.Menu.list('-created_date');
        const today = new Date().toISOString().split('T')[0];
        const todayMenus = menus.filter(m => m.fecha === today && m.stock_disponible > 0);
        
        if (todayMenus.length === 0) {
          addResult('2', 'warning', '⚠️ No hay menús disponibles para hoy', { total: menus.length, hoy: 0 });
        } else {
          addResult('2', 'success', `✅ Encontrados ${todayMenus.length} menús disponibles`, { 
            primer_menu: todayMenus[0].plato_principal,
            cafeteria: todayMenus[0].cafeteria,
            stock: todayMenus[0].stock_disponible
          });
          setTestMenuId(todayMenus[0].id);
        }
      } catch (error) {
        addResult('2', 'error', '❌ Error cargando menús', { error: error.message });
      }

      // Test 3: Crear reserva temporal
      if (testMenuId) {
        addResult('3', 'running', '🎫 Creando reserva de prueba...');
        try {
          const testReserva = {
            menu_id: testMenuId,
            campus: 'Campus Test',
            cafeteria: 'Cafetería Test',
            menus_detalle: 'Menú de Prueba + Segundo Plato',
            precio_total: 2.99,
            codigo_recogida: `TEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            envase_propio: false,
            descuento_aplicado: 0
          };

          const response = await base44.functions.invoke('processReservation', {
            reservaData: testReserva,
            menuId: testMenuId
          });

          if (response.data.success) {
            addResult('3', 'success', '✅ Reserva creada correctamente', {
              reserva_id: response.data.reserva.id,
              codigo: response.data.reserva.codigo_recogida,
              stock_reducido: response.data.menu.stock_disponible
            });
          } else {
            addResult('3', 'error', '❌ Error en respuesta', response.data);
          }
        } catch (error) {
          addResult('3', 'error', '❌ Error creando reserva', { 
            error: error.message,
            response: error.response?.data 
          });
        }
      }

      // Test 4: Verificar Stripe keys
      addResult('4', 'running', '💳 Verificando configuración de Stripe...');
      try {
        const stripeTest = await base44.functions.invoke('createCheckoutSession', {
          reserva_id: 'test-' + Date.now(),
          menus_detalle: 'Menú Test',
          cafeteria: 'Test Cafeteria',
          campus: 'Test Campus',
          precio_total: 2.99,
          codigo_recogida: 'TESTCODE',
          envase_propio: false
        });

        if (stripeTest.data.checkout_url) {
          addResult('4', 'success', '✅ Stripe configurado correctamente', {
            checkout_url: stripeTest.data.checkout_url.substring(0, 50) + '...'
          });
        } else {
          addResult('4', 'error', '❌ No se pudo crear checkout', stripeTest.data);
        }
      } catch (error) {
        addResult('4', 'error', '❌ Error con Stripe', { 
          error: error.message,
          details: error.response?.data 
        });
      }

      // Test 5: Verificar webhooks logs
      addResult('5', 'info', 'ℹ️ Para verificar webhooks, ve al Dashboard de Stripe → Webhooks → Eventos recientes');

    } catch (error) {
      addResult('error', 'error', '❌ Error general en pruebas', { error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const testSpecificReserva = async () => {
    if (!testMenuId) {
      alert('Primero ejecuta el test completo para obtener un menú');
      return;
    }

    setTestResults([]);
    setIsRunning(true);

    try {
      addResult('manual', 'running', '🔄 Creando reserva manual...');
      
      const testReserva = {
        menu_id: testMenuId,
        campus: 'Campus Manual',
        cafeteria: 'Cafetería Manual',
        menus_detalle: 'Menú Manual + Segundo',
        precio_total: 2.99,
        codigo_recogida: `MAN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        envase_propio: false,
        descuento_aplicado: 0
      };

      const response = await base44.functions.invoke('processReservation', {
        reservaData: testReserva,
        menuId: testMenuId
      });

      if (response.data.success) {
        addResult('manual', 'success', '✅ Reserva manual creada', response.data);
      } else {
        addResult('manual', 'error', '❌ Error', response.data);
      }
    } catch (error) {
      addResult('manual', 'error', '❌ Error', { error: error.message, response: error.response?.data });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧪 Test del Sistema de Pagos</h1>
            <p className="text-gray-600 mt-1">Verifica que todo el flujo funcione correctamente</p>
          </div>
        </div>

        {/* Control Panel */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Panel de Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                onClick={runFullTest}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 py-6"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Ejecutando tests...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5 mr-2" />
                    Ejecutar Test Completo
                  </>
                )}
              </Button>

              <Button 
                onClick={testSpecificReserva}
                disabled={isRunning || !testMenuId}
                variant="outline"
                className="w-full py-6"
              >
                <Database className="w-5 h-5 mr-2" />
                Test Reserva Manual
              </Button>
            </div>

            {currentUser && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900">👤 Usuario actual</p>
                <p className="text-green-700">{currentUser.full_name} ({currentUser.email})</p>
                <Badge className="mt-2">{currentUser.app_role}</Badge>
              </div>
            )}

            {testMenuId && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">🍽️ Menú de prueba</p>
                <p className="text-blue-700 text-xs font-mono">{testMenuId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {testResults.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>📊 Resultados de las Pruebas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 ${getStatusBg(result.status)} transition-all duration-300`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">{result.message}</p>
                          <Badge variant="outline" className="text-xs">
                            {result.time}
                          </Badge>
                        </div>
                        {result.details && (
                          <pre className="text-xs bg-white/50 rounded p-2 mt-2 overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Webhook className="w-5 h-5" />
              Instrucciones para verificar Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <ol className="list-decimal list-inside space-y-2">
              <li>Ve al Dashboard de Stripe: <a href="https://dashboard.stripe.com/webhooks" target="_blank" className="underline font-semibold">dashboard.stripe.com/webhooks</a></li>
              <li>Busca el webhook: <code className="bg-white px-2 py-1 rounded">stripeWebhook</code></li>
              <li>Verifica que tenga eventos recientes sin errores (código 200)</li>
              <li>Si hay errores 500, revisa los logs de la función en el Dashboard de Base44</li>
              <li>Prueba haciendo un pago real con tarjeta de test: <code className="bg-white px-2 py-1 rounded">4242 4242 4242 4242</code></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}