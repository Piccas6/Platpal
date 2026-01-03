import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Save, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function QuickStockEditor({ menus, onUpdate }) {
  const [editingMenus, setEditingMenus] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleStockChange = (menuId, newStock) => {
    setEditingMenus({
      ...editingMenus,
      [menuId]: parseInt(newStock) || 0
    });
  };

  const handleSave = async (menu) => {
    const newStock = editingMenus[menu.id];
    if (newStock === undefined || newStock === menu.stock_disponible) return;

    setIsSaving(true);
    try {
      await base44.entities.Menu.update(menu.id, {
        stock_disponible: newStock
      });

      // Limpiar edición
      const newEditingMenus = { ...editingMenus };
      delete newEditingMenus[menu.id];
      setEditingMenus(newEditingMenus);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (menuId) => {
    const newEditingMenus = { ...editingMenus };
    delete newEditingMenus[menuId];
    setEditingMenus(newEditingMenus);
  };

  const isEditing = (menuId) => editingMenus[menuId] !== undefined;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-blue-600" />
          Ajuste Rápido de Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        {menus.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No hay menús para editar
          </p>
        ) : (
          <div className="space-y-3">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-blue-300 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate text-sm">
                    {menu.plato_principal}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">
                    + {menu.plato_secundario}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing(menu.id) ? (
                    <>
                      <Input
                        type="number"
                        value={editingMenus[menu.id]}
                        onChange={(e) => handleStockChange(menu.id, e.target.value)}
                        className="w-16 h-8 text-sm"
                        min="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(menu)}
                        disabled={isSaving}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(menu.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleStockChange(menu.id, menu.stock_disponible)}
                      >
                        {menu.stock_disponible}/{menu.stock_total}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}