import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { manifestJSON, serviceWorkerCode, PWA_INSTRUCTIONS } from '@/components/pwa/PWAConfig';
import { 
  Download, Copy, CheckCircle, Smartphone, Code, FileText,
  Sparkles, ExternalLink, Package, CheckSquare
} from 'lucide-react';

export default function PWASetup() {
  const [copiedItem, setCopiedItem] = useState(null);

  const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text, item) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Convertir PlatPal a App Nativa
          </h1>
          <p className="text-xl text-gray-600">
            Empaqueta tu PWA como aplicación Android/iOS
          </p>
          <Badge className="mt-3 bg-green-500 text-white px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            PWA Lista para Empaquetar
          </Badge>
        </div>

        {/* Quick Start */}
        <Card className="border-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
              🚀 Método Rápido (10 minutos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Descarga los archivos necesarios abajo ⬇️</p>
                  <p className="text-sm text-gray-600">manifest.json y service-worker.js</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Ve a PWABuilder</p>
                  <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    pwabuilder.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Ingresa la URL de tu app</p>
                  <p className="text-sm text-gray-600">Analiza tu PWA y genera el paquete Android</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Descarga APK y publica</p>
                  <p className="text-sm text-gray-600">Sube a Google Play Store (requiere cuenta de $25)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Abrir PWABuilder Ahora
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Archivos para Descargar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Archivos Necesarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* manifest.json */}
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">manifest.json</h3>
                  <p className="text-sm text-gray-600">Configuración de la PWA</p>
                </div>
                <Badge className="bg-blue-600">Esencial</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => downloadFile(JSON.stringify(manifestJSON, null, 2), 'manifest.json', 'application/json')}
                  className="flex-1 bg-blue-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  onClick={() => copyToClipboard(JSON.stringify(manifestJSON, null, 2), 'manifest')}
                  variant="outline"
                  className="flex-1"
                >
                  {copiedItem === 'manifest' ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Copiar</>
                  )}
                </Button>
              </div>
            </div>

            {/* service-worker.js */}
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">service-worker.js</h3>
                  <p className="text-sm text-gray-600">Soporte offline básico</p>
                </div>
                <Badge className="bg-green-600">Esencial</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => downloadFile(serviceWorkerCode, 'service-worker.js', 'application/javascript')}
                  className="flex-1 bg-green-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  onClick={() => copyToClipboard(serviceWorkerCode, 'sw')}
                  variant="outline"
                  className="flex-1"
                >
                  {copiedItem === 'sw' ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Copiar</>
                  )}
                </Button>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">PWA-INSTRUCTIONS.txt</h3>
                  <p className="text-sm text-gray-600">Guía paso a paso completa</p>
                </div>
                <Badge className="bg-amber-600">Recomendado</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => downloadFile(PWA_INSTRUCTIONS, 'PWA-INSTRUCTIONS.txt')}
                  className="flex-1 bg-amber-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  onClick={() => copyToClipboard(PWA_INSTRUCTIONS, 'instructions')}
                  variant="outline"
                  className="flex-1"
                >
                  {copiedItem === 'instructions' ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-green-600" />Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" />Copiar</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración TWA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              Configuración Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">📦 Información de la App</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Package ID:</span>
                    <span className="font-mono font-semibold">com.platpal.app</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">App Name:</span>
                    <span className="font-semibold">PlatPal</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-semibold">1.0.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">🎨 Colores y Tema</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Theme Color:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border" style={{backgroundColor: '#10B981'}}></div>
                      <span className="font-mono">#10B981</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Background:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border" style={{backgroundColor: '#FFFFFF'}}></div>
                      <span className="font-mono">#FFFFFF</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Display:</span>
                    <span className="font-semibold">standalone</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              Checklist de Publicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'manifest.json descargado y colocado en la raíz del proyecto',
                'service-worker.js descargado y colocado en la raíz',
                'Manifest enlazado en index.html con <link rel="manifest">',
                'Service worker registrado en index.html',
                'Iconos en todos los tamaños (48, 72, 96, 144, 192, 512)',
                'PWA score de 100 en Lighthouse',
                'HTTPS habilitado (requerido)',
                'Screenshots preparados (mínimo 2, 1080x1920)',
                'Política de privacidad publicada (URL)',
                'Cuenta de Google Play Developer creada ($25)',
                'APK/AAB generado con PWABuilder o Bubblewrap',
                'Store listing completado',
                'App probada en dispositivo Android real'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recursos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Recursos y Herramientas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer" className="block">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
                  <h3 className="font-bold text-blue-900 mb-1">PWABuilder</h3>
                  <p className="text-sm text-blue-700 mb-2">Genera APK automáticamente</p>
                  <Badge className="bg-blue-600 text-white">Recomendado</Badge>
                </div>
              </a>

              <a href="https://www.pwabuilder.com/imageGenerator" target="_blank" rel="noopener noreferrer" className="block">
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <h3 className="font-bold text-purple-900 mb-1">Image Generator</h3>
                  <p className="text-sm text-purple-700 mb-2">Genera todos los tamaños de iconos</p>
                  <Badge className="bg-purple-600 text-white">Útil</Badge>
                </div>
              </a>

              <a href="https://github.com/GoogleChromeLabs/bubblewrap" target="_blank" rel="noopener noreferrer" className="block">
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all">
                  <h3 className="font-bold text-green-900 mb-1">Bubblewrap CLI</h3>
                  <p className="text-sm text-green-700 mb-2">Herramienta de línea de comandos</p>
                  <Badge className="bg-green-600 text-white">Avanzado</Badge>
                </div>
              </a>

              <a href="https://play.google.com/console/" target="_blank" rel="noopener noreferrer" className="block">
                <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all">
                  <h3 className="font-bold text-orange-900 mb-1">Play Console</h3>
                  <p className="text-sm text-orange-700 mb-2">Publicar en Google Play Store</p>
                  <Badge className="bg-orange-600 text-white">Esencial</Badge>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Vista Previa de Código */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-600" />
              Vista Previa del Código
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-gray-700">manifest.json</h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(manifestJSON, null, 2), 'manifest-preview')}
                >
                  {copiedItem === 'manifest-preview' ? (
                    <><CheckCircle className="w-3 h-3 mr-1 text-green-600" />Copiado</>
                  ) : (
                    <><Copy className="w-3 h-3 mr-1" />Copiar</>
                  )}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-64 overflow-y-auto">
                {JSON.stringify(manifestJSON, null, 2)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-gray-700">service-worker.js (primeras líneas)</h3>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-48 overflow-y-auto">
                {serviceWorkerCode.split('\n').slice(0, 20).join('\n') + '\n\n// ... (ver archivo completo)'}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Notas importantes */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">⚠️ Notas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-orange-900">
              <strong>1. Iconos:</strong> Actualmente estamos usando el mismo logo para todos los tamaños. Para producción, genera iconos optimizados en cada tamaño usando PWABuilder Image Generator.
            </p>
            <p className="text-orange-900">
              <strong>2. Base44 Limitations:</strong> Como estás usando Base44, los archivos manifest.json y service-worker.js deben ser configurados a nivel de hosting/deployment, no dentro de la plataforma Base44.
            </p>
            <p className="text-orange-900">
              <strong>3. HTTPS Requerido:</strong> Las PWA solo funcionan en HTTPS. Asegúrate de que tu dominio tenga SSL configurado.
            </p>
            <p className="text-orange-900">
              <strong>4. Testing:</strong> Usa Lighthouse en Chrome DevTools para verificar que tu PWA está lista antes de generar el APK.
            </p>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <Card className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">¿Todo listo? 🎉</h2>
            <p className="mb-6 text-emerald-50">
              Una vez tengas los archivos configurados en tu hosting, usa PWABuilder para generar tu APK en minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ir a PWABuilder
                </Button>
              </a>
              <Button 
                onClick={() => {
                  downloadFile(JSON.stringify(manifestJSON, null, 2), 'manifest.json', 'application/json');
                  downloadFile(serviceWorkerCode, 'service-worker.js', 'application/javascript');
                  downloadFile(PWA_INSTRUCTIONS, 'PWA-INSTRUCTIONS.txt');
                }}
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}