import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import StripePayment from "../components/payment/StripePayment";
import PaymentSuccess from "../components/payment/PaymentSuccess";
import { Loader2, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentFlow() {
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const verifyPayment = useCallback(async (sessionId) => {
    setIsVerifying(true);
    try {
      const pendingReservation = localStorage.getItem('pendingReservation');
      if (!pendingReservation) {
        navigate(createPageUrl("Home"));
        return;
      }
      
      const reserva = JSON.parse(pendingReservation);
      
      // Esperar un poco para que el webhook procese
      console.log('⏳ Esperando a que Stripe procese el pago...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar estado de la reserva
      console.log('🔍 Verificando estado de reserva:', reserva.id);
      const updatedReserva = await base44.entities.Reserva.get(reserva.id);
      
      console.log('📋 Estado actual:', updatedReserva.payment_status);

      if (updatedReserva.payment_status === 'completed') {
        console.log('✅ Pago confirmado!');
        setReservationData({
          ...reserva,
          ...updatedReserva
        });
        setPaymentStatus('success');
        localStorage.removeItem('pendingReservation');
      } else if (verificationAttempts < 5) {
        // Reintentar después de un delay
        console.log('🔄 Reintentando verificación...', verificationAttempts + 1, 'de 5');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerificationAttempts(prev => prev + 1);
        
        const recheckReserva = await base44.entities.Reserva.get(reserva.id);
        
        if (recheckReserva.payment_status === 'completed') {
          console.log('✅ Pago confirmado en reintento!');
          setReservationData({
            ...reserva,
            ...recheckReserva
          });
          setPaymentStatus('success');
          localStorage.removeItem('pendingReservation');
        } else {
          console.log('⏳ Aún procesando...');
          setPaymentStatus('verifying');
          setReservationData({
            ...reserva,
            ...recheckReserva
          });
        }
      } else {
        console.log('⚠️ Máximo de reintentos alcanzado');
        setPaymentStatus('verifying');
        setReservationData({
          ...reserva,
          ...updatedReserva
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('error');
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, verificationAttempts]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');

    if (cancelled) {
      setPaymentStatus('cancelled');
      return;
    }

    if (sessionId) {
      console.log('🎯 Sesión de Stripe detectada:', sessionId);
      verifyPayment(sessionId);
    } else {
      const pendingReservation = localStorage.getItem('pendingReservation');
      if (pendingReservation) {
        setReservationData(JSON.parse(pendingReservation));
      } else {
        navigate(createPageUrl("Home"));
      }
    }
  }, [navigate, verifyPayment]);

  const handlePaymentCancel = () => {
    navigate(createPageUrl("Menus"));
  };

  const handleContinue = () => {
    localStorage.setItem('lastReservation', JSON.stringify(reservationData));
    localStorage.removeItem('pendingReservation');
    navigate(createPageUrl("Confirmation"));
  };

  const handleManualCheck = async () => {
    if (!reservationData) return;
    
    setIsVerifying(true);
    try {
      const updatedReserva = await base44.entities.Reserva.get(reservationData.id);
      if (updatedReserva.payment_status === 'completed') {
        setReservationData({
          ...reservationData,
          ...updatedReserva
        });
        setPaymentStatus('success');
        localStorage.removeItem('pendingReservation');
      } else {
        alert('El pago aún se está procesando. Por favor espera unos segundos más.');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      alert('Error al verificar el pago. Inténtalo de nuevo.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Pago Cancelado</h2>
            <p className="text-gray-600">
              Has cancelado el proceso de pago. Tu menú sigue reservado temporalmente.
            </p>
            <div className="space-y-2 pt-4">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Intentar de nuevo
              </Button>
              <Button 
                variant="outline"
                onClick={handlePaymentCancel}
                className="w-full"
              >
                Volver a menús
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerifying || paymentStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verificando pago...</h2>
            <p className="text-gray-600">
              Estamos confirmando tu pago con Stripe. Esto puede tardar unos segundos.
            </p>
            <div className="text-sm text-gray-500">
              Por favor, no cierres esta ventana.
            </div>
            {verificationAttempts > 0 && (
              <div className="text-xs text-gray-400">
                Intento {verificationAttempts} de 5...
              </div>
            )}
            {verificationAttempts >= 3 && (
              <div className="pt-4">
                <Button 
                  onClick={handleManualCheck}
                  variant="outline"
                  disabled={isVerifying}
                  className="w-full"
                >
                  Verificar manualmente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Error al verificar el pago</h2>
            <p className="text-gray-600">
              Hubo un problema al verificar tu pago. Si ya has pagado, tu reserva está guardada.
            </p>
            <div className="space-y-2 pt-4">
              <Button onClick={handleManualCheck} className="w-full" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Verificar de nuevo
              </Button>
              <Button variant="outline" onClick={handlePaymentCancel} className="w-full">
                Volver a menús
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 flex items-center justify-center">
      {paymentStatus === 'pending' && (
        <StripePayment
          reserva={reservationData}
          onCancel={handlePaymentCancel}
        />
      )}
      
      {paymentStatus === 'success' && (
        <PaymentSuccess
          reserva={reservationData}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}