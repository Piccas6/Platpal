import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, ExternalLink, Loader2, Search, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GooglePlacesSelector({ cafeteria, onUpdate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Busca en Google Places el lugar "${searchQuery}" en la zona de ${cafeteria.campus}, España. Devuelve solo los 3 primeros resultados con: nombre, dirección, place_id, coordenadas (lat, lng), y URL de Google Maps.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  address: { type: "string" },
                  place_id: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" },
                  maps_url: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSearchResults(response?.results || []);
    } catch (error) {
      console.error('Error searching places:', error);
      alert('Error al buscar lugares: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = async (place) => {
    setSelectedPlace(place);
    setIsSaving(true);

    try {
      await base44.entities.Cafeteria.update(cafeteria.id, {
        google_place_id: place.place_id,
        google_maps_url: place.maps_url,
        latitud: place.lat,
        longitud: place.lng,
        ubicacion_exacta: place.address
      });

      if (onUpdate) {
        onUpdate();
      }

      alert('✅ Ubicación vinculada correctamente');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error saving location:', error);
      alert('❌ Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLocation = async () => {
    if (!confirm('¿Desvincular ubicación de Google Maps?')) return;

    setIsSaving(true);
    try {
      await base44.entities.Cafeteria.update(cafeteria.id, {
        google_place_id: null,
        google_maps_url: null,
        latitud: null,
        longitud: null
      });

      if (onUpdate) {
        onUpdate();
      }

      setSelectedPlace(null);
      alert('✅ Ubicación desvinculada');
    } catch (error) {
      console.error('Error removing location:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4" />
          Ubicación en Google Maps
        </Label>

        {cafeteria.google_place_id ? (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Ubicación vinculada</span>
                </div>
                {cafeteria.ubicacion_exacta && (
                  <p className="text-sm text-gray-700 mb-2">📍 {cafeteria.ubicacion_exacta}</p>
                )}
                {cafeteria.latitud && cafeteria.longitud && (
                  <p className="text-xs text-gray-600 mb-3">
                    Coordenadas: {cafeteria.latitud.toFixed(6)}, {cafeteria.longitud.toFixed(6)}
                  </p>
                )}
                {cafeteria.google_maps_url && (
                  <a 
                    href={cafeteria.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en Google Maps
                  </a>
                )}
              </div>
              <Button
                onClick={handleRemoveLocation}
                disabled={isSaving}
                variant="outline"
                size="sm"
                className="ml-3"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desvincular'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar "${cafeteria.nombre}" en Google Maps...`}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Resultados:</p>
                {searchResults.map((place, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer group"
                    onClick={() => handleSelectPlace(place)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">{place.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                        {place.lat && place.lng && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="ml-3 bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving}
                      >
                        {isSaving && selectedPlace?.place_id === place.place_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Seleccionar'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        💡 Vincula tu cafetería con Google Maps para que los estudiantes puedan encontrarte fácilmente y obtener indicaciones.
      </p>
    </div>
  );
}