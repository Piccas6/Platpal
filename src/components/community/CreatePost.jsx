import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Send, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatePost({ onPostCreated }) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!message.trim() && !imageFile) return;

    setIsPosting(true);
    try {
      const user = await base44.auth.me();
      
      let imageUrl = '';
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }

      await base44.entities.CommunityPost.create({
        user_name: user.full_name || 'Usuario',
        user_avatar: user.full_name ? user.full_name[0].toUpperCase() : '?',
        message: message.trim() || '¡Salvé otro menú con PlatPal! 🎉',
        image_url: imageUrl,
        type: 'manual',
        likes: [],
        comments: []
      });

      setMessage('');
      setImageFile(null);
      setImagePreview(null);
      setIsFocused(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al publicar. Inténtalo de nuevo.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Textarea */}
          <div className="relative">
            <Textarea
              placeholder="¿Qué menú salvaste hoy? Comparte tu experiencia... ✨"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className={`min-h-[80px] resize-none text-base border-2 transition-all duration-300 ${
                isFocused ? 'border-emerald-400 shadow-md' : 'border-gray-200'
              }`}
              disabled={isPosting}
            />
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Preview de imagen */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-xl overflow-hidden border-2 border-emerald-200"
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  disabled={isPosting}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de acción */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isPosting}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 border-2 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                disabled={isPosting}
                asChild
              >
                <span>
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Añadir Foto</span>
                </span>
              </Button>
            </label>

            <div className="flex items-center gap-2">
              {(message.trim() || imageFile) && !isPosting && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessage('');
                    setImageFile(null);
                    setImagePreview(null);
                    setIsFocused(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </Button>
              )}
              
              <Button
                onClick={handlePost}
                disabled={(!message.trim() && !imageFile) || isPosting}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publicar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Contador de caracteres */}
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 text-center"
            >
              💡 Consejo: ¡Comparte tu experiencia y gana visibilidad en la comunidad!
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}