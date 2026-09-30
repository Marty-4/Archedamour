"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { toast } from "sonner";

import { useWebSocket } from "@/lib/websocket";

/**
 * Écoute l'événement WS « live:started » et affiche un toast cliquable
 * à TOUS les utilisateurs connectés (dashboards admin et membre).
 * À monter une fois dans chaque layout de dashboard.
 */
export function LiveStartedToast({ target = "/member/live" }: { target?: string }) {
  const { liveStarted } = useWebSocket();
  const router = useRouter();
  const lastStreamId = useRef<string | null>(null);

  useEffect(() => {
    if (!liveStarted || liveStarted.streamId === lastStreamId.current) return;
    lastStreamId.current = liveStarted.streamId;

    toast(`${liveStarted.title} est en direct`, {
      description: "Cliquez pour rejoindre la diffusion.",
      icon: <Radio className="h-4 w-4 text-red-500" />,
      action: {
        label: "Rejoindre",
        onClick: () => router.push(target),
      },
      duration: 12000,
    });
  }, [liveStarted, router, target]);

  return null;
}
