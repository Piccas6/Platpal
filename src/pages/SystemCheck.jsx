import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Bug,
  Database,
  User as UserIcon,
  Shield,
  Calendar
} from "lucide-react";
import withAuth from "../components/auth/withAuth";

function SystemCheck({ user }) {
  const [diagnostics, setDiagnostics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results = {
      user: {},
      permissions: [],
      entities: {},
      tests: []
    };

    try {
      // 1. Información del usuario
      results.user = {
        email: user.email,
        full_name: user.full_name,
        app_role: user.app_role,
        campus: user.campus,
        cafeteria_info: user.cafeteria_info,
        has_cafeteria_info: !!user.cafeteria_info,
        has_nombre_cafeteria: !!user.cafeteria_info?.nombre_cafeteria,
        nombre_cafeteria_value: user.cafeteria_info?.nombre_cafeteria || 'NO CONFIGURADO'
      };

      // 2. Verificar permisos
      const canPublish = (user.app_role === 'cafeteria' || user.app_role === 'admin') && 
                        user.cafeteria_info?.nombre_cafeteria;
      
      results.permissions.push({
        name: 'Rol correcto',
        status: (user.app_role === 'cafeteria' || user.app_role === 'admin') ? 'pass' : 'fail',
        message: `Rol actual: ${user.app_role || 'NO ASIGNADO'}`
      });

      results.permissions.push({
        name: 'Campus asignado',
        status: user.campus ? 'pass' : 'fail',
        message: user.campus || 'NO ASIGNADO'
      });

      results.permissions.push({
        name: 'Nombre de cafetería',
        status: user.cafeteria_info?.nombre_cafeteria ? 'pass' : 'fail',
        message: user.cafeteria_info?.nombre_cafeteria || 'NO CONFIGURADO'
      });

      results.permissions.push({
        name: 'Puede publicar menús',
        status: canPublish ? 'pass' : 'fail',
        message: canPublish ? 'SÍ' : 'NO - Faltan requisitos'
      });

      // 3. Verificar entidades
      try {
        const menus = await base44.entities.Menu.list();
        results.entities.menus = {
          status: 'pass',
          count: menus.length,
          message: `${menus.length} menús en BD`
        };

        // Filtrar menús de esta cafetería
        const myMenus = menus.filter(m => m.cafeteria === user.cafeteria_info?.nombre_cafeteria);
        results.entities.myMenus = {
          status: 'pass',
          count: myMenus.length,
          message: `${myMenus.length} menús de tu cafetería`
        };
      } catch (error) {
        results.entities.menus = {
          status: 'fail',
          message: `Error: ${error.message}`
        };
      }

      try {
        const reservas = await base44.entities.Reserva.list();
        results.entities.reservas = {
          status: 'pass',
          count: reservas.length,
          message: `${reservas.length} reservas en BD`
        };
      } catch (error) {
        results.entities.reservas = {
          status: 'fail',
          message: `Error: ${error.message}`
        };
      }

    } catch (error) {
      console.error('Error running diagnostics:', error);
      results.tests.push({
        name: 'Error general',
        status: 'fail',
        message: error.message
      });
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  const testCreateMenu = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testMenu = {
      campus: user.campus,
      cafeteria: user.cafeteria_info?.nombre_cafeteria,
      plato_principal: "TEST - Menú de Prueba",
      plato_secundario: "TEST - Acompañamiento",
      precio_original: 8.50,
      precio_descuento: 2.99,
      stock_total: 1,
      stock_disponible: 1,
      fecha: new Date().toISOString().split('T')[0],
      hora_limite_reserva: "16:00",
      hora_limite: "18:00",
      es_sorpresa: false,
      es_recurrente: false,
      dias_semana: [],
      permite_envase_propio: true,
      descuento_envase_propio: 0.15,
      tipo_cocina: "casera",
      es_vegetariano: false,
      es_vegano: false,
      sin_gluten: false,
      alergenos: ["ninguno"]
    };

    console.log('🧪 DATOS DEL TEST:', testMenu);

    try {
      const created = await base44.entities.Menu.create(testMenu);
      console.log('✅ MENÚ CREADO:', created);

      setTestResult({
        status: 'success',
        message: '✅ ¡Test exitoso! El menú de prueba se creó correctamente.',
        details: created,
        menuId: created.id
      });

      // Recargar diagnósticos
      setTimeout(() => runDiagnostics(), 1000);
    } catch (error) {
      console.error('❌ ERROR CREANDO MENÚ:', error);
      
      setTestResult({
        status: 'error',
        message: '❌ Error al crear menú de prueba',
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      });
    } finally {
      setIsTesting(false);
    }
  };

  const deleteTestMenu = async (menuId) => {
    try {
      await base44.entities.Menu.delete(menuId);
      setTestResult({
        ...testResult,
        deleted: true,
        deleteMessage: '✅ Menú de prueba eliminado'
      });
      setTimeout(() => runDiagnostics(), 1000);
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'fail': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Bug className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔧 Diagnóstico del Sistema</h1>
            <p className="text-gray-600 mt-1">Verificación completa de permisos y funcionalidades</p>
          </div>
          <Button 
            onClick={runDiagnostics} 
            variant="outline"
            className="ml-auto"
          >
            🔄 Actualizar
          </Button>
        </div>

        {/* Información del Usuario */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-mono text-sm font-semibold">{diagnostics.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">{diagnostics.user.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol (app_role)</p>
                <Badge className={diagnostics.user.app_role === 'cafeteria' || diagnostics.user.app_role === 'admin' ? 'bg-green-600' : 'bg-red-600'}>
                  {diagnostics.user.app_role || 'NO ASIGNADO'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Campus</p>
                <Badge className={diagnostics.user.campus ? 'bg-blue-600' : 'bg-red-600'}>
                  {diagnostics.user.campus || 'NO ASIGNADO'}
                </Badge>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">cafeteria_info.nombre_cafeteria</p>
                <div className={`p-3 rounded-lg border-2 ${diagnostics.user.has_nombre_cafeteria ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-mono font-bold text-lg">
                    {diagnostics.user.nombre_cafeteria_value}
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">cafeteria_info completo (JSON)</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(diagnostics.user.cafeteria_info, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificación de Permisos */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verificación de Permisos (RLS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnostics.permissions.map((perm, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${getStatusBg(perm.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(perm.status)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{perm.name}</p>
                      <p className="text-sm text-gray-700">{perm.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado de Entidades */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Estado de la Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(diagnostics.entities).map(([key, entity]) => (
                <div key={key} className={`p-4 rounded-xl border-2 ${getStatusBg(entity.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(entity.status)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 capitalize">{key}</p>
                      <p className="text-sm text-gray-700">{entity.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test de Creación */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Test de Creación de Menú
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Prueba crear un menú real con tus permisos actuales. Si falla, veremos el error exacto.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testCreateMenu}
              disabled={isTesting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 py-6"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando menú de prueba...
                </>
              ) : (
                <>
                  🧪 Crear Menú de Prueba
                </>
              )}
            </Button>

            {testResult && (
              <div className={`p-4 rounded-xl border-2 ${testResult.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="font-semibold text-lg mb-2">{testResult.message}</p>
                
                {testResult.status === 'success' && (
                  <>
                    <p className="text-sm text-gray-700 mb-3">
                      ID del menú: <span className="font-mono font-bold">{testResult.menuId}</span>
                    </p>
                    {!testResult.deleted && (
                      <Button
                        onClick={() => deleteTestMenu(testResult.menuId)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        🗑️ Eliminar Menú de Prueba
                      </Button>
                    )}
                    {testResult.deleted && (
                      <p className="text-green-600 font-semibold">{testResult.deleteMessage}</p>
                    )}
                  </>
                )}

                {testResult.status === 'error' && (
                  <div className="space-y-2 mt-3">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-red-900">Error:</p>
                      <p className="text-sm text-red-800 font-mono">{testResult.error}</p>
                    </div>
                    
                    {testResult.response && (
                      <div className="bg-red-100 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-red-900">Respuesta del servidor:</p>
                        <pre className="text-xs text-red-800 overflow-x-auto">
                          {JSON.stringify(testResult.response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {testResult.stack && (
                      <details className="bg-red-100 p-3 rounded-lg">
                        <summary className="text-sm font-semibold text-red-900 cursor-pointer">
                          Ver stack trace
                        </summary>
                        <pre className="text-xs text-red-800 overflow-x-auto mt-2">
                          {testResult.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900">
            <p><strong>Si ves errores rojos arriba:</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Ve a tu <strong>Perfil</strong> y completa la información faltante</li>
              <li>Asegúrate de que <code className="bg-blue-100 px-2 py-1 rounded">nombre_cafeteria</code> está bien escrito</li>
              <li>Vuelve aquí y haz clic en "🔄 Actualizar"</li>
              <li>Haz clic en "🧪 Crear Menú de Prueba" para verificar</li>
            </ol>
            <p className="mt-4"><strong>Si el test es exitoso:</strong> Ya puedes publicar menús desde la página normal.</p>
            <p><strong>Si el test falla:</strong> Copia el error completo y compártelo para investigar más.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(SystemCheck, ['user', 'cafeteria', 'admin', 'manager'], true);