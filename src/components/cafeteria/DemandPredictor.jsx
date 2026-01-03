import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DemandPredictor({ cafeteriaName, platoData, onStockSuggestion }) {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!platoData.plato_principal || !platoData.fecha) {
      setError('Completa el primer plato y la fecha para obtener predicción');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await base44.functions.invoke('predictMenuDemand', {
        cafeteria_name: cafeteriaName,
        plato_principal: platoData.plato_principal,
        plato_secundario: platoData.plato_secundario,
        fecha: platoData.fecha
      });

      setPrediction(data.prediccion);
      
      // Sugerir el stock al componente padre
      if (onStockSuggestion && data.prediccion?.stock_recomendado) {
        onStockSuggestion(data.prediccion.stock_recomendado);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudo obtener predicción. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confianza) => {
    switch (confianza) {
      case 'alto': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Predicción de Demanda IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Usa IA para predecir cuántos menús necesitas basándose en tu historial de ventas.
            </p>
            <Button
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></div>
                  Analizando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Obtener Predicción
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-100 rounded-xl">
              <div>
                <p className="text-sm text-purple-700 font-medium">Stock Recomendado</p>
                <p className="text-3xl font-black text-purple-900">{prediction.stock_recomendado}</p>
              </div>
              <Badge className={getConfidenceColor(prediction.confianza)}>
                Confianza: {prediction.confianza}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Factores Clave
              </h4>
              <ul className="space-y-1">
                {prediction.factores_clave?.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Recomendaciones
              </h4>
              <ul className="space-y-1">
                {prediction.recomendaciones?.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {prediction.razonamiento && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-600 italic">{prediction.razonamiento}</p>
              </div>
            )}

            <Button
              onClick={() => setPrediction(null)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Nueva Predicción
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}