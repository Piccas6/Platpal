import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";

export default function ReportSummary({ analisis }) {
  if (!analisis) return null;

  return (
    <div className="space-y-4">
      {/* Resumen ejecutivo */}
      {analisis.resumen && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Análisis con IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {analisis.resumen}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {/* Puntos clave */}
        {analisis.puntos_clave && analisis.puntos_clave.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Puntos Clave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analisis.puntos_clave.map((punto, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                      {idx + 1}
                    </Badge>
                    <span>{punto}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Oportunidades */}
        {analisis.oportunidades && analisis.oportunidades.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analisis.oportunidades.map((oportunidad, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                      💡
                    </Badge>
                    <span>{oportunidad}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recomendaciones */}
        {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analisis.recomendaciones.map((recomendacion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0 bg-green-50 text-green-700 border-green-200">
                      ✓
                    </Badge>
                    <span>{recomendacion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}