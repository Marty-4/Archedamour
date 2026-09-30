'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const forgotSchema = z.object({
  email: z.string().min(1, 'L\'email est requis').email('Veuillez entrer une adresse email valide'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

/**
 * Demande de réinitialisation de mot de passe.
 * L'API répond toujours de manière identique (sans révéler si l'email existe),
 * sauf en développement où elle renvoie aussi le token pour tester le flux
 * sans infrastructure d'envoi d'email.
 */
export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message ?? 'Une erreur est survenue');
      }

      setIsSubmitted(true);
      if (json?.resetToken) {
        // Mode développement uniquement (renvoyé par l'API en NODE_ENV=dev)
        setDevResetToken(json.resetToken as string);
      }
    } catch (error) {
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer plus tard.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block" aria-label="Arche d'Amour — accueil">
            { }
            <img
              src="/icons/LogoArche.jpg"
              alt="Arche d'Amour"
              className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-md"
            />
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nous vous enverrons un lien de réinitialisation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              Récupération d&apos;accès
            </CardTitle>
            <CardDescription>
              Entrez l&apos;adresse email associée à votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4" role="status">
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p>
                    Si un compte existe avec cet email, un lien de réinitialisation
                    a été envoyé. Vérifiez votre boîte de réception (et vos spams).
                  </p>
                </div>

                {devResetToken && (
                  <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
                    <p className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-200">
                      <TerminalSquare className="h-4 w-4" />
                      Mode développement
                    </p>
                    <p className="mt-1 text-amber-800 dark:text-amber-300">
                      Aucun service d&apos;email n&apos;est configuré : ouvrez
                      directement la page de réinitialisation.
                    </p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href={`/reset-password?token=${encodeURIComponent(devResetToken)}`}>
                        Définir un nouveau mot de passe
                      </Link>
                    </Button>
                  </div>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      className="pl-10"
                      aria-invalid={!!errors.email}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Envoyer le lien de réinitialisation
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
