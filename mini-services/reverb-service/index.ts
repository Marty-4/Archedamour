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
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 3001;

// Create HTTP server
const requestHandler = (req: any, res: any) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'arche-damour-reverb' }));
    return;
  }
  
  // Default response
  res.writeHead(404);
  res.end('Not Found');
};

const httpServer = process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
  ? createHttpsServer({
      key: readFileSync(process.env.SSL_KEY_PATH),
      cert: readFileSync(process.env.SSL_CERT_PATH),
    }, requestHandler)
  : createServer(requestHandler);

// Configure Socket.IO
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://archedamour.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Autoriser les requêtes sans Origin
      if (!origin) {
        return callback(null, true);
      }

      // Autoriser les domaines explicitement configurés
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Autoriser les adresses locales en développement
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.warn(`[WS] Origin refusée: ${origin}`);
      return callback(new Error('Origin non autorisée'));
    },
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
// Appels audio : room -> (socketId -> participant)
const liveCalls = new Map<string, Map<string, { socketId: string; userId: string | null; name: string; role: string; micOn: boolean; joinedAt: string }>>();

/** Retire un participant d'un appel et notifie la room. */
function removeCallParticipant(streamId: string, socketId: string) {
  const roomName = `live:${streamId}`;
  const entry = liveCalls.get(roomName);
  if (!entry?.has(socketId)) return;
  const removed = entry.get(socketId)!;
  entry.delete(socketId);
  if (entry.size === 0) liveCalls.delete(roomName);
  io.to(roomName).emit('live:call:participant-left', { streamId, socketId });
  io.to(roomName).emit('live:call:participants:update', {
    streamId,
    count: entry.size,
    participants: [...entry.values()],
  });
  console.log(`[WS] Call ${streamId}: ${removed.name} left (${entry.size} restants)`);
}

function getLiveViewerCount(roomName: string) {
  return [...(liveViewers.get(roomName) ?? [])].filter((socketId) => {
    const role = connectedUsers.get(socketId)?.role;
    return role !== 'ADMIN' && role !== 'SUPER_ADMIN';
  }).length;
}

// ============================================
// AUTHENTICATION MIDDLEWARE - SEC-003
// ============================================
// Configuration for Next.js API endpoint
const NEXTJS_API_URL = process.env.NEXTJS_API_URL || 'http://localhost:3000';

io.use(async (socket, next) => {
  try {
    // Get token from cookie or handshake
    // NB : un cookie présent mais vide compte comme ABSENT (invité).
    const rawToken = socket.handshake.auth.token || 
                 socket.handshake.query.token ||
                 socket.handshake.headers.cookie?.split(';').find(c => c.trim().startsWith('archedamour_session='))?.split('=')[1] ||
                 '';
    const token = rawToken.trim() ? rawToken : undefined;
    
    // Invités autorisés : la page /live publique doit pouvoir recevoir le
    // direct sans compte (le chat et les rooms personnalisées restent
    // réservés aux utilisateurs authentifiés plus bas).
    if (!token) {
      socket.data.userId = null;
      socket.data.userName = 'Invité';
      socket.data.userRole = 'GUEST';
      socket.data.userEmail = null;
      console.log(`[WS] Guest connection: ${socket.id}`);
      return next();
    }

    // Validate token with Next.js API - SEC-003
    const validationResponse = await fetch(`${NEXTJS_API_URL}/api/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      console.warn(`[WS] Connection rejected: Invalid token (socket: ${socket.id}, error: ${errorData.message || 'Unknown'})`);
      return next(new Error(errorData.message || 'Token invalide'));
    }

    const validationData = await validationResponse.json();
    
    if (!validationData.valid) {
      console.warn(`[WS] Connection rejected: Token validation failed (socket: ${socket.id}, error: ${validationData.error || 'Unknown'})`);
      return next(new Error(validationData.message || 'Validation échouée'));
    }

    // Set user data from validated token
    const user = validationData.user;
    socket.data.userId = user.id;
    socket.data.userName = user.name || 'Utilisateur';
    socket.data.userRole = user.role || 'MEMBER';
    socket.data.userEmail = user.email;
    
    console.log(`[WS] User authenticated: ${socket.id} (${user.name || 'Unknown'} - ${user.role || 'MEMBER'})`);
    
    next();
  } catch (error) {
    console.error(`[WS] Authentication error for socket ${socket.id}:`, error);
    return next(new Error('Erreur d\'authentification'));
  }
});

// ============================================
// CONNECTION HANDLER
// ============================================
io.on('connection', (socket) => {
  console.log(`[WS] User connected: ${socket.id} (${socket.data.userName})`);
  const isGuest = socket.data.userRole === 'GUEST';
  
  // Store user info
  connectedUsers.set(socket.id, {
    id: socket.data.userId,
    name: socket.data.userName,
    role: socket.data.userRole,
  });
  
  // Les invités ne rejoignent pas de canal personnel ni le comptage global
  // (ils restent libres de rejoindre une room live en lecture).
  if (!isGuest) {
    // Join user to their personal channel
    socket.join(`user:${socket.data.userId}`);
  }
  
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
  // GROUP CHAT CHANNEL
  // ============================================

  /**
   * Check if user is a member of a group - SEC-010
   */
  async function isGroupMember(userId: string, groupId: string): Promise<boolean> {
    try {
      const response = await fetch(`${NEXTJS_API_URL}/api/groupes/${groupId}/members/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error(`[WS] Error checking group membership:`, error);
      return false;
    }
  }

  socket.on('group:join', async (groupId: string) => {
    if (!groupId) return;
    
    // Check if user is a member of the group - SEC-010
    const isMember = await isGroupMember(socket.data.userId, groupId);
    if (!isMember) {
      console.warn(`[WS] ${socket.data.userName} (${socket.data.userId}) attempted to join group ${groupId} without permission`);
      socket.emit('group:error', { 
        groupId, 
        message: 'Vous n\'êtes pas membre de ce groupe' 
      });
      return;
    }
    
    const roomName = `group:${groupId}`;
    socket.join(roomName);
    socket.emit('group:joined', { groupId, timestamp: new Date().toISOString() });
    console.log(`[WS] ${socket.data.userName} joined group ${groupId}`);
  });

  socket.on('group:leave', (groupId: string) => {
    if (!groupId) return;
    socket.leave(`group:${groupId}`);
  });

  // Diffusion d'un message de groupe avec persistance en base de données - WS-004
  socket.on('group:message', async (data: { groupId: string; message: string; persisted?: unknown }) => {
    const { groupId, message, persisted } = data;
    if (!groupId || !message || !message.trim() || message.length > 2000) return;

    // Check if user is a member of the group - SEC-010
    const isMember = await isGroupMember(socket.data.userId, groupId);
    if (!isMember) {
      console.warn(`[WS] ${socket.data.userName} (${socket.data.userId}) attempted to send message to group ${groupId} without permission`);
      socket.emit('group:error', { 
        groupId, 
        message: 'Vous n\'êtes pas autorisé à envoyer des messages dans ce groupe' 
      });
      return;
    }

    let chatMessage;
    
    // Si le message a déjà été persisté par l'API (cas où le frontend appelle directement l'API)
    if (persisted && typeof persisted === 'object') {
      chatMessage = persisted;
    } else {
      // Sinon, on persiste le message via l'API Next.js - WS-004
      try {
        const persistResponse = await fetch(`${NEXTJS_API_URL}/api/groupes/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `archedamour_session=${socket.handshake.auth.token || socket.handshake.query.token}`,
          },
          body: JSON.stringify({
            groupId,
            content: message.trim(),
          }),
        });

        if (persistResponse.ok) {
          const persistedData = await persistResponse.json();
          chatMessage = persistedData.message;
          console.log(`[WS] Message persisted to DB: ${chatMessage.id}`);
        } else {
          // Fallback: créer un message temporaire si la persistance échoue
          console.error(`[WS] Failed to persist message to DB, using fallback`);
          chatMessage = {
            id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: socket.data.userId,
            userName: socket.data.userName,
            message: message.trim(),
            timestamp: new Date().toISOString(),
          };
        }
      } catch (error) {
        // Fallback en cas d'erreur réseau
        console.error(`[WS] Error persisting message to DB:`, error);
        chatMessage = {
          id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: socket.data.userId,
          userName: socket.data.userName,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        };
      }
    }

    socket.to(`group:${groupId}`).emit('group:message', chatMessage);
  });

  // ============================================
  // LIVE STREAMING CHANNEL
  // ============================================

  // Join live stream room
  socket.on('live:join', (streamId: string) => {
    const roomName = `live:${streamId}`;
    const existingPeerIds = [...(io.sockets.adapter.rooms.get(roomName) ?? [])];
    socket.join(roomName);
    
    // Track viewer count
    if (!liveViewers.has(roomName)) {
      liveViewers.set(roomName, new Set());
    }
    liveViewers.get(roomName)!.add(socket.id);
    
    const viewerCount = getLiveViewerCount(roomName);
    
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
    socket.to(roomName).emit('live:peer-joined', {
      streamId,
      peerId: socket.id,
      role: socket.data.userRole,
    });
    for (const peerId of existingPeerIds) {
      const peerSocket = io.sockets.sockets.get(peerId);
      socket.emit('live:peer-joined', {
        streamId,
        peerId,
        role: peerSocket?.data.userRole ?? 'MEMBER',
      });
    }
  });

  // ============================================
  // AUDIO CALL MODE (appel à deux sens)
  // ============================================
  // Pour un direct AUDIO, chaque participant publie son micro : le service
  // maintient l'annuaire des participants pour permettre le maillage WebRTC
  // (mesh full-mesh, parfait pour des dizaines de participants).

  socket.on('live:call:join', (data: { streamId: string; displayName?: string }) => {
    const streamId = data?.streamId;
    if (!streamId) return;
    const roomName = `live:${streamId}`;
    socket.join(roomName);

    const participant = {
      socketId: socket.id,
      userId: socket.data.userId,
      name: (data.displayName || socket.data.userName) as string,
      role: (socket.data.userRole ?? 'MEMBER') as string,
      micOn: true,
      joinedAt: new Date().toISOString(),
    };
    const entry = liveCalls.get(roomName) ?? new Map();
    entry.set(socket.id, participant);
    liveCalls.set(roomName, entry);

    // Le nouvel arrivant reçoit la liste des participants déjà présents
    // (pour créer les peers vers eux) — sans lui-même.
    const others = [...entry.values()].filter((p) => p.socketId !== socket.id);
    socket.emit('live:call:participants', { streamId, participants: others });

    // Les autres sont informés du nouvel arrivant (pour créer le peer).
    socket.to(roomName).emit('live:call:participant-joined', participant);
    io.to(roomName).emit('live:call:participants:update', {
      streamId,
      count: entry.size,
      participants: [...entry.values()],
    });
    console.log(`[WS] Call ${streamId}: ${participant.name} joined (${entry.size} participants)`);
  });

  // État du micro d'un participant (couper/réactiver).
  socket.on('live:call:mic', (data: { streamId: string; micOn: boolean }) => {
    if (!data?.streamId) return;
    const roomName = `live:${data.streamId}`;
    const entry = liveCalls.get(roomName);
    if (!entry?.has(socket.id)) return;
    entry.get(socket.id)!.micOn = Boolean(data.micOn);
    io.to(roomName).emit('live:call:mic-update', {
      streamId: data.streamId,
      socketId: socket.id,
      micOn: Boolean(data.micOn),
    });
  });

  socket.on('live:call:leave', (data: { streamId: string }) => {
    const streamId = data?.streamId;
    if (!streamId) return;
    removeCallParticipant(streamId, socket.id);
  });

  // Handshake audio : relayage des SDP/ICE entre participants (ciblé).
  socket.on('live:signal', (data: { streamId: string; targetId: string; signal: unknown }) => {
    if (!data?.streamId || !data?.targetId || !data.signal) return;
    io.to(data.targetId).emit('live:signal', {
      streamId: data.streamId,
      senderId: socket.id,
      senderName: socket.data.userName,
      senderRole: socket.data.userRole,
      signal: data.signal,
    });
  });

  // Leave live stream
  socket.on('live:leave', (streamId: string) => {
    const roomName = `live:${streamId}`;
    socket.leave(roomName);
    
    if (liveViewers.has(roomName)) {
      liveViewers.get(roomName)!.delete(socket.id);
      const viewerCount = getLiveViewerCount(roomName);
      
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
    // Le chat reste réservé aux utilisateurs connectés.
    if (socket.data.userRole === 'GUEST') {
      socket.emit('chat:error', { error: 'Connectez-vous pour participer au chat' });
      return;
    }
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
      io.emit('live:status', {
        streamId: data.streamId,
        status: data.status,
        info: data.info,
        updatedAt: new Date().toISOString(),
      });
      // Notification « un direct démarre » à TOUS les clients connectés
      // (membres + invités) — affichée en toast par le hook client.
      if (data.status === 'LIVE') {
        io.emit('live:started', {
          streamId: data.streamId,
          title: data.info?.title ?? 'Un direct',
          mediaType: data.info?.mediaType ?? 'VIDEO',
          startedAt: new Date().toISOString(),
        });
      }
      console.log(`[WS] Live stream ${data.streamId} status changed to: ${data.status}`);
    }
  });

  // Ping de mesure de latence (badge qualité réseau du Live Studio).
  socket.on('live:ping', (ack?: (data: { pong: boolean; timestamp: string }) => void) => {
    if (typeof ack === 'function') {
      ack({ pong: true, timestamp: new Date().toISOString() });
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
    connectedUsers.delete(socket.id);
    
    // Clean up from all live streams
    for (const [roomName, viewers] of liveViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        const streamId = roomName.replace('live:', '');
        const viewerCount = getLiveViewerCount(roomName);
        
        io.to(roomName).emit('live:viewers:update', {
          streamId,
          count: viewerCount,
        });
      }
    }

    // Clean up from all audio calls
    for (const roomName of liveCalls.keys()) {
      if (liveCalls.get(roomName)?.has(socket.id)) {
        removeCallParticipant(roomName.replace('live:', ''), socket.id);
      }
    }
    
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
