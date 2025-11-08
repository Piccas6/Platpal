import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Plus, CheckCircle, Building2, User, Zap, Loader2, Search } from "lucide-react";
import withAuth from "../components/auth/withAuth";

function CrearCafeteria() {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('new');
  const [searchUser, setSearchUser] = useState('');
  
  const [formData, setFormData] = useState({
    // Credenciales usuario (solo si es nuevo)
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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await base44.entities.User.list();
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

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

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    
    if (userId !== 'new') {
      const user = allUsers.find(u => u.id === userId);
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email,
          full_name: user.full_name || '',
          password: '' // No mostrar la contraseña existente
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        email: '',
        full_name: '',
        password: ''
      }));
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🚀 Iniciando creación de cafetería + asignación...');

      // Validaciones
      if (selectedUserId === 'new') {
        if (!formData.email || !formData.password || !formData.full_name) {
          throw new Error('Complete todos los datos del nuevo usuario');
        }
        if (formData.password.length < 6) {
          throw new Error('La contraseña debe tener mínimo 6 caracteres');
        }
      } else {
        if (!selectedUserId) {
          throw new Error('Seleccione un usuario');
        }
      }

      if (!formData.nombre || !formData.campus) {
        throw new Error('Complete todos los datos de la cafetería');
      }

      // 1. Crear la cafetería
      console.log('📝 Paso 1/2: Creando cafetería...');
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

      const nuevaCafeteria = await base44.entities.Cafeteria.create(cafeteriaData);
      console.log('✅ Cafetería creada:', nuevaCafeteria.id);

      // 2. Asignar usuario
      console.log('👤 Paso 2/2: Asignando usuario...');
      
      let usuarioAsignado = null;
      let usuarioEraExistente = true;

      if (selectedUserId === 'new') {
        // Usuario nuevo - guardar info para que se registre
        console.log('⚠️ Usuario nuevo, debe registrarse primero');
        usuarioEraExistente = false;
      } else {
        // Usuario existente - asignar directamente
        const usuario = allUsers.find(u => u.id === selectedUserId);
        
        if (usuario) {
          console.log('✅ Usuario encontrado, actualizando...');
          
          // Obtener cafeterías existentes y agregar la nueva
          const cafeteriasActuales = usuario.cafeterias_asignadas || [];
          const nuevasCafeterias = [...cafeteriasActuales, nuevaCafeteria.id];
          
          await base44.entities.User.update(usuario.id, {
            app_role: 'cafeteria',
            cafeterias_asignadas: nuevasCafeterias
          });
          
          usuarioAsignado = usuario;
        }
      }

      // Guardar datos para mostrar
      setCreatedData({
        cafeteria: nuevaCafeteria,
        usuario: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          existe: usuarioEraExistente,
          id: selectedUserId !== 'new' ? selectedUserId : null
        }
      });

      console.log('🎉 PROCESO COMPLETADO');

    } catch (error) {
      console.error('❌ Error:', error);
      setError(error.message || 'Error al crear la cafetería');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedData(null);
    setSelectedUserId('new');
    setSearchUser('');
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
                ¡Cafetería Creada y Asignada!
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

              {/* Estado del usuario */}
              {createdData.usuario.existe ? (
                <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-400">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Usuario Asignado Automáticamente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Usuario <strong>{createdData.usuario.email}</strong> encontrado</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Rol actualizado a "cafeteria"</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Cafetería asignada a sus cafeterías</span>
                    </div>
                    <div className="mt-4 p-4 bg-green-100 rounded-xl border-2 border-green-300">
                      <p className="text-green-900 font-bold text-center">
                        ✅ El usuario ya puede acceder y seleccionar esta cafetería en su panel
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    Usuario Nuevo - Requiere Registro
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-blue-700 font-semibold mb-1">Email:</p>
                      <p className="font-mono text-blue-900">{createdData.usuario.email}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-blue-700 font-semibold mb-1">Contraseña (para registro):</p>
                      <p className="font-mono text-blue-900">{createdData.usuario.password}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-blue-700 font-semibold mb-1">Nombre:</p>
                      <p className="font-mono text-blue-900">{createdData.usuario.full_name}</p>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                    <h4 className="text-lg font-bold text-amber-900 mb-3">📋 Próximos Pasos</h4>
                    <ol className="space-y-2 text-amber-800 text-sm">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                        <div>
                          El usuario debe <strong>registrarse</strong> en la plataforma
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                        <div>
                          Una vez registrado, vuelve aquí y selecciona su usuario para asignar esta cafetería
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

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
            <h1 className="text-4xl font-black text-gray-900">Crear y Asignar Cafetería</h1>
            <p className="text-gray-600 mt-2">Asigna cafeterías a usuarios existentes o crea nuevos</p>
          </div>
        </div>

        {/* Info */}
        <Card className="mb-6 border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 text-lg mb-2">🚀 Sistema Inteligente</h3>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span><strong>Usuario existente:</strong> Se asigna automáticamente (puede tener varias cafeterías)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span><strong>Usuario nuevo:</strong> Se guardan credenciales para que se registre primero</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-2 border-red-400 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">!</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SELECCIÓN USUARIO */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-6 h-6 text-blue-600" />
                Asignar a Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Selecciona Usuario *</Label>
                <Select value={selectedUserId} onValueChange={handleUserSelect}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Buscar usuario..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="pl-8"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2 py-1">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-emerald-600">Crear Nuevo Usuario</span>
                      </div>
                    </SelectItem>
                    {filteredUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="py-1">
                          <p className="font-semibold">{u.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                          {u.app_role === 'cafeteria' && (
                            <p className="text-xs text-emerald-600">
                              {u.cafeterias_asignadas?.length || 0} cafetería(s) actual(es)
                            </p>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Datos usuario nuevo */}
              {selectedUserId === 'new' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900">Datos del Nuevo Usuario</h4>
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
                </div>
              )}

              {/* Info usuario existente */}
              {selectedUserId !== 'new' && selectedUserId && (
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-green-900">
                    ✅ <strong>{formData.full_name || 'Usuario'}</strong> - {formData.email}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Esta cafetería se añadirá a sus cafeterías asignadas
                  </p>
                </div>
              )}
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
                ⚙️ Configuración Operativa
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
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-6 text-lg font-bold shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando y asignando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Crear y Asignar Cafetería
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