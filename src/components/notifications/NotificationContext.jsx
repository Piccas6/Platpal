import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Conectar a SSE
  const connect = useCallback(async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;

      const user = await base44.auth.me();
      if (!user?.id) return;

      // Cerrar conexión anterior si existe
      if (eventSource) {
        eventSource.close();
      }

      // Nueva conexión SSE
      const url = `${window.location.origin}/api/functions/notificationStream?userId=${user.id}`;
      const es = new EventSource(url);

      es.onopen = () => {
        console.log('✅ Notificaciones en tiempo real conectadas');
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          // Solo agregar si es una notificación real, no mensajes de sistema
          if (notification.type !== 'connected') {
            addNotification(notification);
          }
        } catch (error) {
          // Ignorar errores de parsing de keep-alive
          if (!event.data.startsWith(':')) {
            console.error('Error procesando notificación:', error);
          }
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // No reintentar automáticamente para evitar loops infinitos
      };

      setEventSource(es);

    } catch (error) {
      console.error('Error conectando notificaciones:', error);
    }
  }, [eventSource]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  }, [eventSource]);

  // Agregar notificación
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: notification.id || Date.now(),
      ...notification,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Mantener últimas 50
    setUnreadCount(prev => prev + 1);

    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      });
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Limpiar notificación
  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  // Limpiar todas
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Conectar al montar
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    connect,
    disconnect
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
}