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
  Sparkles,
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
import { useAuthStore } from '@/stores/auth-store';

// Form validation schema
const loginSchema = z.object({
  email: z.email('Veuillez entrer une adresse email valide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      setIsSuccess(true);
      toast.success('Connexion réussie!', {
        description: 'Bienvenue sur ChurchConnect',
      });
      
      // Redirect after success animation
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      toast.error('Erreur de connexion', {
        description: error instanceof Error ? error.message : 'Email ou mot de passe incorrect',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-spiritual">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gold-warm/20 rounded-full blur-3xl float-animation" />
          <div className="absolute bottom-32 right-16 w-96 h-96 bg-violet-light/30 rounded-full blur-3xl float-animation" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl pulse-glow" />
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
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center glow-gold">
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
            ChurchConnect
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl text-white/90 text-center max-w-md leading-relaxed"
          >
            Rejoignez notre communauté de foi et connectez-vous avec votre église comme jamais auparavant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-8"
          >
            {[
              { value: '500+', label: 'Membres' },
              { value: '50+', label: 'Événements/an' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gold-warm">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Decorative cross */}
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 0.15, rotate: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-16 right-16"
          >
            <svg width="120" height="180" viewBox="0 0 120 180" fill="white">
              <rect x="50" y="0" width="20" height="180" rx="4" />
              <rect x="10" y="60" width="100" height="20" rx="4" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
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
                <h2 className="text-2xl font-bold mb-2">Connexion réussie!</h2>
                <p className="text-muted-foreground">Redirection en cours...</p>
              </motion.div>
            ) : (
              /* Login Form */
              <Card className="border-0 shadow-xl shadow-primary/5 glow-soft" key="form">
                <CardHeader className="space-y-3 pb-6">
                  <motion.div variants={itemVariants}>
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full gradient-spiritual flex items-center justify-center">
                        <Church className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-center font-serif">
                      Bienvenue
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                      Connectez-vous à votre compte ChurchConnect
                    </CardDescription>
                  </motion.div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                      )}
                    </motion.div>

                    {/* Remember Me & Forgot Password */}
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          {...register('rememberMe')}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                          Se souvenir de moi
                        </label>
                      </div>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Mot de passe oublié?
                      </Link>
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
                            Connexion en cours...
                          </>
                        ) : (
                          'Se connecter'
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">
                        ou continuer avec
                      </span>
                    </div>
                  </motion.div>

                  {/* Social Login Buttons (Disabled for demo) */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-11 relative overflow-hidden cursor-not-allowed opacity-60"
                      disabled
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 relative overflow-hidden cursor-not-allowed opacity-60"
                      disabled
                    >
                      <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                  </motion.div>
                </CardContent>

                <CardFooter className="justify-center pb-6">
                  <motion.p
                    variants={itemVariants}
                    className="text-sm text-muted-foreground"
                  >
                    Pas encore inscrit?{' '}
                    <Link
                      href="/register"
                      className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      Créer un compte
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
