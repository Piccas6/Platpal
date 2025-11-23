import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function UploadDocumentsCafeteria() {
  const location = useLocation();
  const navigate = useNavigate();
  const cafeteria_id = location.state?.cafeteria_id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState({});

  const documentTypes = [
    { id: 'cif', label: 'CIF de la empresa', required: true },
    { id: 'dni_representante', label: 'DNI del representante legal', required: true },
    { id: 'certificado_cuenta', label: 'Certificado de cuenta bancaria', required: false },
    { id: 'otros', label: 'Otros documentos', required: false }
  ];

  useEffect(() => {
    if (!cafeteria_id) {
      navigate(createPageUrl('RegistroCafeteria'));
      return;
    }
    loadDocuments();
  }, [cafeteria_id]);

  const loadDocuments = async () => {
    try {
      const docs = await base44.entities.CafeteriaDocumento.filter({ cafeteria_id });
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (tipo, file) => {
    if (!file) return;

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 10MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF, JPG, JPEG o PNG');
      return;
    }

    setUploading({...uploading, [tipo]: true});

    try {
      // Subir archivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Crear documento
      await base44.entities.CafeteriaDocumento.create({
        cafeteria_id,
        tipo,
        file_url,
        file_name: file.name,
        upload_date: new Date().toISOString(),
        validado: false
      });

      // Crear audit log
      await base44.entities.CafeteriaAudit.create({
        cafeteria_id,
        evento: 'documento_subido',
        meta: {
          tipo,
          file_name: file.name
        },
        actor: 'system',
        timestamp: new Date().toISOString(),
        ip_address: window.location.hostname
      });

      await loadDocuments();
      
      // Notificar equipo de revisión
      await base44.functions.invoke('wf_documento_subido', {
        cafeteria_id,
        tipo,
        file_name: file.name
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error al subir el documento. Inténtalo de nuevo.');
    } finally {
      setUploading({...uploading, [tipo]: false});
    }
  };

  const getDocumentStatus = (tipo) => {
    const doc = documents.find(d => d.tipo === tipo);
    if (!doc) return 'pending';
    if (doc.validado) return 'validated';
    return 'uploaded';
  };

  const handleContinue = async () => {
    // Verificar que documentos requeridos estén subidos
    const requiredDocs = documentTypes.filter(dt => dt.required);
    const allUploaded = requiredDocs.every(dt => getDocumentStatus(dt.id) !== 'pending');

    if (!allUploaded) {
      alert('Por favor, sube todos los documentos requeridos antes de continuar');
      return;
    }

    setIsLoading(true);
    try {
      // Actualizar estado de cafetería a kyc_pendiente
      await base44.entities.Cafeteria.update(cafeteria_id, {
        estado_onboarding: 'kyc_pendiente'
      });

      // Ejecutar workflow de verificación KYC
      await base44.functions.invoke('wf_kyc_automatic_check', {
        cafeteria_id
      });

      navigate(createPageUrl('ContratoFirmaCafeteria'), {
        state: { cafeteria_id }
      });

    } catch (error) {
      console.error('Error al continuar:', error);
      alert('Error al procesar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Subir Documentos</h1>
          <p className="text-gray-600">Sube los documentos requeridos para verificar tu identidad</p>
        </div>

        <Card className="border-2 border-emerald-100 shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Documentos Requeridos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.id);
              const isUploading = uploading[docType.id];

              return (
                <Card key={docType.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {docType.label}
                            {docType.required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          <p className="text-sm text-gray-600">
                            PDF, JPG, JPEG o PNG (máx. 10MB)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {status === 'pending' && (
                          <label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => handleFileUpload(docType.id, e.target.files[0])}
                              disabled={isUploading}
                            />
                            <Button
                              as="span"
                              disabled={isUploading}
                              variant="outline"
                              className="cursor-pointer"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Subir
                                </>
                              )}
                            </Button>
                          </label>
                        )}

                        {status === 'uploaded' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            En revisión
                          </Badge>
                        )}

                        {status === 'validated' && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Validado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información importante</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los documentos serán revisados en un plazo máximo de 48 horas</li>
            <li>• Recibirás una notificación por email cuando sean validados</li>
            <li>• Todos los documentos se almacenan de forma segura y cifrada</li>
            <li>• Los datos se retienen según normativa RGPD</li>
          </ul>
        </div>

        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            'Continuar al Siguiente Paso'
          )}
        </Button>
      </div>
    </div>
  );
}