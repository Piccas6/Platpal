
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Utensils, PiggyBank, Heart, Store, Globe, Users, University, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ImpactStatCard = ({ icon: Icon, title, value, unit, color }) => (
  <Card className={`shadow-lg border-2 ${color.border} bg-white hover:shadow-xl transition-shadow duration-300`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
      <Icon className={`w-6 h-6 ${color.text}`} />
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold text-gray-900">{value}</div>
      <p className={`text-sm font-medium ${color.text}`}>{unit}</p>
    </CardContent>
  </Card>
);

const ContributionCard = ({ icon: Icon, title, description, color }) => (
    <div className={`p-8 rounded-3xl bg-gradient-to-br ${color.bg_gradient} border ${color.border} shadow-lg`}>
        <div className="flex items-center justify-center w-14 h-14 bg-white/80 backdrop-blur-sm rounded-2xl mb-5 shadow-md">
            <Icon className={`w-7 h-7 ${color.icon}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
);

export default function ImpactPage() {
    const stats = {
        foodSavedKg: '18',
        menusDistributed: '14',
        moneySaved: '60',
        ngoDonationPercent: '5%',
        partnerCafeterias: 3,
    };
    
    const colors = {
        green: { text: "text-emerald-600", border: "border-emerald-100", bg_gradient: "from-emerald-50 to-green-50", icon: "text-emerald-600" },
        blue: { text: "text-blue-600", border: "border-blue-100", bg_gradient: "from-blue-50 to-sky-50", icon: "text-blue-600" },
        orange: { text: "text-amber-600", border: "border-amber-100", bg_gradient: "from-amber-50 to-orange-50", icon: "text-amber-600" },
        pink: { text: "text-rose-600", border: "border-rose-100" },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="text-center py-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
                <div className="max-w-4xl mx-auto">
                    <div className="w-20 h-20 relative mx-auto mb-6">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png" 
                          alt="PlatPal Logo" 
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                        Cada plato cuenta.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Descubre cómo cada menú que salvas en PlatPal genera un impacto real y positivo en nuestra comunidad y en el planeta.
                    </p>
                </div>
            </section>

            {/* Impact Metrics Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <ImpactStatCard icon={Leaf} title="Comida Salvada" value={stats.foodSavedKg} unit="kg de alimentos" color={colors.green} />
                        <ImpactStatCard icon={Utensils} title="Menús Distribuidos" value={stats.menusDistributed} unit="menús a estudiantes" color={colors.blue} />
                        <ImpactStatCard icon={PiggyBank} title="Ahorro Estudiantil" value={`€${stats.moneySaved}`} unit="ahorrados en total" color={colors.orange} />
                        <ImpactStatCard icon={Heart} title="Donado a ONGs" value={stats.ngoDonationPercent} unit="de cada compra" color={colors.pink} />
                        <ImpactStatCard icon={Store} title="Cafeterías Aliadas" value={stats.partnerCafeterias} unit="se han unido al cambio" color={colors.green} />
                    </div>
                </div>
            </section>

            {/* How We Contribute Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Un Círculo Virtuoso para Todos</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
                        PlatPal crea un ecosistema donde todos ganan. Así es como tu participación marca la diferencia para cada uno de los implicados.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
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
            <section className="py-20 px-6 bg-gray-50">
                 <div className="max-w-4xl mx-auto text-center">
                     <h2 className="text-4xl font-bold text-gray-900 mb-12">Lo que dice nuestra comunidad</h2>
                     <div className="grid md:grid-cols-2 gap-8 text-left">
                        <Card className="p-8 rounded-2xl shadow-lg">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />)}
                            </div>
                            <blockquote className="text-gray-700 italic mb-4">"PlatPal ha cambiado mi vida universitaria. Como rico, ahorro un montón y siento que ayudo al planeta. ¡Es genial!"</blockquote>
                            <footer className="font-semibold text-gray-900">Ana G., Estudiante de Derecho</footer>
                        </Card>
                        <Card className="p-8 rounded-2xl shadow-lg">
                            <div className="flex mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />)}
                            </div>
                            <blockquote className="text-gray-700 italic mb-4">"Antes tirábamos mucha comida al final del día. Ahora, gracias a PlatPal, hemos reducido el desperdicio a casi cero."</blockquote>
                            <footer className="font-semibold text-gray-900">Carlos M., Dueño Cafetería Central</footer>
                        </Card>
                     </div>
                 </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-emerald-500 to-blue-500 p-12 rounded-3xl shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-4">Súmate al cambio con PlatPal</h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Tu próxima comida puede ser un paso más hacia un futuro más sostenible y justo. Explora los menús disponibles hoy y sé parte de la solución.
                    </p>
                    <Link to={createPageUrl("Campus")}>
                        <Button
                            size="lg"
                            className="bg-white text-emerald-600 hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
                        >
                            Empezar a salvar menús <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
