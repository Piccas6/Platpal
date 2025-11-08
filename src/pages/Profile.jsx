import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import withAuth from "../components/auth/withAuth";
import StudentProfile from "../components/profile/StudentProfile";
import CafeteriaProfile from "../components/profile/CafeteriaProfile";
import AdminProfile from "../components/profile/AdminProfile";
import ManagerProfile from "../components/profile/ManagerProfile";
import { Loader2 } from "lucide-react";

function ProfilePage({ user, testRole }) {
  const [profileUser, setProfileUser] = useState(user);
  
  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  const displayRole = testRole || profileUser?.app_role || 'user';

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 p-6 md:p-8">
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
    </div>
  );
}

export default withAuth(ProfilePage, ['user', 'cafeteria', 'admin', 'manager'], true);