import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, ExternalLink, Loader2, Search, CheckCircle, X, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function GooglePlacesSelector({ cafeteria, onUpdate }) {
  const [mapsUrl, setMapsUrl] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');

    if (!mapsUrl.trim() && !address.trim()) {
      setError('Por favor, completa al menos la URL de Google Maps o la dirección');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        ubicacion_exacta: address.trim() || cafeteria.ubicacion_exacta
      };

      if (mapsUrl.trim()) {
        updateData.google_maps_url = mapsUrl.trim();
        
        // Extraer place_id de la URL si existe
        const placeIdMatch = mapsUrl.match(/place\/([^\/\?]+)/);
        if (placeIdMatch) {
          updateData.google_place_id = placeIdMatch[1];
        }
      }

      await base44.entities.Cafeteria.update(cafeteria.id, updateData);

      setSuccessMessage('✅ Ubicación guardada correctamente');
      setMapsUrl('');
      setAddress('');
      
      setTimeout(() => {
        if (onUpdate) onUpdate();
      }, 1500);
    } catch (error) {
      console.error('Error saving location:', error);
      setError('❌ Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLocation = async () => {
    if (!confirm('¿Desvincular ubicación de Google Maps?')) return;

    setIsSaving(true);
    setError('');
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

      setSuccessMessage('✅ Ubicación desvinculada');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error removing location:', error);
      setError('❌ Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Vincular con Google Maps
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          📱 Cómo obtener el enlace:
        </p>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Abre Google Maps en tu móvil o PC</li>
          <li>Busca tu cafetería</li>
          <li>Toca "Compartir" y copia el enlace</li>
          <li>Pégalo aquí abajo</li>
        </ol>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {cafeteria.google_maps_url ? (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">✅ Ubicación vinculada</span>
            </div>
            <Button
              onClick={handleRemoveLocation}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" />Quitar</>}
            </Button>
          </div>
          {cafeteria.ubicacion_exacta && (
            <p className="text-sm text-gray-700 mb-2">📍 {cafeteria.ubicacion_exacta}</p>
          )}
          <a 
            href={cafeteria.google_maps_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en Google Maps
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label className="mb-2 block font-semibold">🔗 URL de Google Maps *</Label>
            <Input
              value={mapsUrl}
              onChange={(e) => {
                setMapsUrl(e.target.value);
                setError('');
              }}
              placeholder="https://maps.app.goo.gl/xxxxx o https://maps.google.com/..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pega aquí el enlace que copiaste de Google Maps
            </p>
          </div>

          <div>
            <Label className="mb-2 block font-semibold">📍 Dirección (opcional)</Label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle Universidad 10, Jerez de la Frontera"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || (!mapsUrl.trim() && !address.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Guardar Ubicación
              </>
            )}
          </Button>
        </div>
      )}

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Los estudiantes podrán ver tu ubicación en el mapa y obtener indicaciones para llegar.
        </p>
      </div>
    </div>
  );
}