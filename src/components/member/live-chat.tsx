"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/lib/websocket";

type LiveChatMessage = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
};

const QUICK_EMOJIS = ["🙏", "❤️", "👍", "🙌", "🔥", "🎉"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Chat en temps réel d'une diffusion (room `live:<id>` du service WebSocket).
 * Les messages restent en mémoire de session (comme un chat de direct classique).
 */
export function LiveChat({
  streamId,
  currentUserId,
  currentUserName,
}: {
  streamId: string;
  currentUserId?: string;
  currentUserName?: string;
}) {
  const { socket, isConnected } = useWebSocket({
    userRole: "MEMBER",
    userId: currentUserId,
    userName: currentUserName ?? "Membre",
  });
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Rejoint la room et écoute les messages.
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (message: LiveChatMessage) => {
      queueMicrotask(() =>
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev.slice(-149), message],
        ),
      );
    };

    socket.emit("live:join", streamId);
    socket.on("chat:message", handleMessage);

    return () => {
      socket.emit("live:leave", streamId);
      socket.off("chat:message", handleMessage);
    };
  }, [socket, isConnected, streamId]);

  // Auto-scroll vers le dernier message (le direct se lit en bas).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || !socket || sending) return;

    setSending(true);
    // Le service diffuse à toute la room, émetteur inclus : pas d'ajout local
    // nécessaire (l'id serveur évite les doublons via le filtre ci-dessus).
    socket.emit("chat:message", { streamId, message: trimmed.slice(0, 500) });
    setDraft("");
    setSending(false);
  }

  return (
    <div className="flex h-[480px] flex-col overflow-hidden rounded-3xl border bg-card lg:h-[560px]">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">Chat du direct</h3>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "Temps réel connecté" : "Connexion au temps réel..."}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Soyez le premier à encourager la communauté !
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = currentUserId ? message.userId === currentUserId : false;
            return (
              <div key={message.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {initials(message.userName || "?")}
                </div>
                <div className={`min-w-0 max-w-[78%] ${mine ? "text-right" : ""}`}>
                  <p className="text-xs text-muted-foreground">
                    {mine ? "Vous" : message.userName} ·{" "}
                    {new Date(message.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div
                    className={`mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm ${
                      mine
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted"
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1 border-t px-3 pt-2">
        <Smile className="h-4 w-4 shrink-0 text-muted-foreground" />
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => send(emoji)}
            className="rounded-full px-1.5 py-1 text-lg transition-colors hover:bg-accent"
            aria-label={`Envoyer ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
          placeholder="Encouragez, partagez..."
          maxLength={500}
          className="rounded-full"
          disabled={!isConnected}
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => send(draft)}
          disabled={!isConnected || !draft.trim() || sending}
          aria-label="Envoyer le message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
