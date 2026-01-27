import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, CreditCard, AlertCircle } from "lucide-react";

export default function StripeConnectSetup({ user, cafeteriaId, onComplete }) {
  const [iban, setIban] = useState("");
  const [titular, setTitular] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    if (!iban || !titular) {
      setError("Completa todos los campos");
      return;
    }

    // Validación básica IBAN
    const ibanClean = iban.replace(/\s/g, '');
    if (!/^ES\d{22}$/.test(ibanClean)) {
      setError("IBAN español inválido (debe empezar con ES y tener 24 caracteres)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { createStripeConnectAccount } = await import("@/functions/createStripeConnectAccount");
      
      const response = await createStripeConnectAccount({
        iban: ibanClean,
        titular_cuenta: titular,
        cafeteria_id: cafeteriaId
      });

      if (response?.data?.onboarding_url) {
        // Redirigir a Stripe para completar onboarding
        window.location.href = response.data.onboarding_url;
      } else if (response?.data?.success && onComplete) {
        onComplete();
      } else {
        setError("No se recibió URL de configuración");
      }
    } catch (error) {
      console.error("Error configurando Stripe:", error);
      setError(error.response?.data?.error || error.message || "Error al configurar pagos");
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya tiene cuenta configurada
  if (user?.stripe_account_id && user?.stripe_onboarding_completed) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-green-900">Pagos Automáticos Activados</h3>
              <p className="text-sm text-green-700">
                Recibirás el 70% de cada venta automáticamente en tu cuenta
              </p>
              {user.iban && (
                <p className="text-xs text-green-600 mt-1">
                  IBAN: {user.iban.slice(0, 4)}****{user.iban.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Configurar Pagos Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💰 Recibe el 70% de cada venta automáticamente</strong>
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Configura tu cuenta bancaria y recibirás transferencias automáticas tras cada pedido pagado.
          </p>
        </div>

        <div>
          <Label>Titular de la Cuenta *</Label>
          <Input
            value={titular}
            onChange={(e) => setTitular(e.target.value)}
            placeholder="Nombre del titular"
            className="mt-2"
          />
        </div>

        <div>
          <Label>IBAN *</Label>
          <Input
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="ES00 0000 0000 0000 0000 0000"
            className="mt-2"
            maxLength={24}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: ES seguido de 22 dígitos
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSetup}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Configurando...
            </>
          ) : (
            "Configurar Pagos Automáticos"
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Protegido por Stripe • Pagos seguros y cifrados
        </p>
      </CardContent>
    </Card>
  );
}