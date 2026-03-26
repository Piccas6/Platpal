import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, BarChart3, Play, RefreshCw, Sparkles,
  Database, Clock, Target, ArrowRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function SurplusAI() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [animStep, setAnimStep] = useState(0);
  const [dryRun, setDryRun] = useState(true);

  const ALGO_STEPS = [
    { icon: Database, label: "Cargando historial de ventas (90 días)...", color: "text-blue-500" },
    { icon: BarChart3, label: "Analizando patrones por día de semana...", color: "text-purple-500" },
    { icon: Brain, label: "Calculando popularidad de platos...", color: "text-emerald-500" },
    { icon: TrendingUp, label: "Aplicando factor de tendencia reciente...", color: "text-orange-500" },
    { icon: Target, label: "Combinando señales con pesos ponderados...", color: "text-pink-500" },
    { icon: Zap, label: "Generando predicciones y recomendaciones...", color: "text-yellow-500" },
  ];

  const runAlgorithm = async () => {
    setIsRunning(true);
    setResults(null);
    setError(null);
    setAnimStep(0);

    // Simular pasos del algoritmo visualmente
    for (let i = 0; i < ALGO_STEPS.length; i++) {
      setAnimStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const response = await base44.functions.invoke('autoSurplusDetection', { dry_run: dryRun });
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getActionBadge = (action) => {
    const map = {
      activate_surprise: { label: "🤖 Auto-activado", cls: "bg-purple-100 text-purple-800 border-purple-300" },
      notify_cafeteria: { label: "⚠️ Alerta enviada", cls: "bg-amber-100 text-amber-800 border-amber-300" },
      notify_high_demand: { label: "🔥 Alta demanda", cls: "bg-red-100 text-red-800 border-red-300" },
      none: { label: "✅ OK", cls: "bg-green-100 text-green-800 border-green-300" },
    };
    const v = map[action] || map.none;
    return <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${v.cls}`}>{v.label}</span>;
  };

  const getConfidenceBadge = (c) => {
    const map = {
      high: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-gray-100 text-gray-600"
    };
    const labels = { high: "Alta confianza", medium: "Media", low: "Pocos datos" };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${map[c]}`}>{labels[c]}</span>;
  };

  // Datos de demo para el gráfico de factores
  const radarData = results?.results?.[0] ? [
    { factor: "Día semana", value: Math.round(results.results[0].algorithm_factors.dow_avg_rate * 100) },
    { factor: "Popularidad plato", value: Math.round((results.results[0].algorithm_factors.dish_popularity_rate ?? results.results[0].algorithm_factors.dow_avg_rate) * 100) },
    { factor: "Demanda actual", value: Math.round(results.results[0].algorithm_factors.current_sell_rate * 100) },
    { factor: "Tendencia", value: Math.round(results.results[0].algorithm_factors.trend_factor * 50) },
  ] : [];

  const barData = results?.results?.map(r => ({
    name: r.plato_principal?.split(' ').slice(0, 2).join(' ') || r.cafeteria,
    vendidos: r.predicted_sold,
    excedente: r.predicted_surplus,
    tasa: Math.round(r.predicted_sell_rate * 100),
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                PlatPal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Surplus AI</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Predicción automática de excedentes · Algoritmo de demanda ponderada</p>
            </div>
          </div>

          {/* Explicación del algoritmo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { icon: Database, label: "Historial 90 días", desc: "Patrones de venta reales", color: "from-blue-500 to-cyan-500" },
              { icon: BarChart3, label: "4 señales combinadas", desc: "DOW · Plato · Tendencia · Demanda actual", color: "from-purple-500 to-violet-500" },
              { icon: Brain, label: "Pesos ponderados", desc: "35% DOW · 30% plato · 25% demanda · 10% tendencia", color: "from-emerald-500 to-teal-500" },
              { icon: Zap, label: "Acción automática", desc: "Activa menú sorpresa sin intervención humana", color: "from-orange-500 to-amber-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Button
            onClick={runAlgorithm}
            disabled={isRunning}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-purple-500/30 text-base gap-3 disabled:opacity-50"
          >
            {isRunning ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Analizando...</>
            ) : (
              <><Play className="w-5 h-5" /> Ejecutar Algoritmo</>
            )}
          </Button>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setDryRun(!dryRun)}
              className={`w-12 h-6 rounded-full transition-colors relative ${dryRun ? 'bg-slate-600' : 'bg-emerald-500'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dryRun ? 'left-1' : 'left-7'}`} />
            </div>
            <span className="text-sm text-slate-300">
              {dryRun ? "🔬 Simulación (sin cambios reales)" : "⚡ Modo activo (aplica cambios)"}
            </span>
          </label>
        </div>

        {/* Animación de pasos del algoritmo */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-black/40 border border-white/10 rounded-2xl p-6 font-mono"
            >
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest">// Ejecutando algoritmo</p>
              {ALGO_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= animStep ? 1 : 0.2, x: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <step.icon className={`w-4 h-4 ${i <= animStep ? step.color : 'text-slate-600'}`} />
                  <span className={`text-sm ${i <= animStep ? 'text-white' : 'text-slate-600'}`}>
                    {step.label}
                  </span>
                  {i < animStep && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                  {i === animStep && <span className="ml-auto w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Resultados */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Menús analizados", value: results.summary.total_menus_analyzed, icon: BarChart3, color: "from-blue-500 to-cyan-500" },
                  { label: "Con riesgo de excedente", value: results.summary.menus_with_surplus_risk, icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
                  { label: "Auto-activados", value: results.summary.menus_auto_activated, icon: Sparkles, color: "from-purple-500 to-pink-500" },
                  { label: "Tasa venta predicha", value: `${Math.round(results.summary.avg_predicted_sell_rate * 100)}%`, icon: TrendingUp, color: "from-emerald-500 to-green-500" },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-3xl font-black text-white">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{card.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Gráficos */}
              {barData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Barras: predicción ventas vs excedente */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Ventas predichas vs. Excedente
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={barData} barSize={18}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: 12, color: '#fff', fontSize: 12 }}
                        />
                        <Bar dataKey="vendidos" fill="#8b5cf6" name="Predicción venta" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="excedente" fill="#f59e0b" name="Excedente predicho" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Radar: factores del algoritmo */}
                  {radarData.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
                      <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-pink-400" />
                        Factores del algoritmo (primer menú)
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#ffffff15" />
                          <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} domain={[0, 100]} />
                          <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Tabla de resultados */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    Análisis detallado por menú
                  </h3>
                  {dryRun && (
                    <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                      🔬 Modo simulación — sin cambios aplicados
                    </span>
                  )}
                </div>
                <div className="divide-y divide-white/5">
                  {results.results.map((r, i) => (
                    <motion.div
                      key={r.menu_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="px-6 py-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{r.plato_principal}</p>
                          <p className="text-xs text-slate-400">{r.cafeteria}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {/* Barra de tasa de venta */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs">Tasa venta:</span>
                            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${r.predicted_sell_rate > 0.8 ? 'bg-emerald-500' : r.predicted_sell_rate > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, r.predicted_sell_rate * 100)}%` }}
                              />
                            </div>
                            <span className="text-white font-bold text-xs">{Math.round(r.predicted_sell_rate * 100)}%</span>
                          </div>

                          <div className="text-xs text-slate-400">
                            <span className="text-white font-semibold">{r.predicted_surplus}</span> excedente estimado
                          </div>

                          <div className="text-xs text-slate-400">
                            {r.data_points_used} datos
                          </div>

                          {getConfidenceBadge(r.confidence)}
                          {getActionBadge(r.action)}
                        </div>
                      </div>

                      {r.action_reason && (
                        <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {r.action_reason}
                        </p>
                      )}

                      {/* Desglose de factores */}
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { label: "DOW (35%)", val: r.algorithm_factors.dow_avg_rate },
                          { label: "Plato (30%)", val: r.algorithm_factors.dish_popularity_rate },
                          { label: "Actual (25%)", val: r.algorithm_factors.current_sell_rate },
                          { label: "Tendencia ×", val: r.algorithm_factors.trend_factor, isMultiplier: true },
                        ].map((f, fi) => (
                          <div key={fi} className="bg-white/5 rounded-lg px-2 py-1">
                            <p className="text-xs text-slate-500">{f.label}</p>
                            <p className="text-xs font-bold text-white">
                              {f.val !== null ? (f.isMultiplier ? `×${f.val?.toFixed(2)}` : `${Math.round((f.val ?? 0) * 100)}%`) : 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {results.results.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-500">
                      No hay menús activos hoy para analizar.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer explicativo para inversor */}
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-2xl backdrop-blur">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  Potencial de pivotaje
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {[
                    { title: "Eliminación de fricción", desc: "Las cafeterías ya no marcan excedentes manualmente. El sistema actúa solo, reduciendo la tasa de abandono de operadores." },
                    { title: "Pricing dinámico", desc: "El mismo algoritmo puede modular el precio del menú en tiempo real según la tasa de venta predicha, maximizando ingresos." },
                    { title: "API B2B / White-label", desc: "El motor de predicción puede ofrecerse como servicio a otros operadores de FoodTech, generando ingresos recurrentes." },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="font-semibold text-purple-300 mb-1">{item.title}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}