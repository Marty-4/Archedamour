import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  CalendarDays,
  CheckCircle2,
  Church,
  Clock3,
  CreditCard,
  FileText,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Mic as MicIcon,
  Music2,
  PlayCircle,
  UserRound,
  Users,
  Video,
} from "lucide-react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/db";
import { SESSION_CONFIG } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { ProfileEditForm } from "@/components/member/profile-edit-form";
import { AvatarUpload } from "@/components/member/avatar-upload";
import { GroupChat } from "@/components/member/group-chat";

const labels: Record<
  string,
  {
    title: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  profile: {
    title: "Mon profil",
    description:
      "Gérez vos informations personnelles et votre profil membre.",
    icon: UserRound,
  },

  cultes: {
    title: "Cultes",
    description: "Les prochains cultes de votre église.",
    icon: Church,
  },

  predications: {
    title: "Prédications",
    description: "La bibliothèque des enseignements.",
    icon: Video,
  },

  evenements: {
    title: "Événements",
    description: "Les événements ouverts aux inscriptions.",
    icon: CalendarDays,
  },

  prieres: {
    title: "Prières",
    description: "Demandes de prière de la communauté.",
    icon: Heart,
  },

  dons: {
    title: "Mes dons",
    description: "Votre historique de dons.",
    icon: CreditCard,
  },

  groupes: {
    title: "Mes groupes",
    description: "Votre groupe de maison.",
    icon: Users,
  },

  "groupes-chat": {
    title: "Discussion",
    description: "Le chat de votre groupe de maison.",
    icon: MessageCircle,
  },

  communaute: {
    title: "Communauté",
    description: "Publications de la communauté.",
    icon: MessageCircle,
  },

  bibliotheque: {
    title: "Bibliothèque",
    description: "Cours et ressources disponibles.",
    icon: FileText,
  },

  louange: {
    title: "Louange",
    description: "Prédications et contenus de louange.",
    icon: Music2,
  },
};

const formatDate = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
});

const formatDateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatStatus(status?: string | null) {
  if (!status) return "Non renseigné";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

function formatMoney(amount: number, currency: string) {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function getInitials(name?: string | null) {
  if (!name) return "M";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((value) => value.charAt(0))
    .join("")
    .toUpperCase();
}

async function currentUser() {
  const sessionUser = await getSessionUser(
    (await cookies()).get(SESSION_CONFIG.cookieName)?.value,
  );

  if (!sessionUser) return null;

  let user = await db.user.findUnique({
    where: {
      id: sessionUser.id,
    },
    include: {
      memberProfile: {
        include: {
          department: true,
          group: {
            include: {
              leader: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  if (!user.memberProfile) {
    const church = await db.church.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!church) {
      return user;
    }

    const nameParts = (user.name ?? "Membre À compléter")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const firstName = nameParts[0] ?? "Membre";

    const lastName =
      nameParts.slice(1).join(" ") || "À compléter";

    await db.memberProfile.create({
      data: {
        userId: user.id,
        churchId: church.id,
        firstName,
        lastName,
        phone: null,
        birthDate: null,
        gender: null,
        address: null,
        city: null,
        membershipDate: null,
        baptismDate: null,
        maritalStatus: null,
        departmentId: null,
        groupId: null,
        bio: null,
        status: "ACTIVE",
      },
    });

    user = await db.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        memberProfile: {
          include: {
            department: true,
            group: {
              include: {
                leader: true,
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return user;
}

export default async function MemberSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  const meta = labels[section];

  if (!meta) {
    notFound();
  }

  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }


const profile = user.memberProfile;

let content: React.ReactNode = null;



if (section === "profile") {
  if (!profile) {
    content = (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Profil incomplet</CardTitle>
          <CardDescription>
            Votre profil membre n'est pas encore disponible.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contactez l'administration de l'église pour finaliser votre profil.
          </p>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <ProfileSection
        user={user}
        profile={profile}
      />
    );
  }
}
    const churchId = profile?.churchId;

  const Icon = meta.icon;




  /*
   * ============================================================
   * CULTES
   * ============================================================
   */
  if (section === "cultes") {
    const services = churchId
      ? await db.service.findMany({
          where: {
            churchId,
            date: {
              gte: new Date(),
            },
            status: {
              in: ["SCHEDULED", "ONGOING"],
            },
          },
          take: 50,
          orderBy: {
            date: "asc",
          },
          include: {
            preacher: true,
          },
        })
      : [];

    content = services.length ? (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className="overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <CardContent className="p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Church className="h-5 w-5" />
                </div>

                <Badge variant="secondary">
                  {formatStatus(service.status)}
                </Badge>
              </div>

              <h3 className="text-xl font-semibold">
                {service.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {service.description ??
                  "Retrouvez-nous pour ce moment de communion et de partage."}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <InfoLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  text={formatDateTime.format(service.date)}
                />

                <InfoLine
                  icon={<Clock3 className="h-4 w-4" />}
                  text={`${formatTime(service.startTime)} - ${formatTime(
                    service.endTime,
                  )}`}
                />

                <InfoLine
                  icon={<MapPin className="h-4 w-4" />}
                  text={service.location ?? "Lieu à définir"}
                />

                <InfoLine
                  icon={<UserRound className="h-4 w-4" />}
                  text={service.preacher?.name ?? "Prédicateur non renseigné"}
                />
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Badge variant="outline">
                  {formatStatus(service.type)}
                </Badge>

                {service.liveUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                  >
                    <a
                      href={service.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Live
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Church className="h-6 w-6" />}
        title="Aucun culte à venir"
        description="Les prochains cultes de votre église apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * PREDICATIONS
   * ============================================================
   */
  if (section === "predications") {
    const sermons = churchId
      ? await db.sermon.findMany({
          where: {
            churchId,
          },
          take: 50,
          orderBy: {
            date: "desc",
          },
          include: {
            preacher: true,
            category: true,
            series: true,
            recordedBy: { select: { id: true, name: true } },
          },
        })
      : [];

    content = sermons.length ? (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sermons.map((sermon) => (
          <Card
            key={sermon.id}
            className="overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {sermon.thumbnail ? (
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={sermon.thumbnail}
                  alt={sermon.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                <Video className="h-12 w-12 text-primary/60" />
              </div>
            )}

            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">
                  {formatStatus(sermon.type)}
                </Badge>

                {sermon.category?.name && (
                  <span className="text-xs text-muted-foreground">
                    {sermon.category.name}
                  </span>
                )}
              </div>

              <h3 className="mt-4 line-clamp-2 text-xl font-semibold">
                {sermon.title}
              </h3>

              {sermon.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {sermon.description}
                </p>
              )}

              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <InfoLine
                  icon={<UserRound className="h-4 w-4" />}
                  text={sermon.preacher.name ?? "Prédicateur"}
                />

                {sermon.audioUrl && sermon.recordedBy?.name && (
                  <InfoLine
                    icon={<MicIcon className="h-4 w-4" />}
                    text={`Enregistré par ${sermon.recordedBy.name}`}
                  />
                )}

                <InfoLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  text={formatDate.format(sermon.date)}
                />

                {sermon.duration && (
                  <InfoLine
                    icon={<Clock3 className="h-4 w-4" />}
                    text={`${sermon.duration} minutes`}
                  />
                )}
              </div>

              {(sermon.videoUrl ||
                sermon.audioUrl ||
                sermon.documentUrl) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {sermon.videoUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl"
                    >
                      <a
                        href={sermon.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Vidéo
                      </a>
                    </Button>
                  )}

                  {sermon.audioUrl && (
                    <div className="w-full space-y-2">
                      {/* Lecteur intégré : écoute directe dans l'app. */}
                      { }
                      <audio
                        controls
                        preload="none"
                        src={sermon.audioUrl}
                        className="w-full"
                      />
                      {sermon.downloadsAllowed && (
                        <a
                          href={sermon.audioUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4"
                        >
                          Télécharger l'audio
                        </a>
                      )}
                    </div>
                  )}

                  {sermon.documentUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                    >
                      <a
                        href={sermon.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Video className="h-6 w-6" />}
        title="Aucune prédication"
        description="Les enseignements disponibles apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * EVENEMENTS
   * ============================================================
   */
  if (section === "evenements") {
    const events = churchId
      ? await db.event.findMany({
          where: {
            churchId,
            status: "PUBLISHED",
          },
          take: 50,
          orderBy: {
            date: "asc",
          },
          include: {
            _count: {
              select: {
                registrations: true,
              },
            },
            organizer: true,
          },
        })
      : [];

    content = events.length ? (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {event.image ? (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                <CalendarDays className="h-12 w-12 text-primary/60" />
              </div>
            )}

            <CardContent className="p-6">
              <Badge variant="secondary">
                Événement
              </Badge>

              <h3 className="mt-4 text-xl font-semibold">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <InfoLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  text={formatDateTime.format(event.date)}
                />

                <InfoLine
                  icon={<Clock3 className="h-4 w-4" />}
                  text={`${formatTime(event.startTime)} - ${formatTime(
                    event.endTime,
                  )}`}
                />

                <InfoLine
                  icon={<MapPin className="h-4 w-4" />}
                  text={event.location ?? "Lieu à définir"}
                />

                <InfoLine
                  icon={<Users className="h-4 w-4" />}
                  text={`${event._count.registrations} inscrit${
                    event._count.registrations > 1 ? "s" : ""
                  }`}
                />
              </div>

              <Button className="mt-6 w-full rounded-xl">
                Voir l’événement
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="Aucun événement disponible"
        description="Les événements ouverts aux membres apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * PRIERES
   * ============================================================
   */
  if (section === "prieres") {
    const prayers = churchId
      ? await db.prayerRequest.findMany({
          where: {
            churchId,
            visibility: "COMMUNITY",
          },
          take: 50,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        })
      : [];

    content = prayers.length ? (
      <div className="grid gap-5 md:grid-cols-2">
        {prayers.map((prayer) => (
          <Card
            key={prayer.id}
            className="rounded-3xl transition-all duration-300 hover:shadow-xl"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>

                <Badge
                  variant={
                    prayer.isAnswered ? "default" : "secondary"
                  }
                >
                  {prayer.isAnswered
                    ? "Exaucée"
                    : "En attente"}
                </Badge>
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                {prayer.title}
              </h3>

              {prayer.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {prayer.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {prayer.user.name ?? "Membre"}
                </span>

                <span>
                  {prayer.prayerCount} prière
                  {prayer.prayerCount > 1 ? "s" : ""}
                </span>

                <span>
                  {formatDate.format(prayer.createdAt)}
                </span>
              </div>

              <Button
                variant="outline"
                className="mt-6 rounded-xl"
              >
                <Heart className="mr-2 h-4 w-4" />
                Je prie
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Heart className="h-6 w-6" />}
        title="Aucune demande de prière"
        description="Les demandes visibles par la communauté apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * DONS
   * ============================================================
   */
  if (section === "dons") {
    const donations = await db.donation.findMany({
      where: {
        userId: user.id,
      },
      take: 50,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        category: true,
      },
    });

    const totalCompleted = donations
      .filter((donation) => donation.status === "COMPLETED")
      .reduce((total, donation) => total + donation.amount, 0);

    content = donations.length ? (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Nombre de dons"
            value={String(donations.length)}
            icon={<CreditCard className="h-5 w-5" />}
          />

          <StatCard
            label="Total versé"
            value={formatMoney(
              totalCompleted,
              donations[0]?.currency ?? "XAF",
            )}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            label="Dernier don"
            value={
              donations[0]
                ? formatDate.format(donations[0].paymentDate)
                : "—"
            }
            icon={<CalendarDays className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-4">
          {donations.map((donation) => (
            <Card
              key={donation.id}
              className="rounded-3xl"
            >
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {donation.category.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {donation.method ?? "Moyen non renseigné"}
                      {" · "}
                      {formatDateTime.format(donation.paymentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {formatStatus(donation.status)}
                  </Badge>

                  <p className="text-lg font-bold">
                    {formatMoney(
                      donation.amount,
                      donation.currency,
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ) : (
      <EmptyState
        icon={<CreditCard className="h-6 w-6" />}
        title="Aucun don enregistré"
        description="Votre historique de dons apparaîtra ici."
      />
    );
  }

  /*
   * ============================================================
   * GROUPES
   * ============================================================
   */
  if (section === "groupes") {
    const group = profile?.group;

    content = group ? (
      <Card className="overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="secondary">
                {formatStatus(group.status)}
              </Badge>

              <h2 className="mt-3 text-3xl font-bold">
                {group.name}
              </h2>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                {group.description ??
                  "Votre groupe de vie et de partage."}
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-background/80 shadow-sm">
              <Users className="h-9 w-9 text-primary" />
            </div>
          </div>
        </div>

        <CardContent className="grid gap-5 p-8 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Membres"
            value={String(group._count.members)}
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Responsable"
            value={group.leader?.name ?? "Non renseigné"}
            icon={<UserRound className="h-5 w-5" />}
          />

          <StatCard
            label="Jour"
            value={group.meetingDay ?? "Non renseigné"}
            icon={<CalendarDays className="h-5 w-5" />}
          />

          <StatCard
            label="Lieu"
            value={group.location ?? "À définir"}
            icon={<MapPin className="h-5 w-5" />}
          />
        </CardContent>
      </Card>
    ) : (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Vous n’avez pas encore de groupe"
        description="Lorsqu’un groupe vous sera attribué, ses informations apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * GROUPES — CHAT (section /member/groupes/chat)
   * ============================================================
   */
  if (section === "groupes-chat") {
    const group = profile?.group;

    content = group ? (
      <GroupChat groupId={group.id} currentUserId={user.id} />
    ) : (
      <EmptyState
        icon={<MessageCircle className="h-6 w-6" />}
        title="Aucune discussion disponible"
        description="Vous rejoindrez la discussion de votre groupe dès qu'il vous sera attribué."
      />
    );
  }

  /*
   * ============================================================
   * COMMUNAUTE
   * ============================================================
   */
  if (section === "communaute") {
    const posts = churchId
      ? await db.post.findMany({
          where: {
            churchId,
            visibility: {
              in: ["PUBLIC", "MEMBERS"],
            },
          },
          take: 50,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true,
          },
        })
      : [];

    content = posts.length ? (
      <div className="mx-auto grid max-w-4xl gap-5">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="rounded-3xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {getInitials(post.user.name)}
                </div>

                <div>
                  <p className="font-semibold">
                    {post.user.name ?? "Membre"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatDateTime.format(post.createdAt)}
                  </p>
                </div>

                <div className="ml-auto">
                  <Badge variant="secondary">
                    {formatStatus(post.type)}
                  </Badge>
                </div>
              </div>

              <p className="mt-5 whitespace-pre-line text-sm leading-7">
                {post.content}
              </p>

              {post.imageUrl && (
                <div className="mt-5 overflow-hidden rounded-2xl">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="max-h-[480px] w-full object-cover"
                  />
                </div>
              )}

              <div className="mt-5 flex items-center gap-6 border-t pt-4 text-sm text-muted-foreground">
                <span>
                  {post.likesCount} J'aime
                </span>

                <span>
                  {post.commentsCount} commentaire
                  {post.commentsCount > 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<MessageCircle className="h-6 w-6" />}
        title="La communauté est encore calme"
        description="Les publications visibles par les membres apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * BIBLIOTHEQUE
   * ============================================================
   */
  if (section === "bibliotheque") {
    const courses = churchId
      ? await db.course.findMany({
          where: {
            churchId,
            status: "PUBLISHED",
          },
          take: 50,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            instructor: true,
            _count: {
              select: {
                modules: true,
              },
            },
          },
        })
      : [];

    content = courses.length ? (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {course.image ? (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                <FileText className="h-12 w-12 text-primary/60" />
              </div>
            )}

            <CardContent className="p-6">
              <Badge variant="secondary">
                Formation
              </Badge>

              <h3 className="mt-4 text-xl font-semibold">
                {course.title}
              </h3>

              {course.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {course.description}
                </p>
              )}

              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <InfoLine
                  icon={<UserRound className="h-4 w-4" />}
                  text={
                    course.instructor?.name ??
                    "Église"
                  }
                />

                <InfoLine
                  icon={<FileText className="h-4 w-4" />}
                  text={`${course._count.modules} module${
                    course._count.modules > 1 ? "s" : ""
                  }`}
                />

                <InfoLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  text={formatDate.format(course.createdAt)}
                />
              </div>

              <Button className="mt-6 w-full rounded-xl">
                Accéder au cours
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Bibliothèque vide"
        description="Les cours publiés par votre église apparaîtront ici."
      />
    );
  }

  /*
   * ============================================================
   * LOUANGE
   * ============================================================
   */
  if (section === "louange") {
    const worship = churchId
      ? await db.sermon.findMany({
          where: {
            churchId,
            OR: [
              {
                category: {
                  name: {
                    contains: "louange",
                  },
                },
              },
              {
                title: {
                  contains: "louange",
                },
              },
            ],
          },
          take: 50,
          orderBy: {
            date: "desc",
          },
          include: {
            preacher: true,
            category: true,
          },
        })
      : [];

    content = worship.length ? (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {worship.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-violet-500/20 via-primary/10 to-transparent">
              <Music2 className="h-14 w-14 text-primary/60" />
            </div>

            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {item.category?.name ?? "Louange"}
                </Badge>

                <Music2 className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mt-4 line-clamp-2 text-xl font-semibold">
                {item.title}
              </h3>

              {item.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              )}

              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <InfoLine
                  icon={<UserRound className="h-4 w-4" />}
                  text={item.preacher.name ?? "Église"}
                />

                <InfoLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  text={formatDate.format(item.date)}
                />
              </div>

              {(item.videoUrl || item.audioUrl) && (
                <div className="mt-6 flex gap-2">
                  {item.videoUrl && (
                    <Button
                      asChild
                      className="rounded-xl"
                    >
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Écouter / Voir
                      </a>
                    </Button>
                  )}

                  {item.audioUrl && !item.videoUrl && (
                    <Button
                      asChild
                      className="rounded-xl"
                    >
                      <a
                        href={item.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Écouter
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={<Music2 className="h-6 w-6" />}
        title="Aucun contenu de louange"
        description="Les contenus de louange apparaîtront ici."
      />
    );
  }

  return (
    <DashboardLayout
      variant="member"
      user={{
        name: user.name,
        email: user.email,
        image: user.avatar,
        role: user.role,
      }}
    >
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Espace membre
              </p>

              <h1 className="font-serif text-3xl font-bold tracking-tight">
                {meta.title}
              </h1>

              <p className="mt-1 text-muted-foreground">
                {meta.description}
              </p>
            </div>
          </div>

          {section !== "profile" && (
            <Badge
              variant="outline"
              className="w-fit rounded-full px-4 py-2"
            >
              {content ? "Données actualisées" : "Espace membre"}
            </Badge>
          )}
        </div>

        {/* CONTENT */}
        {content}
      </div>
    </DashboardLayout>
  );
}

/* ============================================================
 * PROFILE
 * ============================================================ */

function ProfileSection({
  user,
  profile,
}: {
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  profile: NonNullable<
    NonNullable<Awaited<ReturnType<typeof currentUser>>>["memberProfile"]
  >;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      {/* PROFILE CARD */}
      <Card className="overflow-hidden rounded-3xl">
        <div className="h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/30" />

        <CardContent className="relative px-6 pb-7">
          <div className="-mt-14 mb-5">
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-xl">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name ?? "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {getInitials(
                    `${profile.firstName} ${profile.lastName}`,
                  )}
                </span>
              )}

              <AvatarUpload hasAvatar={Boolean(user?.avatar)} />
            </div>
          </div>

          <h2 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {user?.email}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {formatStatus(profile.status)}
            </Badge>

            <Badge variant="outline">
              {formatStatus(user?.role)}
            </Badge>
          </div>

          <div className="mt-6 space-y-4">
            <ProfileInfo
              icon={<MapPin className="h-4 w-4" />}
              label="Ville"
              value={profile.city ?? "Non renseignée"}
            />

            <ProfileInfo
              icon={<UserRound className="h-4 w-4" />}
              label="Département"
              value={
                profile.department?.name ??
                "Aucun département"
              }
            />

            <ProfileInfo
              icon={<Users className="h-4 w-4" />}
              label="Groupe"
              value={
                profile.group?.name ??
                "Aucun groupe"
              }
            />

            <ProfileInfo
              icon={<CalendarDays className="h-4 w-4" />}
              label="Membre depuis"
              value={
                profile.membershipDate
                  ? formatDate.format(profile.membershipDate)
                  : "Non renseigné"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* PROFILE INFORMATION */}
      <div className="space-y-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Les informations enregistrées pour votre profil membre.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            <ProfileField
              label="Prénom"
              value={profile.firstName}
            />

            <ProfileField
              label="Nom"
              value={profile.lastName}
            />

            <ProfileField
              label="Email"
              value={user?.email ?? "—"}
            />

            <ProfileField
              label="Téléphone"
              value={profile.phone ?? "Non renseigné"}
            />

            <ProfileField
              label="Date de naissance"
              value={
                profile.birthDate
                  ? formatDate.format(profile.birthDate)
                  : "Non renseignée"
              }
            />

            <ProfileField
              label="Genre"
              value={formatStatus(profile.gender)}
            />

            <ProfileField
              label="État matrimonial"
              value={formatStatus(
                profile.maritalStatus,
              )}
            />

            <ProfileField
              label="Ville"
              value={profile.city ?? "Non renseignée"}
            />

            <ProfileField
              label="Adresse"
              value={profile.address ?? "Non renseignée"}
            />

            <ProfileField
              label="Date d'adhésion"
              value={
                profile.membershipDate
                  ? formatDate.format(profile.membershipDate)
                  : "Non renseignée"
              }
            />

            <ProfileField
              label="Date de baptême"
              value={
                profile.baptismDate
                  ? formatDate.format(profile.baptismDate)
                  : "Non renseignée"
              }
            />

            <ProfileField
              label="Statut du profil"
              value={formatStatus(profile.status)}
            />
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>À propos de moi</CardTitle>
            <CardDescription>
              Votre présentation personnelle.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-2xl bg-muted/50 p-5 text-sm leading-7">
              {profile.bio?.trim()
                ? profile.bio
                : "Aucune biographie renseignée pour le moment."}
            </div>
          </CardContent>
        </Card>

        {/* EDITION */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Modifier mon profil</CardTitle>
            <CardDescription>
              Mettez à jour les informations que vous pouvez gérer
              vous-même.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfileEditForm
              profile={{
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone ?? "",
                city: profile.city ?? "",
                address: profile.address ?? "",
                maritalStatus: profile.maritalStatus ?? "",
                bio: profile.bio ?? "",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function ProfileInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
 * HELPERS
 * ============================================================ */

function InfoLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="shrink-0 text-primary">
        {icon}
      </span>

      <span className="truncate">
        {text}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 line-clamp-2 text-xl font-bold">
              {value}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-3xl border-dashed">
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <h3 className="mt-5 text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}