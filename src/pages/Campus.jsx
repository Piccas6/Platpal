import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CampusCard from "../components/campus/CampusCard";
import { base44 } from "@/api/base44Client";

const initialCampusData = [
  { id: "jerez", nombre: "Campus Jerez", ubicacion: "Jerez de la Frontera", horario: "08:00 - 18:00", cafeterias: [] },
  { id: "puerto_real", nombre: "Campus Puerto Real", ubicacion: "Puerto Real", horario: "08:00 - 17:30", cafeterias: [] },
  { id: "cadiz", nombre: "Campus Cádiz", ubicacion: "Cádiz Centro", horario: "08:00 - 19:00", cafeterias: [] },
  { id: "algeciras", nombre: "Campus Algeciras", ubicacion: "Algeciras", horario: "08:00 - 17:00", cafeterias: [] }
];

export default function Campus() {
  const navigate = useNavigate();
  const [campusList, setCampusList] = useState(initialCampusData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        // NUEVO: Obtener todas las cafeterías APROBADAS desde la entidad Cafeteria
        const allCafeterias = await base44.entities.Cafeteria.list();
        
        // Filtrar solo las aprobadas y activas
        const cafeteriasAprobadas = allCafeterias.filter(c => 
          c.aprobada === true && c.activa === true
        );

        console.log('✅ Cafeterías aprobadas:', cafeteriasAprobadas);

        // Agrupar por campus
        const cafeteriasByCampus = {
          jerez: [],
          puerto_real: [],
          cadiz: [],
          algeciras: []
        };

        cafeteriasAprobadas.forEach(cafeteria => {
          const campusId = cafeteria.campus;
          if (campusId && cafeteriasByCampus[campusId]) {
            cafeteriasByCampus[campusId].push({
              id: cafeteria.id,
              nombre: cafeteria.nombre,
              descripcion: cafeteria.descripcion,
              ubicacion_exacta: cafeteria.ubicacion_exacta
            });
          }
        });

        // Actualizar la lista de campus con las cafeterías agrupadas
        const updatedCampusList = initialCampusData.map(campus => ({
          ...campus,
          cafeterias: cafeteriasByCampus[campus.id] || []
        }));

        setCampusList(updatedCampusList);
      } catch (error) {
        console.error("Error fetching cafeterias:", error);
        setCampusList(initialCampusData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafeterias();
  }, []);

  const handleCampusSelect = (campus) => {
    localStorage.setItem('selectedCampus', JSON.stringify(campus));
    navigate(createPageUrl("Menus"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="ml-4 text-lg text-gray-700">Cargando campus...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Selecciona tu campus
            </h1>
            <p className="text-gray-600 mt-2">Elige dónde quieres recoger tu menú sostenible</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {campusList.map((campus) => (
            <CampusCard 
              key={campus.id}
              campus={campus}
              onSelect={handleCampusSelect}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-3xl border border-emerald-100/50">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-gray-900">💚 Tu elección importa</h3>
            <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Al elegir PlatPal, no solo ahorras dinero en comida deliciosa, sino que también contribuyes a 
              reducir el desperdicio alimentario y apoyas a organizaciones benéficas locales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}