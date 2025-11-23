import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, MapPin, Truck } from 'lucide-react';
import OfficeOrderModal from './OfficeOrderModal';

export default function OfficeMenuCard({ menu, currentUser, onOrderSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOutOfStock = menu.stock_disponible <= 0;

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-2xl group border-2 ${
        isOutOfStock ? 'opacity-60 border-gray-200' : 'border-blue-100 hover:border-blue-300'
      }`}>
        {/* Imagen */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {menu.imagen_url ? (
            <img 
              src={menu.imagen_url} 
              alt={menu.plato_principal}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-20 h-20 text-gray-300" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-500 text-white shadow-md">
              Office
            </Badge>
          </div>

          {/* Stock */}
          <div className="absolute bottom-3 left-3">
            {isOutOfStock ? (
              <Badge className="bg-red-500 text-white shadow-lg">Agotado</Badge>
            ) : (
              <Badge className="bg-emerald-500 text-white shadow-lg">
                {menu.stock_disponible} disponibles
              </Badge>
            )}
          </div>

          {/* Precios */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
            <div className="text-xs text-gray-600 mb-1">Desde</div>
            <div className="text-2xl font-bold text-blue-600">€4.50</div>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Título */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {menu.plato_principal}
            </h3>
            <p className="text-gray-600 text-sm mb-3">{menu.plato_secundario}</p>
            
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{menu.cafeteria}</span>
            </div>
          </div>

          {/* Info de entrega */}
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Truck className="w-4 h-4" />
              <span className="font-semibold">Entrega desde las 15:30</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">Vía Glovo o JustEat</p>
          </div>

          {/* Opciones de precio */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sin bebida:</span>
              <span className="font-bold text-blue-600">4,50€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Con bebida:</span>
              <span className="font-bold text-purple-600">5,30€</span>
            </div>
          </div>

          {/* Botón */}
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={isOutOfStock}
            className={`w-full py-6 text-base font-semibold rounded-xl transition-all duration-300 ${
              isOutOfStock 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {isOutOfStock ? 'Agotado' : 'Pedir para Office'}
          </Button>
        </CardContent>
      </Card>

      <OfficeOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={menu}
        currentUser={currentUser}
        onOrderSuccess={onOrderSuccess}
      />
    </>
  );
}