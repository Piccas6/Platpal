import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakMeter({ currentStreak = 0, maxStreak = 0, size = 'normal' }) {
  const isLarge = size === 'large';
  
  const getStreakLevel = (streak) => {
    if (streak >= 30) return { level: 'Legendario', color: 'from-purple-500 to-pink-500', emoji: '🔥👑' };
    if (streak >= 14) return { level: 'Maestro', color: 'from-orange-500 to-red-500', emoji: '🔥🔥' };
    if (streak >= 7) return { level: 'Comprometido', color: 'from-yellow-500 to-orange-500', emoji: '🔥' };
    if (streak >= 3) return { level: 'En racha', color: 'from-emerald-500 to-green-500', emoji: '✨' };
    return { level: 'Principiante', color: 'from-gray-400 to-gray-500', emoji: '⭐' };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const isActive = currentStreak > 0;

  if (size === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-2xl border-2 border-orange-200">
        <Flame className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
        <div>
          <p className="text-lg font-bold text-gray-900">{currentStreak}</p>
          <p className="text-xs text-gray-600">días</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${isActive ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
            {isLarge ? 'Tu Racha de Sostenibilidad' : 'Racha Actual'}
          </span>
          {isActive && (
            <Badge className={`bg-gradient-to-r ${streakInfo.color} text-white`}>
              {streakInfo.emoji} {streakInfo.level}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Racha actual */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block"
          >
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center ${
              isActive 
                ? `bg-gradient-to-br ${streakInfo.color} shadow-2xl` 
                : 'bg-gradient-to-br from-gray-200 to-gray-300'
            }`}>
              <Flame className={`w-12 h-12 mb-2 ${isActive ? 'text-white' : 'text-gray-500'} ${isActive && 'animate-pulse'}`} />
              <p className="text-4xl font-black text-white">{currentStreak}</p>
            </div>
            {isActive && currentStreak >= 3 && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 text-3xl"
              >
                🔥
              </motion.div>
            )}
          </motion.div>
          <p className="mt-4 text-gray-700 font-semibold">
            {currentStreak === 0 ? '¡Empieza tu racha hoy!' : `${currentStreak} ${currentStreak === 1 ? 'día' : 'días'} consecutivos`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {currentStreak === 0 
              ? 'Compra tu primer menú para iniciar' 
              : '¡Sigue comprando para mantenerla!'}
          </p>
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-4 bg-white/80 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <p className="text-2xl font-bold text-gray-900">{maxStreak}</p>
            </div>
            <p className="text-xs text-gray-600">Mejor Racha</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">
                {currentStreak > 0 ? Math.round((currentStreak / (maxStreak || 1)) * 100) : 0}%
              </p>
            </div>
            <p className="text-xs text-gray-600">del Récord</p>
          </div>
        </div>

        {/* Motivación */}
        {isActive && (
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-700">
              {currentStreak < 3 && '¡Vas por buen camino! 🌱'}
              {currentStreak >= 3 && currentStreak < 7 && '¡Excelente compromiso! 💪'}
              {currentStreak >= 7 && currentStreak < 14 && '¡Eres un héroe del planeta! 🌍'}
              {currentStreak >= 14 && currentStreak < 30 && '¡Increíble dedicación! ⭐'}
              {currentStreak >= 30 && '¡LEYENDA SOSTENIBLE! 👑🔥'}
            </p>
          </div>
        )}

        {/* Próximo hito */}
        {isActive && currentStreak < 30 && (
          <div className="text-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 inline mr-1" />
            {currentStreak < 3 && `${3 - currentStreak} días más para "En racha"`}
            {currentStreak >= 3 && currentStreak < 7 && `${7 - currentStreak} días más para "Comprometido"`}
            {currentStreak >= 7 && currentStreak < 14 && `${14 - currentStreak} días más para "Maestro"`}
            {currentStreak >= 14 && currentStreak < 30 && `${30 - currentStreak} días más para "Legendario"`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}