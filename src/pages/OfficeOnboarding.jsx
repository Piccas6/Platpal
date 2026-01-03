import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { OrbitalLoader } from '@/components/ui/orbital-loader';
import OfficeProfileSetup from '../components/office/OfficeProfileSetup';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OfficeOnboarding() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Si ya tiene perfil Office configurado, redirigir al dashboard
        if (currentUser.company_name && currentUser.app_role === 'office_user') {
          navigate(createPageUrl('OfficeDashboard'));
        }
      } catch (error) {
        console.error('Error loading user:', error);
        navigate(createPageUrl('Home'));
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <OrbitalLoader message="Cargando..." />
      </div>
    );
  }

  return <OfficeProfileSetup user={user} />;
}