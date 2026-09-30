"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditableProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  maritalStatus: string;
  bio: string;
};

const MARITAL_OPTIONS = [
  { value: "SINGLE", label: "Célibataire" },
  { value: "MARRIED", label: "Marié(e)" },
  { value: "DIVORCED", label: "Divorcé(e)" },
  { value: "WIDOWED", label: "Veuf / Veuve" },
  { value: "SEPARATED", label: "Séparé(e)" },
] as const;

export function ProfileEditForm({
  profile,
}: {
  profile: EditableProfileData;
}) {
  const router = useRouter();
  const [maritalStatus, setMaritalStatus] = useState(
    profile.maritalStatus || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/member/profile-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(formData.get("firstName") ?? "").trim(),
          lastName: String(formData.get("lastName") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          city: String(formData.get("city") ?? "").trim(),
          address: String(formData.get("address") ?? "").trim(),
          maritalStatus: maritalStatus || null,
          bio: String(formData.get("bio") ?? "").trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setMessage({
          type: "error",
          text:
            payload?.message ??
            "Impossible de mettre à jour le profil. Veuillez réessayer.",
        });
        return;
      }

      setMessage({
        type: "success",
        text: payload?.message ?? "Profil mis à jour avec succès.",
      });
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "Erreur réseau. Vérifiez votre connexion puis réessayez.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            Prénom <span className="text-red-500">*</span>
          </label>

          <Input
            id="firstName"
            name="firstName"
            defaultValue={profile.firstName}
            required
            maxLength={100}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Nom <span className="text-red-500">*</span>
          </label>

          <Input
            id="lastName"
            name="lastName"
            defaultValue={profile.lastName}
            required
            maxLength={100}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Téléphone
          </label>

          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone}
            maxLength={30}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Ville
          </label>

          <Input
            id="city"
            name="city"
            defaultValue={profile.city}
            maxLength={120}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Adresse
          </label>

          <Input
            id="address"
            name="address"
            defaultValue={profile.address}
            maxLength={255}
            className="h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">État matrimonial</label>

          <Select
            value={maritalStatus || undefined}
            onValueChange={(value) => setMaritalStatus(value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>

            <SelectContent>
              {MARITAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Biographie
        </label>

        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio}
          rows={5}
          maxLength={2000}
          className="rounded-2xl"
          placeholder="Présentez-vous..."
        />
      </div>

      {message && (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
