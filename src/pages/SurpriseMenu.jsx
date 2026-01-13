import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

export default function SurpriseMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cafeterias, setCafeterias] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    cafeteria_id: "",
    hora_recogida_deseada: "",
    notas_estudiante: "",
    alergias: [],
    preferencia_vegetariano: false,
    preferencia_vegano: false
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Actualizar cada 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [allCafeterias, allRequests] = await Promise.all([
        base44.entities.Cafeteria.list(),
        base44.entities.SurpriseMenuRequest.list('-created_date', 50)
      ]);

      const activeCafeterias = allCafeterias.filter(c => c.activa && c.aprobada);
      setCafeterias(activeCafeterias);

      const today = new Date().toISOString().split('T')[0];
      const userRequests = allRequests.filter(r => 
        r.created_by === currentUser.email && r.fecha_solicitud?.startsWith(today)
      );
      setMyRequests(userRequests);

    } catch (error) {
      console.error("Error cargando datos:", error);
      navigate(createPageUrl("Home"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cafeteria_id || !formData.hora_recogida_deseada) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const selectedCafeteria = cafeterias.find(c => c.id === formData.cafeteria_id);
    if (!selectedCafeteria) return;

    setIsSubmitting(true);
    try {
      await base44.entities.SurpriseMenuRequest.create({
        student_email: user.email,
        student_name: user.full_name,
        cafeteria_id: selectedCafeteria.id,
        cafeteria_name: selectedCafeteria.nombre,
        campus: selectedCafeteria.campus,
        hora_recogida_deseada: formData.hora_recogida_deseada,
        notas_estudiante: formData.notas_estudiante,
        alergias: formData.alergias,
        preferencia_vegetariano: formData.preferencia_vegetariano,
        preferencia_vegano: formData.preferencia_vegano,
        fecha_solicitud: new Date().toISOString(),
        estado: "pendiente"
      });

      alert("✅ Solicitud enviada a la cafetería. Te notificaremos cuando respondan.");
      
      setFormData({
        cafeteria_id: "",
        hora_recogida_deseada: "",
        notas_estudiante: "",
        alergias: [],
        preferencia_vegetariano: false,
        preferencia_vegano: false
      });

      await loadData();
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      alert("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (estado) => {
    const variants = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pendiente' },
      aceptada: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Aceptada' },
      rechazada: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rechazada' },
      reservada: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Reservada' },
      expirada: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Expirada' }
    };
    const variant = variants[estado] || variants.pendiente;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.bg} ${variant.text} gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  const handleReserveAcceptedMenu = async (request) => {
    if (!request.menu_creado_id) {
      alert("No hay menú disponible para reservar");
      return;
    }
    
    navigate(createPageUrl("Menus"), { 
      state: { highlightMenuId: request.menu_creado_id }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <OrbitalLoader message="Cargando menús sorpresa..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl("Menus"))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Menús
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Menú Sorpresa
            </h1>
            <p className="text-gray-600 mt-2">
              Solicita un menú del día aunque la cafetería no tenga publicado
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              ¿Cómo funciona?
            </h3>
            <ol className="text-sm text-purple-800 space-y-2 ml-4 list-decimal">
              <li>Selecciona una cafetería y hora de recogida</li>
              <li>La cafetería tiene 30 minutos para aceptar o rechazar</li>
              <li>Si acepta, recibirás notificación y podrás reservar por 2,99€</li>
              <li>Recoge tu menú sorpresa en la hora indicada</li>
            </ol>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nueva Solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cafetería *
                </label>
                <Select
                  value={formData.cafeteria_id}
                  onValueChange={(value) => setFormData({ ...formData, cafeteria_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cafetería" />
                  </SelectTrigger>
                  <SelectContent>
                    {cafeterias.map(cafe => (
                      <SelectItem key={cafe.id} value={cafe.id}>
                        {cafe.nombre} - {cafe.campus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hora de Recogida *
                </label>
                <Select
                  value={formData.hora_recogida_deseada}
                  onValueChange={(value) => setFormData({ ...formData, hora_recogida_deseada: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona franja horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13:00-14:00">13:00 - 14:00</SelectItem>
                    <SelectItem value="14:00-15:00">14:00 - 15:00</SelectItem>
                    <SelectItem value="15:00-16:00">15:00 - 16:00</SelectItem>
                    <SelectItem value="16:00-17:00">16:00 - 17:00</SelectItem>
                    <SelectItem value="17:00-18:00">17:00 - 18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferencia_vegetariano}
                    onChange={(e) => setFormData({ ...formData, preferencia_vegetariano: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Vegetariano</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferencia_vegano}
                    onChange={(e) => setFormData({ ...formData, preferencia_vegano: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Vegano</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas o Preferencias
                </label>
                <Textarea
                  value={formData.notas_estudiante}
                  onChange={(e) => setFormData({ ...formData, notas_estudiante: e.target.value })}
                  placeholder="Ej: Sin frutos secos, prefiero pasta..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? <OrbitalLoader className="w-5 h-5" /> : "Enviar Solicitud"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {myRequests.length > 0 ? (
              <div className="space-y-3">
                {myRequests.map(request => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-xl border-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{request.cafeteria_name}</p>
                        <p className="text-sm text-gray-600">
                          Recogida: {request.hora_recogida_deseada}
                        </p>
                      </div>
                      {getStatusBadge(request.estado)}
                    </div>

                    {request.notas_cafeteria && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900">Nota de la cafetería:</p>
                        <p className="text-sm text-blue-800">{request.notas_cafeteria}</p>
                      </div>
                    )}

                    {request.estado === 'aceptada' && request.menu_creado_id && (
                      <Button
                        onClick={() => handleReserveAcceptedMenu(request)}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700"
                      >
                        Ver Menú y Reservar
                      </Button>
                    )}

                    {request.estado === 'rechazada' && (
                      <p className="text-xs text-red-600 mt-2">
                        La cafetería no pudo atender esta solicitud
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No tienes solicitudes hoy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}