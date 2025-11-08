import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, UtensilsCrossed, ArrowRight, Building2 } from "lucide-react";

export default function CampusCard({ campus, onSelect }) {
  // Imágenes reales de los campus de la Universidad de Cádiz
  const campusImages = {
    jerez: "https://www.uca.es/wp-content/uploads/2017/05/CampusJerez.jpg",
    puerto_real: "https://admpuertoreal.uca.es/wp-content/uploads/2021/05/Campus-PR-1024x768.jpg",
    cadiz: "https://www.uca.es/wp-content/uploads/2017/05/CampusCadiz.jpg",
    algeciras: "https://www.uca.es/wp-content/uploads/2018/03/IMG_2098.jpg"
  };

  const campusGradients = {
    jerez: "from-blue-500 to-indigo-600",
    puerto_real: "from-emerald-500 to-green-600",
    cadiz: "from-orange-500 to-amber-600",
    algeciras: "from-purple-500 to-pink-600"
  };

  const campusName = campus?.nombre || 'Campus';
  const campusLocation = campus?.ubicacion || '';
  const campusSchedule = campus?.horario || '';
  const campusCafeterias = Array.isArray(campus?.cafeterias) ? campus.cafeterias : [];

  return (
    <Card className="group overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:scale-[1.02] cursor-pointer" onClick={() => onSelect(campus)}>
      <CardContent className="p-0">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={campusImages[campus.id] || campusImages.jerez} 
            alt={campusName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${campusGradients[campus.id] || campusGradients.jerez} mix-blend-multiply opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>
          
          <div className="absolute top-4 left-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-7 h-7 text-gray-700" />
            </div>
          </div>

          {campusCafeterias.length > 0 && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 font-semibold shadow-md px-3 py-1">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                {campusCafeterias.length} {campusCafeterias.length === 1 ? 'cafetería' : 'cafeterías'}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:translate-x-2 transition-transform duration-300">
              {campusName}
            </h3>
            <p className="text-white/90 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {campusLocation}
            </p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Horario</p>
                <p className="text-gray-600">{campusSchedule}</p>
              </div>
            </div>

            {campusCafeterias.length > 0 ? (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Establecimientos disponibles
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {campusCafeterias.map((caf, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-100">
                      <UtensilsCrossed className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{caf.nombre}</p>
                        {caf.ubicacion_exacta && (
                          <p className="text-xs text-gray-500 truncate">{caf.ubicacion_exacta}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-200">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800 text-center">
                    📍 Próximamente nuevos establecimientos
                  </p>
                </div>
              </div>
            )}

            <Button 
              onClick={() => onSelect(campus)}
              disabled={campusCafeterias.length === 0}
              className={`w-full rounded-2xl py-6 font-semibold shadow-md hover:shadow-lg transition-all duration-300 group/btn mt-4 ${
                campusCafeterias.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
              }`}
            >
              {campusCafeterias.length === 0 ? (
                'Sin menús disponibles'
              ) : (
                <>
                  Ver menús disponibles
                  <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}