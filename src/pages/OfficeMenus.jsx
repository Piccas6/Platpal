import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import withOfficeAuth from "../components/auth/withOfficeAuth";
import OfficeMenuCard from "../components/office/OfficeMenuCard";

function OfficeMenus() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const allMenus = await base44.entities.Menu.filter({ fecha: today }, '-created_date');
      
      setMenus(allMenus.filter(m => m.stock_disponible > 0));

      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("OfficeHome")}>
            <Button variant="outline" size="icon" className="rounded-2xl border-2 hover:border-blue-200 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              Menús Office Disponibles Hoy
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Comida de calidad recuperada de cafeterías locales
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Entrega a partir de las 15:30 • Sin compromiso
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Menús recuperados, no sobras</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Comida de calidad de cafeterías locales</li>
                  <li>✅ Recuperada antes de que caduque</li>
                  <li>✅ Entrega vía Glovo (gestionamos todo) o recogida</li>
                  <li>✅ Dashboard corporativo con informes de impacto</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menus Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : menus.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <OfficeMenuCard
                key={menu.id}
                menu={menu}
                currentUser={currentUser}
                onOrderSuccess={loadData}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-2 border-dashed">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay menús disponibles hoy
            </h3>
            <p className="text-gray-600 mb-6">
              Vuelve mañana para ver nuevas ofertas
            </p>
            <Link to={createPageUrl("OfficeHome")}>
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withOfficeAuth(OfficeMenus);