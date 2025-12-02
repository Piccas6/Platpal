import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Gift,
  TrendingUp,
  Euro,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Loader2,
  Target,
  Award
} from "lucide-react";

export default function ReferralDashboard() {
  const [codes, setCodes] = useState([]);
  const [uses, setUses] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    partner_name: "",
    partner_email: "",
    discount_amount: 0.20,
    reward_threshold: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [codesData, usesData, rewardsData] = await Promise.all([
        base44.entities.ReferralCode.list(),
        base44.entities.ReferralUse.list('-created_date', 100),
        base44.entities.ReferralReward.list('-created_date')
      ]);
      setCodes(codesData);
      setUses(usesData);
      setRewards(rewardsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCode = async () => {
    try {
      await base44.entities.ReferralCode.create({
        ...newCode,
        code: newCode.code.toUpperCase(),
        total_uses: 0,
        completed_orders: 0,
        rewards_earned: 0,
        rewards_delivered: 0,
        is_active: true
      });
      setShowCreateModal(false);
      setNewCode({
        code: "",
        partner_name: "",
        partner_email: "",
        discount_amount: 0.20,
        reward_threshold: 10
      });
      loadData();
    } catch (error) {
      console.error("Error creando código:", error);
      alert("Error al crear el código");
    }
  };

  const markRewardDelivered = async (rewardId) => {
    try {
      await base44.entities.ReferralReward.update(rewardId, {
        delivered: true,
        delivered_date: new Date().toISOString().split('T')[0]
      });
      
      // Actualizar contador en ReferralCode
      const reward = rewards.find(r => r.id === rewardId);
      if (reward) {
        const codeData = codes.find(c => c.code === reward.code);
        if (codeData) {
          await base44.entities.ReferralCode.update(codeData.id, {
            rewards_delivered: (codeData.rewards_delivered || 0) + 1
          });
        }
      }
      
      loadData();
    } catch (error) {
      console.error("Error actualizando recompensa:", error);
    }
  };

  const exportCSV = () => {
    const headers = ["Código", "Usuario", "Email", "Estado", "Descuento", "Fecha"];
    const rows = uses.map(u => [
      u.code,
      u.user_name || "-",
      u.user_email,
      u.status,
      u.discount_applied + "€",
      new Date(u.created_date).toLocaleDateString('es-ES')
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calcular métricas - CORREGIDO con márgenes reales
  const totalUses = uses.length;
  const completedUses = uses.filter(u => u.status === "completed").length;
  const totalDiscount = uses.filter(u => u.status === "completed")
    .reduce((sum, u) => sum + (u.discount_applied || 0.20), 0);
  
  // Margen real por menú: 2.99€ - 1€ cafetería - 0.30€ Stripe = 1.69€ neto para PlatPal
  // Con descuento referido: 2.79€ - 1€ - 0.30€ = 1.49€ neto
  const margenNormalPlatPal = 0.70; // Tu margen real después de cafetería y Stripe
  const margenConDescuento = 0.50; // 0.70 - 0.20 descuento
  const margenNetoReferidos = completedUses * margenConDescuento;
  
  const pendingRewards = rewards.filter(r => !r.delivered).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Referidos</h2>
          <p className="text-gray-600">Gestiona códigos de descuento y colaboradores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Código de Referido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Código</Label>
                  <Input
                    placeholder="Ej: UNOVELES20"
                    value={newCode.code}
                    onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label>Nombre del colaborador</Label>
                  <Input
                    placeholder="Ej: Unoveles"
                    value={newCode.partner_name}
                    onChange={(e) => setNewCode({...newCode, partner_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email del colaborador</Label>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={newCode.partner_email}
                    onChange={(e) => setNewCode({...newCode, partner_email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Descuento (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newCode.discount_amount}
                      onChange={(e) => setNewCode({...newCode, discount_amount: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Hito recompensa</Label>
                    <Input
                      type="number"
                      value={newCode.reward_threshold}
                      onChange={(e) => setNewCode({...newCode, reward_threshold: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <Button onClick={createCode} className="w-full bg-emerald-600">
                  Crear Código
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Referidos</p>
            <p className="text-3xl font-black text-gray-900">{totalUses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Completados</p>
            <p className="text-3xl font-black text-emerald-600">{completedUses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Euro className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Descuentos Dados</p>
            <p className="text-3xl font-black text-amber-600">€{totalDiscount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Margen Neto</p>
            <p className="text-3xl font-black text-green-600">€{margenNetoReferidos.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Códigos Activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Códigos de Referido
          </CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length > 0 ? (
            <div className="space-y-4">
              {codes.map((code) => {
                const codeUses = uses.filter(u => u.code === code.code);
                const codeCompleted = codeUses.filter(u => u.status === "completed").length;
                const nextMilestone = Math.ceil((codeCompleted + 1) / code.reward_threshold) * code.reward_threshold;
                const progress = (codeCompleted % code.reward_threshold) / code.reward_threshold * 100;
                
                return (
                  <div key={code.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-mono font-bold">
                          {code.code}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{code.partner_name}</p>
                          <p className="text-sm text-gray-600">{code.partner_email}</p>
                        </div>
                      </div>
                      <Badge className={code.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {code.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{codeUses.length}</p>
                        <p className="text-xs text-gray-600">Usos totales</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{codeCompleted}</p>
                        <p className="text-xs text-gray-600">Completados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-600">{code.rewards_earned || 0}</p>
                        <p className="text-xs text-gray-600">Menús ganados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{code.rewards_delivered || 0}</p>
                        <p className="text-xs text-gray-600">Entregados</p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso hacia siguiente hito */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progreso hacia hito {nextMilestone}</span>
                        <span>{codeCompleted % code.reward_threshold}/{code.reward_threshold}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No hay códigos de referido</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Crear primer código
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recompensas Pendientes */}
      {pendingRewards > 0 && (
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Recompensas Pendientes de Entregar
              <Badge className="bg-amber-500 text-white">{pendingRewards}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.filter(r => !r.delivered).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-semibold">{reward.partner_name}</p>
                    <p className="text-sm text-gray-600">
                      Menú gratis por alcanzar {reward.trigger_count} referidos
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => markRewardDelivered(reward.id)}
                    className="bg-emerald-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marcar entregado
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos usos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Últimos Referidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uses.length > 0 ? (
            <div className="space-y-2">
              {uses.slice(0, 10).map((use) => (
                <div key={use.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{use.code}</Badge>
                    <div>
                      <p className="font-medium text-gray-900">{use.user_name || use.user_email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(use.created_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">-{use.discount_applied?.toFixed(2)}€</span>
                    <Badge className={
                      use.status === "completed" ? "bg-green-100 text-green-800" :
                      use.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {use.status === "completed" ? "Completado" :
                       use.status === "pending" ? "Pendiente" : "Cancelado"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No hay usos registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}