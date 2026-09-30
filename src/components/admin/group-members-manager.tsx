"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Trash2, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Candidate = { value: string; label: string };

type GroupMemberRow = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

/**
 * Gestion des membres d'un groupe côté admin :
 * - affiche la liste (dialogue)
 * - ajout d'un utilisateur existant (membre ou responsable)
 * - retrait d'un membre
 */
export function GroupMembersManager({
  groupId,
  groupName,
  candidates,
}: {
  groupId: string;
  groupName: string;
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMemberRow[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [saving, setSaving] = useState(false);
  // Recherche filtrée des candidats (nom ou email, insensible à la casse).
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((candidate) => candidate.label.toLowerCase().includes(q));
  }, [candidates, searchQuery]);

  async function loadMembers(retries = 2) {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/admin/groupes/membres?groupId=${groupId}`);
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erreur de chargement");
      // apiSuccess enveloppe la réponse : { data: { group, members } }
      setMembers(payload.data?.members ?? payload.members ?? []);
    } catch {
      // Le réseau vers la base peut être instable : on retente avant d'afficher l'erreur.
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1500));
        return loadMembers(retries - 1);
      }
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setMembers([]);
      loadMembers();
    }
  }

  async function addMember() {
    if (!selectedUser) {
      toast.error("Sélectionnez un utilisateur");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/groupes/membres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, userId: selectedUser, role: selectedRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Échec de l'ajout");

      toast.success(
        selectedRole === "LEADER"
          ? "Responsable du groupe mis à jour"
          : "Membre ajouté au groupe",
      );
      setSelectedUser("");
      setSelectedRole("MEMBER");
      setSearchQuery("");
      await loadMembers();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de l'ajout");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Retirer ce membre du groupe ?")) return;

    try {
      const res = await fetch(`/api/admin/groupes/membres?memberId=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Échec du retrait");

      toast.success("Membre retiré du groupe");
      await loadMembers();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec du retrait");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Membres du groupe ${groupName}`}>
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Membres — {groupName}</DialogTitle>
          <DialogDescription>
            Ajoutez des utilisateurs au groupe. Le membre désigné « Responsable »
            devient le responsable du groupe.
          </DialogDescription>
        </DialogHeader>

        {/* Ajout — recherche filtrée (barre de recherche membres) */}
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un membre (nom ou email)..."
                aria-label="Rechercher un membre à ajouter"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCandidates.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Aucun membre ne correspond.</p>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <SelectItem key={candidate.value} value={candidate.value}>
                      {candidate.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Membre</SelectItem>
                <SelectItem value="LEADER">Responsable</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={addMember} disabled={saving || !selectedUser} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Ajouter
            </Button>
          </div>
        </div>

        {/* Liste */}
        <div className="max-h-[320px] space-y-2 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Impossible de charger la liste (réseau instable).
              </p>
              <Button variant="outline" size="sm" onClick={() => loadMembers()}>
                Réessayer
              </Button>
            </div>
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun membre dans ce groupe pour le moment.
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.user.name || "Utilisateur sans nom"}
                    {member.role === "LEADER" && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Responsable
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeMember(member.id)}
                  aria-label={`Retirer ${member.user.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
