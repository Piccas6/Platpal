import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OfficeProfileSetup({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: user?.company_name || '',
    company_role: user?.company_role || 'employee',
    telefono: user?.telefono || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.company_name) {
      alert('Por favor indica el nombre de tu empresa');
      return;
    }

    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        company_name: formData.company_name,
        company_role: formData.company_role,
        telefono: formData.telefono,
        app_role: 'office_user'
      });

      navigate(createPageUrl('OfficeDashboard'));
    } catch (error) {
      console.error('Error guardando perfil:', error);
      alert('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-blue-200 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Configura tu perfil Office</CardTitle>
              <p className="text-sm text-blue-100 mt-1">Para empezar necesitamos algunos datos</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>👤 Usuario detectado:</strong> {user?.email}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Correo corporativo detectado. Configura tu perfil para acceder a PlatPal Oficinas.
            </p>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nombre de tu empresa *
            </Label>
            <Input
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Ej: TechStartup SL"
            />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Tu rol en la empresa *
            </Label>
            <Select
              value={formData.company_role}
              onValueChange={(value) => setFormData({ ...formData, company_role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="office_manager">Office Manager</SelectItem>
                <SelectItem value="hr">Recursos Humanos</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Teléfono (opcional)
            </Label>
            <Input
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.company_name}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold"
          >
            {isSaving ? 'Guardando...' : 'Continuar a PlatPal Oficinas'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}