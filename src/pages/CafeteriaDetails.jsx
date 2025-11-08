import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Phone, UtensilsCrossed, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CafeteriaDetails() {
  const { cafeteriaId } = useParams();
  const navigate = useNavigate();
  const [cafeteria, setCafeteria] = useState(null);
  const [menuTemplates, setMenuTemplates] = useState([]);
  const [todaysMenus, setTodaysMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [cafeteriaId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar la cafetería por ID
      const cafeteriaUser = await base44.entities.User.get(cafeteriaId);
      
      if (!cafeteriaUser || cafeteriaUser.app_role !== 'cafeteria') {
        setCafeteria(null);
        setIsLoading(false);
        return;
      }

      setCafeteria(cafeteriaUser);

      const cafeteriaName = cafeteriaUser.cafeteria_info?.nombre_cafeteria;
      
      if (cafeteriaName) {
        // Cargar plantillas
        const templates = await base44.entities.MenuTemplate.filter({
          cafeteria: cafeteriaName
        });
        setMenuTemplates(templates);

        // Cargar menús de hoy
        const today = new Date().toISOString().split('T')[0];
        const allMenus = await base44.entities.Menu.filter({
          cafeteria: cafeteriaName,
          fecha: today
        });
        setTodaysMenus(allMenus);
      }

    } catch (error) {
      console.error("Error loading cafeteria:", error);
      setCafeteria(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!cafeteria || !cafeteria.cafeteria_info) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cafetería no encontrada</h3>
            <p className="text-gray-600 mb-4">No pudimos encontrar información sobre esta cafetería.</p>
            <Button onClick={() => navigate(createPageUrl("Menus"))}>
              Ver Menús Disponibles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const info = cafeteria.cafeteria_info;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {info.nombre_cafeteria}
            </h1>
            <p className="text-gray-600 mt-1">Información y especialidades</p>
          </div>
        </div>

        {/* Información de la cafetería */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              Información
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {info.campus && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Campus {info.campus.replace('_', ' ').charAt(0).toUpperCase() + info.campus.slice(1).replace('_', ' ')}
                </span>
              </div>
            )}
            {info.ubicacion_exacta && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{info.ubicacion_exacta}</span>
              </div>
            )}
            {info.horario_apertura && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Horario: {info.horario_apertura} - {info.hora_fin_recogida}
                </span>
              </div>
            )}
            {info.contacto && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{info.contacto}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menús de hoy */}
        {todaysMenus.length > 0 && (
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                Menús Disponibles Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysMenus.map((menu) => (
                  <div key={menu.id} className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                    <h3 className="font-bold text-gray-900 mb-1">{menu.plato_principal}</h3>
                    <p className="text-sm text-gray-600 mb-2">+ {menu.plato_secundario}</p>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-emerald-500 text-white">
                        {menu.stock_disponible} disponibles
                      </Badge>
                      <span className="text-emerald-600 font-bold">€2.99</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Especialidades */}
        {menuTemplates.length > 0 ? (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Nuestras Especialidades
              </CardTitle>
              <p className="text-sm text-gray-600">
                Platos que solemos ofrecer habitualmente
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {menuTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    {template.imagen_url && (
                      <img
                        src={template.imagen_url}
                        alt={template.nombre_plantilla}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-bold text-gray-900 mb-2">
                      {template.nombre_plantilla}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.plato_principal} + {template.plato_secundario}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.tipo_cocina && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {template.tipo_cocina}
                        </Badge>
                      )}
                      {template.es_vegetariano && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          🥗 Vegetariano
                        </Badge>
                      )}
                      {template.es_vegano && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          🌱 Vegano
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sin especialidades publicadas
              </h3>
              <p className="text-gray-600">
                Esta cafetería aún no ha añadido sus especialidades.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link to={createPageUrl("Menus")}>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
              Ver Todos los Menús
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}