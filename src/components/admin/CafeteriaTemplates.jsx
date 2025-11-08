import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, Store, CheckCircle2 } from 'lucide-react';

const campusOptions = [
  { id: 'jerez', name: 'Campus Jerez' },
  { id: 'puerto_real', name: 'Campus Puerto Real' },
  { id: 'cadiz', name: 'Campus Cádiz' },
  { id: 'algeciras', name: 'Campus Algeciras' }
];

export default function CafeteriaTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre_cafeteria: '',
    slug: '',
    campus: '',
    horario_apertura: '08:00',
    hora_fin_reserva: '16:00',
    hora_fin_recogida: '18:00',
    contacto: '',
    ubicacion_exacta: '',
    descripcion: '',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const allTemplates = await base44.entities.CafeteriaProfileTemplate.list('-created_date');
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generar slug cuando se escribe el nombre
    if (field === 'nombre_cafeteria' && !editingTemplate) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        await base44.entities.CafeteriaProfileTemplate.update(editingTemplate.id, formData);
      } else {
        await base44.entities.CafeteriaProfileTemplate.create(formData);
      }
      
      loadTemplates();
      handleCloseDialog();
      alert(editingTemplate ? '✅ Plantilla actualizada' : '✅ Plantilla creada');
    } catch (error) {
      console.error("Error saving template:", error);
      alert('❌ Error al guardar la plantilla');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      nombre_cafeteria: template.nombre_cafeteria,
      slug: template.slug,
      campus: template.campus,
      horario_apertura: template.horario_apertura || '08:00',
      hora_fin_reserva: template.hora_fin_reserva || '16:00',
      hora_fin_recogida: template.hora_fin_recogida || '18:00',
      contacto: template.contacto || '',
      ubicacion_exacta: template.ubicacion_exacta || '',
      descripcion: template.descripcion || '',
      is_active: template.is_active !== false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (templateId) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
    
    try {
      await base44.entities.CafeteriaProfileTemplate.delete(templateId);
      loadTemplates();
      alert('✅ Plantilla eliminada');
    } catch (error) {
      console.error("Error deleting template:", error);
      alert('❌ Error al eliminar la plantilla');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      nombre_cafeteria: '',
      slug: '',
      campus: '',
      horario_apertura: '08:00',
      hora_fin_reserva: '16:00',
      hora_fin_recogida: '18:00',
      contacto: '',
      ubicacion_exacta: '',
      descripcion: '',
      is_active: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Plantillas de Cafeterías
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Cafetería'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_cafeteria">Nombre de la Cafetería *</Label>
                    <Input
                      id="nombre_cafeteria"
                      value={formData.nombre_cafeteria}
                      onChange={(e) => handleInputChange('nombre_cafeteria', e.target.value)}
                      placeholder="Ej: Cafetería Central"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (ID único) *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="ej: cafeteria-central-jerez"
                      disabled={!!editingTemplate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Campus *</Label>
                  <Select value={formData.campus} onValueChange={(value) => handleInputChange('campus', value)}>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horario_apertura">Hora Apertura</Label>
                    <Input
                      id="horario_apertura"
                      type="time"
                      value={formData.horario_apertura}
                      onChange={(e) => handleInputChange('horario_apertura', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_fin_reserva">Límite Reservas</Label>
                    <Input
                      id="hora_fin_reserva"
                      type="time"
                      value={formData.hora_fin_reserva}
                      onChange={(e) => handleInputChange('hora_fin_reserva', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora_fin_recogida">Límite Recogida</Label>
                    <Input
                      id="hora_fin_recogida"
                      type="time"
                      value={formData.hora_fin_recogida}
                      onChange={(e) => handleInputChange('hora_fin_recogida', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contacto">Teléfono</Label>
                    <Input
                      id="contacto"
                      value={formData.contacto}
                      onChange={(e) => handleInputChange('contacto', e.target.value)}
                      placeholder="+34 956 123 456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion_exacta">Ubicación Exacta</Label>
                    <Input
                      id="ubicacion_exacta"
                      value={formData.ubicacion_exacta}
                      onChange={(e) => handleInputChange('ubicacion_exacta', e.target.value)}
                      placeholder="Ej: Edificio A, Planta Baja"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Descripción breve de la cafetería..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseDialog}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Cargando plantillas...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay plantillas creadas aún</p>
            <p className="text-sm text-gray-400">Crea plantillas para agilizar el onboarding de cafeterías</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <div key={template.id} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{template.nombre_cafeteria}</h3>
                      {template.is_active && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activa
                        </Badge>
                      )}
                      <Badge variant="outline">{campusOptions.find(c => c.id === template.campus)?.name}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-2">
                      <div>
                        <span className="text-gray-500">Apertura:</span> {template.horario_apertura}
                      </div>
                      <div>
                        <span className="text-gray-500">Fin reservas:</span> {template.hora_fin_reserva}
                      </div>
                      <div>
                        <span className="text-gray-500">Fin recogida:</span> {template.hora_fin_recogida}
                      </div>
                      {template.contacto && (
                        <div>
                          <span className="text-gray-500">Tel:</span> {template.contacto}
                        </div>
                      )}
                    </div>

                    {template.ubicacion_exacta && (
                      <p className="text-sm text-gray-600 mt-2">
                        📍 {template.ubicacion_exacta}
                      </p>
                    )}

                    {template.descripcion && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        {template.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}