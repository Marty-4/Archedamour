'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Church,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Sparkles,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore, type RegisterData } from '@/stores/auth-store';

// Form validation schema
const registerSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.email('Veuillez entrer une adresse email valide'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[a-zA-Z]/, 'Le mot de passe doit contenir au moins une lettre')
      .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 25, label: 'Faible', color: 'bg-red-500' };
    if (score <= 4) return { level: 50, label: 'Moyen', color: 'bg-yellow-500' };
    if (score === 5) return { level: 75, label: 'Bon', color: 'bg-green-400' };
    return { level: 100, label: 'Excellent', color: 'bg-green-500' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[25, 50, 75, 100].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              strength.level >= level ? strength.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Force: {strength.label}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      });
      setIsSuccess(true);
      toast.success('Compte créé avec succès!', {
        description: "Bienvenue dans la communauté Arche d'Amour",
      });

      // Redirect after success animation
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      toast.error("Erreur d'inscription", {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'inscription",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-32 left-24 w-80 h-80 bg-gold-warm/20 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-24 right-20 w-96 h-96 bg-violet-light/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-2xl pulse-glow" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex flex-col justify-center items-center p-12 text-white"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
            className="mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center glow-violet">
                <Church className="w-14 h-14 text-gold-warm" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold-warm animate-pulse" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl font-bold mb-4 text-center font-serif"
          >
            Rejoignez-nous
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl text-white/90 text-center max-w-md leading-relaxed"
          >
            Créez votre compte et découvrez une nouvelle façon de vivre votre foi en communauté.
          </motion.p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-12 space-y-4 w-full max-w-sm"
          >
            {[
              { icon: Church, text: 'Accès à tous les événements de l\'église' },
              { icon: Shield, text: 'Sécurité et confidentialité garanties' },
              { icon: Sparkles, text: 'Communauté active et bienveillante' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3"
              >
                <div className="w-10 h-10 rounded-full bg-gold-warm/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-gold-warm" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative cross */}
          <motion.div
            initial={{ opacity: 0, rotate: 10 }}
            animate={{ opacity: 0.12, rotate: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-16 left-16"
          >
            <svg width="100" height="150" viewBox="0 0 100 150" fill="white">
              <rect x="42" y="0" width="16" height="150" rx="3" />
              <rect x="8" y="50" width="84" height="16" rx="3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md py-8"
        >
          {/* Success State */}
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Compte créé!</h2>
                <p className="text-muted-foreground">Redirection vers le tableau de bord...</p>
              </motion.div>
            ) : (
              /* Register Form */
              <Card className="border-0 shadow-xl shadow-primary/5 glow-soft" key="form">
                <CardHeader className="space-y-3 pb-6">
                  <motion.div variants={itemVariants}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
                        <Church className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-2xl sm:text-3xl font-bold text-center font-serif">
                      Créer un compte
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                      Rejoignez la communauté Arche d'Amour
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nom complet
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jean Dupont"
                          className={`pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20 ${
                            errors.name ? 'border-destructive focus:ring-destructive/20' : ''
                          }`}
                          {...register('name')}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Adresse email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className={`pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20 ${
                            errors.email ? 'border-destructive focus:ring-destructive/20' : ''
                          }`}
                          {...register('email')}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </motion.div>

                    {/* Phone Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Téléphone <span className="text-muted-foreground">(optionnel)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+225 00 000 000"
                          className={`pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20 ${
                            errors.phone ? 'border-destructive focus:ring-destructive/20' : ''
                          }`}
                          {...register('phone')}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </motion.div>

                    {/* Password Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 h-11 transition-all focus:ring-2 focus:ring-primary/20 ${
                            errors.password ? 'border-destructive focus:ring-destructive/20' : ''
                          }`}
                          {...register('password')}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <PasswordStrength password={passwordValue || ''} />
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 h-11 transition-all focus:ring-2 focus:ring-primary/20 ${
                            errors.confirmPassword ? 'border-destructive focus:ring-destructive/20' : ''
                          }`}
                          {...register('confirmPassword')}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Terms Checkbox */}
                    <motion.div variants={itemVariants}>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          {...register('acceptTerms')}
                          disabled={isLoading}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="acceptTerms"
                          className="text-sm text-muted-foreground cursor-pointer select-none leading-relaxed"
                        >
                          J&apos;accepte les{' '}
                          <Link
                            href="/terms"
                            className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                          >
                            conditions d&apos;utilisation
                          </Link>{' '}
                          et la{' '}
                          <Link
                            href="/privacy"
                            className="text-primary hover:text-primary/80 font-medium underline underline-offset-2"
                          >
                            politique de confidentialité
                          </Link>
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-sm text-destructive mt-1 ml-6">
                          {errors.acceptTerms.message}
                        </p>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold gradient-spiritual hover:opacity-90 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Création du compte...
                          </>
                        ) : (
                          'Créer mon compte'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>

                <CardFooter className="justify-center pb-6">
                  <motion.p
                    variants={itemVariants}
                    className="text-sm text-muted-foreground"
                  >
                    Déjà un compte?{' '}
                    <Link
                      href="/login"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      Se connecter
                    </Link>
                  </motion.p>
                </CardFooter>
              </Card>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
