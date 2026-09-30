"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/lib/websocket";

type Participant = {
  socketId: string;
  userId: string | null;
  name: string;
  role: string;
  micOn: boolean;
  joinedAt: string;
};

/**
 * Panneau animateur d'un appel audio : liste TEMPS RÉEL des participants
 * (arrivées, départs, état du micro de chacun). L'admin/pasteur voit ici
 * tout le monde — il n'a qu'à parler, chacun reçoit son flux via le mesh.
 */
export function AudioCallHostPanel({ streamId }: { streamId: string }) {
  const { socket, isConnected } = useWebSocket({ userRole: "ADMIN", userName: "Animateur" });
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!socket) return;

    const update = (data: { streamId: string; participants: Participant[] }) => {
      if (data.streamId !== streamId) return;
      setParticipants(data.participants);
    };

    const joined = (participant: Participant) => {
      setParticipants((prev) =>
        prev.some((p) => p.socketId === participant.socketId)
          ? prev.map((p) => (p.socketId === participant.socketId ? participant : p))
          : [...prev, participant],
      );
    };

    const left = (data: { streamId: string; socketId: string }) => {
      if (data.streamId !== streamId) return;
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
    };

    const micUpdate = (data: { streamId: string; socketId: string; micOn: boolean }) => {
      if (data.streamId !== streamId) return;
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === data.socketId ? { ...p, micOn: data.micOn } : p)),
      );
    };

    socket.on("live:call:participants:update", update);
    socket.on("live:call:participant-joined", joined);
    socket.on("live:call:participant-left", left);
    socket.on("live:call:mic-update", micUpdate);

    return () => {
      socket.off("live:call:participants:update", update);
      socket.off("live:call:participant-joined", joined);
      socket.off("live:call:participant-left", left);
      socket.off("live:call:mic-update", micUpdate);
    };
  }, [socket, streamId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Participants de l&apos;appel
          <Badge variant="secondary" className="ml-auto">
            {participants.length} connecté{participants.length > 1 ? "s" : ""}
          </Badge>
          {!isConnected && (
            <Badge variant="outline" className="text-muted-foreground">
              temps réel hors ligne
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Personne n&apos;a encore rejoint l&apos;appel. Les participants apparaissent ici dès qu&apos;ils se connectent.
          </p>
        ) : (
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li
                key={participant.socketId}
                className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${participant.micOn ? "bg-emerald-500" : "bg-muted-foreground"}`}
                  aria-label={participant.micOn ? "Micro actif" : "Micro coupé"}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{participant.name}</span>
                {participant.micOn ? (
                  <Mic className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <MicOff className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
