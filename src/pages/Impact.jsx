import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Utensils, PiggyBank, Heart, Store, Globe, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { OrbitalLoader } from '@/components/ui/orbital-loader';

const ImpactStatCard = ({ icon: Icon, title, value, unit, color, isLoading }) => (
  <Card className={`shadow-lg border-2 ${color.border} bg-white hover:shadow-xl transition-shadow duration-300`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm sm:text-base font-semibold text-gray-800">{title}</CardTitle>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color.text} flex-shrink-0`} />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex justify-center py-2">
          <OrbitalLoader className="w-8 h-8" />
        </div>
      ) : (
        <>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{value}</div>
          <p className={`text-xs sm:text-sm font-medium ${color.text} mt-1`}>{unit}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const ContributionCard = ({ icon: Icon, title, description, color }) => (
    <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${color.bg_gradient} border ${color.border} shadow-lg`}>
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-4 sm:mb-5 shadow-md">
            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${color.icon}`} />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{description}</p>
    </div>
);

export default function ImpactPage() {
    const stats = {
        foodSavedKg: 21,
        menusDistributed: 53,
        moneySaved: 158,
        co2Saved: 168,
        partnerCafeterias: 3,
    };
    const isLoading = false;
    
    const colors = {
        green: { text: "text-emerald-600", border: "border-emerald-100", bg_gradient: "from-emerald-50 to-green-50", icon: "text-emerald-600" },
        blue: { text: "text-blue-600", border: "border-blue-100", bg_gradient: "from-blue-50 to-sky-50", icon: "text-blue-600" },
        orange: { text: "text-amber-600", border: "border-amber-100", bg_gradient: "from-amber-50 to-orange-50", icon: "text-amber-600" },
        pink: { text: "text-rose-600", border: "border-rose-100" },
        purple: { text: "text-purple-600", border: "border-purple-100" },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="max-w-4xl mx-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative mx-auto mb-4 sm:mb-6">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                          alt="PlatPal Logo" 
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight px-2">
                        Cada plato cuenta.
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Descubre cómo cada menú que salvas en PlatPal genera un impacto real y positivo en nuestra comunidad y en el planeta.
                    </p>
                </div>
            </section>

            {/* Impact Metrics Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                        <ImpactStatCard icon={Leaf} title="Comida Salvada" value={stats.foodSavedKg} unit="kg de alimentos" color={colors.green} isLoading={isLoading} />
                        <ImpactStatCard icon={Utensils} title="Menús Distribuidos" value={stats.menusDistributed} unit="menús salvados" color={colors.blue} isLoading={isLoading} />
                        <ImpactStatCard icon={PiggyBank} title="Ahorro Total" value={`€${stats.moneySaved}`} unit="ahorrados" color={colors.orange} isLoading={isLoading} />
                        <ImpactStatCard icon={Globe} title="CO₂ Evitado" value={stats.co2Saved} unit="kg de CO₂" color={colors.purple} isLoading={isLoading} />
                        <ImpactStatCard icon={Store} title="Cafeterías" value={stats.partnerCafeterias} unit="aliadas activas" color={colors.green} isLoading={isLoading} />
                    </div>
                </div>
            </section>

            {/* How We Contribute Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">Un Círculo Virtuoso para Todos</h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
                        PlatPal crea un ecosistema donde todos ganan. Así es como tu participación marca la diferencia para cada uno de los implicados.
                    </p>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-left">
                        <ContributionCard 
                            icon={Users} 
                            title="Para los Estudiantes" 
                            description="Acceden a comida de calidad a precios muy reducidos, permitiéndoles ahorrar dinero sin sacrificar una buena alimentación."
                            color={colors.blue}
                        />
                        <ContributionCard 
                            icon={Store} 
                            title="Para las Cafeterías" 
                            description="Transforman el excedente de comida en ingresos adicionales, reducen sus pérdidas y atraen a nuevos clientes comprometidos."
                            color={colors.orange}
                        />
                        <ContributionCard 
                            icon={Globe} 
                            title="Para el Planeta" 
                            description="Cada menú salvado evita el desperdicio alimentario, disminuyendo las emisiones de CO₂ y la presión sobre nuestros recursos naturales."
                            color={colors.green}
                        />
                    </div>
                </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
                 <div className="max-w-4xl mx-auto text-center">
                     <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-10 md:mb-12 px-2">Lo que dice nuestra comunidad</h2>
                     <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 text-left">
                        <Card className="p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />)}
                            </div>
                            <blockquote className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4">"PlatPal ha cambiado mi vida universitaria. Como rico, ahorro un montón y siento que ayudo al planeta. ¡Es genial!"</blockquote>
                            <footer className="text-sm sm:text-base font-semibold text-gray-900">Ana G., Estudiante de Derecho</footer>
                        </Card>
                        <Card className="p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />)}
                            </div>
                            <blockquote className="text-sm sm:text-base text-gray-700 italic mb-3 sm:mb-4">"Antes tirábamos mucha comida al final del día. Ahora, gracias a PlatPal, hemos reducido el desperdicio a casi cero."</blockquote>
                            <footer className="text-sm sm:text-base font-semibold text-gray-900">Carlos M., Dueño Cafetería Central</footer>
                        </Card>
                     </div>
                 </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">Súmate al cambio con PlatPal</h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                        Tu próxima comida puede ser un paso más hacia un futuro más sostenible y justo. Explora los menús disponibles hoy y sé parte de la solución.
                    </p>
                    <Link to={createPageUrl("Menus")}>
                        <Button
                            size="lg"
                            className="bg-white text-emerald-600 hover:bg-gray-100 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg transition-transform hover:scale-105"
                        >
                            Empezar a salvar menús <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}