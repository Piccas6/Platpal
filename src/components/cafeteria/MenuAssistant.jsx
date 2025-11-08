import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Utensils
} from "lucide-react";

export default function MenuAssistant({ onApplySuggestion, currentFormData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Suggestions para quick actions
  const quickSuggestions = [
    {
      icon: Lightbulb,
      label: "Nombres creativos",
      prompt: "Sugiere 5 nombres creativos y atractivos para un menú que incluye pollo asado con patatas. Considera que estamos en temporada de otoño y próxima a exámenes finales.",
      color: "text-amber-600"
    },
    {
      icon: Utensils,
      label: "Descripción apetitosa",
      prompt: currentFormData?.plato_principal 
        ? `Genera una descripción apetitosa y atractiva (máximo 50 palabras) para este menú: "${currentFormData.plato_principal}" con "${currentFormData.plato_secundario}". Hazla irresistible para estudiantes.`
        : "Genera una descripción apetitosa para un menú de lentejas con chorizo y ensalada mixta.",
      color: "text-emerald-600"
    },
    {
      icon: TrendingUp,
      label: "Opciones dietéticas",
      prompt: "¿Qué opciones vegetarianas/veganas están tendiendo ahora entre estudiantes universitarios? Dame 3 sugerencias de menús plant-based populares.",
      color: "text-purple-600"
    },
    {
      icon: DollarSign,
      label: "Optimizar precio",
      prompt: currentFormData?.plato_principal
        ? `Analiza el histórico de ventas y sugiere el precio óptimo para este menú: "${currentFormData.plato_principal}" con "${currentFormData.plato_secundario}". Considera que el precio actual en el mercado es €8.50.`
        : "¿Cuál es el precio óptimo para un menú de pasta con ensalada considerando el mercado universitario?",
      color: "text-green-600"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: "cafeteria_menu_assistant",
        metadata: {
          name: "Asistente de Menú",
          description: "Conversación para ayuda con creación de menús"
        }
      });
      setConversationId(conversation.id);
      
      // Mensaje de bienvenida
      setMessages([{
        role: "assistant",
        content: "👋 ¡Hola! Soy tu asistente de menús con IA.\n\nPuedo ayudarte a:\n✨ Sugerir nombres creativos de platos\n📝 Generar descripciones apetitosas\n🥗 Recomendar opciones dietéticas\n💰 Optimizar precios\n\n¿En qué puedo ayudarte hoy?",
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Error initializing conversation:", error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!conversationId) {
      initializeConversation();
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !conversationId) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get the current conversation
      const conversation = await base44.agents.getConversation(conversationId);
      
      // Add user message
      const updatedConversation = await base44.agents.addMessage(conversation, {
        role: "user",
        content: messageText
      });

      // Subscribe to updates for streaming response
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        if (data.messages && data.messages.length > 0) {
          const lastMessage = data.messages[data.messages.length - 1];
          
          if (lastMessage.role === "assistant") {
            setMessages(prev => {
              const filtered = prev.filter(m => !(m.role === "assistant" && m.isStreaming));
              return [
                ...filtered,
                {
                  ...lastMessage,
                  isStreaming: true,
                  timestamp: new Date().toISOString()
                }
              ];
            });
          }
        }
      });

      // Wait a bit for the response to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      unsubscribe();
      setIsLoading(false);

      // Get final conversation state
      const finalConversation = await base44.agents.getConversation(conversationId);
      setMessages(finalConversation.messages.map(m => ({
        ...m,
        timestamp: m.timestamp || new Date().toISOString()
      })));

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        timestamp: new Date().toISOString(),
        error: true
      }]);
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (prompt) => {
    sendMessage(prompt);
  };

  const extractSuggestionData = (content) => {
    // Try to extract structured data from the response
    const suggestions = {
      names: [],
      description: null,
      price: null
    };

    // Extract names (numbered lists or bullet points)
    const nameMatches = content.match(/(?:\d+\.|[-•])\s*([^\n]+)/g);
    if (nameMatches) {
      suggestions.names = nameMatches.map(match => 
        match.replace(/^\d+\.|^[-•]\s*/, '').trim()
      );
    }

    // Extract description (usually in quotes or after "Descripción:")
    const descMatch = content.match(/(?:Descripción:|")(.*?)(?:"|$)/s);
    if (descMatch) {
      suggestions.description = descMatch[1].trim();
    }

    // Extract price (€X.XX format)
    const priceMatch = content.match(/€\s*(\d+[.,]\d{2})/);
    if (priceMatch) {
      suggestions.price = parseFloat(priceMatch[1].replace(',', '.'));
    }

    return suggestions;
  };

  const handleApplySuggestionFromMessage = (content) => {
    const suggestions = extractSuggestionData(content);
    
    if (onApplySuggestion) {
      onApplySuggestion(suggestions);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 z-50"
        size="icon"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-lg">Asistente de Menús AI</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-white/90 mt-1">Potenciado por IA para crear menús exitosos</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b">
            <p className="text-xs font-semibold text-gray-700 mb-3">Sugerencias rápidas:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSuggestion(suggestion.prompt)}
                  className="p-2 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all text-left"
                  disabled={isLoading}
                >
                  <suggestion.icon className={`w-4 h-4 ${suggestion.color} mb-1`} />
                  <p className="text-xs font-medium text-gray-700">{suggestion.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - Using plain div with overflow instead of ScrollArea */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.role === "assistant" && !message.error && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplySuggestionFromMessage(message.content)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1 h-auto"
                    >
                      ✨ Aplicar sugerencias
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputMessage);
            }}
            className="flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-gradient-to-r from-purple-600 to-pink-500"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}