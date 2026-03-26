import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Brain, TrendingUp, AlertTriangle, CheckCircle,
  BarChart3, Play, RefreshCw, Sparkles, Info, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function SurplusAI() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const runAlgorithm = async () => {
    setIsRunning(true);
    setResults(null);
    setError(null);
    try {
      const response = await base44.functions.invoke('autoSurplusDetection', { dry_run: dryRun });
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const sellRateColor = (rate) => {
    if (rate > 0.8) return "bg-emerald-500";
    if (rate > 0.5) return "bg-amber-400";
    return "bg-red-400";
  };

  const actionLabel = (action) => {
    const map = {
      activate_surprise: { text: "Menú sorpresa activado", dot: "bg-violet-500" },
      notify_cafeteria: { text: "Alerta enviada", dot: "bg-amber-400" },
      notify_high_demand: { text: "Alta demanda", dot: "bg-rose-500" },
      none: { text: "Sin acción", dot: "bg-gray-300" },
    };
    return map[action] || map.none;
  };

  const radarData = results?.results?.[0] ? [
    { factor: "Día semana", value: Math.round(results.results[0].algorithm_factors.dow_avg_rate * 100) },
    { factor: "Popularidad", value: Math.round((results.results[0].algorithm_factors.dish_popularity_rate ?? results.results[0].algorithm_factors.dow_avg_rate) * 100) },
    { factor: "Demanda actual", value: Math.round(results.results[0].algorithm_factors.current_sell_rate * 100) },
    { factor: "Tendencia", value: Math.round(results.results[0].algorithm_factors.trend_factor * 50) },
  ] : [];

  const barData = results?.results?.map(r => ({
    name: r.plato_principal?.split(' ').slice(0, 2).join(' ') || r.cafeteria,
    vendidos: r.predicted_sold,
    excedente: r.predicted_surplus,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Surplus AI</h1>
            <p className="text-sm text-gray-500 mt-1">
              Predice excedentes en tiempo real y activa el menú sorpresa automáticamente.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-500">En producción</span>
          </div>
        </div>

        {/* Cómo funciona — colapso visual */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Cómo funciona el algoritmo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { step: "1", label: "Historial 90 días", sub: "Reservas y ventas pasadas por cafetería" },
              { step: "2", label: "4 señales combinadas", sub: "Día de semana · plato · tendencia · demanda actual" },
              { step: "3", label: "Peso ponderado", sub: "35% DOW · 30% plato · 25% demanda · 10% tendencia" },
              { step: "4", label: "Acción automática", sub: "Si la tasa predicha baja del umbral, activa menú sorpresa" },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
                <div>
                  <p className="font-medium text-gray-800 leading-tight">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
            onClick={runAlgorithm}
            disabled={isRunning}
            className="bg-gray-900 hover:bg-gray-800 text-white gap-2 px-5 py-5 rounded-xl"
          >
            {isRunning
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analizando...</>
              : <><Play className="w-4 h-4" /> Ejecutar análisis</>
            }
          </Button>

          <button
            onClick={() => setDryRun(!dryRun)}
            className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className={`w-9 h-5 rounded-full relative transition-colors ${dryRun ? 'bg-gray-200' : 'bg-emerald-500'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dryRun ? 'left-0.5' : 'left-4'}`} />
            </div>
            <span>{dryRun ? "Modo simulación — sin cambios reales" : "Modo activo — aplica cambios"}</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Resultados */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Menús analizados", value: results.summary.total_menus_analyzed },
                  { label: "Con riesgo de excedente", value: results.summary.menus_with_surplus_risk },
                  { label: "Auto-activados", value: results.summary.menus_auto_activated },
                  { label: "Tasa venta media", value: `${Math.round(results.summary.avg_predicted_sell_rate * 100)}%` },
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Gráficos */}
              {barData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Ventas predichas vs. excedente</p>
                    <ResponsiveContainer width="100%" height={190}>
                      <BarChart data={barData} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                        />
                        <Bar dataKey="vendidos" fill="#374151" name="Predicción venta" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="excedente" fill="#fbbf24" name="Excedente predicho" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {radarData.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <p className="text-sm font-semibold text-gray-700 mb-4">Factores del primer menú</p>
                      <ResponsiveContainer width="100%" height={190}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#f0f0f0" />
                          <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                          <PolarRadiusAxis tick={false} domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#374151" fill="#374151" fillOpacity={0.12} strokeWidth={1.5} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla detallada */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-semibold text-gray-800 text-sm">Detalle por menú</p>
                  {dryRun && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">simulación</span>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {results.results.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-10">No hay menús activos hoy.</p>
                  )}
                  {results.results.map((r, i) => {
                    const action = actionLabel(r.action);
                    const isOpen = expandedRow === i;
                    return (
                      <div key={r.menu_id}>
                        <button
                          className="w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedRow(isOpen ? null : i)}
                        >
                          {/* Dot acción */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${action.dot}`} />

                          {/* Nombre */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{r.plato_principal}</p>
                            <p className="text-xs text-gray-400">{r.cafeteria}</p>
                          </div>

                          {/* Barra tasa */}
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${sellRateColor(r.predicted_sell_rate)}`}
                                style={{ width: `${Math.min(100, r.predicted_sell_rate * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{Math.round(r.predicted_sell_rate * 100)}%</span>
                          </div>

                          {/* Acción */}
                          <span className="text-xs text-gray-500 hidden md:block w-36 text-right">{action.text}</span>

                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                                {r.action_reason && (
                                  <p className="text-xs text-gray-500 mt-3 mb-3 flex items-start gap-1.5">
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                                    {r.action_reason}
                                  </p>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                  {[
                                    { label: "Día semana (35%)", val: r.algorithm_factors.dow_avg_rate, pct: true },
                                    { label: "Popularidad plato (30%)", val: r.algorithm_factors.dish_popularity_rate, pct: true },
                                    { label: "Demanda actual (25%)", val: r.algorithm_factors.current_sell_rate, pct: true },
                                    { label: "Tendencia (×)", val: r.algorithm_factors.trend_factor, mult: true },
                                  ].map((f, fi) => (
                                    <div key={fi} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                      <p className="text-xs text-gray-400">{f.label}</p>
                                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                        {f.val != null
                                          ? f.mult ? `×${f.val.toFixed(2)}` : `${Math.round(f.val * 100)}%`
                                          : "—"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{r.data_points_used} registros históricos usados · confianza: {r.confidence}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}