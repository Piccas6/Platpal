
import React, { useState, useEffect } from "react";
import { CommunityPost, UploadFile } from "@/integrations/Core";
import { base44 } from "@/integrations/base44"; // Assuming base44 is imported from an integrations library
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowLeft, Share2, Send, Camera, Loader2, Copy, Star } from "lucide-react"; // Added Star icon
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Label } from "@/components/ui/label";
import ReviewModal from '../components/menus/ReviewModal'; // New import for ReviewModal

export default function Confirmation() {
  const [reservationData, setReservationData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [postMessage, setPostMessage] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false); // New state for review modal
  const [isSubmittingReview, setIsSubmittingReview] = useState(false); // New state for review submission

  useEffect(() => {
    const reservationInfo = localStorage.getItem('lastReservation');
    if (reservationInfo) {
      setReservationData(JSON.parse(reservationInfo));
      // Clean up: Remove the reservation information from localStorage after it's been used
      localStorage.removeItem('lastReservation');
    }
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null)); // Changed from User.me() to base44.auth.me()
  }, []);
  
  const handleSharePost = async () => {
      if (!postMessage.trim() || !currentUser) return;
      setIsPosting(true);
      try {
          let imageUrl = '';
          if (postImage) {
              const { file_url } = await UploadFile({ file: postImage });
              imageUrl = file_url;
          }
          await CommunityPost.create({
              user_name: currentUser.full_name,
              user_avatar: currentUser.full_name ? currentUser.full_name[0].toUpperCase() : '?',
              message: postMessage,
              image_url: imageUrl,
              type: 'manual'
          });
          setPostMessage("");
          setPostImage(null);
          alert("¡Publicado en la comunidad! Gracias por compartir.");
      } catch (error) {
          console.error("Error posting to community:", error);
          alert("Hubo un error al publicar.");
      } finally {
          setIsPosting(false);
      }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmitReview = async (reviewData) => {
    setIsSubmittingReview(true);
    try {
      await base44.entities.MenuReview.create({ // Using base44 for creating MenuReview
        ...reviewData,
        user_name: currentUser?.full_name || 'Usuario'
      });
      setShowReviewModal(false);
      alert('✅ ¡Gracias por tu valoración!');
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('❌ Error al enviar la valoración');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!reservationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-6">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🤔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No se encontró la reserva</h1>
          <p className="text-gray-600 mb-6">
            Parece que no hay información de una reserva reciente. Por favor, vuelve a la página de inicio para continuar.
          </p>
          <Link to={createPageUrl("Home")}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">¡Reserva Completada!</h1>
            <p className="text-gray-600 mt-2">Has salvado un menú del desperdicio. ¡Gracias por tu impacto!</p>
        </div>

        {/* Código de Recogida */}
        <Card className="mb-8 shadow-xl border-4 border-emerald-200">
            <CardHeader className="text-center">
                <CardTitle>Tu Código de Recogida</CardTitle>
                <CardDescription>Muestra este código en la cafetería</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p 
                    className="text-5xl font-bold text-emerald-600 tracking-widest bg-emerald-50 rounded-lg py-4 cursor-pointer"
                    onClick={() => copyToClipboard(reservationData.codigo_recogida)}
                >
                    {reservationData.codigo_recogida}
                </p>
                {copied && <p className="text-sm text-green-600 mt-2">¡Copiado!</p>}
            </CardContent>
        </Card>

        {/* Detalles del Pedido */}
        <Card className="mb-8 shadow-lg border-2 border-gray-100">
            <CardHeader>
                <CardTitle>Detalles del Menú</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Cafetería:</span>
                    <span className="font-semibold">{reservationData.menu.cafeteria}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Campus:</span>
                    <span className="font-semibold">{reservationData.campus.nombre}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Menú:</span>
                    <span className="font-semibold">{reservationData.menu.plato_principal}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-2">
                    <span className="text-gray-600">Precio Pagado:</span>
                    <span className="font-bold text-lg text-emerald-700">€{reservationData.precio_total.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
        
        {/* NUEVO: Botón para valorar */}
        <Card className="mb-8 shadow-lg border-2 border-amber-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              ¿Cómo estuvo tu menú?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Tu opinión ayuda a mejorar el servicio y a otros estudiantes a elegir mejor
            </p>
            <Button onClick={() => setShowReviewModal(true)} className="w-full bg-amber-500 hover:bg-amber-600">
              <Star className="w-4 h-4 mr-2" />
              Valorar mi experiencia
            </Button>
          </CardContent>
        </Card>

        {/* Social Sharing Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-500" />
                ¡Comparte tu hazaña!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Añade un mensaje a la comunidad PlatPal:</Label>
              <Textarea 
                placeholder={`¡Acabo de salvar un menú de ${reservationData.menu.cafeteria}! Estaba delicioso...`}
                value={postMessage}
                onChange={(e) => setPostMessage(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2">
                <Input type="file" accept="image/*" onChange={(e) => setPostImage(e.target.files[0])} className="text-xs max-w-xs" />
                <Button onClick={handleSharePost} disabled={isPosting || !postMessage.trim()}>
                    {isPosting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Publicar
                </Button>
              </div>
            </div>
            <div className="border-t pt-4">
              <Label>Comparte en tus redes sociales:</Label>
              <Button variant="outline" className="w-full mt-2" onClick={() => copyToClipboard(`¡Acabo de salvar un menú con #PlatPal! 拯救食物, 拯救地球. ¡Únete al movimiento! @platpal_app`)}>
                <Copy className="w-4 h-4 mr-2"/> Copiar mensaje para Instagram/TikTok
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex gap-3">
          <Link to={createPageUrl("Home")} className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl py-3 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          <Link to={createPageUrl("Community")} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl py-3 font-semibold">
              Ir a la Comunidad
            </Button>
          </Link>
        </div>

        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          reserva={reservationData}
          onSubmit={handleSubmitReview}
          isLoading={isSubmittingReview}
        />
      </div>
    </div>
  );
}
