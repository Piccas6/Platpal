import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticación
    const user = await base44.auth.me();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Obtener userId de la query string
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId || userId !== user.id) {
      return new Response('Invalid user', { status: 403 });
    }

    // Configurar SSE
    const stream = new ReadableStream({
      start(controller) {
        // Enviar comentario inicial para mantener la conexión
        const encoder = new TextEncoder();
        const sendMessage = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Mensaje de bienvenida
        sendMessage({
          type: 'connected',
          message: 'Notificaciones en tiempo real conectadas',
          timestamp: new Date().toISOString()
        });

        // Keep-alive cada 30 segundos
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
          } catch (error) {
            clearInterval(keepAliveInterval);
          }
        }, 30000);

        // Simular notificaciones periódicas (en producción, esto vendría de eventos reales)
        // Por ahora, este endpoint mantiene la conexión abierta
        // Las notificaciones reales se enviarían cuando ocurran eventos específicos

        // Limpiar al cerrar
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAliveInterval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error en notification stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});