import Link from "next/link";
import { Construction } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Page provisoire pour les sections dont le contenu n'est pas encore rédigé.
 * Évite les liens morts (404) depuis le pied de page et la navigation.
 */
export function PlaceholderPage({
  title,
  description = "Cette section est en cours de rédaction et sera bientôt disponible.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="h-8 w-8" />
      </div>

      <h1 className="mt-6 font-serif text-3xl font-bold">{title}</h1>

      <p className="mt-3 text-muted-foreground">{description}</p>

      <Button asChild className="mt-8 rounded-xl">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
