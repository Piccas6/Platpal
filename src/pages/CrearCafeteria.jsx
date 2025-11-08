import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";
import { ChefHat, CheckCircle2, ArrowLeft, Loader2, User, Building2, Lock } from "lucide-react";

function CrearCafeteria() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [formData, setFormData] = useState({
    // Usuario
    email: "",
    password: "",
    full_name: "",
    
    // Cafetería
    nombre_cafeteria: "",
    campus: "",
    ubicacion_exacta: "",
    contacto: "",
    horario_apertura: "08:00",
    hora_fin_reserva: "16:00",
    hora_fin_recogida: "18:00",
    precio_original_default: 8.50
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.full_name || !formData.nombre_cafeteria || !formData.campus) {
      alert("Por favor, completa todos los campos obligatorios (*)");
      return;
    }

    if (formData.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 [CREAR CAFETERIA] Iniciando creación...');

      // PASO 1: Crear usuario con contraseña
      // Nota: Base44 creará el usuario automáticamente al hacer signup
      // Pero como admin, podemos invitarlo y asignarle datos
      
      // Usamos el SDK como service role para crear el usuario
      console.log('👤 [CREAR CAFETERIA] Creando usuario...');
      
      // Crear usuario directamente (asumiendo que tienes permisos de admin)
      // Si no funciona, el usuario tendrá que registrarse manualmente
      
      // Por ahora, creamos la cafetería primero y le damos instrucciones al usuario de registrarse
      
      // Generar slug único
      const slug = formData.nombre_cafeteria
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // PASO 2: Crear cafetería
      console.log('🏪 [CREAR CAFETERIA] Creando cafetería...');
      
      const cafeteriaData = {
        nombre: formData.nombre_cafeteria,
        slug: `${slug}-${formData.campus}-${Date.now()}`,
        campus: formData.campus,
        contacto: formData.contacto || formData.email,
        ubicacion_exacta: formData.ubicacion_exacta,
        horario_apertura: formData.horario_apertura,
        hora_fin_reserva: formData.hora_fin_reserva,
        hora_fin_recogida: formData.hora_fin_recogida,
        precio_original_default: parseFloat(formData.precio_original_default),
        aprobada: true, // ✅ Aprobada automáticamente
        estado_onboarding: "aprobada",
        activa: true,
        puede_publicar_menus: true, // ✅ Puede publicar inmediatamente
        fecha_solicitud: new Date().toISOString(),
        fecha_aprobacion: new Date().toISOString()
      };

      const nuevaCafeteria = await base44.entities.Cafeteria.create(cafeteriaData);
      
      console.log('✅ [CREAR CAFETERIA] Cafetería creada:', nuevaCafeteria.id);

      // Guardar credenciales para mostrar
      setCreatedCredentials({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        cafeteria_id: nuevaCafeteria.id,
        cafeteria_nombre: formData.nombre_cafeteria
      });

      console.log('✅ [CREAR CAFETERIA] Proceso completado');

      setSubmitted(true);

    } catch (error) {
      console.error("❌ [CREAR CAFETERIA] Error:", error);
      alert("Error al crear cafetería: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pantalla de confirmación
  if (submitted && createdCredentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">¡Cafetería Creada!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 p-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-blue-900 text-lg">📋 Cafetería Registrada:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {createdCredentials.cafeteria_nombre}</p>
                <p><strong>ID:</strong> {createdCredentials.cafeteria_id}</p>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-orange-900 text-lg">🔐 INSTRUCCIONES IMPORTANTES:</h3>
              <div className="space-y-3 text-sm text-orange-900">
                <p className="font-bold">El usuario debe REGISTRARSE primero en la plataforma:</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Ir a la página de inicio</li>
                  <li>Click en "Iniciar Sesión" → "Registrarse"</li>
                  <li>Usar estos datos:
                    <div className="bg-white rounded p-3 mt-2 font-mono text-xs">
                      <p><strong>Email:</strong> {createdCredentials.email}</p>
                      <p><strong>Contraseña:</strong> {createdCredentials.password}</p>
                      <p><strong>Nombre:</strong> {createdCredentials.full_name}</p>
                    </div>
                  </li>
                  <li>Después de registrarse, tu (admin) debes:
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Ir a Dashboard → Data → User</li>
                      <li>Buscar el usuario por email</li>
                      <li>Editar y cambiar:
                        <div className="bg-white rounded p-2 mt-1 font-mono text-xs">
                          <p>app_role: "cafeteria"</p>
                          <p>cafeterias_asignadas: ["{createdCredentials.cafeteria_id}"]</p>
                        </div>
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-900">
                ✅ La cafetería está <strong>aprobada y activa</strong>. Una vez asignes el usuario, podrá publicar menús inmediatamente.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => {
                  setFormData({
                    email: "",
                    password: "",
                    full_name: "",
                    nombre_cafeteria: "",
                    campus: "",
                    ubicacion_exacta: "",
                    contacto: "",
                    horario_apertura: "08:00",
                    hora_fin_reserva: "16:00",
                    hora_fin_recogida: "18:00",
                    precio_original_default: 8.50
                  });
                  setSubmitted(false);
                  setCreatedCredentials(null);
                }}
                variant="outline"
                className="w-full"
              >
                Crear Otra Cafetería
              </Button>
              
              <Button 
                onClick={() => navigate(createPageUrl("AdminDashboard"))}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
              >
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("AdminDashboard"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Crear Nueva Cafetería
            </h1>
            <p className="text-lg text-gray-600">
              Panel de administración
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-2xl">Configuración Completa</CardTitle>
            <p className="text-sm text-gray-600">Los campos marcados con * son obligatorios</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN 1: CREDENCIALES DE USUARIO */}
              <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 text-xl flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Credenciales de Usuario
                </h3>
                <p className="text-sm text-blue-700">El usuario deberá registrarse con estos datos</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email de Acceso *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="mt-1 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="mínimo 6 caracteres"
                      className="mt-1 bg-white"
                      required
                    />
                    <p className="text-xs text-blue-600 mt-1">Guarda esta contraseña para dársela al usuario</p>
                  </div>

                  <div>
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="mt-1 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DE LA CAFETERÍA */}
              <div className="space-y-4 p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
                <h3 className="font-bold text-emerald-900 text-xl flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Datos de la Cafetería
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre_cafeteria">Nombre de la Cafetería *</Label>
                    <Input
                      id="nombre_cafeteria"
                      value={formData.nombre_cafeteria}
                      onChange={(e) => handleChange('nombre_cafeteria', e.target.value)}
                      placeholder="Ej: Cafetería Central"
                      className="mt-1 bg-white"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="campus">Campus *</Label>
                      <Select value={formData.campus} onValueChange={(value) => handleChange('campus', value)} required>
                        <SelectTrigger className="mt-1 bg-white">
                          <SelectValue placeholder="Selecciona campus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jerez">Jerez</SelectItem>
                          <SelectItem value="puerto_real">Puerto Real</SelectItem>
                          <SelectItem value="cadiz">Cádiz</SelectItem>
                          <SelectItem value="algeciras">Algeciras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="contacto">Teléfono de Contacto</Label>
                      <Input
                        id="contacto"
                        type="tel"
                        value={formData.contacto}
                        onChange={(e) => handleChange('contacto', e.target.value)}
                        placeholder="Ej: 956 123 456"
                        className="mt-1 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ubicacion_exacta">Ubicación Exacta</Label>
                    <Input
                      id="ubicacion_exacta"
                      value={formData.ubicacion_exacta}
                      onChange={(e) => handleChange('ubicacion_exacta', e.target.value)}
                      placeholder="Ej: Edificio B, Planta Baja"
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: CONFIGURACIÓN OPERATIVA */}
              <div className="space-y-4 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <h3 className="font-bold text-amber-900 text-xl flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Configuración Operativa
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario_apertura">Hora Apertura</Label>
                    <Input
                      id="horario_apertura"
                      type="time"
                      value={formData.horario_apertura}
                      onChange={(e) => handleChange('horario_apertura', e.target.value)}
                      className="mt-1 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hora_fin_reserva">Límite Reservas</Label>
                    <Input
                      id="hora_fin_reserva"
                      type="time"
                      value={formData.hora_fin_reserva}
                      onChange={(e) => handleChange('hora_fin_reserva', e.target.value)}
                      className="mt-1 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hora_fin_recogida">Límite Recogida</Label>
                    <Input
                      id="hora_fin_recogida"
                      type="time"
                      value={formData.hora_fin_recogida}
                      onChange={(e) => handleChange('hora_fin_recogida', e.target.value)}
                      className="mt-1 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="precio_original_default">Precio Original (€)</Label>
                    <Input
                      id="precio_original_default"
                      type="number"
                      step="0.01"
                      value={formData.precio_original_default}
                      onChange={(e) => handleChange('precio_original_default', e.target.value)}
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 text-lg font-bold shadow-xl hover:shadow-2xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando cafetería...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Crear Cafetería
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default withAuth(CrearCafeteria, ['admin']);