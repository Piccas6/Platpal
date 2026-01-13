import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function SurpriseRequestsPanel({ cafeteriaName }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [responseNotes, setResponseNotes] = useState({});

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 10000); // Actualizar cada 10s
    return () => clearInterval(interval);
  }, [cafeteriaName]);

  const loadRequests = async () => {
    try {
      const allRequests = await base44.entities.SurpriseMenuRequest.list('-created_date', 50);
      
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = allRequests.filter(r => 
        r.cafeteria_name === cafeteriaName && 
        r.fecha_solicitud?.startsWith(today) &&
        r.estado === 'pendiente'
      );

      setRequests(todayRequests);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request) => {
    setProcessingId(request.id);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Crear menú sorpresa
      const menuData = {
        campus: request.campus,
        cafeteria: request.cafeteria_name,
        plato_principal: "Menú Sorpresa del Día",
        plato_secundario: "Preparado especialmente para ti",
        precio_original: 8.5,
        precio_descuento: 2.99,
        stock_total: 1,
        stock_disponible: 1,
        fecha: today,
        es_sorpresa: true,
        hora_limite: request.hora_recogida_deseada.split('-')[1] || "18:00",
        permite_envase_propio: true,
        es_vegetariano: request.preferencia_vegetariano || false,
        es_vegano: request.preferencia_vegano || false,
        alergenos: request.alergias || []
      };

      const newMenu = await base44.entities.Menu.create(menuData);

      // Actualizar solicitud
      await base44.entities.SurpriseMenuRequest.update(request.id, {
        estado: 'aceptada',
        fecha_respuesta: new Date().toISOString(),
        menu_creado_id: newMenu.id,
        notas_cafeteria: responseNotes[request.id] || "¡Preparamos tu menú sorpresa!"
      });

      alert("✅ Solicitud aceptada y menú creado");
      await loadRequests();
      
    } catch (error) {
      console.error("Error aceptando solicitud:", error);
      alert("Error al procesar la solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    if (!confirm("¿Seguro que quieres rechazar esta solicitud?")) return;

    setProcessingId(request.id);
    try {
      await base44.entities.SurpriseMenuRequest.update(request.id, {
        estado: 'rechazada',
        fecha_respuesta: new Date().toISOString(),
        notas_cafeteria: responseNotes[request.id] || "No podemos atender esta solicitud en este momento"
      });

      alert("Solicitud rechazada");
      await loadRequests();
      
    } catch (error) {
      console.error("Error rechazando solicitud:", error);
      alert("Error al rechazar la solicitud");
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeRemaining = (fechaSolicitud) => {
    const solicitud = new Date(fechaSolicitud);
    const expiracion = new Date(solicitud.getTime() + 30 * 60000); // 30 minutos
    const now = new Date();
    const diff = expiracion - now;
    
    if (diff <= 0) return "Expirado";
    
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min restantes`;
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6 flex justify-center">
          <OrbitalLoader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Solicitudes de Menú Sorpresa
          {requests.length > 0 && (
            <Badge className="bg-purple-500">{requests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-purple-600" />
                      <p className="font-bold text-gray-900">{request.student_name}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Recogida: {request.hora_recogida_deseada}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(request.fecha_solicitud)}
                  </Badge>
                </div>

                {request.preferencia_vegetariano && (
                  <Badge className="bg-green-100 text-green-800 mr-2 mb-2">Vegetariano</Badge>
                )}
                {request.preferencia_vegano && (
                  <Badge className="bg-green-100 text-green-800 mr-2 mb-2">Vegano</Badge>
                )}

                {request.notas_estudiante && (
                  <div className="mt-2 p-3 bg-white rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Notas del estudiante:</p>
                    <p className="text-sm text-gray-600">{request.notas_estudiante}</p>
                  </div>
                )}

                {request.alergias?.length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Alergias:</p>
                    <p className="text-sm text-red-600">{request.alergias.join(', ')}</p>
                  </div>
                )}

                <div className="mt-3">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nota para el estudiante (opcional):
                  </label>
                  <Textarea
                    value={responseNotes[request.id] || ''}
                    onChange={(e) => setResponseNotes({ ...responseNotes, [request.id]: e.target.value })}
                    placeholder="Ej: Te prepararemos pasta con ensalada"
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => handleAccept(request)}
                    disabled={processingId === request.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingId === request.id ? (
                      <OrbitalLoader className="w-4 h-4" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceptar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleReject(request)}
                    disabled={processingId === request.id}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay solicitudes pendientes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}