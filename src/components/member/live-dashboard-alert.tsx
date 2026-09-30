"use client";

import Link from "next/link";
import { Radio, Video } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWebSocket } from "@/lib/websocket";

type LiveStreamSummary = { id: string; title: string; mediaType: "VIDEO" | "AUDIO" };

type Props = { initialStreams: LiveStreamSummary[] };

export function LiveDashboardAlert({ initialStreams }: Props) {
  const { socket } = useWebSocket({ userRole: "MEMBER" });
  const [streams, setStreams] = useState(initialStreams);

  useEffect(() => {
    if (!socket) return;
    const handleStatus = (data: { streamId: string; status: string; info?: { title?: string; mediaType?: "VIDEO" | "AUDIO" } }) => {
      if (data.status === "LIVE") {
        setStreams((current) => current.some((stream) => stream.id === data.streamId) ? current : [...current, { id: data.streamId, title: data.info?.title ?? "Direct en cours", mediaType: data.info?.mediaType ?? "VIDEO" }]);
      } else if (data.status === "ENDED" || data.status === "CANCELLED") {
        setStreams((current) => current.filter((stream) => stream.id !== data.streamId));
      }
    };
    socket.on("live:status", handleStatus);
    return () => { socket.off("live:status", handleStatus); };
  }, [socket]);

  if (!streams.length) return null;

  return (
    <Card className="border-red-500/30 bg-red-500/[0.04]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600"><Radio className="h-5 w-5 animate-pulse" /></div>
          <div><div className="flex items-center gap-2"><h2 className="font-semibold">Direct en cours</h2><Badge className="bg-red-600 text-white">EN DIRECT</Badge></div><p className="text-sm text-muted-foreground">{streams[0].title} · {streams[0].mediaType === "AUDIO" ? "Audio" : "Vidéo"}</p></div>
        </div>
        <Button asChild><Link href="/member/live"><Video className="mr-2 h-4 w-4" />Rejoindre le direct</Link></Button>
      </CardContent>
    </Card>
  );
}
