import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Euro, 
  Package, 
  Leaf, 
  CreditCard,
  Gift,
  Tag,
  Check,
  X
} from "lucide-react";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  menu, 
  campus, 
  onConfirm, 
  isLoading,
  currentUser 
}) {
  const [usarEnvasePropio, setUsarEnvasePropio] = useState(false);
  const [usarBono, setUsarBono] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  if (!menu) return null;

  const referralDiscount = appliedReferral?.discount || 0;
  
  const precioFinal = usarBono 
    ? 0 
    : usarEnvasePropio 
      ? Math.max(0, menu.precio_descuento - (menu.descuento_envase_propio || 0) - referralDiscount)
      : Math.max(0, menu.precio_descuento - referralDiscount);

  const validateReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    setIsValidatingCode(true);
    setCodeError("");

    try {
      const upperCode = referralCode.toUpperCase().trim();
      
      // Buscar el código
      const codes = await base44.entities.ReferralCode.filter({ 
        code: upperCode,
        is_active: true 
      });

      if (codes.length === 0) {
        setCodeError("Código no válido");
        setIsValidatingCode(false);
        return;
      }

      const refCode = codes[0];

      // Verificar si el usuario ya usó este código
      const existingUses = await base44.entities.ReferralUse.filter({
        code: upperCode,
        user_email: currentUser?.email
      });

      if (existingUses.length > 0) {
        setCodeError("Ya has usado este código");
        setIsValidatingCode(false);
        return;
      }

      // Código válido
      setAppliedReferral({
        code: refCode.code,
        discount: refCode.discount_amount,
        partner_name: refCode.partner_name
      });
      
      setReferralCode("");
    } catch (err) {
      console.error("Error validando código:", err);
      setCodeError("Error al validar");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleConfirm = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const reservaInicio = 15.5; // 15:30
    const reservaFin = 16.5;    // 16:30

    if (currentTime < reservaInicio || currentTime > reservaFin) {
      alert('⏰ Las reservas solo están disponibles entre las 15:30 y las 16:30. Por favor, vuelve en ese horario.');
      return;
    }

    const codigo = 'PLP' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const reservaData = {
      menu_id: menu.id,
      menus_detalle: `${menu.plato_principal} + ${menu.plato_secundario}`,
      campus: campus?.id || menu.campus,
      cafeteria: menu.cafeteria,
      precio_total: precioFinal,
      codigo_recogida: codigo,
      envase_propio: usarEnvasePropio,
      descuento_aplicado: usarEnvasePropio ? (menu.descuento_envase_propio || 0) : 0,
      usar_bono: usarBono,
      pagado_con_bono: usarBono,
      referral_code: appliedReferral?.code || null,
      referral_discount: referralDiscount
    };

    onConfirm(reservaData);
  };

  const tieneBonos = currentUser?.creditos_menu_bono > 0;
  const tieneSubscripcion = currentUser?.tiene_subscripcion_activa;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirmar Reserva</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detalles del menú */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{menu.plato_principal}</h3>
                <p className="text-sm text-gray-600">+ {menu.plato_secundario}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{menu.cafeteria}</Badge>
                  {menu.es_vegetariano && <Badge className="bg-green-100 text-green-800">🥗 Vegetariano</Badge>}
                  {menu.es_vegano && <Badge className="bg-green-100 text-green-800">🌱 Vegano</Badge>}
                </div>
              </div>
            </div>
          </div>

          {/* Opción de Bono */}
          {tieneBonos && (
            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <Label className="font-semibold text-purple-900">Usar Bono de Suscripción</Label>
                </div>
                <Switch
                  checked={usarBono}
                  onCheckedChange={setUsarBono}
                />
              </div>
              <p className="text-sm text-purple-700">
                Tienes <strong>{currentUser.creditos_menu_bono}</strong> {currentUser.creditos_menu_bono === 1 ? 'menú disponible' : 'menús disponibles'}
              </p>
              {tieneSubscripcion && (
                <p className="text-xs text-purple-600 mt-1">
                  ✨ Suscripción activa • Se renuevan mensualmente
                </p>
              )}
            </div>
          )}

          {/* Opción de Envase Propio */}
          {!usarBono && menu.permite_envase_propio && (
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <Label className="font-semibold text-green-900">Traer mi propio envase</Label>
                </div>
                <Switch
                  checked={usarEnvasePropio}
                  onCheckedChange={setUsarEnvasePropio}
                />
              </div>
              <p className="text-sm text-green-700">
                Ahorra €{(menu.descuento_envase_propio || 0).toFixed(2)} extra siendo sostenible
              </p>
            </div>
          )}

          {/* Código de Referido */}
          {!usarBono && (
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              {appliedReferral ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 text-sm">
                        Código {appliedReferral.code} aplicado
                      </p>
                      <p className="text-xs text-emerald-600">
                        Descuento de €{appliedReferral.discount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAppliedReferral(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">¿Tienes un código de descuento?</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: UNOVELES20"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value.toUpperCase());
                        setCodeError("");
                      }}
                      className="flex-1 uppercase text-sm"
                      disabled={isValidatingCode}
                    />
                    <Button
                      onClick={validateReferralCode}
                      disabled={!referralCode.trim() || isValidatingCode}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isValidatingCode ? (
                        <OrbitalLoader className="w-4 h-4" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                  {codeError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <X className="w-3 h-3" /> {codeError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Precio Final */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
                {usarBono ? (
                  <div>
                    <p className="text-4xl font-black text-purple-600">GRATIS</p>
                    <p className="text-xs text-purple-500 mt-1">Usando bono de suscripción</p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-emerald-600">€{precioFinal.toFixed(2)}</p>
                    {(usarEnvasePropio || appliedReferral) && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-400 line-through">€{menu.precio_descuento.toFixed(2)}</span>
                        {usarEnvasePropio && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            -€{(menu.descuento_envase_propio || 0).toFixed(2)} envase
                          </Badge>
                        )}
                        {appliedReferral && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            -€{referralDiscount.toFixed(2)} {appliedReferral.code}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                {usarBono ? (
                  <Gift className="w-8 h-8 text-white" />
                ) : (
                  <Euro className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
              💡 <strong>Recuerda:</strong> Una vez confirmado, recibirás un código de recogida para mostrar en la cafetería.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {isLoading ? (
                <>
                  <OrbitalLoader className="w-4 h-4 mr-2" />
                  Procesando...
                </>
              ) : usarBono ? (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Usar Bono
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ir al Pago
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}