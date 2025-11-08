import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, reserva, onSubmit, isLoading }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [aspectos, setAspectos] = useState({
    sabor: 0,
    cantidad: 0,
    presentacion: 0
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Por favor selecciona una puntuación');
      return;
    }

    onSubmit({
      menu_id: reserva?.menu_id || reserva?.menu?.id || '',
      reserva_id: reserva?.id || '',
      cafeteria: reserva?.cafeteria || '',
      rating,
      comment,
      aspectos: {
        sabor: aspectos.sabor || rating,
        cantidad: aspectos.cantidad || rating,
        presentacion: aspectos.presentacion || rating
      }
    });
  };

  const renderStars = (currentValue, setValue, label) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue(value)}
            onMouseEnter={() => label === 'Tu Puntuación' && setHoverRating(value)}
            onMouseLeave={() => label === 'Tu Puntuación' && setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                value <= (label === 'Tu Puntuación' ? (hoverRating || currentValue) : currentValue)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Valora tu experiencia</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="font-semibold text-gray-900">
              {reserva?.menus_detalle || 'Menú'}
            </p>
            <p className="text-sm text-gray-600">
              {reserva?.cafeteria || 'Cafetería'}
            </p>
          </div>

          {renderStars(rating, setRating, 'Tu Puntuación')}

          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm text-gray-700">Valora aspectos específicos (opcional)</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sabor</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAspectos(prev => ({ ...prev, sabor: value }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          value <= aspectos.sabor ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Cantidad</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAspectos(prev => ({ ...prev, cantidad: value }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          value <= aspectos.cantidad ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Presentación</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAspectos(prev => ({ ...prev, presentacion: value }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          value <= aspectos.presentacion ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos qué te pareció..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar Valoración
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}