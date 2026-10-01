/**
 * Arche d'Amour - WebSocket Client Hook
 * 
 * Provides real-time functionality:
 * - Live chat during streams
 * - Real-time notifications
 * - User presence
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
interface UseWebSocketOptions {
  userId?: string;
  userName?: string;
  userRole?: string;
  token?: string;
  autoConnect?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Default configuration
const WS_CONFIG = {
  url: process.env.NEXT_PUBLIC_WS_URL || '',
  path: '/socket.io',
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
};

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    userId,
    userName = 'Utilisateur',
    userRole = 'MEMBER',
    token,
    autoConnect = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  // Dernier événement « un direct démarre » (null = aucun reçu).
  const [liveStarted, setLiveStarted] = useState<{ streamId: string; title: string; mediaType: string; startedAt: string } | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Determine URL (use gateway with XTransformPort for local dev)
    let url = WS_CONFIG.url;
    if (!url && typeof window !== 'undefined') {
      url = `${window.location.protocol}//${window.location.hostname}:3001`;
    }

    // Invité (page /live publique) : aucun token → le service WS classe la
    // connexion comme GUEST au lieu de tenter une validation qui échouerait.
    const hasToken = Boolean(token && token.trim());

    const socket = io(url, {
      ...WS_CONFIG,
      autoConnect,
      ...(hasToken
        ? {
            query: { userId, name: userName, role: userRole, token },
            auth: { userId, name: userName, role: userRole, token },
          }
        : {
            query: { userId: '', name: 'Invité', role: 'GUEST' },
            auth: { userId: '', name: 'Invité', role: 'GUEST' },
          }),
    });

    socketRef.current = socket;
    // Defer setState to avoid synchronous call in effect
    requestAnimationFrame(() => {
      setSocketInstance(socket);
    });

    // Connection events
    socket.on('connect', () => {
      console.log('[WS] Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error.message);
      setIsConnected(false);
    });

    // Global events
    socket.on('users:online', (data: { count: number }) => {
      setOnlineUsers(data.count);
    });

    socket.on('notification:global', (notification: Notification) => {
      // Can be handled by specific hooks or callbacks
      console.log('[WS] Global notification:', notification);
    });

    // « Un direct démarre » : exposé pour toast global dans les pages.
    socket.on('live:started', (payload: { streamId: string; title: string; mediaType: string; startedAt: string }) => {
      setLiveStarted(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
    };
  }, [userId, userName, userRole, token, autoConnect]);

  // Return socket and state
  return {
    socket: socketInstance,
    isConnected,
    onlineUsers,
    liveStarted,
  };
}

/**
 * Hook for live streaming features
 */
export function useLiveStream(streamId?: string, options: UseWebSocketOptions = {}) {
  const { socket } = useWebSocket(options);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // Join/leave stream
  const joinStream = useCallback((id?: string) => {
    const stream = id || streamId;
    if (socket && stream) {
      socket.emit('live:join', stream);
      setIsJoined(true);
    }
  }, [socket, streamId]);

  const leaveStream = useCallback((id?: string) => {
    const stream = id || streamId;
    if (socket && stream) {
      socket.emit('live:leave', stream);
      setIsJoined(false);
    }
  }, [socket, streamId]);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (socket && streamId && isJoined) {
      socket.emit('chat:message', { streamId, message });
    }
  }, [socket, streamId, isJoined]);

  // Send reaction
  const sendReaction = useCallback((emoji: string) => {
    if (socket && streamId && isJoined) {
      socket.emit('live:reaction', { streamId, emoji });
    }
  }, [socket, streamId, isJoined]);

  // Set up listeners
  useEffect(() => {
    if (!socket) return;

    const handleJoined = (data: { viewerCount: number }) => {
      setViewerCount(data.viewerCount);
    };

    const handleViewersUpdate = (data: { count: number }) => {
      setViewerCount(data.count);
    };

    const handleChatMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
    };

    socket.on('live:joined', handleJoined);
    socket.on('live:viewers:update', handleViewersUpdate);
    socket.on('chat:message', handleChatMessage);

    return () => {
      socket.off('live:joined', handleJoined);
      socket.off('live:viewers:update', handleViewersUpdate);
      socket.off('chat:message', handleChatMessage);
    };
  }, [socket]);

  return {
    isJoined,
    viewerCount,
    messages,
    joinStream,
    leaveStream,
    sendMessage,
    sendReaction,
  };
}

/**
 * Hook pour le chat de groupe (rooms `group:<id>`, persistance en base
 * via /api/groupes/messages, diffusion temps réel via socket.io).
 */
export function useGroupChat(groupId?: string, options: UseWebSocketOptions = {}) {
  const { socket, isConnected } = useWebSocket(options);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // Rejoint la room du groupe
  useEffect(() => {
    if (!socket || !groupId || !isConnected) return;

    const join = () => {
      socket.emit('group:join', groupId);
      queueMicrotask(() => setIsJoined(true));
    };
    join();

    const handleHistory = (data: { messages: ChatMessage[] }) => {
      queueMicrotask(() => setMessages(data.messages));
    };

    const handleMessage = (message: ChatMessage) => {
      queueMicrotask(() =>
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev.slice(-99), message],
        ),
      );
    };

    socket.on('group:history', handleHistory);
    socket.on('group:message', handleMessage);

    return () => {
      socket.emit('group:leave', groupId);
      socket.off('group:history', handleHistory);
      socket.off('group:message', handleMessage);
      queueMicrotask(() => setIsJoined(false));
    };
  }, [socket, groupId, isConnected]);

  /** Diffuse un message (déjà persisté via l'API) aux membres du groupe. */
  const sendMessage = useCallback(
    (payload: { message: string; persisted?: unknown }) => {
      if (!socket || !groupId || !isJoined) return false;
      socket.emit('group:message', { groupId, ...payload });
      return true;
    },
    [socket, groupId, isJoined],
  );

  return { messages, isJoined, sendMessage, setMessages };
}

/**
 * Hook for real-time notifications
 */
export function useNotifications(options: UseWebSocketOptions = {}) {
  const { socket } = useWebSocket(options);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications
  const subscribe = useCallback(() => {
    if (socket) {
      socket.emit('notifications:subscribe');
    }
  }, [socket]);

  // Mark as read
  const markAsRead = useCallback((notificationId: string) => {
    if (socket) {
      socket.emit('notification:read', notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  // Set up listeners
  useEffect(() => {
    if (!socket) return;

    const handleRecent = (recent: Notification[]) => {
      setNotifications(recent);
      setUnreadCount(recent.filter(n => !n.read).length);
    };

    const handleGlobal = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notifications:recent', handleRecent);
    socket.on('notification:global', handleGlobal);

    return () => {
      socket.off('notifications:recent', handleRecent);
      socket.off('notification:global', handleGlobal);
    };
  }, [socket]);

  return {
    notifications,
    unreadCount,
    subscribe,
    markAsRead,
  };
}

/**
 * Hook for prayer request updates
 */
export function usePrayerUpdates(options: UseWebSocketOptions = {}) {
  const { socket } = useWebSocket(options);
  const [lastPrayerActivity, setLastPrayerActivity] = useState<{
    prayerId: string;
    userName: string;
    timestamp: string;
  } | null>(null);

  // Subscribe to prayer updates
  const subscribe = useCallback(() => {
    if (socket) {
      socket.emit('prayers:subscribe');
    }
  }, [socket]);

  // Notify that you're praying for someone
  const notifyPrayingFor = useCallback((prayerId: string) => {
    if (socket) {
      socket.emit('prayer:pray-for-me', prayerId);
    }
  }, [socket]);

  // Set up listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewPrayer = (data: { prayerId: string; userName: string; timestamp: string }) => {
      setLastPrayerActivity(data);
    };

    socket.on('prayer:new-prayer', handleNewPrayer);

    return () => {
      socket.off('prayer:new-prayer', handleNewPrayer);
    };
  }, [socket]);

  return {
    lastPrayerActivity,
    subscribe,
    notifyPrayingFor,
  };
}
