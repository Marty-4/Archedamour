"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Cast,
  CircleDot,
  Expand,
  Eye,
  Loader2,
  Mic,
  MicOff,
  MonitorPlay,
  Radio,
  Settings2,
  Signal,
  Square,
  Timer,
  Video,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useWebSocket } from "@/lib/websocket";

type SignalMessage = { streamId: string; senderId: string; signal: RTCSessionDescriptionInit | RTCIceCandidateInit };

function formatDuration(startedAt: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return h === "00" ? `${m}:${s}` : `${h}:${m}:${s}`;
}

export function LiveStudioControls() {
  const { socket, isConnected } = useWebSocket({ userRole: "ADMIN", userName: "Studio Live" });
  const [title, setTitle] = useState("Direct de l'église");
  const [mediaType, setMediaType] = useState<"VIDEO" | "AUDIO">("VIDEO");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [websocketHealthUrl, setWebsocketHealthUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [elapsed, setElapsed] = useState("00:00");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "degraded" | "unknown">("unknown");
  const [showPreviewSettings, setShowPreviewSettings] = useState(false);
  // Direct en cours détecté en base (créé via le formulaire ou une autre session)
  const [activeStream, setActiveStream] = useState<
    { id: string; title: string; platform: string; scheduledStart: string | null } | null
  >(null);
  const [stoppingActive, setStoppingActive] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());

  const stopMedia = useCallback(() => {
    mediaRef.current?.getTracks().forEach((track) => { track.stop(); });
    mediaRef.current = null;
    setMediaReady(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, []);

  useEffect(() => {
    setWebsocketHealthUrl(`https://${window.location.hostname}:3001/health`);
  }, []);

  // Détecte un direct déjà en cours en base (bouton Arrêter toujours disponible).
  const refreshActiveStream = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live");
      const payload = await res.json().catch(() => null);
      const items: Array<{ id: string; title: string; platform: string; status: string; scheduledStart: string | null }> =
        payload?.data ?? payload ?? [];
      const live = items.find((item) => item.status === "LIVE");
      setActiveStream(live ? { id: live.id, title: live.title, platform: live.platform, scheduledStart: live.scheduledStart } : null);
    } catch {
      // Silencieux : le badge disparaît simplement.
    }
  }, []);

  useEffect(() => {
    void refreshActiveStream();
  }, [refreshActiveStream]);

  useEffect(() => {
    return () => {
      mediaRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Chronomètre du direct
  useEffect(() => {
    if (!startedAt) return;
    setElapsed(formatDuration(startedAt));
    const interval = setInterval(() => setElapsed(formatDuration(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  // Qualité de connexion : mesurée via la latence socket.io
  useEffect(() => {
    if (!socket) return;
    const measure = () => {
      const start = Date.now();
      socket.timeout(3000).emit("live:ping", () => {
        const latency = Date.now() - start;
        setConnectionQuality(latency < 150 ? "good" : "degraded");
      });
    };
    measure();
    const interval = setInterval(measure, 15000);
    return () => clearInterval(interval);
  }, [socket]);

  useEffect(() => {
    if (previewRef.current && mediaRef.current && mediaType === "VIDEO") {
      previewRef.current.srcObject = mediaRef.current;
    }
  }, [streamId, mediaType, mediaReady]);

  useEffect(() => {
    if (!socket || !streamId) return;

    const sendSignal = (targetId: string, signal: RTCSessionDescriptionInit | RTCIceCandidateInit) => {
      socket.emit("live:signal", { streamId, targetId, signal });
    };

    const createPeer = async (peerId: string) => {
      if (!mediaRef.current || peersRef.current.has(peerId)) return;
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      peersRef.current.set(peerId, peer);
      mediaRef.current.getTracks().forEach((track) => peer.addTrack(track, mediaRef.current!));
      peer.onicecandidate = (event) => event.candidate && sendSignal(peerId, event.candidate.toJSON());
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "failed" || peer.connectionState === "closed") {
          peersRef.current.delete(peerId);
        }
      };
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSignal(peerId, offer);
    };

    const handlePeerJoined = (data: { streamId: string; peerId: string; role: string }) => {
      if (data.streamId === streamId && data.role !== "ADMIN" && data.role !== "SUPER_ADMIN") void createPeer(data.peerId);
    };

    const handleSignal = async (data: SignalMessage) => {
      if (data.streamId !== streamId) return;
      const peer = peersRef.current.get(data.senderId);
      if (!peer) return;
      if ("type" in data.signal && data.signal.type === "answer") {
        await peer.setRemoteDescription(data.signal);
      } else if ("candidate" in data.signal) {
        await peer.addIceCandidate(data.signal);
      }
    };

    const handleViewerUpdate = (data: { streamId: string; count: number }) => {
      if (data.streamId === streamId) setViewerCount(Math.max(0, data.count));
    };

    socket.on("live:peer-joined", handlePeerJoined);
    socket.on("live:signal", handleSignal);
    socket.on("live:viewers:update", handleViewerUpdate);
    socket.emit("live:join", streamId);
    return () => {
      socket.emit("live:leave", streamId);
      socket.off("live:peer-joined", handlePeerJoined);
      socket.off("live:signal", handleSignal);
      socket.off("live:viewers:update", handleViewerUpdate);
    };
  }, [socket, streamId]);

  // === APPEL AUDIO (deux sens) ===
  // Pour un direct AUDIO, l'animateur rejoint aussi le catalogue d'appel :
  // il reçoit la liste des participants et OFFRE son micro à chacun (mesh).
  // Les participants de leur côté offrent vers lui à leur arrivée — la règle
  // anti-glare côté service fait que seul le NOUVEAU arrivant offre ; pour
  // éviter le clash, l'animateur n'offre que vers les participants déjà
  // présents dans sa liste initiale, et répond aux offers des nouveaux.
  useEffect(() => {
    if (!socket || !streamId || mediaType !== "AUDIO" || !mediaReady) return;

    const callPeers = new Map<string, RTCPeerConnection>();

    const getOrCreate = (peerId: string, offerSide: boolean) => {
      const existing = callPeers.get(peerId);
      if (existing) return { peer: existing, created: false };
      if (!mediaRef.current) return null;
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      callPeers.set(peerId, peer);
      mediaRef.current.getAudioTracks().forEach((track) => peer.addTrack(track, mediaRef.current!));
      peer.onicecandidate = (event) =>
        event.candidate && socket.emit("live:signal", { streamId, targetId: peerId, signal: event.candidate.toJSON() });
      peer.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
          callPeers.delete(peerId);
        }
      };
      return { peer, created: true };
    };

    const handleParticipants = async (data: { streamId: string; participants: Array<{ socketId: string }> }) => {
      if (data.streamId !== streamId) return;
      // Règle mesh « le nouveau offre » : ces participants étaient là AVANT
      // l'animateur, donc c'est lui (nouveau pour eux) qui offre. Eux, en
      // recevant participant-joined, ne feront qu'attendre l'offer.
      for (const p of data.participants) {
        const res = getOrCreate(p.socketId, true);
        if (res?.created) {
          const offer = await res.peer.createOffer();
          await res.peer.setLocalDescription(offer);
          socket.emit("live:signal", { streamId, targetId: p.socketId, signal: offer });
        }
      }
    };

    const handleSignal = async (data: SignalMessage) => {
      if (data.streamId !== streamId) return;
      const res = getOrCreate(data.senderId, false);
      if (!res) return;
      const { peer } = res;
      if ("type" in data.signal && data.signal.type === "offer") {
        // Un participant offre vers l'animateur (règle : le nouveau offre) → réponse.
        await peer.setRemoteDescription(data.signal);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("live:signal", { streamId, targetId: data.senderId, signal: answer });
      } else if ("type" in data.signal && data.signal.type === "answer") {
        if (peer.signalingState !== "have-local-offer") return;
        await peer.setRemoteDescription(data.signal);
      } else if ("candidate" in data.signal) {
        try {
          await peer.addIceCandidate(data.signal);
        } catch {
          // Candidate hors séquence : ignorée.
        }
      }
    };

    socket.emit("live:call:join", { streamId, displayName: "Animateur" });
    socket.on("live:call:participants", handleParticipants);
    socket.on("live:signal", handleSignal);

    return () => {
      socket.emit("live:call:leave", { streamId });
      socket.off("live:call:participants", handleParticipants);
      socket.off("live:signal", handleSignal);
      callPeers.forEach((peer) => peer.close());
      callPeers.clear();
    };
  }, [socket, streamId, mediaType, mediaReady]);

  async function startLive() {
    setLoading(true);
    setIsLaunching(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("La capture audio/vidéo n'est pas disponible dans ce navigateur.");
      if (!window.isSecureContext) throw new Error("Sur téléphone, ouvrez la version HTTPS du site pour autoriser la caméra et le micro.");
      const media = mediaRef.current ?? await navigator.mediaDevices.getUserMedia({ audio: true, video: mediaType === "VIDEO" });
      mediaRef.current = media;
      setMediaReady(true);
      if (previewRef.current && mediaType === "VIDEO") {
        previewRef.current.srcObject = media;
        await previewRef.current.play().catch(() => undefined);
      }
      const response = await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, platform: "INTERNAL", mediaType, status: "LIVE", actualStart: new Date().toISOString() }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error ?? result?.message ?? `Impossible de créer le direct (${response.status}).`);
      }
      const item = result?.data;
      if (!item?.id) throw new Error("Le serveur n'a pas retourné l'identifiant du direct.");
      setStreamId(item.id);
      setStartedAt(new Date());
      setConnectionQuality(isConnected ? "good" : "unknown");
      socket?.emit("admin:live:status", { streamId: item.id, status: "LIVE", info: { title: item.title, mediaType } });
      toast.success(isConnected ? "Le direct est maintenant visible dans les espaces membres." : "Le direct est lancé. La connexion temps réel sera rétablie automatiquement.");
      window.setTimeout(() => setIsLaunching(false), 1400);
    } catch (error) {
      setIsLaunching(false);
      toast.error(error instanceof Error ? error.message : "Impossible de démarrer le direct.");
    } finally {
      setLoading(false);
    }
  }

  // Retour sur la page alors qu'un direct est en cours dans CE navigateur :
  // le navigateur a stoppé la capture au démontage du composant. On permet
  // de reprendre la caméra/micro et de rattacher les tracks aux peers.
  async function resumeMedia() {
    setLoading(true);
    try {
      if (!streamId) throw new Error("Aucun direct en cours depuis ce navigateur.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Capture audio/vidéo indisponible.");
      if (!window.isSecureContext) throw new Error("La caméra/micro exige HTTPS (ou localhost).");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mediaType === "VIDEO",
      });
      mediaRef.current?.getTracks().forEach((track) => track.stop());
      mediaRef.current = media;
      setMediaReady(true);
      if (previewRef.current && mediaType === "VIDEO") {
        previewRef.current.srcObject = media;
        await previewRef.current.play().catch(() => undefined);
      }
      // Rattache les nouvelles tracks aux peers existants (spectateurs déjà
      // connectés) sans renégociation complète.
      peersRef.current.forEach((peer) => {
        const senders = peer.getSenders();
        media.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) void sender.replaceTrack(track);
          else peer.addTrack(track, media);
        });
      });
      setDeviceStatus("Aperçu repris : la diffusion continue vers les spectateurs connectés.");
      toast.success("Caméra/micro rattachés au direct en cours.");
    } catch (error) {
      setDeviceStatus(error instanceof Error ? error.message : "Impossible de reprendre la capture.");
      toast.error(error instanceof Error ? error.message : "Impossible de reprendre la capture.");
    } finally {
      setLoading(false);
    }
  }

  async function testDevices() {
    try {
      if (!window.isSecureContext) throw new Error("Sur téléphone, ouvrez la version HTTPS du site pour autoriser la caméra et le micro.");
      const testMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: mediaType === "VIDEO" });
      mediaRef.current?.getTracks().forEach((track) => track.stop());
      mediaRef.current = testMedia;
      setMediaReady(true);
      if (previewRef.current && mediaType === "VIDEO") {
        previewRef.current.srcObject = testMedia;
        await previewRef.current.play().catch(() => undefined);
      }
      setDeviceStatus(mediaType === "VIDEO" ? "Caméra et micro opérationnels" : "Micro opérationnel");
      toast.success("Les périphériques sont disponibles.");
    } catch (error) {
      setDeviceStatus("Accès caméra/micro refusé ou indisponible");
      toast.error(error instanceof Error ? error.message : "Impossible d'accéder aux périphériques.");
    }
  }

  async function stopLive() {
    const id = streamId ?? activeStream?.id;
    if (!id) return;
    setLoading(true);
    setStoppingActive(true);
    try {
      await fetch("/api/admin/live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "ENDED", actualEnd: new Date().toISOString() }),
      });
      socket?.emit("admin:live:status", { streamId: id, status: "ENDED" });
      if (streamId) {
        socket?.emit("live:leave", streamId);
        peersRef.current.forEach((peer) => peer.close());
        peersRef.current.clear();
        stopMedia();
        setStreamId(null);
        setStartedAt(null);
      }
      setActiveStream(null);
      setViewerCount(0);
      setConnectionQuality("unknown");
      void refreshActiveStream();
      toast.success("Le direct est terminé.");
    } catch {
      toast.error("Impossible d'arrêter le direct. Réessayez.");
    } finally {
      setLoading(false);
      setStoppingActive(false);
    }
  }

  async function enterFullscreen() {
    if (stageRef.current?.requestFullscreen) await stageRef.current.requestFullscreen();
  }

  function toggleTrack(kind: "audio" | "video") {
    const nextValue = kind === "audio" ? !audioEnabled : !videoEnabled;
    mediaRef.current?.getTracks().filter((track) => track.kind === kind).forEach((track) => { track.enabled = nextValue; });
    if (kind === "audio") setAudioEnabled(nextValue);
    else setVideoEnabled(nextValue);
  }

  const qualityBadge =
    connectionQuality === "good"
      ? { label: "Réseau stable", className: "bg-emerald-500/15 text-emerald-400", icon: Signal }
      : connectionQuality === "degraded"
        ? { label: "Réseau instable", className: "bg-amber-500/15 text-amber-400", icon: Signal }
        : null;

  return (
    <Card suppressHydrationWarning className="overflow-hidden border-red-500/30">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${streamId ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${streamId ? "animate-pulse bg-white" : "bg-muted-foreground"}`} />
            {streamId ? "DIRECT EN COURS" : "DIRECT NON LANCÉ"}
          </span>
          <span>Lancer un direct dans l'application</span>
          {streamId && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 font-mono text-sm text-white">
                <Timer className="h-3.5 w-3.5" /> {elapsed}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {viewerCount} spectateur{viewerCount > 1 ? "s" : ""}
              </span>
              {qualityBadge && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${qualityBadge.className}`}>
                  <qualityBadge.icon className="h-3.5 w-3.5" /> {qualityBadge.label}
                </span>
              )}
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Direct actif détecté en base, non lancé depuis CE navigateur :
            bouton d'arrêt toujours disponible (ex. direct créé via le formulaire). */}
        {!streamId && activeStream && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN DIRECT
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{activeStream.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activeStream.platform === "INTERNAL"
                    ? "Direct interne (autre session ou formulaire)"
                    : "Diffusion via plateforme externe"}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={stopLive}
              disabled={loading || stoppingActive}
              className="shrink-0"
            >
              <Square className="mr-2 h-4 w-4" />
              {stoppingActive ? "Arrêt..." : "Arrêter le live"}
            </Button>
          </div>
        )}

        {!streamId && activeStream && !mediaReady && (
          <Button variant="outline" onClick={resumeMedia} disabled={loading} className="w-fit">
            <Video className="mr-2 h-4 w-4" />
            Reprendre la caméra (direct en cours)
          </Button>
        )}

        {!streamId ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
            {mediaType === "VIDEO" && mediaReady && (
              <div className="relative order-first overflow-hidden rounded-xl bg-black md:col-span-4">
                <video ref={previewRef} autoPlay muted playsInline className="aspect-video w-full object-contain" />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                  <CircleDot className="h-3.5 w-3.5 text-emerald-400" /> Aperçu local
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPreviewSettings((value) => !value)}
                  aria-label="Réglages de l'aperçu"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
                {showPreviewSettings && (
                  <div className="absolute right-3 top-12 z-10 w-60 space-y-3 rounded-xl bg-black/85 p-4 text-sm text-white shadow-xl backdrop-blur">
                    <p className="font-semibold">Aperçu</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2"><Mic className="h-4 w-4" /> Micro</span>
                      <Switch checked={audioEnabled} onCheckedChange={() => toggleTrack("audio")} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4" /> Caméra</span>
                      <Switch checked={videoEnabled} onCheckedChange={() => toggleTrack("video")} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="live-title">Titre</Label>
              <Input id="live-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 md:contents">
              <Button type="button" variant={mediaType === "VIDEO" ? "default" : "outline"} onClick={() => { setMediaType("VIDEO"); setDeviceStatus(null); }}>
                <Video className="mr-2 h-4 w-4" />Vidéo
              </Button>
              <Button type="button" variant={mediaType === "AUDIO" ? "default" : "outline"} onClick={() => { setMediaType("AUDIO"); setDeviceStatus(null); }}>
                <Mic className="mr-2 h-4 w-4" />Audio
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:contents">
              <Button type="button" variant="outline" onClick={testDevices} disabled={loading}>
                <Mic className="mr-2 h-4 w-4" />{mediaReady ? "Aperçu prêt" : "Activer caméra/micro"}
              </Button>
              <Button onClick={startLive} disabled={loading || !title.trim()}>
                <Radio className="mr-2 h-4 w-4" />Démarrer
              </Button>
            </div>
          </div>
        ) : (
          <div ref={stageRef} className="relative min-h-[420px] overflow-hidden rounded-2xl bg-slate-950 p-3 sm:min-h-[560px]">
            {mediaType === "VIDEO" ? (
              <video ref={previewRef} autoPlay muted playsInline className="h-full min-h-[394px] w-full rounded-xl bg-black object-contain sm:min-h-[534px]" />
            ) : (
              <div className="flex min-h-[394px] flex-col items-center justify-center gap-5 rounded-xl bg-gradient-to-br from-slate-950 via-red-950/40 to-slate-900 text-white sm:min-h-[534px]">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-600/20 ring-8 ring-red-500/10">
                  <Mic className="h-12 w-12 animate-pulse text-red-400" />
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold"><Volume2 className="h-5 w-5 text-red-400" />Audio en direct</div>
                <div className="flex items-end gap-1" aria-label="Micro actif">
                  {[4, 8, 14, 22, 12, 18, 7, 16, 10, 20].map((height, index) => (
                    <span key={index} className="w-1.5 animate-pulse rounded-full bg-red-400" style={{ height }} />
                  ))}
                </div>
              </div>
            )}
            <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> EN DIRECT
            </div>
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 font-mono text-sm font-semibold text-white">
                <Timer className="h-4 w-4" /> {elapsed}
              </span>
              <div className="flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-sm font-semibold text-white">
                <Eye className="h-4 w-4" /> {viewerCount}
              </div>
              {qualityBadge && (
                <span className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-flex ${qualityBadge.className}`}>
                  <qualityBadge.icon className="h-4 w-4" /> {qualityBadge.label}
                </span>
              )}
              <Button size="icon" variant="secondary" onClick={() => setShowSettings((value) => !value)} aria-label="Afficher les réglages">
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={enterFullscreen} aria-label="Passer en plein écran">
                <Expand className="h-4 w-4" />
              </Button>
            </div>
            {showSettings && (
              <div className="absolute right-6 top-16 z-10 w-[min(18rem,calc(100%-3rem))] space-y-3 rounded-xl bg-black/85 p-4 text-sm text-white shadow-xl backdrop-blur">
                <p className="font-semibold">Réglages du direct</p>
                <Button className="w-full justify-start" variant="secondary" onClick={() => toggleTrack("audio")}>
                  {audioEnabled ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {audioEnabled ? "Couper le micro" : "Activer le micro"}
                </Button>
                {mediaType === "VIDEO" && (
                  <Button className="w-full justify-start" variant="secondary" onClick={() => toggleTrack("video")}>
                    {videoEnabled ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                    {videoEnabled ? "Couper la caméra" : "Activer la caméra"}
                  </Button>
                )}
              </div>
            )}
            {isLaunching && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 text-white backdrop-blur-sm">
                <Loader2 className="h-10 w-10 animate-spin text-red-400" />
                <span className="text-lg font-semibold">Le direct démarre...</span>
              </div>
            )}
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-3 rounded-xl bg-black/75 p-3 text-sm text-white backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                <span className="truncate">Votre {mediaType === "VIDEO" ? "caméra et votre micro" : "micro"} sont diffusés</span>
              </span>
              <Button size="sm" variant="destructive" onClick={stopLive} disabled={loading}>
                <Square className="mr-2 h-4 w-4" />Arrêter
              </Button>
            </div>
          </div>
        )}
        {deviceStatus && <p className="text-sm text-muted-foreground">{deviceStatus}</p>}
        {!isConnected && (
          <p className="flex items-start gap-2 text-sm text-amber-600">
            <MonitorPlay className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Service temps réel non connecté.{" "}
              {websocketHealthUrl && (
                <>
                  <a className="underline" href={websocketHealthUrl} target="_blank" rel="noreferrer">Ouvrez le contrôle websocket</a>, acceptez le certificat, puis rechargez cette page.
                </>
              )}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
