import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, CheckCircle, Building2, User, Lock, Phone, MapPin, Clock, Euro, Loader2 } from "lucide-react";
import withAuth from "../components/auth/withAuth";

function CrearCafeteria() {
  const [formData, setFormData] = useState({
    // Credenciales usuario
    email: '',
    password: '',
    full_name: '',
    
    // Datos cafetería
    nombre: '',
    slug: '',
    campus: '',
    contacto: '',
    ubicacion_exacta: '',
    descripcion: '',
    horario_apertura: '08:00',
    hora_fin_reserva: '16:00',
    hora_fin_recogida: '18:00',
    precio_original_default: 8.5,
    activa: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdData, setCreatedData] = useState(null);
  const [error, setError] = useState('');

  const campusOptions = [
    { id: 'jerez', name: 'Jerez' },
    { id: 'puerto_real', name: 'Puerto Real' },
    { id: 'cadiz', name: 'Cádiz' },
    { id: 'algeciras', name: 'Algeciras' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generar slug cuando cambia el nombre
    if (field === 'nombre' && value) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🚀 Iniciando creación de cafetería...');

      // Validaciones
      if (!formData.email || !formData.password || !formData.full_name) {
        throw new Error('Complete todos los datos del usuario');
      }

      if (!formData.nombre || !formData.campus) {
        throw new Error('Complete todos los datos de la cafetería');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener mínimo 6 caracteres');
      }

      // 1. Crear la cafetería
      console.log('📝 Creando cafetería...');
      const cafeteriaData = {
        nombre: formData.nombre,
        slug: formData.slug,
        campus: formData.campus,
        contacto: formData.contacto,
        ubicacion_exacta: formData.ubicacion_exacta,
        descripcion: formData.descripcion,
        horario_apertura: formData.horario_apertura,
        hora_fin_reserva: formData.hora_fin_reserva,
        hora_fin_recogida: formData.hora_fin_recogida,
        precio_original_default: parseFloat(formData.precio_original_default),
        activa: true
      };

      console.log('Datos cafetería:', cafeteriaData);
      const nuevaCafeteria = await base44.entities.Cafeteria.create(cafeteriaData);
      console.log('✅ Cafetería creada:', nuevaCafeteria.id);

      // Guardar datos para mostrar
      setCreatedData({
        cafeteria: nuevaCafeteria,
        usuario: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message || 'Error al crear la cafetería');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedData(null);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      nombre: '',
      slug: '',
      campus: '',
      contacto: '',
      ubicacion_exacta: '',
      descripcion: '',
      horario_apertura: '08:00',
      hora_fin_reserva: '16:00',
      hora_fin_recogida: '18:00',
      precio_original_default: 8.5,
      activa: true
    });
    setError('');
  };

  // Vista de confirmación
  if (createdData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl border-4 border-emerald-400">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-center text-3xl font-black">
                ¡Cafetería Creada Exitosamente!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              {/* Datos de la cafetería */}
              <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <h3 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Cafetería Registrada
                </h3>
                <div className="space-y-2 text-emerald-800">
                  <p><strong>Nombre:</strong> {createdData.cafeteria.nombre}</p>
                  <p><strong>Campus:</strong> {createdData.cafeteria.campus}</p>
                  <p><strong>ID:</strong> <code className="bg-white px-2 py-1 rounded">{createdData.cafeteria.id}</code></p>
                </div>
              </div>

              {/* Credenciales */}
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Credenciales del Usuario
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-1">Email:</p>
                    <p className="font-mono text-blue-900">{createdData.usuario.email}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-1">Contraseña:</p>
                    <p className="font-mono text-blue-900">{createdData.usuario.password}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-1">Nombre:</p>
                    <p className="font-mono text-blue-900">{createdData.usuario.full_name}</p>
                  </div>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4">📋 Próximos Pasos</h3>
                <ol className="space-y-3 text-amber-800">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <strong>Registrar el usuario:</strong> El usuario debe ir a <strong>Home → Acceso Cafeterías → Registrarse</strong> usando estas credenciales.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong>Asignar rol (Admin):</strong> Ve a <strong>Dashboard → Data → User</strong>, busca el email y edita:
                      <ul className="mt-2 ml-4 space-y-1 text-sm">
                        <li>• <code className="bg-white px-1 rounded">app_role: "cafeteria"</code></li>
                        <li>• <code className="bg-white px-1 rounded">cafeterias_asignadas: ["{createdData.cafeteria.id}"]</code></li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <strong>Listo:</strong> El usuario puede iniciar sesión y acceder a su panel.
                    </div>
                  </li>
                </ol>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateAnother}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Otra Cafetería
                </Button>
                <Link to={createPageUrl("AdminDashboard")} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Volver al Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista del formulario
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("AdminDashboard")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Crear Nueva Cafetería</h1>
            <p className="text-gray-600 mt-2">Registra un nuevo establecimiento en el sistema</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-2 border-red-400 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">!</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900">Error al crear cafetería</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CREDENCIALES USUARIO */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-6 h-6 text-blue-600" />
                Credenciales del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label>Contraseña *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Nombre Completo *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* DATOS CAFETERÍA */}
          <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="w-6 h-6 text-emerald-600" />
                Datos de la Cafetería
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Cafetería *</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Cafetería Central"
                    required
                  />
                </div>
                <div>
                  <Label>Slug (generado automáticamente)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="cafeteria-central"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Campus *</Label>
                  <Select value={formData.campus} onValueChange={(v) => handleChange('campus', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campusOptions.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Teléfono de Contacto</Label>
                  <Input
                    type="tel"
                    value={formData.contacto}
                    onChange={(e) => handleChange('contacto', e.target.value)}
                    placeholder="624257636"
                  />
                </div>
              </div>

              <div>
                <Label>Ubicación Exacta</Label>
                <Input
                  value={formData.ubicacion_exacta}
                  onChange={(e) => handleChange('ubicacion_exacta', e.target.value)}
                  placeholder="Ej: Edificio B, Planta Baja"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Describe la cafetería..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* CONFIGURACIÓN */}
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-amber-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6 text-amber-600" />
                Configuración Operativa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Hora Apertura</Label>
                  <Input
                    type="time"
                    value={formData.horario_apertura}
                    onChange={(e) => handleChange('horario_apertura', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Límite Reservas</Label>
                  <Input
                    type="time"
                    value={formData.hora_fin_reserva}
                    onChange={(e) => handleChange('hora_fin_reserva', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Límite Recogida</Label>
                  <Input
                    type="time"
                    value={formData.hora_fin_recogida}
                    onChange={(e) => handleChange('hora_fin_recogida', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Precio Original por Defecto (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio_original_default}
                  onChange={(e) => handleChange('precio_original_default', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón Submit */}
          <div className="flex gap-3">
            <Link to={createPageUrl("AdminDashboard")} className="flex-1">
              <Button type="button" variant="outline" className="w-full py-6">
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-6 text-lg font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando cafetería...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Cafetería
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(CrearCafeteria, ['admin']);