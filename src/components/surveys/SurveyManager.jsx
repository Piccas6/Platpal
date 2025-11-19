import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Edit, Trash2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SurveyManager({ surveys, onUpdate }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    opciones: ['', ''],
    campus: 'todos',
    fecha_cierre: '',
    activa: true
  });

  const handleStartCreate = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      opciones: ['', ''],
      campus: 'todos',
      fecha_cierre: '',
      activa: true
    });
    setIsCreating(true);
    setEditingId(null);
  };

  const handleStartEdit = (survey) => {
    setFormData({
      titulo: survey.titulo,
      descripcion: survey.descripcion || '',
      opciones: survey.opciones,
      campus: survey.campus,
      fecha_cierre: survey.fecha_cierre || '',
      activa: survey.activa
    });
    setEditingId(survey.id);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.titulo || formData.opciones.filter(o => o.trim()).length < 2) {
      alert('Completa el título y al menos 2 opciones');
      return;
    }

    const opcionesFiltradas = formData.opciones.filter(o => o.trim());

    try {
      if (editingId) {
        await base44.entities.Survey.update(editingId, {
          ...formData,
          opciones: opcionesFiltradas
        });
      } else {
        await base44.entities.Survey.create({
          ...formData,
          opciones: opcionesFiltradas,
          votos: {}
        });
      }
      setIsCreating(false);
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('Error al guardar encuesta:', error);
      alert('Error al guardar la encuesta');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta encuesta?')) return;
    try {
      await base44.entities.Survey.delete(id);
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la encuesta');
    }
  };

  const addOpcion = () => {
    setFormData(prev => ({
      ...prev,
      opciones: [...prev.opciones, '']
    }));
  };

  const removeOpcion = (idx) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.filter((_, i) => i !== idx)
    }));
  };

  const updateOpcion = (idx, value) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.map((o, i) => i === idx ? value : o)
    }));
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle>🎯 Gestión de Encuestas (Admin)</CardTitle>
          {!isCreating && !editingId && (
            <Button onClick={handleStartCreate} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nueva Encuesta
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {(isCreating || editingId) && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="¿Cuál es tu plato favorito?"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Opcional..."
                rows={2}
              />
            </div>

            <div>
              <Label>Campus</Label>
              <Select value={formData.campus} onValueChange={(v) => setFormData(prev => ({ ...prev, campus: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los campus</SelectItem>
                  <SelectItem value="jerez">Jerez</SelectItem>
                  <SelectItem value="puerto_real">Puerto Real</SelectItem>
                  <SelectItem value="cadiz">Cádiz</SelectItem>
                  <SelectItem value="algeciras">Algeciras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha de Cierre</Label>
              <Input
                type="date"
                value={formData.fecha_cierre}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_cierre: e.target.value }))}
              />
            </div>

            <div>
              <Label>Opciones *</Label>
              <div className="space-y-2 mt-2">
                {formData.opciones.map((opcion, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={opcion}
                      onChange={(e) => updateOpcion(idx, e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                    />
                    {formData.opciones.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOpcion(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOpcion} className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir opción
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-1" />
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setEditingId(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!isCreating && !editingId && (
          <div className="space-y-2">
            {surveys.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay encuestas creadas</p>
            ) : (
              surveys.map(survey => (
                <div key={survey.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-semibold">{survey.titulo}</h4>
                    <p className="text-xs text-gray-500">
                      {survey.opciones.length} opciones • Campus: {survey.campus}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleStartEdit(survey)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(survey.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}