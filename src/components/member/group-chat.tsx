"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroupChat } from "@/lib/websocket";

type ChatMessage = {
  id: string;
  content?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
  userId: string;
  author?: string;
  userName?: string;
  avatar?: string | null;
  isMine?: boolean;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function GroupChat({ groupId, currentUserId }: { groupId: string; currentUserId: string }) {
  const { messages, isJoined, sendMessage } = useGroupChat(groupId, {
    userId: currentUserId,
  });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fallbackLoaded = useRef(false);

  // Historique via l'API (le WS ne fournit pas l'historique persistant).
  useEffect(() => {
    let cancelled = false;
    fallbackLoaded.current = false;

    (async () => {
      try {
        const res = await fetch(`/api/groupes/messages?groupId=${groupId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message ?? "Erreur de chargement");
        if (!cancelled) {
          const mapped: ChatMessage[] = (data.messages ?? []).map((m: ChatMessage) => ({
            ...m,
            message: m.content,
            timestamp: m.createdAt,
          }));
          // On repart de l'historique ; les messages WS viendront s'ajouter.
          localStorage.setItem(`gchat_${groupId}`, JSON.stringify(mapped));
          fallbackLoaded.current = true;
          window.dispatchEvent(new Event(`gchat_reload_${groupId}`));
        }
      } catch {
        if (!cancelled) fallbackLoaded.current = true;
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  // Fusion : l'historique API remplace la liste, les messages WS s'ajoutent.
  const [baseMessages, setBaseMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    const reload = () => {
      try {
        const stored = localStorage.getItem(`gchat_${groupId}`);
        if (stored) setBaseMessages(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener(`gchat_reload_${groupId}`, reload);
    reload();
    return () => window.removeEventListener(`gchat_reload_${groupId}`, reload);
  }, [groupId]);

  const allMessages = [...baseMessages];
  for (const m of messages) {
    if (!allMessages.some((x) => x.id === m.id)) allMessages.push(m);
  }
  allMessages.sort(
    (a, b) =>
      new Date(a.createdAt ?? a.timestamp ?? 0).getTime() -
      new Date(b.createdAt ?? b.timestamp ?? 0).getTime(),
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setDraft("");

    try {
      // 1) Persistance via l'API (source de vérité, retourne le message complet).
      const res = await fetch("/api/groupes/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, content }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.message) {
        setDraft(content);
        return;
      }

      // 2) Affichage local immédiat.
      setBaseMessages((prev) => [
        ...prev,
        { ...data.message, message: data.message.content },
      ]);

      // 3) Diffusion temps réel aux autres membres (version persistée).
      sendMessage({ message: content, persisted: { ...data.message, message: data.message.content } });
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  }

  const displayName = (m: ChatMessage) => m.author ?? m.userName ?? "Membre";
  const displayText = (m: ChatMessage) => m.message ?? m.content ?? "";
  const displayTime = (m: ChatMessage) => {
    const date = new Date(m.createdAt ?? m.timestamp ?? Date.now());
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-3xl border bg-card">
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">Discussion du groupe</h3>
          <p className="text-xs text-muted-foreground">
            {isJoined ? "Connecté en temps réel" : "Connexion au temps réel..."}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Aucun message. Lancez la discussion !
            </p>
          </div>
        ) : (
          allMessages.map((m) => {
            const mine = m.isMine ?? m.userId === currentUserId;
            return (
              <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {initials(displayName(m))}
                </div>
                <div className={`max-w-[75%] ${mine ? "text-right" : ""}`}>
                  <p className="text-xs text-muted-foreground">
                    {mine ? "Vous" : displayName(m)} · {displayTime(m)}
                  </p>
                  <div
                    className={`mt-1 inline-block rounded-2xl px-4 py-2 text-sm ${
                      mine
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted"
                    }`}
                  >
                    {displayText(m)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t px-4 py-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Écrivez un message..."
          maxLength={2000}
          className="rounded-full"
        />
        <Button size="icon" className="shrink-0 rounded-full" onClick={handleSend} disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
