import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceStockButton({ onVoiceCommand, isEnabled = true }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interimTranscript += transcriptPart;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          setIsProcessing(true);
          onVoiceCommand(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          if (!isProcessing) {
            setTranscript("");
          }
        }, 2000);
      };

      setRecognition(recognitionInstance);
    }
  }, [onVoiceCommand, isProcessing]);

  const toggleListening = () => {
    if (!isEnabled) {
      alert("El modo voz no está habilitado. Actívalo en los ajustes del dashboard.");
      return;
    }

    if (!recognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error deteniendo reconocimiento:', error);
        setIsListening(false);
      }
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error iniciando reconocimiento:', error);
        if (error.name === 'InvalidStateError') {
          setIsListening(false);
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('Error en reintento:', e);
            }
          }, 100);
        }
      }
    }
  };

  useEffect(() => {
    if (!isListening && !isProcessing) {
      setTranscript("");
    }
  }, [isListening, isProcessing]);

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 right-6 z-50"
      >
        <Button
          onClick={toggleListening}
          disabled={isProcessing || !isEnabled}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : isEnabled
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-gray-400'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          ) : isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-44 right-6 z-40 bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-emerald-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                {isProcessing ? 'Procesando...' : 'Escuchando...'}
              </span>
            </div>
            <p className="text-gray-900 text-sm">
              {transcript || "Habla ahora..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}