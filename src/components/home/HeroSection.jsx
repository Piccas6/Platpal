
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf, ArrowRight, Heart, Recycle } from "lucide-react";

export default function HeroSection() {
  const scrollToHowItWorks = () => {
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="px-4 py-2 bg-emerald-100/80 text-emerald-800 rounded-full text-sm font-semibold tracking-wide">
                  Sostenibilidad Universitaria
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Menús universitarios
                <span className="block bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                  sin desperdicios
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Compra menús universitarios sobrantes a menor precio, ayuda al planeta y apoya a ONGs locales. 
                <span className="font-semibold text-emerald-700"> Una decisión que marca la diferencia.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Campus")} className="flex-1 sm:flex-none">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
                  Explorar menús
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={scrollToHowItWorks}
                className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300"
              >
                Ver cómo funciona
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Recycle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Reduce desperdicios</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-amber-600">€</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">Ahorra dinero</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Apoya ONGs</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-emerald-100 to-amber-100 rounded-3xl p-8 shadow-2xl">
              <div className="w-full h-full bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Tu impacto</h3>
                    <p className="text-gray-600 text-sm">Cada menú comprado<br/>evita 1kg de desperdicios</p>
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
