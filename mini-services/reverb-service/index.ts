/**
 * Arche d'Amour - WebSocket Service (Reverb-like)
 * 
 * This service provides real-time features:
 * - Live notifications
 * - Live streaming chat
 * - User presence
 * - Real-time updates
 * 
 * Port: 3001
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'arche-damour-reverb' }));
    return;
  }
  
  // Default response
  res.writeHead(404);
  res.end('Not Found');
});

// Configure Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://21.0.13.22:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store for active connections and rooms
const connectedUsers = new Map<string, { id: string; name?: string; role?: string }>();
const liveViewers = new Map<string, Set<string>>();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  // In production, verify JWT token here
  // For demo, accept all connections with a user ID
  const userId = socket.handshake.auth.userId || socket.handshake.query.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  socket.data.userId = userId;
  socket.data.userName = socket.handshake.auth.name || socket.handshake.query.name || `Utilisateur`;
  socket.data.userRole = socket.handshake.auth.role || socket.handshake.query.role || 'MEMBER';
  
  next();
});

// ============================================
// CONNECTION HANDLER
// ============================================
io.on('connection', (socket) => {
  console.log(`[WS] User connected: ${socket.id} (${socket.data.userName})`);
  
  // Store user info
  connectedUsers.set(socket.id, {
    id: socket.data.userId,
    name: socket.data.userName,
    role: socket.data.userRole,
  });
  
  // Join user to their personal channel
  socket.join(`user:${socket.data.userId}`);
  
  // Send welcome message
  socket.emit('connected', {
    userId: socket.data.userId,
    message: 'Bienvenue sur Arche d\'Amour!',
    timestamp: new Date().toISOString(),
  });

  // Broadcast user count update
  broadcastUserCount();

  // ============================================
  // NOTIFICATIONS CHANNEL
  // ============================================
  
  // Subscribe to notifications
  socket.on('notifications:subscribe', () => {
    socket.join('notifications');
    console.log(`[WS] ${socket.data.userName} subscribed to notifications`);
    
    // Send recent notifications (mock)
    socket.emit('notifications:recent', [
      {
        id: '1',
        type: 'NEW_SERVICE',
        title: 'Nouveau culte programmé',
        message: 'Le culte de dimanche prochain a été programmé.',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'VERSE_OF_DAY',
        title: 'Verset du jour',
        message: '"Car je connais les projets que j\'ai formés sur vous" - Jérémie 29:11',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  });

  // Mark notification as read
  socket.on('notification:read', (notificationId: string) => {
    socket.emit('notification:read:confirmed', { 
      notificationId, 
      timestamp: new Date().toISOString() 
    });
  });

  // ============================================
  // LIVE STREAMING CHANNEL
  // ============================================

  // Join live stream room
  socket.on('live:join', (streamId: string) => {
    const roomName = `live:${streamId}`;
    socket.join(roomName);
    
    // Track viewer count
    if (!liveViewers.has(roomName)) {
      liveViewers.set(roomName, new Set());
    }
    liveViewers.get(roomName)!.add(socket.id);
    
    const viewerCount = liveViewers.get(roomName)!.size;
    
    console.log(`[WS] ${socket.data.userName} joined live stream ${streamId}. Viewers: ${viewerCount}`);
    
    // Confirm join
    socket.emit('live:joined', {
      streamId,
      viewerCount,
      timestamp: new Date().toISOString(),
    });
    
    // Broadcast updated viewer count
    io.to(roomName).emit('live:viewers:update', {
      streamId,
      count: viewerCount,
    });
    
    // Send recent chat messages
    socket.to(roomName).emit('chat:user-joined', {
      userName: socket.data.userName,
      viewerCount,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave live stream
  socket.on('live:leave', (streamId: string) => {
    const roomName = `live:${streamId}`;
    socket.leave(roomName);
    
    if (liveViewers.has(roomName)) {
      liveViewers.get(roomName)!.delete(socket.id);
      const viewerCount = liveViewers.get(roomName)!.size;
      
      io.to(roomName).emit('live:viewers:update', {
        streamId,
        count: viewerCount,
      });
      
      io.to(roomName).emit('chat:user-left', {
        userName: socket.data.userName,
        viewerCount,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`[WS] ${socket.data.userName} left live stream ${streamId}. Viewers: ${viewerCount}`);
    }
  });

  // Chat message in live stream
  socket.on('chat:message', (data: { streamId: string; message: string }) => {
    const { streamId, message } = data;
    const roomName = `live:${streamId}`;
    
    // Validate message
    if (!message || message.trim().length === 0 || message.length > 500) {
      socket.emit('chat:error', { error: 'Message invalide' });
      return;
    }

    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: socket.data.userId,
      userName: socket.data.userName,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Broadcast to everyone in the live stream room
    io.to(roomName).emit('chat:message', chatMessage);
    
    console.log(`[WS] Chat in ${streamId}: ${socket.data.userName}: ${message.substring(0, 50)}...`);
  });

  // Reaction/emoji during live stream
  socket.on('live:reaction', (data: { streamId: string; emoji: string }) => {
    const roomName = `live:${data.streamId}`;
    
    io.to(roomName).except(socket.id).emit('live:reaction', {
      emoji: data.emoji,
      userName: socket.data.userName,
      count: 1,
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================
  // PRAYER REQUESTS CHANNEL
  // ============================================

  socket.on('prayers:subscribe', () => {
    socket.join('prayers');
    console.log(`[WS] ${socket.data.userName} subscribed to prayer updates`);
  });

  socket.on('prayer:pray-for-me', (prayerId: string) => {
    // Broadcast that someone is praying
    io.to('prayers').emit('prayer:new-prayer', {
      prayerId,
      userName: socket.data.userName,
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================
  // ADMIN CHANNEL
  // ============================================

  socket.on('admin:subscribe', () => {
    if (socket.data.userRole === 'SUPER_ADMIN' || socket.data.userRole === 'ADMIN') {
      socket.join('admin');
      socket.emit('admin:subscribed', { message: 'Canal admin activé' });
    } else {
      socket.emit('error', { message: 'Non autorisé' });
    }
  });

  // Admin: Send global notification
  socket.on('admin:notification', (data: { title: string; message: string; type: string }) => {
    if (socket.data.userRole === 'SUPER_ADMIN' || socket.data.userRole === 'ADMIN') {
      io.emit('notification:global', {
        id: `notif_${Date.now()}`,
        ...data,
        from: socket.data.userName,
        createdAt: new Date().toISOString(),
      });
      console.log(`[WS] Admin ${socket.data.userName} sent global notification: ${data.title}`);
    }
  });

  // Admin: Update live status
  socket.on('admin:live:status', (data: { streamId: string; status: string; info?: any }) => {
    if (socket.data.userRole === 'SUPER_ADMIN' || socket.data.userRole === 'ADMIN') {
      io.emit(`live:${data.streamId}:status`, {
        status: data.status,
        info: data.info,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[WS] Live stream ${data.streamId} status changed to: ${data.status}`);
    }
  });

  // ============================================
  // PRESENCE & TYPING INDICATORS
  // ============================================

  // User typing indicator
  socket.on('typing:start', (room: string) => {
    socket.to(room).emit('user:typing', {
      userId: socket.data.userId,
      userName: socket.data.userName,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (room: string) => {
    socket.to(room).emit('user:typing', {
      userId: socket.data.userId,
      isTyping: false,
    });
  });

  // ============================================
  // DISCONNECT HANDLER
  // ============================================
  socket.on('disconnect', (reason) => {
    console.log(`[WS] User disconnected: ${socket.id} (${socket.data.userName}) - Reason: ${reason}`);
    
    // Clean up from all live streams
    for (const [roomName, viewers] of liveViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        const streamId = roomName.replace('live:', '');
        const viewerCount = viewers.size;
        
        io.to(roomName).emit('live:viewers:update', {
          streamId,
          count: viewerCount,
        });
      }
    }
    
    // Remove from connected users
    connectedUsers.delete(socket.id);
    
    // Broadcast updated user count
    broadcastUserCount();
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[WS] Socket error for ${socket.id}:`, error.message);
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function broadcastUserCount() {
  const count = connectedUsers.size;
  io.emit('users:online', { count });
}

// ============================================
// SERVER STARTUP
// ============================================
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🌊 Arche d'Amour - WebSocket Service           ║
║   ───────────────────────────────────────         ║
║   Status: ✅ Running                             ║
║   Port:   ${PORT.toString().padEnd(34)}║
║   Mode:   Development                            ║
║                                                   ║
║   Channels:                                       ║
║   • notifications  - Real-time alerts            ║
║   • live:*          - Live streaming & chat       ║
║   • prayers         - Prayer request updates      ║
║   • admin           - Admin controls              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  // Log server status every 5 minutes
  setInterval(() => {
    console.log(`[WS Status] Connected users: ${connectedUsers.size}, Live streams: ${liveViewers.size}`);
  }, 5 * 60 * 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[WS] SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[WS] SIGINT received, closing server...');
  httpServer.close(() => {
    console.log('[WS] Server closed');
    process.exit(0);
  });
});

export { io, httpServer };
