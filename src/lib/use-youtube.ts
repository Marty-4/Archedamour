/**
 * Arche d'Amour - YouTube React Hook
 * Client-side hook for YouTube integration
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  YouTubeClient, 
  YouTubeVideo, 
  YouTubeChannel,
  getYouTubeClient 
} from './youtube';

interface UseYouTubeOptions {
  videoId?: string;
  playlistId?: string;
  channelId?: string;
  apiKey?: string;
  autoLoad?: boolean;
}

export function useYouTube(options: UseYouTubeOptions = {}) {
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref for client to avoid dependency issues
  const clientRef = useRef<YouTubeClient>(
    options.apiKey ? new YouTubeClient(options.apiKey) : getYouTubeClient()
  );

  // Load single video
  const loadVideo = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientRef.current.getVideo(id);
      
      if (result) {
        setVideo(result);
      } else {
        setError('Vidéo non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement de la vidéo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load videos from playlist
  const loadPlaylist = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientRef.current.getPlaylistVideos(id);
      setVideos(result);
    } catch (err) {
      setError('Erreur lors du chargement de la playlist');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load channel info
  const loadChannel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientRef.current.getChannel(id);
      
      if (result) {
        setChannel(result);
      } else {
        setError('Chaîne non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement de la chaîne');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search videos
  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientRef.current.searchVideos(query);
      setVideos(result);
    } catch (err) {
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load on mount if options provided
  useEffect(() => {
    if (options.autoLoad === false) return;

    // Use requestAnimationFrame to defer state updates
    const loadInitialData = () => {
      if (options.videoId) {
        loadVideo(options.videoId);
      } else if (options.playlistId) {
        loadPlaylist(options.playlistId);
      } else if (options.channelId) {
        loadChannel(options.channelId);
      }
    };

    requestAnimationFrame(loadInitialData);
  }, [options.videoId, options.playlistId, options.channelId, options.autoLoad, loadVideo, loadPlaylist, loadChannel]);

  return {
    video,
    videos,
    channel,
    loading,
    error,
    loadVideo,
    loadPlaylist,
    loadChannel,
    search,
    // Helper methods
    getEmbedUrl: YouTubeClient.getEmbedUrl,
    getWatchUrl: YouTubeClient.getWatchUrl,
  };
}
