import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, MapPin, Clock, Euro, Recycle } from "lucide-react";

export default function ReservationModal({ isOpen, onClose, menu, campus, onConfirm, isLoading, currentUser }) {
  const [usarEnvasePropio, setUsarEnvasePropio] = useState(false);
  const [usarBono, setUsarBono] = useState(false);

  if (!menu) return null;

  const canMakePurchase = currentUser?.app_role === 'user' || 
                          currentUser?.app_role === 'admin' || 
                          currentUser?.app_role === 'cafeteria';
  
  if (!canMakePurchase) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-3xl border-2">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Acceso Restringido
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎓</span>
            </div>
            <p className="text-gray-700">
              Solo los estudiantes pueden realizar compras en PlatPal.
            </p>
            <p className="text-sm text-gray-500">
              Si eres estudiante, por favor contacta con el administrador para que actualice tu rol.
            </p>
            <Button onClick={onClose} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const descuentoEnvase = menu.descuento_envase_propio || 0.15;
  const precioBase = 2.99;
  const precioFinal = usarBono ? 0 : (usarEnvasePropio && menu.permite_envase_propio ? precioBase - descuentoEnvase : precioBase);

  const tieneBonos = currentUser?.creditos_menu_bono > 0;

  const handleConfirmAndPay = () => {
    const codigoRecogida = `PLP${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const reservaParaCrear = {
      menu_id: menu.id,
      campus: campus?.nombre || 'Campus',
      cafeteria: menu.cafeteria || 'Cafetería',
      menus_detalle: menu.es_sorpresa ? 'Menú Sorpresa + 2º Plato Sorpresa' : `${menu.plato_principal || ''} + ${menu.plato_secundario || ''}`,
      precio_total: precioFinal,
      codigo_recogida: codigoRecogida,
      envase_propio: usarEnvasePropio,
      descuento_aplicado: usarEnvasePropio ? descuentoEnvase : 0,
      usar_bono: usarBono
    };
    onConfirm(reservaParaCrear);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            Confirmar reserva
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border border-emerald-100/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-gray-900">{String(menu.cafeteria || 'Cafetería')}</p>
                  <p className="text-sm text-gray-600">{String(campus?.nombre || 'Campus')}</p>
                </div>
              </div>

              <div className="border-t border-emerald-100 pt-3">
                <div>
                  <p className="font-semibold text-gray-900">
                      {menu.es_sorpresa ? 'Menú Sorpresa' : String(menu.plato_principal || '')}
                  </p>
                  <p className="text-gray-600 text-sm">
                      + {menu.es_sorpresa ? '2º Plato Sorpresa' : String(menu.plato_secundario || '')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-emerald-100">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Reserva hasta {String(menu.hora_limite_reserva || '')} • Recoge hasta {String(menu.hora_limite || '')}
                </span>
              </div>
            </div>
          </div>

          {/* Opción de usar bono */}
          {tieneBonos && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🎁</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Usar Bono</p>
                    <p className="text-sm text-gray-600">
                      Te quedan {currentUser.creditos_menu_bono} {currentUser.creditos_menu_bono === 1 ? 'menú' : 'menús'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={usarBono}
                  onCheckedChange={setUsarBono}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              {usarBono && (
                <p className="text-xs text-emerald-700 font-medium">
                  ¡Genial! Este menú no te costará nada 🎉
                </p>
              )}
            </div>
          )}

          {/* Opción envase propio (solo si NO usa bono) */}
          {!usarBono && menu.permite_envase_propio && (
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3">
                <Recycle className="w-5 h-5 text-amber-600" />
                <div>
                  <Label htmlFor="envase-propio" className="font-semibold text-gray-900 cursor-pointer">
                    Traer mi envase
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ahorra €{descuentoEnvase.toFixed(2)}
                  </p>
                </div>
              </div>
              <Switch
                id="envase-propio"
                checked={usarEnvasePropio}
                onCheckedChange={setUsarEnvasePropio}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>
          )}

          {/* Precio final */}
          <div className="pt-4 border-t-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <div className="text-right">
                {usarBono ? (
                  <div>
                    <span className="text-3xl font-bold text-emerald-600">GRATIS</span>
                    <p className="text-xs text-gray-500">(Usando 1 bono)</p>
                  </div>
                ) : (
                  <div>
                    {usarEnvasePropio && menu.permite_envase_propio && (
                      <span className="text-sm text-gray-400 line-through block">
                        €{precioBase.toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-emerald-600">
                      €{precioFinal.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-amber-800">⏱️ Reserva temporal por 5 minutos</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Tu menú estará reservado durante 5 minutos mientras completas el pago.
                Si no pagas en ese tiempo, se liberará automáticamente.
              </p>
            </div>
          </div>

          {currentUser?.app_role === 'cafeteria' && (
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-700 text-center">
                🧪 <strong>Modo Testing:</strong> Estás comprando como cafetería para probar el sistema
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-2xl py-3 font-semibold border-2 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAndPay}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Procesando...</span>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : usarBono ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Reserva
                </>
              ) : (
                <>
                  <Euro className="w-4 h-4 mr-2" />
                  Pagar €{precioFinal.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {usarBono && (
            <p className="text-xs text-center text-gray-500">
              Se descontará 1 menú de tus bonos disponibles
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}