import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function VoiceConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  command 
}) {
  if (!command) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black text-center text-gray-900">
              Confirmar Cambio de Stock
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-200 mb-6"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plato</p>
                <p className="text-2xl font-bold text-gray-900">{command.dishName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Stock Actual</p>
                  <p className="text-3xl font-black text-gray-700">{command.currentStock}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-700 mb-1">Nuevo Stock</p>
                  <p className="text-3xl font-black text-emerald-600">{command.newStock}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Cambio:</span> {command.changeDescription}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onClose}
              size="lg"
              variant="outline"
              className="h-16 text-lg font-bold border-2 hover:bg-gray-100"
            >
              <XCircle className="w-6 h-6 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              size="lg"
              className="h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}