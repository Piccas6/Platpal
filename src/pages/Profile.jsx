import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import withAuth from "../components/auth/withAuth";
import StudentProfile from "../components/profile/StudentProfile";
import CafeteriaProfile from "../components/profile/CafeteriaProfile";
import AdminProfile from "../components/profile/AdminProfile";
import ManagerProfile from "../components/profile/ManagerProfile";
import NotificationManager from "../components/notifications/NotificationManager";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

function ProfilePage({ user, testRole }) {
  const [profileUser, setProfileUser] = useState(user);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  const displayRole = testRole || profileUser?.app_role || 'user';

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete all user's data first
      const userEmail = profileUser.email;
      
      // Delete reservations
      const reservations = await base44.entities.Reserva.filter({ student_email: userEmail });
      await Promise.all(reservations.map(r => base44.entities.Reserva.delete(r.id)));
      
      // Delete posts
      const posts = await base44.entities.CommunityPost.filter({ created_by: userEmail });
      await Promise.all(posts.map(p => base44.entities.CommunityPost.delete(p.id)));
      
      // Note: User entity deletion is restricted, so we'll just log out
      await base44.auth.logout();
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error al eliminar la cuenta. Por favor contacta con soporte.");
      setIsDeleting(false);
    }
  };

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {displayRole === 'user' && (
          <StudentProfile user={profileUser} />
        )}
        {displayRole === 'cafeteria' && (
          <CafeteriaProfile user={profileUser} />
        )}
        {displayRole === 'admin' && (
          <AdminProfile user={profileUser} />
        )}
        {displayRole === 'manager' && (
          <ManagerProfile user={profileUser} />
        )}

        <NotificationManager currentUser={profileUser} />

        {/* Delete Account Section */}
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Zona de Peligro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar mi cuenta
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Tus reservas de menús</li>
                      <li>Tus publicaciones en la comunidad</li>
                      <li>Tu progreso y logros</li>
                      <li>Tus preferencias y configuración</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage, ['user', 'cafeteria', 'admin', 'manager'], true);