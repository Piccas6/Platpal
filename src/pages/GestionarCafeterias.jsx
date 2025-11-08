import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  MapPin,
  Phone,
  Clock,
  Euro,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import withAuth from "../components/auth/withAuth";

function GestionarCafeterias() {
  const [cafeterias, setCafeterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCafeteria, setEditingCafeteria] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
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

  const campusOptions = [
    { id: 'jerez', name: 'Jerez' },
    { id: 'puerto_real', name: 'Puerto Real' },
    { id: 'cadiz', name: 'Cádiz' },
    { id: 'algeciras', name: 'Algeciras' }
  ];

  useEffect(() => {
    loadCafeterias();
  }, []);

  const loadCafeterias = async () => {
    setIsLoading(true);
    try {
      const fetchedCafeterias = await base44.entities.Cafeteria.list('-created_date');
      setCafeterias(fetchedCafeterias);
    } catch (error) {
      console.error('Error loading cafeterias:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const openCreateModal = () => {
    setEditingCafeteria(null);
    setFormData({
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
    setShowModal(true);
  };

  const openEditModal = (cafeteria) => {
    setEditingCafeteria(cafeteria);
    setFormData({
      nombre: cafeteria.nombre,
      slug: cafeteria.slug,
      campus: cafeteria.campus,
      contacto: cafeteria.contacto || '',
      ubicacion_exacta: cafeteria.ubicacion_exacta || '',
      descripcion: cafeteria.descripcion || '',
      horario_apertura: cafeteria.horario_apertura || '08:00',
      hora_fin_reserva: cafeteria.hora_fin_reserva || '16:00',
      hora_fin_recogida: cafeteria.hora_fin_recogida || '18:00',
      precio_original_default: cafeteria.precio_original_default || 8.5,
      activa: cafeteria.activa !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
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
        activa: formData.activa
      };

      if (editingCafeteria) {
        await base44.entities.Cafeteria.update(editingCafeteria.id, cafeteriaData);
        alert('✅ Cafetería actualizada correctamente');
      } else {
        await base44.entities.Cafeteria.create(cafeteriaData);
        alert('✅ Cafetería creada correctamente');
      }

      setShowModal(false);
      loadCafeterias();
    } catch (error) {
      console.error('Error saving cafeteria:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cafeteria) => {
    if (!confirm(`¿Eliminar la cafetería "${cafeteria.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await base44.entities.Cafeteria.delete(cafeteria.id);
      alert('✅ Cafetería eliminada');
      loadCafeterias();
    } catch (error) {
      console.error('Error deleting cafeteria:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const filteredCafeterias = cafeterias.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.campus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ubicacion_exacta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline" size="icon" className="rounded-2xl border-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Gestionar Cafeterías</h1>
              <p className="text-gray-600 mt-2">Crea y administra los establecimientos de la plataforma</p>
            </div>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Cafetería
          </Button>
        </div>

        {/* Buscador */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, campus o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-black text-gray-900">{cafeterias.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-3xl font-black text-green-600">
                {cafeterias.filter(c => c.activa).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Jerez</p>
              <p className="text-3xl font-black text-blue-600">
                {cafeterias.filter(c => c.campus === 'jerez').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Otros Campus</p>
              <p className="text-3xl font-black text-purple-600">
                {cafeterias.filter(c => c.campus !== 'jerez').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de cafeterías */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : filteredCafeterias.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron cafeterías' : 'No hay cafeterías'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Crea tu primera cafetería para empezar'}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateModal} className="bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Cafetería
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCafeterias.map((cafeteria) => (
              <Card key={cafeteria.id} className="hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    
                    {/* Info */}
                    <div className="flex-1 space-y-4">
                      {/* Título y badges */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900">{cafeteria.nombre}</h3>
                        {cafeteria.activa ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            Inactiva
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {cafeteria.campus.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Info grid */}
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        {cafeteria.contacto && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{cafeteria.contacto}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>
                            {cafeteria.horario_apertura} - {cafeteria.hora_fin_recogida}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Euro className="w-4 h-4 text-gray-500" />
                          <span>Precio default: €{cafeteria.precio_original_default?.toFixed(2)}</span>
                        </div>
                        {cafeteria.ubicacion_exacta && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{cafeteria.ubicacion_exacta}</span>
                          </div>
                        )}
                      </div>

                      {cafeteria.descripcion && (
                        <p className="text-gray-600 italic">"{cafeteria.descripcion}"</p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ID: <code className="bg-gray-100 px-2 py-1 rounded">{cafeteria.id}</code></span>
                        <span>•</span>
                        <span>Slug: <code className="bg-gray-100 px-2 py-1 rounded">{cafeteria.slug}</code></span>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(cafeteria)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(cafeteria)}
                        className="gap-2 text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Mostrando {filteredCafeterias.length} de {cafeterias.length} cafeterías
        </p>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingCafeteria ? '✏️ Editar Cafetería' : '➕ Nueva Cafetería'}
            </DialogTitle>
            <DialogDescription>
              {editingCafeteria 
                ? 'Modifica los datos de la cafetería' 
                : 'Crea un nuevo establecimiento en la plataforma'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            
            {/* Datos básicos */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">📝 Datos Básicos</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Cafetería Central"
                    required
                  />
                </div>
                <div>
                  <Label>Slug *</Label>
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
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campusOptions.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Teléfono</Label>
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
            </div>

            {/* Configuración */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">⚙️ Configuración</h3>
              
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Precio Original Default (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio_original_default}
                    onChange={(e) => handleChange('precio_original_default', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={(e) => handleChange('activa', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <Label>Cafetería Activa</Label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {editingCafeteria ? '💾 Guardar Cambios' : '➕ Crear Cafetería'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(GestionarCafeterias, ['admin']);