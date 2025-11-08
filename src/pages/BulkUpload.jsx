import React, { useState } from "react";
import { Menu } from "@/entities/Menu";
import { MenuTemplate } from "@/entities/MenuTemplate";
import { User } from "@/entities/User";
import { UploadFile, ExtractDataFromUploadedFile, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import withAuth from "../components/auth/withAuth";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft, Download, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function BulkUpload({ user }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(extension)) {
        setError('Por favor, sube un archivo CSV o Excel (.xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // 1. Subir archivo
      const { file_url } = await UploadFile({ file });

      // 2. Extraer datos del archivo
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            menus: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  plato_principal: { type: "string" },
                  plato_secundario: { type: "string" },
                  fecha: { type: "string" },
                  stock_total: { type: "number" },
                  hora_limite_reserva: { type: "string" },
                  hora_limite: { type: "string" },
                  tipo_cocina: { type: "string" },
                  es_vegetariano: { type: "boolean" },
                  es_vegano: { type: "boolean" },
                  sin_gluten: { type: "boolean" },
                  permite_envase_propio: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      if (extractionResult.status === 'error') {
        throw new Error(extractionResult.details || 'Error al procesar el archivo');
      }

      const menusData = extractionResult.output.menus;

      // 3. Crear menús en la base de datos
      const cafeteriaName = user.cafeteria_info?.nombre_cafeteria;
      const campus = user.cafeteria_info?.campus;

      const createdMenus = [];
      for (const menuData of menusData) {
        try {
          // Generar imagen con IA
          let imageUrl = '';
          try {
            const imagePrompt = `Fotografía profesional y apetitosa de un plato de comida: ${menuData.plato_principal} con ${menuData.plato_secundario}. Estilo culinario, bien iluminado, fondo neutro, presentación de restaurante.`;
            const { url } = await GenerateImage({ prompt: imagePrompt });
            imageUrl = url;
          } catch (imgError) {
            console.error("Error generating image:", imgError);
            // Continuar sin imagen si falla
          }

          const menu = await Menu.create({
            cafeteria: cafeteriaName,
            campus: campus,
            plato_principal: menuData.plato_principal,
            plato_secundario: menuData.plato_secundario,
            fecha: menuData.fecha,
            stock_total: menuData.stock_total,
            stock_disponible: menuData.stock_total,
            hora_limite_reserva: menuData.hora_limite_reserva || "16:00",
            hora_limite: menuData.hora_limite || "18:00",
            precio_original: 5.99,
            precio_descuento: 2.99,
            tipo_cocina: menuData.tipo_cocina || "casera",
            es_vegetariano: menuData.es_vegetariano || false,
            es_vegano: menuData.es_vegano || false,
            sin_gluten: menuData.sin_gluten || false,
            permite_envase_propio: menuData.permite_envase_propio !== false,
            descuento_envase_propio: 0.15,
            imagen_url: imageUrl
          });
          createdMenus.push(menu);
        } catch (menuError) {
          console.error("Error creating menu:", menuError);
        }
      }

      setResult({
        success: true,
        totalMenus: menusData.length,
        createdMenus: createdMenus.length
      });

    } catch (error) {
      console.error("Error in bulk upload:", error);
      setError(error.message || 'Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `plato_principal,plato_secundario,fecha,stock_total,hora_limite_reserva,hora_limite,tipo_cocina,es_vegetariano,es_vegano,sin_gluten
Paella Valenciana,Ensalada,2024-06-15,10,16:00,18:00,mediterranea,false,false,false
Lentejas con chorizo,Pan,2024-06-15,8,16:00,18:00,casera,false,false,true
Pasta Carbonara,Ensalada César,2024-06-16,12,16:00,18:00,italiana,false,false,false`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_menus_platpal.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              Carga Masiva de Menús
            </h1>
            <p className="text-gray-600 mt-1">Sube un archivo CSV o Excel con varios menús a la vez</p>
          </div>
        </div>

        {/* Instrucciones */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Cómo usar la carga masiva:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Descarga la plantilla de ejemplo (botón abajo)</li>
              <li>2. Rellena el archivo con los datos de tus menús</li>
              <li>3. Sube el archivo aquí</li>
              <li>4. ¡Listo! Los menús se crearán automáticamente con imágenes generadas por IA</li>
            </ol>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla CSV
            </Button>
          </CardContent>
        </Card>

        {/* Área de carga */}
        <Card>
          <CardHeader>
            <CardTitle>Subir Archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Archivo seleccionado: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {result && result.success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                  <p className="font-semibold">¡Carga completada exitosamente!</p>
                  <p className="text-sm">
                    Se crearon {result.createdMenus} de {result.totalMenus} menús con imágenes generadas por IA
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-6"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Procesando y generando imágenes con IA...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Subir y Crear Menús
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Campos requeridos */}
        <Card>
          <CardHeader>
            <CardTitle>Campos del Archivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Badge variant="outline">plato_principal (requerido)</Badge>
              <Badge variant="outline">plato_secundario (requerido)</Badge>
              <Badge variant="outline">fecha (requerido, YYYY-MM-DD)</Badge>
              <Badge variant="outline">stock_total (requerido)</Badge>
              <Badge variant="outline">hora_limite_reserva (opcional)</Badge>
              <Badge variant="outline">hora_limite (opcional)</Badge>
              <Badge variant="outline">tipo_cocina (opcional)</Badge>
              <Badge variant="outline">es_vegetariano (opcional, true/false)</Badge>
              <Badge variant="outline">es_vegano (opcional, true/false)</Badge>
              <Badge variant="outline">sin_gluten (opcional, true/false)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(BulkUpload, ['cafeteria', 'admin']);