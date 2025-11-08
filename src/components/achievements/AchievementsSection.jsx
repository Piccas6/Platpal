import React, { useState, useEffect } from 'react';
import { Achievement } from '@/entities/Achievement';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';

export default function AchievementsSection({ achievements: userAchievementIds = [] }) {
  const [allAchievements, setAllAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const achievementsData = await Achievement.list();
        setAllAchievements(achievementsData);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-4">
        {allAchievements.map(achievement => {
          const isUnlocked = userAchievementIds.includes(achievement.id);
          return (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${isUnlocked ? 'border-amber-400' : 'border-gray-200'}`}>
                  <img
                    src={achievement.icon_url}
                    alt={achievement.name}
                    className={`w-12 h-12 object-contain p-1 transition-all ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-40'}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{achievement.name}</p>
                <p>{achievement.description}</p>
                {!isUnlocked && <p className="text-xs text-gray-500">(Bloqueado)</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}