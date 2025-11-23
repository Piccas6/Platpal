import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Leaf, Users, Wallet, ChefHat } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";

export default function SEOBlog() {
  const articles = [
    {
      id: 'como-ahorrar-comida-universidad',
      title: '10 Consejos para Ahorrar en Comida siendo Estudiante Universitario',
      excerpt: 'Descubre estrategias prácticas para reducir tus gastos en alimentación sin sacrificar calidad ni variedad.',
      keywords: 'ahorrar comida estudiante, trucos ahorro universidad, comida barata estudiantes',
      icon: Wallet,
      color: 'blue'
    },
    {
      id: 'despericio-alimentario-universidades',
      title: 'El Problema del Desperdicio Alimentario en Cafeterías Universitarias',
      excerpt: 'Analizamos el impacto ambiental del desperdicio de comida en campus y cómo PlatPal ayuda a solucionarlo.',
      keywords: 'desperdicio alimentario, sostenibilidad universidad, comida sostenible',
      icon: Leaf,
      color: 'green'
    },
    {
      id: 'mejores-cafeterias-cadiz',
      title: 'Guía de las Mejores Cafeterías Universitarias en Cádiz',
      excerpt: 'Recorrido por las cafeterías de la UCA en Jerez, Puerto Real, Cádiz y Algeciras con sus especialidades.',
      keywords: 'cafeterías UCA, mejores cafeterías Cádiz, comida universidad Cádiz',
      icon: ChefHat,
      color: 'orange'
    },
    {
      id: 'comunidad-estudiantes-sostenibles',
      title: 'Cómo Crear una Comunidad de Estudiantes Sostenibles',
      excerpt: 'Tips para involucrar a tus compañeros en iniciativas de sostenibilidad y consumo responsable.',
      keywords: 'comunidad sostenible, estudiantes eco-friendly, iniciativas verdes universidad',
      icon: Users,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6">
      <SEOHead
        title="Blog PlatPal - Consejos, Sostenibilidad y Ahorro para Estudiantes"
        description="Lee artículos sobre cómo ahorrar en comida, reducir desperdicio alimentario, las mejores cafeterías universitarias y crear comunidades sostenibles."
        keywords="blog estudiantes, consejos ahorro comida, sostenibilidad universitaria, guía cafeterías Cádiz, tips estudiantes"
        canonicalUrl="https://platpal.app/blog"
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog PlatPal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Consejos, guías y recursos para estudiantes que quieren ahorrar, comer bien y cuidar el planeta
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const Icon = article.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-emerald-600',
              orange: 'from-orange-500 to-amber-600',
              purple: 'from-purple-500 to-pink-600'
            };

            return (
              <Card key={article.id} className="border-2 hover:shadow-2xl transition-all group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[article.color]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-emerald-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Próximamente</span>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* SEO Content Section */}
        <div className="mt-16 space-y-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">¿Por qué elegir menús sostenibles?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Los <strong>menús sostenibles</strong> no solo benefician al medio ambiente, sino también a tu bolsillo. 
                En PlatPal, rescatamos comida de calidad que de otro modo se desperdiciaría, ofreciéndote 
                <strong> menús completos desde 2,99€</strong>. Cada menú que reservas contribuye a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Reducir el <strong>desperdicio alimentario</strong> en cafeterías universitarias</li>
                <li>Disminuir las emisiones de CO₂ asociadas a la producción de alimentos</li>
                <li>Apoyar a las <strong>cafeterías locales</strong> de Cádiz</li>
                <li>Ahorrar dinero mientras comes comida de calidad</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Cafeterías universitarias en Cádiz</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                PlatPal opera en los principales campus de la <strong>Universidad de Cádiz (UCA)</strong>:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Campus de Jerez</strong> - Variedad mediterránea y casera</li>
                <li><strong>Campus de Puerto Real</strong> - Opciones vegetarianas y veganas</li>
                <li><strong>Campus de Cádiz Centro</strong> - Cocina internacional y local</li>
                <li><strong>Campus de Algeciras</strong> - Menús tradicionales andaluces</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Todas nuestras cafeterías ofrecen <strong>menús completos por 2,99€</strong> con recogida 
                entre las 16:30 y 18:00h. ¡Reserva hoy y disfruta de comida de calidad a precio de estudiante!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar a ahorrar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a la comunidad de estudiantes que ya están ahorrando y ayudando al planeta
          </p>
          <Link to={createPageUrl("Campus")}>
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-all hover:scale-105">
              Ver Menús Disponibles
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}