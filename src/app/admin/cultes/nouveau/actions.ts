
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const createServiceSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Le titre du culte est obligatoire.")
      .max(150, "Le titre ne peut pas dépasser 150 caractères."),

    description: z
      .string()
      .trim()
      .max(2000, "La description ne peut pas dépasser 2000 caractères.")
      .optional(),

    type: z.enum([
      "SUNDAY_SERVICE",
      "WEEKDAY_PRAYER",
      "BIBLE_STUDY",
      "VIGIL",
      "CONFERENCE",
      "SEMINAR",
      "RETREAT",
      "OTHER",
    ]),

    date: z.string().min(1, "La date est obligatoire."),

    startTime: z.string().min(1, "L'heure de début est obligatoire."),

    endTime: z.string().min(1, "L'heure de fin est obligatoire."),

    location: z
      .string()
      .trim()
      .max(200, "Le lieu ne peut pas dépasser 200 caractères.")
      .optional(),

    preacherId: z.string().optional(),

    image: z
      .string()
      .trim()
      .url("L'URL de l'image est invalide.")
      .optional()
      .or(z.literal("")),

    liveUrl: z
      .string()
      .trim()
      .url("L'URL du live est invalide.")
      .optional()
      .or(z.literal("")),

    status: z.enum([
      "SCHEDULED",
      "ONGOING",
      "COMPLETED",
      "CANCELLED",
    ]),
  })
  .superRefine((data, ctx) => {
    const start = new Date(`${data.date}T${data.startTime}:00`);
    const end = new Date(`${data.date}T${data.endTime}:00`);

    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "La date ou l'heure est invalide.",
      });

      return;
    }

    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "L'heure de fin est invalide.",
      });

      return;
    }

    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "L'heure de fin doit être après l'heure de début.",
      });
    }
  });

type CreateServiceState = {
  error?: string;
  success?: boolean;
};

export async function createService(
  _previousState: CreateServiceState,
  formData: FormData,
): Promise<CreateServiceState> {
  // Hors du try/catch : requireAdmin() déclenche une redirection (NEXT_REDIRECT)
  // pour les non-admins — une exception à laisser remonter, jamais à intercepter.
  await requireAdmin();

  try {
    const raw = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      type: formData.get("type"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      location: formData.get("location") || undefined,
      preacherId: formData.get("preacherId") || undefined,
      image: formData.get("image") || "",
      liveUrl: formData.get("liveUrl") || "",
      status: formData.get("status"),
    };

    const parsed = createServiceSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Données invalides.",
      };
    }

    const data = parsed.data;

    // L'application utilise une seule église.
    // On récupère donc simplement l'église existante.
    const church = await db.church.findFirst({
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!church) {
      return {
        error:
          "Aucune église n'est configurée dans l'application. Configurez d'abord l'église.",
      };
    }

    // Sécurise la relation avec le prédicateur.
    if (data.preacherId) {
      const preacher = await db.user.findUnique({
        where: {
          id: data.preacherId,
        },
        select: {
          id: true,
        },
      });

      if (!preacher) {
        return {
          error: "Le prédicateur sélectionné est introuvable.",
        };
      }
    }

    const startTime = new Date(`${data.date}T${data.startTime}:00`);
    const endTime = new Date(`${data.date}T${data.endTime}:00`);

    await db.service.create({
      data: {
        churchId: church.id,
        title: data.title,
        description: data.description || null,
        type: data.type,
        date: new Date(`${data.date}T00:00:00`),
        startTime,
        endTime,
        location: data.location || null,
        preacherId: data.preacherId || null,
        image: data.image || null,
        liveUrl: data.liveUrl || null,
        status: data.status,
      },
    });
  } catch (error) {
    // Ce catch ne doit capturer QUE les erreurs inattendues (base de données...).
    // Les redirections Next.js (NEXT_REDIRECT) ne passent jamais par ici car
    // redirect() est appelé hors du bloc try.
    console.error("Erreur lors de la création du culte :", error);

    return {
      error: "Impossible de créer le culte. Veuillez réessayer.",
    };
  }

  // Hors du try/catch : redirect() lance une exception NEXT_REDIRECT qui ne
  // doit pas être interceptée par le catch ci-dessus (sinon l'utilisateur voit
  // une erreur alors que le culte a bien été créé).
  revalidatePath("/admin/cultes");
  redirect("/admin/cultes");
}
