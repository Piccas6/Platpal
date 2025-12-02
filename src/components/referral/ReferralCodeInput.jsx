import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Check, X, Loader2, Gift, Tag } from "lucide-react";

export default function ReferralCodeInput({ 
  userEmail, 
  onCodeApplied, 
  appliedCode,
  onCodeRemoved 
}) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const validateCode = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    setError("");

    try {
      const upperCode = code.toUpperCase().trim();
      
      // Buscar el código en la base de datos
      const codes = await base44.entities.ReferralCode.filter({ 
        code: upperCode,
        is_active: true 
      });

      if (codes.length === 0) {
        setError("Código no válido");
        setIsValidating(false);
        return;
      }

      const referralCode = codes[0];

      // Verificar si el usuario ya usó este código
      const existingUses = await base44.entities.ReferralUse.filter({
        code: upperCode,
        user_email: userEmail
      });

      if (existingUses.length > 0) {
        setError("Ya has usado este código");
        setIsValidating(false);
        return;
      }

      // Código válido
      onCodeApplied({
        code: referralCode.code,
        discount: referralCode.discount_amount,
        partner_name: referralCode.partner_name
      });
      
      setCode("");
    } catch (err) {
      console.error("Error validando código:", err);
      setError("Error al validar el código");
    } finally {
      setIsValidating(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-800">
                Código {appliedCode.code} aplicado
              </p>
              <p className="text-sm text-emerald-600">
                Descuento de {appliedCode.discount.toFixed(2)}€
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCodeRemoved}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-700">
        <Tag className="w-4 h-4" />
        <span className="text-sm font-medium">¿Tienes un código de descuento?</span>
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Ej: UNOVELES20"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          className="flex-1 uppercase"
          disabled={isValidating}
        />
        <Button
          onClick={validateCode}
          disabled={!code.trim() || isValidating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}