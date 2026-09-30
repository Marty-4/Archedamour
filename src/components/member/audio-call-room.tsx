"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/lib/websocket";

type Participant = {
  socketId: string;
  userId: string | null;
  name: string;
  role: string;
  micOn: boolean;
  joinedAt: string;
};

type SignalMessage = {
  streamId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * Appel audio à deux sens (conférence mesh) pour les directs AUDIO.
 * Chaque participant publie son micro et entend tous les autres :
 * - à l'arrivée, on demande la liste des participants (live:call:join) et on
 *   crée un peer + offer vers chacun d'eux (règle anti-glare : le nouveau offre) ;
 * - quand quelqu'un d'autre arrive, on attend SON offer (pas de glare).
 * L'admin/pasteur voit la même liste, en plus du flux qu'il diffuse déjà.
 */
export function AudioCallRoom({ streamId, displayName }: { streamId: string; displayName?: string }) {
  const { socket, isConnected } = useWebSocket({ userRole: "MEMBER" });

  const [status, setStatus] = useState<"idle" | "joining" | "in-call">("idle");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const audioRefs = useRef(new Map<string, HTMLAudioElement>());
  const micAnalyserRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; raf: number } | null>(null);
  const inCallRef = useRef(false);

  /** Crée un peer vers un participant et (si offerSide) envoie l'offer. */
  const createPeer = useCallback(
    async (peerId: string, offerSide: boolean) => {
      if (!socket || peersRef.current.has(peerId)) return;

      const peer = new RTCPeerConnection(ICE_CONFIG);
      peersRef.current.set(peerId, peer);

      // Sortie audio distante : chaque peer crée un <audio> dédié.
      const remoteAudio = document.createElement("audio");
      remoteAudio.autoplay = true;
      remoteAudio.dataset.peerId = peerId;
      audioRefs.current.set(peerId, remoteAudio);
      peer.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
        void remoteAudio.play().catch(() => undefined);
      };
      peer.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
          peer.close();
          peersRef.current.delete(peerId);
          audioRefs.current.delete(peerId);
        }
      };
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("live:signal", {
            streamId,
            targetId: peerId,
            signal: event.candidate.toJSON(),
          });
        }
      };

      // Mon micro dans le peer (s'il est actif côté local).
      const local = localStreamRef.current;
      if (local) {
        local.getAudioTracks().forEach((track) => peer.addTrack(track, local));
      }

      if (offerSide) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("live:signal", { streamId, targetId: peerId, signal: offer });
      }
    },
    [socket, streamId],
  );

  const joinCall = useCallback(async () => {
    if (!socket || inCallRef.current) return;
    setStatus("joining");
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Votre navigateur ne supporte pas la capture audio.");
      }
      if (!window.isSecureContext) {
        throw new Error("Le micro exige une connexion sécurisée (HTTPS ou localhost).");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      inCallRef.current = true;

      socket.emit("live:call:join", { streamId, displayName });
      setStatus("in-call");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre l'appel.");
      setStatus("idle");
    }
  }, [socket, streamId, displayName]);

  const leaveCall = useCallback(() => {
    if (!socket) return;
    socket.emit("live:call:leave", { streamId });
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    audioRefs.current.forEach((el) => (el.srcObject = null));
    audioRefs.current.clear();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (micAnalyserRef.current) {
      cancelAnimationFrame(micAnalyserRef.current.raf);
      void micAnalyserRef.current.ctx.close();
      micAnalyserRef.current = null;
    }
    setSpeaking(false);
    inCallRef.current = false;
    setParticipants([]);
    setStatus("idle");
  }, [socket, streamId]);

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    const next = !micOn;
    tracks.forEach((track) => (track.enabled = next));
    setMicOn(next);
    socket?.emit("live:call:mic", { streamId, micOn: next });
  }, [micOn, socket, streamId]);

  // Indicateur local « vous parlez » (optionnel, purement visuel).
  useEffect(() => {
    if (status !== "in-call" || !micOn) return;
    const stream = localStreamRef.current;
    if (!stream) return;
    try {
      const Ctx = window.AudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        setSpeaking(data.some((v) => v > 90));
        micAnalyserRef.current!.raf = requestAnimationFrame(loop);
      };
      micAnalyserRef.current = { ctx, analyser, raf: requestAnimationFrame(loop) };
      return () => {
        if (micAnalyserRef.current) {
          cancelAnimationFrame(micAnalyserRef.current.raf);
          void micAnalyserRef.current.ctx.close();
          micAnalyserRef.current = null;
        }
      };
    } catch {
      return undefined;
    }
  }, [status, micOn]);

  // Signalisation : liste à l'arrivée, arrivées/départs, offers/answers/ICE.
  useEffect(() => {
    if (!socket || status !== "in-call") return;

    const handleParticipants = (data: { streamId: string; participants: Participant[] }) => {
      if (data.streamId !== streamId) return;
      setParticipants(data.participants);
      // Le nouvel arrivant OFFRE vers tous les présents (anti-glare : eux n'offrent pas).
      data.participants.forEach((p) => void createPeer(p.socketId, true));
    };

    const handleJoined = (participant: Participant) => {
      setParticipants((prev) => [...prev.filter((p) => p.socketId !== participant.socketId), participant]);
      // On n'offre PAS : l'arrivant offrira vers nous (règle du nouveau).
      void createPeer(participant.socketId, false);
    };

    const handleLeft = (data: { streamId: string; socketId: string }) => {
      if (data.streamId !== streamId) return;
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
      peersRef.current.get(data.socketId)?.close();
      peersRef.current.delete(data.socketId);
      audioRefs.current.delete(data.socketId);
    };

    const handleParticipantsUpdate = (data: { streamId: string; participants: Participant[] }) => {
      if (data.streamId !== streamId) return;
      setParticipants(data.participants);
    };

    const handleMicUpdate = (data: { streamId: string; socketId: string; micOn: boolean }) => {
      if (data.streamId !== streamId) return;
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === data.socketId ? { ...p, micOn: data.micOn } : p)),
      );
    };

    const handleSignal = async (data: SignalMessage) => {
      if (data.streamId !== streamId) return;
      let peer = peersRef.current.get(data.senderId);
      if (!peer) {
        // Message d'un inconnu (answer/ICE avant notre peer) : peer récepteur.
        await createPeer(data.senderId, false);
        peer = peersRef.current.get(data.senderId);
        if (!peer) return;
      }
      if ("type" in data.signal && data.signal.type === "offer") {
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
          // Candidate hors séquence : ignorée (la suivante réussira).
        }
      }
    };

    socket.on("live:call:participants", handleParticipants);
    socket.on("live:call:participant-joined", handleJoined);
    socket.on("live:call:participant-left", handleLeft);
    socket.on("live:call:participants:update", handleParticipantsUpdate);
    socket.on("live:call:mic-update", handleMicUpdate);
    socket.on("live:signal", handleSignal);

    return () => {
      socket.off("live:call:participants", handleParticipants);
      socket.off("live:call:participant-joined", handleJoined);
      socket.off("live:call:participant-left", handleLeft);
      socket.off("live:call:participants:update", handleParticipantsUpdate);
      socket.off("live:call:mic-update", handleMicUpdate);
      socket.off("live:signal", handleSignal);
    };
  }, [socket, status, streamId, createPeer]);

  // Si la socket se reconnecte, on repart proprement (le peer mesh est mort).
  useEffect(() => {
    if (isConnected || status !== "in-call") return;
    leaveCall();
  }, [isConnected, status, leaveCall]);

  // Cleanup final.
  useEffect(() => {
    return () => {
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Users className="h-5 w-5 text-primary" />
          Appel audio en direct
          {status === "in-call" && (
            <Badge variant="secondary" className="ml-1">
              {participants.length + 1} participant{participants.length ? "s" : ""}
            </Badge>
          )}
        </h3>
      </div>

      {status === "in-call" ? (
        <>
          {/* Liste des participants (l'admin/pasteur voit tout le monde ici) */}
          <ul className="mb-4 space-y-2">
            <li className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {speaking && <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500/60" />}
                <span className={`h-2.5 w-2.5 rounded-full ${micOn ? "bg-emerald-500" : "bg-muted-foreground"}`} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Vous</span>
              {micOn ? (
                <Mic className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <MicOff className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </li>

            {participants.map((participant) => (
              <li
                key={participant.socketId}
                className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${participant.micOn ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {participant.name}
                  {(participant.role === "ADMIN" || participant.role === "SUPER_ADMIN" || participant.role === "PASTOR") && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      Animateur
                    </span>
                  )}
                </span>
                {participant.micOn ? (
                  <Mic className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <MicOff className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </li>
            ))}
          </ul>

          {/* Contrôles d'appel */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={micOn ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleMic}
              className="rounded-full"
            >
              {micOn ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
              {micOn ? "Micro actif" : "Micro coupé"}
            </Button>
            <Button variant="destructive" size="lg" onClick={leaveCall} className="rounded-full">
              <PhoneOff className="mr-2 h-4 w-4" />
              Quitter l'appel
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Rejoignez l&apos;appel pour écouter le direct et partager votre micro
            avec l&apos;animateur et les autres participants.
          </p>
          <Button size="lg" onClick={joinCall} disabled={status === "joining" || !isConnected} className="rounded-full">
            {status === "joining" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
            {status === "joining" ? "Connexion…" : "Rejoindre l'appel"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!isConnected && <p className="text-xs text-muted-foreground">Connexion au service temps réel…</p>}
        </div>
      )}
    </div>
  );
}
