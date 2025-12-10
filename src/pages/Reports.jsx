import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, TrendingUp, Calendar, Filter, Sparkles, BarChart3 } from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReportVisualization from "../components/reports/ReportVisualization";
import ReportSummary from "../components/reports/ReportSummary";
import { jsPDF } from "jspdf";

export default function Reports() {
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    report_type: 'ventas',
    fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    cafeteria_filter: 'all',
    incluir_analisis_ia: true,
    incluir_visualizaciones: true,
    incluir_predicciones: false
  });

  const [cafeterias, setCafeterias] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser?.app_role === 'admin') {
          const allCafeterias = await base44.entities.Cafeteria.list();
          setCafeterias(allCafeterias.filter(c => c.activa));
        } else if (currentUser?.cafeterias_asignadas) {
          const allCafeterias = await base44.entities.Cafeteria.list();
          const userCafeterias = allCafeterias.filter(c => 
            currentUser.cafeterias_asignadas.includes(c.id) && c.activa
          );
          setCafeterias(userCafeterias);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateReport', reportConfig);
      setGeneratedReport(data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error al generar el informe: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Informe PlatPal', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${reportConfig.fecha_inicio} a ${reportConfig.fecha_fin}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;

    // Métricas principales
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Métricas Principales', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const metrics = generatedReport.metricas;
    Object.entries(metrics).forEach(([key, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      doc.text(`${label}: ${value}`, 20, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Análisis IA
    if (generatedReport.analisis_ia) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Análisis con IA', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(generatedReport.analisis_ia.resumen || '', pageWidth - 40);
      lines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 20, yPos);
        yPos += 6;
      });
    }

    doc.save(`informe_platpal_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OrbitalLoader message="Cargando..." />
      </div>
    );
  }

  if (!['admin', 'manager', 'cafeteria'].includes(user.app_role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 mb-6">Los informes están disponibles solo para administradores y gestores.</p>
            <Link to={createPageUrl("Home")}>
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">📊 Informes Automáticos</h1>
            <p className="text-gray-600 mt-1">Genera informes inteligentes con análisis IA</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Panel de Configuración */}
          <Card className="lg:col-span-1 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Configuración del Informe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Informe</Label>
                <Select 
                  value={reportConfig.report_type} 
                  onValueChange={(v) => setReportConfig(prev => ({...prev, report_type: v}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas">📈 Ventas</SelectItem>
                    <SelectItem value="menus">🍽️ Menús</SelectItem>
                    <SelectItem value="clientes">👥 Clientes</SelectItem>
                    <SelectItem value="impacto">🌱 Impacto Ambiental</SelectItem>
                    <SelectItem value="completo">📊 Completo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fecha Inicio</Label>
                <Input 
                  type="date" 
                  value={reportConfig.fecha_inicio}
                  onChange={(e) => setReportConfig(prev => ({...prev, fecha_inicio: e.target.value}))}
                />
              </div>

              <div>
                <Label>Fecha Fin</Label>
                <Input 
                  type="date" 
                  value={reportConfig.fecha_fin}
                  onChange={(e) => setReportConfig(prev => ({...prev, fecha_fin: e.target.value}))}
                />
              </div>

              {cafeterias.length > 0 && (
                <div>
                  <Label>Cafetería</Label>
                  <Select 
                    value={reportConfig.cafeteria_filter} 
                    onValueChange={(v) => setReportConfig(prev => ({...prev, cafeteria_filter: v}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {cafeterias.map(cafe => (
                        <SelectItem key={cafe.id} value={cafe.nombre}>{cafe.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Análisis con IA</Label>
                  <input 
                    type="checkbox" 
                    checked={reportConfig.incluir_analisis_ia}
                    onChange={(e) => setReportConfig(prev => ({...prev, incluir_analisis_ia: e.target.checked}))}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Visualizaciones</Label>
                  <input 
                    type="checkbox" 
                    checked={reportConfig.incluir_visualizaciones}
                    onChange={(e) => setReportConfig(prev => ({...prev, incluir_visualizaciones: e.target.checked}))}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Predicciones</Label>
                  <input 
                    type="checkbox" 
                    checked={reportConfig.incluir_predicciones}
                    onChange={(e) => setReportConfig(prev => ({...prev, incluir_predicciones: e.target.checked}))}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
              >
                {isGenerating ? (
                  <>
                    <OrbitalLoader className="w-4 h-4 mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Informe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {!generatedReport && !isGenerating && (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Genera tu primer informe
                  </h3>
                  <p className="text-gray-600">
                    Configura los parámetros y haz clic en "Generar Informe" para comenzar
                  </p>
                </CardContent>
              </Card>
            )}

            {isGenerating && (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <OrbitalLoader message="Generando informe inteligente..." />
                  <p className="text-gray-600 mt-4">
                    Analizando datos y generando insights con IA
                  </p>
                </CardContent>
              </Card>
            )}

            {generatedReport && (
              <>
                <Card className="border-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Informe Generado</CardTitle>
                    <Button onClick={handleExportPDF} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-4">
                      Periodo: {reportConfig.fecha_inicio} a {reportConfig.fecha_fin}
                    </div>
                    
                    {/* Métricas principales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Object.entries(generatedReport.metricas || {}).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Análisis IA */}
                {generatedReport.analisis_ia && (
                  <ReportSummary analisis={generatedReport.analisis_ia} />
                )}

                {/* Visualizaciones */}
                {reportConfig.incluir_visualizaciones && generatedReport.datos_grafico && (
                  <ReportVisualization 
                    data={generatedReport.datos_grafico}
                    reportType={reportConfig.report_type}
                  />
                )}

                {/* Predicciones */}
                {reportConfig.incluir_predicciones && generatedReport.predicciones && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Predicciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {generatedReport.predicciones}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}