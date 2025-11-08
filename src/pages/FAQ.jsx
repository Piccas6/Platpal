
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react"; // Removed HelpCircle as it's replaced by an image
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    question: "¿Dónde recojo mi pedido?",
    answer: "Debes recoger tu pedido en la cafetería que seleccionaste al hacer la reserva. Presenta tu código de recogida y listo. El personal te entregará tu menú reservado."
  },
  {
    question: "¿Puedo comerme el menú en la cafetería?",
    answer: "No, los menús de PlatPal son exclusivamente para llevar. La idea es que puedas rescatar la comida y disfrutarla donde tú prefieras, ayudándonos a agilizar el proceso y a salvar más platos del desperdicio."
  },
  {
    question: "¿Qué pasa si los menús se agotan?",
    answer: "Los menús se muestran en tiempo real según disponibilidad. Si un menú se agota antes de que puedas reservarlo, te sugerimos revisar otras opciones disponibles o volver más tarde."
  },
  {
    question: "¿Cómo colaboro con ONGs?",
    answer: "Un porcentaje de cada compra se destina automáticamente a ONGs locales que luchan contra la pobreza alimentaria. No necesitas hacer nada extra, tu compra ya está ayudando."
  },
  {
    question: "¿Hasta cuándo puedo recoger mi menú?",
    answer: "Cada menú tiene una hora límite de recogida, generalmente antes del cierre de la cafetería. Esta información aparece claramente en tu reserva."
  },
  {
    question: "¿Puedo cancelar mi reserva?",
    answer: "Las reservas no pueden cancelarse una vez confirmadas, ya que apartamos el menú específicamente para ti. Te recomendamos reservar solo lo que vayas a recoger."
  },
  {
    question: "¿Los menús están en buen estado?",
    answer: "¡Por supuesto! Los menús están frescos y en perfecto estado. Solo son 'sobrantes' porque se prepararon de más, no porque tengan algún problema de calidad."
  },
  {
    question: "¿Cómo funcionan los precios?",
    answer: "Ofrecemos descuentos del 30-50% sobre el precio original para evitar desperdicios. Los precios mostrados ya incluyen el descuento aplicado."
  },
  {
    question: "¿Necesito crear una cuenta?",
    answer: "No necesitas registrarte para usar PlatPal. Solo necesitas tu código de recogida para retirar tu pedido en la cafetería."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
              alt="PlatPal Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Preguntas frecuentes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Resuelve todas tus dudas sobre PlatPal y cómo funciona nuestro sistema de menús sostenibles
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <Card key={index} className="shadow-md border-2 hover:border-emerald-200 transition-all duration-300">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left rounded-none hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {openItems.has(index) ? (
                      <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </Button>
                
                <AnimatePresence>
                  {openItems.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-3xl border border-emerald-100/50">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">¿Tienes alguna otra pregunta?</h3>
            <p className="text-gray-700 max-w-xl mx-auto">
              Si no encuentras la respuesta que buscas, no dudes en contactar con el personal de la cafetería 
              al momento de recoger tu pedido.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                Sostenible
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                Económico
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
                <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                Solidario
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
