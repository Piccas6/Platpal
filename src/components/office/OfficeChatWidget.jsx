import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OfficeChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Formulario inicial
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    initialMessage: ''
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setContactForm(prev => ({
          ...prev,
          name: currentUser.full_name || '',
          email: currentUser.email || ''
        }));
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const allMessages = await base44.entities.OfficeChatMessage.list('-created_date', 100);
      const conversationMessages = allMessages
        .filter(m => m.conversation_id === conversationId)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startConversation = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.initialMessage) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConversationId);

      await base44.entities.OfficeChatMessage.create({
        conversation_id: newConversationId,
        sender_type: 'user',
        sender_name: contactForm.name,
        sender_email: contactForm.email,
        company_name: contactForm.company,
        message: contactForm.initialMessage
      });

      // Enviar notificación por email al equipo
      try {
        await base44.integrations.Core.SendEmail({
          to: 'piccas.entrepreneurship@gmail.com',
          subject: `🏢 Nueva consulta Office - ${contactForm.company || contactForm.name}`,
          body: `
Nueva conversación iniciada en PlatPal Oficinas

👤 Contacto:
━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${contactForm.name}
Email: ${contactForm.email}
Empresa: ${contactForm.company || 'No especificada'}

💬 Mensaje inicial:
━━━━━━━━━━━━━━━━━━━━━━
${contactForm.initialMessage}

🔑 ID Conversación: ${newConversationId}

━━━━━━━━━━━━━━━━━━━━━━
Responde desde el panel de admin o directamente al email del cliente.
          `.trim()
        });
      } catch (emailError) {
        console.error('Error enviando notificación:', emailError);
      }

      setHasStarted(true);
      await loadMessages();
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Error al iniciar conversación. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !conversationId) return;

    setIsLoading(true);
    try {
      await base44.entities.OfficeChatMessage.create({
        conversation_id: conversationId,
        sender_type: 'user',
        sender_name: contactForm.name,
        sender_email: contactForm.email,
        company_name: contactForm.company,
        message: currentMessage
      });

      setCurrentMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:scale-110 transition-all"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 shadow-2xl border-2 border-blue-200 transition-all ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Soporte Office</h3>
            <p className="text-xs text-blue-100">Te respondemos rápido</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {!hasStarted ? (
            // Formulario inicial
            <div className="p-4 space-y-4 overflow-y-auto" style={{ height: 'calc(600px - 140px)' }}>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  👋 ¡Hola! Cuéntanos en qué podemos ayudarte
                </p>
                <p className="text-xs text-blue-700">
                  Consultas sobre packs, facturación, pruebas piloto, o cualquier duda sobre PlatPal Oficinas.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Nombre *</label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Email *</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="tu@empresa.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Empresa</label>
                <Input
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="Nombre de tu empresa"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">¿En qué podemos ayudarte? *</label>
                <Textarea
                  value={contactForm.initialMessage}
                  onChange={(e) => setContactForm({ ...contactForm, initialMessage: e.target.value })}
                  placeholder="Ej: Quiero info sobre packs para 20 personas..."
                  rows={4}
                />
              </div>

              <Button
                onClick={startConversation}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? 'Iniciando...' : 'Iniciar conversación'}
              </Button>
            </div>
          ) : (
            // Chat activo
            <>
              <div className="p-4 space-y-3 overflow-y-auto" style={{ height: 'calc(600px - 140px)' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender_type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.sender_type === 'support' && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">Soporte Office</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}