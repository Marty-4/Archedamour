"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, Loader2, Maximize, Mic, Minimize, Pause, Play, Timer, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/websocket";

type Props = { streamId: string; mediaType: "VIDEO" | "AUDIO"; title: string; startedAt?: string | Date | null };
type SignalMessage = { streamId: string; senderId: string; signal: RTCSessionDescriptionInit | RTCIceCandidateInit };

function formatElapsed(from: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - from.getTime()) / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return h === "00" ? `${m}:${s}` : `${h}:${m}:${s}`;
}

export function LivePlayer({ streamId, mediaType, title, startedAt }: Props) {
  const { socket } = useWebSocket({ userRole: "MEMBER" });
  const mediaRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const hostSocketIdRef = useRef<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [liveEnded, setLiveEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Spectateurs (temps réel) + durée du direct (chronomètre local).
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handleSignal = async (data: SignalMessage) => {
      if (data.streamId !== streamId) return;
      if (hostSocketIdRef.current && hostSocketIdRef.current !== data.senderId) {
        peerRef.current?.close();
        peerRef.current = null;
        setConnected(false);
      }
      hostSocketIdRef.current = data.senderId;
      if (!peerRef.current) {
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        peerRef.current = peer;
        peer.ontrack = (event) => {
          if (mediaRef.current && event.streams[0]) {
            mediaRef.current.srcObject = event.streams[0];
            setConnected(true);
          }
        };
        peer.onicecandidate = (event) => event.candidate && socket.emit("live:signal", { streamId, targetId: data.senderId, signal: event.candidate.toJSON() });
      }
      const peer = peerRef.current;
      if ("type" in data.signal && data.signal.type === "offer") {
        setLiveEnded(false);
        await peer.setRemoteDescription(data.signal);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("live:signal", { streamId, targetId: data.senderId, signal: answer });
      } else if ("candidate" in data.signal) {
        await peer.addIceCandidate(data.signal);
      }
    };
    const handleStatus = (data: { status: string }) => {
      if (data.status !== "ENDED" && data.status !== "CANCELLED") return;
      peerRef.current?.close();
      peerRef.current = null;
      hostSocketIdRef.current = null;
      if (mediaRef.current) mediaRef.current.srcObject = null;
      setConnected(false);
      setLiveEnded(true);
    };
    const joinStream = () => {
      peerRef.current?.close();
      peerRef.current = null;
      hostSocketIdRef.current = null;
      setConnected(false);
      socket.emit("live:join", streamId);
    };

    socket.on("live:signal", handleSignal);
    socket.on(`live:${streamId}:status`, handleStatus);
    socket.on("connect", joinStream);
    if (socket.connected) joinStream();
    return () => {
      socket.emit("live:leave", streamId);
      socket.off("live:signal", handleSignal);
      socket.off(`live:${streamId}:status`, handleStatus);
      socket.off("connect", joinStream);
      peerRef.current?.close();
      peerRef.current = null;
      hostSocketIdRef.current = null;
    };
  }, [socket, streamId]);

  // Nombre de spectateurs en temps réel (push WS, incluant ce spectateur).
  useEffect(() => {
    if (!socket) return;
    const handleViewers = (data: { streamId: string; count: number }) => {
      if (data.streamId === streamId) setViewerCount(Math.max(0, data.count));
    };
    socket.on("live:viewers:update", handleViewers);
    return () => {
      socket.off("live:viewers:update", handleViewers);
    };
  }, [socket, streamId]);

  // Chronomètre du direct (basé sur l'heure de démarrage réelle).
  // startedAt invalide/absent → l'effet ne tourne pas (elapsed reste null :
  // aucun setState synchrone dans l'effet, règle react-hooks).
  const startAt = useMemo(() => {
    if (!startedAt) return null;
    const date = startedAt instanceof Date ? startedAt : new Date(startedAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [startedAt]);

  useEffect(() => {
    if (!startAt) return;
    const tick = () => setElapsed(formatElapsed(startAt));
    const raf = requestAnimationFrame(tick);
    const interval = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [startAt]);

  // Applique l'état du son à l'élément vidéo (autoplay autorisé en muet).
  useEffect(() => {
    if (mediaRef.current) mediaRef.current.muted = isMuted;
  }, [isMuted, connected]);

  // Synchronise l'état plein écran (ex. Échap pressé par l'utilisateur).
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = mediaRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else {
        const webkitEl = el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void };
        if (webkitEl.webkitRequestFullscreen) {
          await webkitEl.webkitRequestFullscreen();
        }
      }
    } catch {
      // Refusé par le navigateur (geste requis, iframe...) : on ignore silencieusement.
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-black ${
        isFullscreen ? "flex h-full w-full items-center justify-center" : "rounded-2xl"
      }`}
    >
      <video
        ref={mediaRef}
        autoPlay
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        className={
          mediaType === "AUDIO"
            ? "h-24 w-full"
            : isFullscreen
              ? "h-full w-full object-contain"
              : "aspect-video w-full cursor-pointer"
        }
        aria-label={title}
      />

      {!connected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
          {liveEnded ? <span>Ce direct est terminé.</span> : <><Loader2 className="h-6 w-6 animate-spin" /><span>Connexion au direct...</span></>}
        </div>
      )}

      {connected && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-white" /> EN DIRECT
        </div>
      )}

      {/* Durée du direct + spectateurs (visibles dès la connexion) */}
      {connected && (elapsed || viewerCount !== null) && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {elapsed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 font-mono text-xs font-semibold text-white">
              <Timer className="h-3 w-3" /> {elapsed}
            </span>
          )}
          {viewerCount !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold text-white">
              <Eye className="h-3 w-3" /> {viewerCount}
            </span>
          )}
        </div>
      )}

      {mediaType === "AUDIO" && connected && (
        <Mic className="pointer-events-none absolute right-4 top-1/2 h-7 w-7 -translate-y-1/2 text-white/70" />
      )}

      {/* Barre de contrôles : lecture, son, plein écran */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
          onClick={togglePlay}
          disabled={!connected}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
          onClick={() => setIsMuted((value) => !value)}
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <span className="flex-1" />

        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
