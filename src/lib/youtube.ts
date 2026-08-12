/**
 * Arche d'Amour - YouTube API Integration
 * 
 * Provides YouTube functionality:
 * - Live stream management
 * - Video embedding
 * - Channel info
 * - Playlist handling
 * 
 * Configuration:
 * Set these environment variables in .env.local:
 * - YOUTUBE_API_KEY: Your YouTube Data API key
 * - YOUTUBE_CHANNEL_ID: Your channel ID (optional)
 */

// Types
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    default: string;
    medium: string;
    high: string;
    maxres?: string;
  };
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  duration?: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  isLive: boolean;
  liveStreamingDetails?: {
    actualStartTime?: string;
    scheduledStartTime?: string;
    concurrentViewers?: number;
    activeLiveChatId?: string;
  };
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  videoCount: number;
  thumbnail: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface LiveStreamConfig {
  id: string;
  title: string;
  description: string;
  platform: 'YOUTUBE' | 'FACEBOOK' | 'CUSTOM';
  streamUrl?: string;
  videoId?: string;
  chatEnabled: boolean;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  scheduledStart?: string;
  viewerCount?: number;
}

// Default API key (can be overridden)
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';

/**
 * YouTube API Client Class
 */
export class YouTubeClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || DEFAULT_API_KEY;
  }

  /**
   * Get video information by ID
   */
  async getVideo(videoId: string): Promise<YouTubeVideo | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${videoId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      return this.formatVideo(data.items[0]);
    } catch (error) {
      console.error('[YouTube] Error fetching video:', error);
      return null;
    }
  }

  /**
   * Get multiple videos by IDs
   */
  async getVideos(videoIds: string[]): Promise<YouTubeVideo[]> {
    try {
      const ids = videoIds.join(',');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${ids}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      return (data.items || []).map((item: any) => this.formatVideo(item));
    } catch (error) {
      console.error('[YouTube] Error fetching videos:', error);
      return [];
    }
  }

  /**
   * Search videos
   */
  async searchVideos(query: string, maxResults = 12): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&order=date&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      const videoIds = (data.items || [])
        .filter((item: any) => item.id?.videoId)
        .map((item: any) => item.id.videoId);

      if (videoIds.length === 0) {
        return [];
      }

      return await this.getVideos(videoIds);
    } catch (error) {
      console.error('[YouTube] Error searching:', error);
      return [];
    }
  }

  /**
   * Get channel information
   */
  async getChannel(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || '',
        subscriberCount: parseInt(item.statistics.subscriberCount) || 0,
        videoCount: parseInt(item.statistics.videoCount) || 0,
        viewCount: parseInt(item.statistics.viewCount) || 0,
      };
    } catch (error) {
      console.error('[YouTube] Error fetching channel:', error);
      return null;
    }
  }

  /**
   * Get playlist information
   */
  async getPlaylist(playlistId: string): Promise<YouTubePlaylist | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        videoCount: item.contentDetails.itemCount || 0,
        thumbnail: item.snippet.thumbnails?.high?.url || '',
      };
    } catch (error) {
      console.error('[YouTube] Error fetching playlist:', error);
      return null;
    }
  }

  /**
   * Get videos from a playlist
   */
  async getPlaylistVideos(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
    try {
      // First get playlist items
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      const videoIds = (data.items || [])
        .map((item: any) => item.contentDetails?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) {
        return [];
      }

      return await this.getVideos(videoIds);
    } catch (error) {
      console.error('[YouTube] Error fetching playlist videos:', error);
      return [];
    }
  }

  /**
   * Get current/active live streams from a channel
   */
  async getChannelLiveStreams(channelId: string): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&eventType=upcoming&order=date&maxResults=10&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      const videoIds = (data.items || [])
        .map((item: any) => item.id?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) {
        return [];
      }

      const videos = await this.getVideos(videoIds);
      
      // Filter only actually live or upcoming
      return videos.filter(v => v.isLive || v.liveStreamingDetails?.scheduledStartTime);
    } catch (error) {
      console.error('[YouTube] Error fetching live streams:', error);
      return [];
    }
  }

  /**
   * Format raw API response to YouTubeVideo
   */
  private formatVideo(item: any): YouTubeVideo {
    const snippet = item.snippet || {};
    const statistics = item.statistics || {};
    const liveDetails = item.liveStreamingDetails || {};
    
    // Check if video is live
    const isLive = item.snippet?.liveBroadcastContent === 'live';
    const isUpcoming = item.snippet?.liveBroadcastContent === 'upcoming';

    return {
      id: item.id,
      title: snippet.title || '',
      description: snippet.description || '',
      thumbnail: {
        default: snippet.thumbnails?.default?.url || '',
        medium: snippet.thumbnails?.medium?.url || '',
        high: snippet.thumbnails?.high?.url || '',
        maxres: snippet.thumbnails?.maxres?.url,
      },
      publishedAt: snippet.publishedAt || '',
      channelId: snippet.channelId || '',
      channelTitle: snippet.channelTitle || '',
      duration: item.contentDetails?.duration,
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: statistics.likeCount ? parseInt(statistics.likeCount) : undefined,
      commentCount: statistics.commentCount ? parseInt(statistics.commentCount) : undefined,
      isLive: isLive || isUpcoming,
      liveStreamingDetails: Object.keys(liveDetails).length > 0 ? {
        actualStartTime: liveDetails.actualStartTime,
        scheduledStartTime: liveDetails.scheduledStartTime,
        concurrentViewers: liveDetails.concurrentViewers 
          ? parseInt(liveDetails.concurrentViewers) 
          : undefined,
        activeChatId: liveDetails.activeLiveChatId,
      } : undefined,
    };
  }

  /**
   * Generate embed URL for a video
   */
  static getEmbedUrl(videoId: string, options?: { autoplay?: boolean; start?: number }): string {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      ...(options?.autoplay && { autoplay: '1', mute: '1' }),
      ...(options?.start && { start: options.start.toString() }),
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * Generate watch URL for a video
   */
  static getWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Generate live chat embed URL
   */
  static getLiveChatEmbedUrl(chatId: string): string {
    return `https://www.youtube.com/live_chat?v=${chatId}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&dark_theme=0`;
  }
}

// Singleton instance
let youtubeClient: YouTubeClient | null = null;

export function getYouTubeClient(apiKey?: string): YouTubeClient {
  if (!youtubeClient) {
    youtubeClient = new YouTubeClient(apiKey);
  }
  return youtubeClient;
}
