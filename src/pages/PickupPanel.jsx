
import React, { useState, useEffect, useCallback } from "react";
import { Reserva } from "@/entities/Reserva";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import withAuth from "../components/auth/withAuth";
import { QrCode, CheckCircle2, AlertCircle, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function PickupPanel({ user }) {
  const [searchCode, setSearchCode] = useState('');
  const [reservations, setReservations] = useState([]);
  const [foundReservation, setFoundReservation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPendingReservations = useCallback(async () => {
    try {
      const cafeteriaName = user.cafeteria_info?.nombre_cafeteria;
      if (!cafeteriaName) {
        setReservations([]); // Clear reservations if no cafeteria name
        return;
      }

      const allReservations = await Reserva.list('-created_date');
      const pending = allReservations.filter(r => 
        r.cafeteria === cafeteriaName && 
        r.estado === 'pagado'
      );
      setReservations(pending);
    } catch (error) {
      // Si es rate limit, no hacer nada (evitar spam de errores en consola por auto-refresh)
      if (!error.message?.includes('Rate limit')) {
        console.error("Error loading reservations:", error);
      }
    }
  }, [user.cafeteria_info?.nombre_cafeteria]); // Dependency on cafeteria name

  useEffect(() => {
    loadPendingReservations();
    
    // FIXED: Cambiado de 15s a 60s para evitar rate limit
    const interval = setInterval(loadPendingReservations, 60000);
    return () => clearInterval(interval);
  }, [loadPendingReservations]); // Dependency on the memoized function

  const handleSearch = async () => {
    setError('');
    setSuccess('');
    setFoundReservation(null);

    if (!searchCode.trim()) {
      setError('Por favor, introduce un código de recogida');
      return;
    }

    try {
      const cafeteriaName = user.cafeteria_info?.nombre_cafeteria;
      if (!cafeteriaName) {
        setError('No se pudo obtener la información de la cafetería.');
        return;
      }

      const allReservations = await Reserva.list();
      const found = allReservations.find(r => 
        r.codigo_recogida === searchCode.toUpperCase() &&
        r.cafeteria === cafeteriaName
      );

      if (!found) {
        setError('Código no encontrado o no pertenece a esta cafetería');
        return;
      }

      if (found.estado === 'recogido') {
        setError('Este pedido ya fue recogido anteriormente');
        return;
      }

      if (found.estado !== 'pagado') {
        setError('Este pedido aún no ha sido pagado');
        return;
      }

      setFoundReservation(found);
    } catch (error) {
      console.error("Error searching code:", error);
      setError('Error al buscar el código');
    }
  };

  const handleMarkAsPickedUp = async (reservaId) => {
    try {
      await Reserva.update(reservaId, {
        estado: 'recogido'
      });

      setSuccess('¡Pedido marcado como recogido exitosamente!');
      setFoundReservation(null);
      setSearchCode('');
      loadPendingReservations();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Error marking as picked up:", error);
      setError('Error al marcar como recogido');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="w-8 h-8 text-emerald-600" />
              Panel de Recogida
            </h1>
            <p className="text-gray-600 mt-1">Valida códigos y entrega pedidos</p>
          </div>
        </div>

        {/* Buscador de código */}
        <Card className="border-2 border-emerald-200">
          <CardHeader>
            <CardTitle>Buscar Código de Recogida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Introduce el código (ej: PLPABC123)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="text-lg font-mono uppercase"
                autoFocus
              />
              <Button 
                onClick={handleSearch}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span>{success}</span>
              </div>
            )}

            {foundReservation && (
              <div className="p-6 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="text-xl font-bold text-gray-900">{foundReservation.user_name}</p>
                  </div>
                  <Badge className="text-lg px-4 py-2 bg-emerald-600">
                    €{foundReservation.precio_total?.toFixed(2)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-700"><strong>Menú:</strong> {foundReservation.menus_detalle}</p>
                  {foundReservation.envase_propio && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      ♻️ Cliente trae envase propio
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => handleMarkAsPickedUp(foundReservation.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Marcar como Recogido
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de pedidos pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Pedidos Pendientes ({reservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reservations.map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border hover:border-emerald-300 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{reserva.user_name}</p>
                      <p className="text-sm text-gray-600">{reserva.menus_detalle}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Código: <span className="font-mono font-bold text-lg text-emerald-600">{reserva.codigo_recogida}</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSearchCode(reserva.codigo_recogida);
                        handleSearch();
                      }}
                      variant="outline"
                    >
                      Validar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay pedidos pendientes de recogida</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PickupPanel, ['cafeteria', 'admin']);
