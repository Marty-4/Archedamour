"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleStop, Loader2, Mic, Pause, Play, Radio, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type RecorderState = "idle" | "recording" | "paused" | "ready";

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return h === "00" ? `${m}:${s}` : `${h}:${m}:${s}`;
}

/**
 * Enregistrement de prédication avec le micro de l'appareil (MediaRecorder) :
 * - chronomètre animé + visualisation (barres pulsées par le niveau réel du micro)
 * - pause / reprise, annulation, ré-écoute avant publication
 * - à la publication : upload vers /api/admin/upload (folder=sermon-audio)
 *   puis callback onSave(audioUrl, durationSeconds).
 */
export function MicroRecorder({
  onSave,
  uploading = false,
}: {
  onSave: (audioUrl: string, durationSeconds: number) => void;
  uploading?: boolean;
}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(28).fill(4));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const tickerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupVisualization = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  }, []);

  const clearAll = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    cleanupVisualization();
    if (tickerRef.current !== null) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setElapsed(0);
    setLevels(Array(28).fill(4));
    setAudioUrl(null);
    setDurationSec(0);
  }, [cleanupVisualization]);

  useEffect(() => () => clearAll(), [clearAll]);

  /** Visualisation : barres animées par le niveau réel du micro. */
  const startVisualization = useCallback((stream: MediaStream) => {
    try {
      const Ctx = window.AudioContext;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        // 7 bandes moyennées → 28 barres (2 répétitions) avec lissage.
        const bandCount = 14;
        const bands: number[] = [];
        const chunk = Math.floor(data.length / bandCount);
        for (let b = 0; b < bandCount; b++) {
          let sum = 0;
          for (let i = 0; i < chunk; i++) sum += data[b * chunk + i];
          bands.push(sum / chunk);
        }
        setLevels((prev) => {
          const next = [...prev];
          for (let i = 0; i < 28; i++) {
            const level = bands[i % bandCount] / 255;
            const target = 4 + level * 34;
            next[i] = prev[i] + (target - prev[i]) * 0.4;
          }
          return next;
        });
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      // Visualisation indisponible : les barres resteront statiques.
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Capture micro indisponible dans ce navigateur.");
      if (!window.isSecureContext) throw new Error("Le micro exige une connexion sécurisée (HTTPS ou localhost).");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioUrl(url);
        setDurationSec(Math.round(accumulatedRef.current / 1000));
        stream.getTracks().forEach((track) => track.stop());
        cleanupVisualization();
        setState("ready");
      };
      recorderRef.current = recorder;

      accumulatedRef.current = 0;
      startedAtRef.current = Date.now();
      recorder.start(1000); // chunks d'1 s (pause fiable)
      setState("recording");
      startVisualization(stream);

      tickerRef.current = window.setInterval(() => {
        if (recorderRef.current?.state === "recording") {
          setElapsed(accumulatedRef.current + (Date.now() - startedAtRef.current));
        }
      }, 200);
    } catch (error) {
      toast.error("Micro inaccessible", {
        description: error instanceof Error ? error.message : "Autorisez le micro et réessayez.",
      });
    }
  }, [cleanupVisualization, startVisualization]);

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state !== "recording") return;
    recorder.pause();
    accumulatedRef.current += Date.now() - startedAtRef.current;
    setState("paused");
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state !== "paused") return;
    recorder.resume();
    startedAtRef.current = Date.now();
    setState("recording");
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    if (recorder.state === "recording") {
      accumulatedRef.current += Date.now() - startedAtRef.current;
    }
    if (tickerRef.current !== null) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    recorder.stop(); // onstop construit le blob et passe en "ready"
  }, []);

  /** Publication : upload du blob puis callback avec URL + durée. */
  const publish = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!audioUrl || !recorder) return;
    try {
      const blob = await (await fetch(audioUrl)).blob();
      const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("wav") ? "wav" : "webm";
      const formData = new FormData();
      formData.set("file", new File([blob], `predication.${extension}`, { type: blob.type }));
      formData.set("folder", "sermon-audio");

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Échec du téléversement");

      onSave(payload.data?.url ?? payload.url, Math.max(1, durationSec));
    } catch (error) {
      toast.error("Publication impossible", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, [audioUrl, durationSec, onSave]);

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {state === "idle" && (
          <Button type="button" onClick={startRecording} className="rounded-full">
            <Mic className="mr-2 h-4 w-4" />
            Enregistrer avec le micro
          </Button>
        )}

        {state === "recording" && (
          <>
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="absolute h-full w-full animate-ping rounded-full bg-red-500/60" />
              <span className="h-3.5 w-3.5 rounded-full bg-red-500" />
            </span>
            <span className="font-mono text-lg font-bold tabular-nums">{formatTime(elapsed)}</span>
            <Button type="button" variant="secondary" size="sm" onClick={pauseRecording}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="mr-2 h-4 w-4" /> Arrêter
            </Button>
          </>
        )}

        {state === "paused" && (
          <>
            <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-muted-foreground" />
            <span className="font-mono text-lg font-bold tabular-nums">{formatTime(elapsed)}</span>
            <span className="text-sm text-muted-foreground">en pause</span>
            <Button type="button" variant="secondary" size="sm" onClick={resumeRecording}>
              <Play className="mr-2 h-4 w-4" /> Reprendre
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="mr-2 h-4 w-4" /> Arrêter
            </Button>
          </>
        )}

        {state === "ready" && audioUrl && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => void new Audio(audioUrl).play()}>
              <Play className="mr-2 h-4 w-4" /> Réécouter
            </Button>
            <span className="text-sm text-muted-foreground">durée : {formatTime(durationSec * 1000)}</span>
            <Button type="button" onClick={publish} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radio className="mr-2 h-4 w-4" />}
              Publier cet enregistrement
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { clearAll(); setState("idle"); }}>
              <Trash2 className="mr-2 h-4 w-4" /> Refaire
            </Button>
          </>
        )}
      </div>

      {/* Visualisation du niveau du micro (recording/paused) */}
      {(state === "recording" || state === "paused") && (
        <div className="mt-4 flex h-12 items-end gap-1" aria-hidden>
          {levels.map((level, index) => (
            <span
              key={index}
              className="w-full max-w-2 rounded-full bg-gradient-to-t from-red-600 to-red-400 transition-[height] duration-100"
              style={{ height: `${state === "paused" ? 4 : Math.max(4, level)}px` }}
            />
          ))}
        </div>
      )}

      {/* Pré-écoute après arrêt */}
      {state === "ready" && audioUrl && (
         
        <audio controls preload="metadata" src={audioUrl} className="mt-4 w-full" />
      )}

      {state === "recording" && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <CircleStop className="h-3.5 w-3.5" />
          L&apos;enregistrement continue même si vous remplissez le reste du formulaire.
        </p>
      )}
    </div>
  );
}
