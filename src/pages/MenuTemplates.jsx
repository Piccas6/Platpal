import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Save, Sparkles, Copy, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import withAuth from '../components/auth/withAuth';

const tipoCocinaOptions = [
  { id: 'mediterranea', name: 'Mediterránea' },
  { id: 'italiana', name: 'Italiana' },
  { id: 'asiatica', name: 'Asiática' },
  { id: 'mexicana', name: 'Mexicana' },
  { id: 'vegetariana', name: 'Vegetariana' },
  { id: 'casera', name: 'Casera' },
  { id: 'internacional', name: 'Internacional' },
  { id: 'rapida', name: 'Comida Rápida' },
  { id: 'otra', name: 'Otra' }
];

const alergenosOptions = [
  { id: 'gluten', name: 'Gluten' },
  { id: 'lacteos', name: 'Lácteos' },
  { id: 'huevos', name: 'Huevos' },
  { id: 'pescado', name: 'Pescado' },
  { id: 'frutos_secos', name: 'Frutos Secos' },
  { id: 'soja', name: 'Soja' },
  { id: 'ninguno', name: 'Ninguno' }
];

function MenuTemplates({ user }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_plantilla: '',
    plato_principal: '',
    plato_secundario: '',
    tipo_cocina: '',
    es_vegetariano: false,
    es_vegano: false,
    sin_gluten: false,
    alergenos: [],
    permite_envase_propio: true,
    descuento_envase_propio: 0.15
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const allTemplates = await base44.entities.MenuTemplate.list('-created_date');
      const myTemplates = allTemplates.filter(t => t.cafeteria === user?.cafeteria_info?.nombre_cafeteria);
      setTemplates(myTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.nombre_plantilla || !formData.plato_principal || !formData.plato_secundario) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        ...formData,
        cafeteria: user?.cafeteria_info?.nombre_cafeteria || 'Cafetería'
      };

      if (editingTemplate) {
        await base44.entities.MenuTemplate.update(editingTemplate.id, templateData);
      } else {
        await base44.entities.MenuTemplate.create(templateData);
      }

      await loadTemplates();
      setIsDialogOpen(false);
      resetForm();
      alert('✅ Plantilla guardada correctamente');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ Error al guardar la plantilla');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      await base44.entities.MenuTemplate.delete(templateId);
      await loadTemplates();
      alert('✅ Plantilla eliminada');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('❌ Error al eliminar la plantilla');
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      nombre_plantilla: template.nombre_plantilla || '',
      plato_principal: template.plato_principal || '',
      plato_secundario: template.plato_secundario || '',
      tipo_cocina: template.tipo_cocina || '',
      es_vegetariano: template.es_vegetariano || false,
      es_vegano: template.es_vegano || false,
      sin_gluten: template.sin_gluten || false,
      alergenos: template.alergenos || [],
      permite_envase_propio: template.permite_envase_propio ?? true,
      descuento_envase_propio: template.descuento_envase_propio || 0.15
    });
    setIsDialogOpen(true);
  };

  const handleUseTemplate = (template) => {
    navigate(createPageUrl('PublishMenu'), {
      state: { templateData: template }
    });
  };

  const resetForm = () => {
    setFormData({
      nombre_plantilla: '',
      plato_principal: '',
      plato_secundario: '',
      tipo_cocina: '',
      es_vegetariano: false,
      es_vegano: false,
      sin_gluten: false,
      alergenos: [],
      permite_envase_propio: true,
      descuento_envase_propio: 0.15
    });
    setEditingTemplate(null);
  };

  const handleAlergenoToggle = (alergeno) => {
    setFormData(prev => {
      const newAlergenos = new Set(prev.alergenos);
      if (alergeno === 'ninguno') {
        return { ...prev, alergenos: newAlergenos.has('ninguno') ? [] : ['ninguno'] };
      }
      newAlergenos.delete('ninguno');
      if (newAlergenos.has(alergeno)) {
        newAlergenos.delete(alergeno);
      } else {
        newAlergenos.add(alergeno);
      }
      return { ...prev, alergenos: Array.from(newAlergenos) };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("CafeteriaDashboard")}>
              <Button variant="outline" size="icon" className="rounded-2xl">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Plantillas de Menú</h1>
              <p className="text-gray-600 mt-1">Crea plantillas reutilizables para publicar menús más rápido</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_plantilla">Nombre de la Plantilla *</Label>
                  <Input
                    id="nombre_plantilla"
                    value={formData.nombre_plantilla}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre_plantilla: e.target.value }))}
                    placeholder="Ej: Menú Italiano Clásico"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plato_principal">Plato Principal *</Label>
                    <Input
                      id="plato_principal"
                      value={formData.plato_principal}
                      onChange={(e) => setFormData(prev => ({ ...prev, plato_principal: e.target.value }))}
                      placeholder="Ej: Pasta Carbonara"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plato_secundario">Plato Secundario *</Label>
                    <Input
                      id="plato_secundario"
                      value={formData.plato_secundario}
                      onChange={(e) => setFormData(prev => ({ ...prev, plato_secundario: e.target.value }))}
                      placeholder="Ej: Ensalada César"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_cocina">Tipo de Cocina</Label>
                  <Select
                    value={formData.tipo_cocina}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_cocina: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoCocinaOptions.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>{tipo.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Opciones Dietéticas</Label>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.es_vegetariano}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_vegetariano: checked }))}
                      />
                      <Label>🥗 Vegetariano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.es_vegano}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_vegano: checked }))}
                      />
                      <Label>🌱 Vegano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.sin_gluten}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sin_gluten: checked }))}
                      />
                      <Label>🌾 Sin Gluten</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alérgenos</Label>
                  <div className="flex flex-wrap gap-2">
                    {alergenosOptions.map(alergeno => (
                      <Badge
                        key={alergeno.id}
                        variant={formData.alergenos.includes(alergeno.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAlergenoToggle(alergeno.id)}
                      >
                        {alergeno.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Permitir envase propio</Label>
                    <Switch
                      checked={formData.permite_envase_propio}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permite_envase_propio: checked }))}
                    />
                  </div>
                  {formData.permite_envase_propio && (
                    <div className="space-y-2">
                      <Label htmlFor="descuento_envase_propio">Descuento por envase propio (€)</Label>
                      <Input
                        id="descuento_envase_propio"
                        type="number"
                        step="0.01"
                        value={formData.descuento_envase_propio}
                        onChange={(e) => setFormData(prev => ({ ...prev, descuento_envase_propio: parseFloat(e.target.value) }))}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTemplate} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes plantillas aún</h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera plantilla para publicar menús más rápidamente
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{template.nombre_plantilla}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">{template.plato_principal}</p>
                      <p className="text-sm text-gray-600">+ {template.plato_secundario}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tipo_cocina && (
                        <Badge variant="outline" className="text-xs">
                          {tipoCocinaOptions.find(t => t.id === template.tipo_cocina)?.name || template.tipo_cocina}
                        </Badge>
                      )}
                      {template.es_vegetariano && <Badge variant="outline" className="text-xs">🥗 Veg</Badge>}
                      {template.es_vegano && <Badge variant="outline" className="text-xs">🌱 Vegano</Badge>}
                      {template.sin_gluten && <Badge variant="outline" className="text-xs">🌾 S/G</Badge>}
                    </div>

                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Usar Plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(MenuTemplates, ['cafeteria', 'admin']);