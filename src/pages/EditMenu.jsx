import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2, Recycle, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import withAuth from "../components/auth/withAuth";

function EditMenu({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      // Check if menu was passed via location.state
      if (location.state?.menu) {
        const menuData = location.state.menu;
        setMenu(menuData);
        setFormData({
          plato_principal: menuData.plato_principal,
          plato_secundario: menuData.plato_secundario,
          precio_original: menuData.precio_original,
          stock_disponible: menuData.stock_disponible,
          hora_limite_reserva: menuData.hora_limite_reserva,
          hora_limite: menuData.hora_limite,
          permite_envase_propio: menuData.permite_envase_propio ?? true,
          descuento_envase_propio: menuData.descuento_envase_propio ?? 0.15,
          es_sorpresa: menuData.es_sorpresa ?? false
        });
        setIsLoading(false);
        return;
      }

      // Fallback to URL param if no state
      const searchParams = new URLSearchParams(location.search);
      const menuId = searchParams.get('id');
      if (menuId) {
        try {
          const data = await base44.entities.Menu.get(menuId);
          setMenu(data);
          setFormData({
            plato_principal: data.plato_principal,
            plato_secundario: data.plato_secundario,
            precio_original: data.precio_original,
            stock_disponible: data.stock_disponible,
            hora_limite_reserva: data.hora_limite_reserva,
            hora_limite: data.hora_limite,
            permite_envase_propio: data.permite_envase_propio ?? true,
            descuento_envase_propio: data.descuento_envase_propio ?? 0.15,
            es_sorpresa: data.es_sorpresa ?? false
          });
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching menu:", err);
          alert("No se pudo cargar el menú para editar.");
          navigate(createPageUrl("CafeteriaDashboard"));
        }
      } else {
        alert("No se especificó un menú para editar.");
        navigate(createPageUrl("CafeteriaDashboard"));
      }
    };

    loadMenu();
  }, [location.search, location.state, navigate]);

  const handleInputChange = (e) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSwitchChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      console.log('💾 Guardando cambios del menú...');
      
      await base44.entities.Menu.update(menu.id, {
        ...formData,
        stock_total: menu.stock_total, // Mantener stock_total original
      });
      
      console.log('✅ Menú actualizado exitosamente');
      
      // Wait for DB replication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate with refresh flag
      navigate(createPageUrl("CafeteriaDashboard"), {
        state: { refreshData: true, timestamp: Date.now() }
      });
    } catch (error) {
      console.error("❌ Error updating menu:", error);
      alert("Error al actualizar el menú.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !menu) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="ml-2">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("CafeteriaDashboard")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-emerald-200 hover:bg-emerald-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Editar Menú</h1>
            <p className="text-gray-600 mt-2">Ajusta los detalles de tu menú publicado.</p>
          </div>
        </div>

        <Card className="shadow-lg border-2">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl border">
                 <Sparkles className="w-5 h-5 text-purple-700"/>
                 <p className="text-sm font-medium text-gray-800">
                    {formData.es_sorpresa ? "Este es un menú sorpresa." : "Este no es un menú sorpresa."}
                 </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plato_principal">Plato Principal</Label>
                  <Input id="plato_principal" value={formData.plato_principal || ''} onChange={handleInputChange} required disabled={formData.es_sorpresa} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plato_secundario">2º Plato</Label>
                  <Input id="plato_secundario" value={formData.plato_secundario || ''} onChange={handleInputChange} required disabled={formData.es_sorpresa} />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="precio_original">Precio Original (€)</Label>
                  <Input id="precio_original" type="number" step="0.01" value={formData.precio_original || ''} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Precio PlatPal (€)</Label>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-xl font-bold text-emerald-600">€2.99</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_disponible">Stock Disponible</Label>
                  <Input id="stock_disponible" type="number" value={formData.stock_disponible || 0} onChange={handleInputChange} required />
                   <p className="text-xs text-gray-500">Stock total original: {menu?.stock_total}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hora_limite_reserva">Límite para Reservar</Label>
                  <Input id="hora_limite_reserva" type="time" value={formData.hora_limite_reserva || ''} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_limite">Límite para Recoger</Label>
                  <Input id="hora_limite" type="time" value={formData.hora_limite || ''} onChange={handleInputChange} required />
                </div>
              </div>

               <div className="p-4 border rounded-2xl space-y-4 bg-green-50/30">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="permite_envase_propio" className="flex items-center gap-2 font-semibold"><Recycle className="w-4 h-4 text-green-700"/>¿Permitir envase propio?</Label>
                      <Switch id="permite_envase_propio" checked={formData.permite_envase_propio} onCheckedChange={(c) => handleSwitchChange('permite_envase_propio', c)} />
                  </div>
                  {formData.permite_envase_propio && (
                      <div className="space-y-2"><Label htmlFor="descuento_envase_propio">Descuento por envase propio (€)</Label><Input id="descuento_envase_propio" type="number" step="0.01" value={formData.descuento_envase_propio || 0} onChange={handleInputChange} className="w-32" /></div>
                  )}
              </div>

              <Button type="submit" disabled={isSaving} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl py-3 font-semibold">
                {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Save className="w-5 h-5 mr-2" /> Guardar Cambios</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(EditMenu, ['cafeteria', 'admin']);