import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Euro, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OfficeOrderModal({ isOpen, onClose, menu, currentUser, onOrderSuccess }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente_nombre: currentUser?.full_name || '',
    cliente_email: currentUser?.email || '',
    cliente_telefono: '',
    direccion_entrega: '',
    incluye_bebida: false,
    servicio_entrega: 'glovo',
    notas: ''
  });

  const precioMenu = formData.incluye_bebida ? 5.30 : 4.50;
  const costoEnvio = 0; // Incluido en el precio
  const precioTotal = precioMenu + costoEnvio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente_email || !formData.direccion_entrega || !formData.cliente_telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const codigoRecogida = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const orderData = {
        menu_id: menu.id,
        cliente_nombre: formData.cliente_nombre,
        cliente_email: formData.cliente_email,
        cliente_telefono: formData.cliente_telefono,
        direccion_entrega: formData.direccion_entrega,
        cafeteria: menu.cafeteria,
        campus: menu.campus,
        menu_detalle: `${menu.plato_principal} + ${menu.plato_secundario}`,
        incluye_bebida: formData.incluye_bebida,
        precio_menu: precioMenu,
        margen_platpal: formData.incluye_bebida ? 2.50 : 2.20,
        pago_cafeteria: formData.incluye_bebida ? 2.80 : 2.30,
        coste_envio: costoEnvio,
        precio_total: precioTotal,
        estado: 'pendiente',
        codigo_recogida: codigoRecogida,
        servicio_entrega: formData.servicio_entrega,
        notas: formData.notas,
        payment_status: 'pending',
        tipo_pedido: 'individual'
      };

      const nuevaOrden = await base44.entities.OfficeOrder.create(orderData);

      // Reducir stock
      if (menu.stock_disponible > 0) {
        await base44.entities.Menu.update(menu.id, {
          stock_disponible: menu.stock_disponible - 1
        });
      }

      // Crear sesión de pago con Stripe
      const { data } = await base44.functions.invoke('createOfficeCheckout', {
        order_id: nuevaOrden.id,
        menu_detalle: orderData.menu_detalle,
        precio_total: precioTotal,
        cliente_email: formData.cliente_email,
        incluye_bebida: formData.incluye_bebida
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No se recibió URL de pago');
      }

    } catch (error) {
      console.error('Error creating office order:', error);
      alert('Error al procesar el pedido. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pedido Office - {menu.plato_principal}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Información del Cliente</h3>
            
            <div>
              <Label>Nombre / Empresa *</Label>
              <Input
                required
                value={formData.cliente_nombre}
                onChange={(e) => setFormData({...formData, cliente_nombre: e.target.value})}
                placeholder="Nombre o empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData({...formData, cliente_email: e.target.value})}
                  placeholder="correo@empresa.com"
                />
              </div>
              <div>
                <Label>Teléfono *</Label>
                <Input
                  required
                  type="tel"
                  value={formData.cliente_telefono}
                  onChange={(e) => setFormData({...formData, cliente_telefono: e.target.value})}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Dirección de Entrega */}
          <div>
            <Label>Dirección de Entrega *</Label>
            <Textarea
              required
              value={formData.direccion_entrega}
              onChange={(e) => setFormData({...formData, direccion_entrega: e.target.value})}
              placeholder="Calle, número, piso, puerta, código postal, ciudad..."
              rows={3}
            />
          </div>

          {/* Servicio de Entrega */}
          <div>
            <Label>Servicio de Entrega</Label>
            <Select
              value={formData.servicio_entrega}
              onValueChange={(value) => setFormData({...formData, servicio_entrega: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="glovo">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Glovo (Recomendado)
                  </div>
                </SelectItem>
                <SelectItem value="justeat">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Just Eat
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incluir Bebida */}
          <div className="space-y-3">
            <Label>¿Incluir bebida?</Label>
            <RadioGroup
              value={formData.incluye_bebida.toString()}
              onValueChange={(value) => setFormData({...formData, incluye_bebida: value === 'true'})}
            >
              <div className="flex items-center space-x-2 p-3 border-2 rounded-lg hover:bg-blue-50 cursor-pointer">
                <RadioGroupItem value="false" id="sin-bebida" />
                <Label htmlFor="sin-bebida" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span>Sin bebida</span>
                    <span className="font-bold text-blue-600">4,50€</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border-2 rounded-lg hover:bg-purple-50 cursor-pointer">
                <RadioGroupItem value="true" id="con-bebida" />
                <Label htmlFor="con-bebida" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span>Con bebida</span>
                    <span className="font-bold text-purple-600">5,30€</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notas */}
          <div>
            <Label>Notas adicionales (opcional)</Label>
            <Textarea
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              placeholder="Ej: Dejar en recepción, timbre de arriba..."
              rows={2}
            />
          </div>

          {/* Resumen */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span>Menú {formData.incluye_bebida ? 'con bebida' : 'sin bebida'}</span>
              <span className="font-semibold">€{precioMenu.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Entrega</span>
              <span className="font-semibold text-green-600">Incluida</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-blue-600">€{precioTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <Euro className="w-4 h-4 mr-2" />
                  Pagar €{precioTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}