import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

export default function ReportVisualization({ data, reportType }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Visualización de Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Gráfico de barras - Ventas por día */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Ventas Diarias</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="ventas" fill="#10B981" name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de líneas - Ingresos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de Ingresos</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `€${value.toFixed(2)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Ingresos (€)"
                  dot={{ fill: '#F59E0B', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}