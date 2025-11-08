import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Award, Trophy, Medal, Crown } from 'lucide-react';

const icons = [
  { icon: Crown, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-100 to-orange-100', shadow: 'shadow-amber-200' },
  { icon: Trophy, color: 'text-gray-400', bg: 'bg-gradient-to-br from-gray-100 to-slate-100', shadow: 'shadow-gray-200' },
  { icon: Medal, color: 'text-orange-500', bg: 'bg-gradient-to-br from-orange-100 to-amber-100', shadow: 'shadow-orange-200' }
];

export default function RankingLeaderboard({ limit }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const users = await base44.entities.User.filter({ app_role: 'user' }, '-weekly_saved_menus', limit || 10);
        setLeaderboard(users.filter(u => u.weekly_saved_menus > 0));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin w-6 h-6 text-emerald-600" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">¡Sé el primero en salvar un menú esta semana!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((user, index) => {
        const IconComponent = index < 3 ? icons[index].icon : Award;
        const iconColor = index < 3 ? icons[index].color : 'text-gray-400';
        const bgColor = index < 3 ? icons[index].bg : 'bg-gray-50';
        const shadowColor = index < 3 ? icons[index].shadow : '';
        
        return (
          <div 
            key={user.id} 
            className={`flex items-center gap-3 md:gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
              index < 3 ? `${bgColor} border-2 border-amber-200 shadow-lg hover:shadow-xl ${shadowColor}` : 'bg-white/80 border-2 border-gray-100 hover:border-emerald-200'
            }`}
          >
            <div className={`w-12 h-12 ${index < 3 ? bgColor : 'bg-gray-100'} rounded-xl flex items-center justify-center flex-shrink-0 ${index < 3 ? 'shadow-md' : ''}`}>
              {index < 3 ? (
                <IconComponent className={`w-6 h-6 ${iconColor}`} />
              ) : (
                <span className="font-bold text-gray-600 text-lg">{index + 1}</span>
              )}
            </div>
            
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-amber-500 rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {user.full_name ? user.full_name[0].toUpperCase() : '?'}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.full_name || 'Usuario'}</p>
              <p className="text-xs text-gray-500 truncate">
                {user.campus ? `${user.campus.charAt(0).toUpperCase() + user.campus.slice(1).replace('_', ' ')}` : 'Campus'}
              </p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-2xl text-emerald-600">{user.weekly_saved_menus}</p>
              <p className="text-xs text-gray-500">menús</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}