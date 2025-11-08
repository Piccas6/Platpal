
import React from "react";
import { MapPin, UtensilsCrossed, ShoppingBag, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Selecciona campus",
    description: "Elige tu universidad y cafetería favorita",
    color: "emerald"
  },
  {
    icon: UtensilsCrossed,
    title: "Explora menús",
    description: "Ve los menús disponibles con descuentos especiales", 
    color: "amber"
  },
  {
    icon: ShoppingBag,
    title: "Reserva tu menú",
    description: "Confirma tu pedido en segundos",
    color: "blue"
  },
  {
    icon: CheckCircle,
    title: "Recoge y disfruta",
    description: "Pasa por la cafetería antes del cierre",
    color: "rose"
  }
];

const colorClasses = {
  emerald: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    accent: "border-emerald-200"
  },
  amber: {
    bg: "bg-amber-100", 
    icon: "text-amber-600",
    accent: "border-amber-200"
  },
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600", 
    accent: "border-blue-200"
  },
  rose: {
    bg: "bg-rose-100",
    icon: "text-rose-600",
    accent: "border-rose-200"
  }
};

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona PlatPal?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un proceso simple y rápido para conseguir menús deliciosos mientras ayudas al planeta
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            return (
              <div key={index} className="relative group">
                <div className={`p-8 rounded-3xl border-2 ${colors.accent} bg-gradient-to-b from-white to-gray-50/30 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                      <step.icon className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                    
                    <div className="text-xs font-bold text-gray-400 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                      {index + 1}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gray-200"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
