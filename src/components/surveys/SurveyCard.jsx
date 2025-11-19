import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SurveyCard({ survey, currentUser, onVoteSuccess }) {
  const [isVoting, setIsVoting] = useState(false);
  
  // Calcular votos totales y verificar si el usuario ya votó
  const totalVotes = Object.values(survey.votos || {}).reduce((sum, voters) => sum + voters.length, 0);
  const userVote = currentUser ? Object.keys(survey.votos || {}).find(opcion => 
    survey.votos[opcion]?.includes(currentUser.email)
  ) : null;

  const handleVote = async (opcion) => {
    if (!currentUser || !currentUser.email) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    if (userVote) {
      alert('Ya has votado en esta encuesta');
      return;
    }

    setIsVoting(true);
    try {
      const nuevosVotos = { ...(survey.votos || {}) };
      if (!nuevosVotos[opcion]) {
        nuevosVotos[opcion] = [];
      }
      nuevosVotos[opcion].push(currentUser.email);

      await base44.entities.Survey.update(survey.id, {
        votos: nuevosVotos
      });

      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Error al votar:', error);
      alert('Error al registrar tu voto');
    } finally {
      setIsVoting(false);
    }
  };

  const getVotePercentage = (opcion) => {
    if (totalVotes === 0) return 0;
    const votes = survey.votos?.[opcion]?.length || 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const getVoteCount = (opcion) => {
    return survey.votos?.[opcion]?.length || 0;
  };

  const isClosed = survey.fecha_cierre && new Date(survey.fecha_cierre) < new Date();

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {survey.titulo}
            </CardTitle>
            {survey.descripcion && (
              <p className="text-sm text-gray-600 mt-2">{survey.descripcion}</p>
            )}
          </div>
          {isClosed && (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <Clock className="w-3 h-3 mr-1" />
              Cerrada
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {survey.opciones.map((opcion, idx) => {
          const voteCount = getVoteCount(opcion);
          const percentage = getVotePercentage(opcion);
          const isUserVote = userVote === opcion;

          return (
            <div key={idx} className="space-y-1">
              <Button
                onClick={() => handleVote(opcion)}
                disabled={isVoting || !!userVote || isClosed || !currentUser}
                variant={isUserVote ? "default" : "outline"}
                className={`w-full justify-between text-left relative overflow-hidden ${
                  isUserVote ? 'bg-blue-600 text-white' : ''
                }`}
              >
                {userVote && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-blue-200/30 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isUserVote && <CheckCircle className="w-4 h-4" />}
                  {opcion}
                </span>
                {userVote && (
                  <span className="relative z-10 text-sm font-bold">
                    {percentage}% ({voteCount})
                  </span>
                )}
              </Button>
            </div>
          );
        })}

        <div className="pt-2 text-center text-sm text-gray-600">
          {userVote ? (
            <span className="font-semibold text-blue-700">✓ Has votado por: {userVote}</span>
          ) : !currentUser ? (
            <span>Inicia sesión para votar</span>
          ) : isClosed ? (
            <span>Encuesta cerrada</span>
          ) : (
            <span>{totalVotes} {totalVotes === 1 ? 'voto' : 'votos'} • Selecciona una opción</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}