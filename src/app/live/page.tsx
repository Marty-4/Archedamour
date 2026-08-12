'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Users,
  Clock,
  Calendar,
  MessageCircle,
  Send,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Play,
  Pause,
  ChevronRight,
  Bell,
  BellOff,
  Sparkles,
  Music,
  Tv,
  Video,
  Settings,
  Eye,
  Smile,
  ThumbsUp,
  ClappingHands,
  Pray,
  Flame,
  Star,
  History,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { PublicLayout } from '@/components/layouts/public-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
interface ChatMessage {
  id: string;
  user: string;
  initials: string;
  message: string;
  timestamp: string;
  isHost?: boolean;
}

interface PastStream {
  id: number;
  title: string;
  date: string;
  preacher: string;
  viewers: number;
  duration: string;
  hasRecording: boolean;
}

// Mock data
const currentStream = {
  title: "Culte du Dimanche - Matin",
  preacher: "Pasteur Jean-Marc Lumbu",
  description: "Série : 'Marcher dans la lumière' - Éphésiens chapitre 5",
  startedAt: "10h03",
  viewers: 347,
  thumbnail: "/api/placeholder/1280/720",
};

const upcomingStreams = [
  {
    id: 1,
    title: "Culte du Soir - Adoration",
    date: "Aujourd'hui",
    time: "14h30",
    preacher: "Pasteur Emmanuel Kamba",
    description: "Soirée de louange et d'adoration",
  },
  {
    id: 2,
    title: "Culte du Dimanche - Matin",
    date: "Dimanche prochain",
    time: "10h00",
    preacher: "Pasteur Jean-Marc Lumbu",
    description: "Prédication sur la foi",
  },
  {
    id: 3,
    title: "Étude Biblique en Direct",
    date: "Mercredi",
    time: "18h00",
    preacher: "Sœur Grace Mutombo",
    description: "Étude approfondie de l'épître aux Romains",
  },
  {
    id: 4,
    title: "Veillée de Prière de Fin d'Année",
    date: "31 Décembre 2024",
    time: "22h00",
    preacher: "Équipe Pastorale",
    description: "Une nuit de prière pour accueillir la nouvelle année",
  },
];

const pastStreams: PastStream[] = [
  {
    id: 1,
    title: "Culte du Dimanche - La Paix de Dieu",
    date: "Dimanche 15 Décembre",
    preacher: "Pasteur Jean-Marc Lumbu",
    viewers: 512,
    duration: "1h45min",
    hasRecording: true,
  },
  {
    id: 2,
    title: "Culte du Soir - Louange",
    date: "Dimanche 15 Décembre",
    preacher: "Équipe de Louange",
    viewers: 289,
    duration: "1h20min",
    hasRecording: true,
  },
  {
    id: 3,
    title: "Culte du Dimanche - L'Amour Véritable",
    date: "Dimanche 8 Décembre",
    preacher: "Pasteur Emmanuel Kamba",
    viewers: 478,
    duration: "1h52min",
    hasRecording: true,
  },
  {
    id: 4,
    title: "Conférence des Jeunes",
    date: "Samedi 7 Décembre",
    preacher: "Invité: Frère Paul M.",
    viewers: 234,
    duration: "2h10min",
    hasRecording: false,
  },
];

const initialChatMessages: ChatMessage[] = [
  { id: '1', user: 'Marie-Claire M.', initials: 'MC', message: 'Gloire à Dieu pour cette prédication !', timestamp: '10:05', isHost: false },
  { id: '2', user: 'Patrice Mbemba', initials: 'PM', message: 'Amen ! Que Dieu bénisse Sa Parole', timestamp: '10:06', isHost: false },
  { id: '3', user: 'Modérateur', initials: 'M', message: 'Bienvenue à tous les nouveaux ! N\'hésitez pas à vous présenter.', timestamp: '10:07', isHost: true },
  { id: '4', user: 'Esther T.', initials: 'ET', message: 'Je me joins depuis Kinshasa 🇨🇩', timestamp: '10:08', isHost: false },
  { id: '5', user: 'Frère Christian', initials: 'FC', message: 'Nous sommes plusieurs à suivre ici à Brazzaville', timestamp: '10:09', isHost: false },
  { id: '6', user: 'Sophie Ngalula', initials: 'SN', message: 'Que le Saint-Esprit nous parle aujourd\'hui !', timestamp: '10:10', isHost: false },
];

const emojiReactions = [
  { icon: Heart, label: '❤️', count: 24 },
  { icon: ThumbsUp, label: '👍', count: 18 },
  { icon: ClappingHands, label: '👏', count: 12 },
  { icon: Pray, label: '🙏', count: 31 },
  { icon: Flame, label: '🔥', count: 8 },
  { icon: Star, label: '⭐', count: 5 },
];

export default function LivePage() {
  const [isLive, setIsLive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [viewerCount, setViewerCount] = useState(currentStream.viewers);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate viewer count changes
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'Vous',
      initials: 'V',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleEmojiReaction = (emoji: string) => {
    // In a real app, this would send the reaction to the server
    console.log('Reaction:', emoji);
  };

  // Toggle live state for demo purposes
  const toggleLiveState = () => {
    setIsLive(!isLive);
  };

  return (
    <PublicLayout>
      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PageHeader
              title="Diffusion en Direct"
              description="Participez à nos cultes et événements en direct, où que vous soyez."
              breadcrumbs={[{ label: "Live" }]}
              className="text-white [&_h1]:text-white [&_p]:text-white/80 [&_li]:text-white/60 [&_a]:text-white hover:[&_a]:text-white"
            />

            {/* Live Status Toggle (for demo) */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLiveState}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Démo: {isLive ? 'Passer hors ligne' : 'Activer le direct'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {isLive ? (
              /* LIVE STATE */
              <motion.div
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Live Banner */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <span className="font-bold text-lg tracking-wide">EN DIRECT</span>
                  </motion.div>
                  
                  <Separator orientation="vertical" className="h-8 bg-white/30" />
                  
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">{viewerCount.toLocaleString('fr-FR')} spectateurs</span>
                  </div>

                  <Separator orientation="vertical" className="h-8 bg-white/30 hidden sm:block" />
                  
                  <p className="hidden sm:block font-medium">{currentStream.title}</p>

                  <div className="ml-auto flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          >
                            {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Player Area */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="overflow-hidden border-2 border-primary/20">
                      {/* Video Container */}
                      <div className="relative aspect-video bg-black">
                        {/* Placeholder for iframe/video embed */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <div className="text-center space-y-4">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Radio className="w-20 h-20 text-red-500 mx-auto" />
                            </motion.div>
                            <p className="text-white/80 text-lg">Diffusion en cours...</p>
                            <p className="text-white/50 text-sm">Lect vidéo intégré (YouTube/Facebook)</p>
                            
                            {/* Simulated play button overlay */}
                            {!isPlaying && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
                                onClick={() => setIsPlaying(true)}
                              >
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <Play className="w-10 h-10 text-white ml-1" />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                              onClick={() => setIsPlaying(!isPlaying)}
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                              onClick={() => setIsMuted(!isMuted)}
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>

                            {/* Progress bar placeholder */}
                            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-red-500"
                                initial={{ width: '0%' }}
                                animate={{ width: '35%' }}
                                transition={{ duration: 2, ease: 'linear' }}
                              />
                            </div>

                            <span className="text-white/70 text-sm">00:32:15</span>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20 hidden sm:flex"
                            >
                              <Maximize className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Live indicator corner */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-600 text-white border-0 px-3 py-1">
                            <motion.div
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-2 h-2 rounded-full bg-white mr-2 inline-block"
                            />
                            LIVE
                          </Badge>
                        </div>
                      </div>

                      {/* Stream Info */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h2 className="font-serif text-xl font-bold text-foreground">
                            {currentStream.title}
                          </h2>
                          <p className="text-muted-foreground mt-1">{currentStream.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {currentStream.preacher}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Démarré à {currentStream.startedAt}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {viewerCount.toLocaleString('fr-FR')} spectateurs
                          </span>
                        </div>

                        {/* Emoji Reactions */}
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-sm text-muted-foreground mr-2">Réagir :</span>
                          {emojiReactions.map((reaction) => {
                            const Icon = reaction.icon;
                            return (
                              <TooltipProvider key={reaction.label}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleEmojiReaction(reaction.label)}
                                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-accent transition-colors"
                                    >
                                      <span>{reaction.label}</span>
                                      <span className="text-xs text-muted-foreground">{reaction.count}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>{reaction.count} personnes</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Live Chat Sidebar */}
                  <div className="space-y-4">
                    <Card className="h-[500px] flex flex-col">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MessageCircle className="w-5 h-5 text-primary" />
                          Chat en Direct
                          <Badge variant="secondary" className="ml-auto">
                            {chatMessages.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
                          {chatMessages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-start gap-3 ${msg.isHost ? 'bg-primary/5 p-3 rounded-lg -mx-3' : ''}`}
                            >
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className={
                                  msg.isHost 
                                    ? 'gradient-spiritual text-white text-xs' 
                                    : 'bg-muted text-muted-foreground text-xs'
                                }>
                                  {msg.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium text-sm ${msg.isHost ? 'text-primary' : 'text-foreground'}`}>
                                    {msg.user}
                                  </span>
                                  {msg.isHost && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      Modo
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm text-foreground break-words mt-0.5">{msg.message}</p>
                              </div>
                            </motion.div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Emoji Quick Actions */}
                        <div className="flex items-center gap-1 px-4 py-2 border-t">
                          <TooltipProvider>
                            {['😊', '🙏', '❤️', '👍', '🙌', '🎉'].map((emoji) => (
                              <Tooltip key={emoji}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setNewMessage(emoji)}
                                    className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center text-lg transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>{emoji}</TooltipContent>
                                  </Tooltip>
                                ))}
                          </TooltipProvider>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                            className="flex gap-2"
                          >
                            <Input
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Envoyer un message..."
                              className="rounded-lg"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={!newMessage.trim()}
                              className="gradient-spiritual text-white rounded-lg shrink-0"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </form>
                          <p className="text-xs text-muted-foreground mt-2">
                            Soyez respectueux dans vos échanges. Les messages modérés apparaissent avec un badge.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Admin Studio Link */}
                <div className="text-center pt-4">
                  <Link href="/admin/live-studio">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Settings className="w-4 h-4 mr-2" />
                      Accès Studio Live (Admin)
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* OFFLINE STATE */
              <motion.div
                key="offline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* No Live Banner */}
                <Card className="border-dashed border-2 border-border/50">
                  <CardContent className="py-16 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"
                    >
                      <Tv className="w-12 h-12 text-muted-foreground/50" />
                    </motion.div>
                    
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                      Aucune diffusion en cours
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Il n&apos;y a actuellement aucune diffusion en direct. Revenez bientôt ou consultez 
                      nos prochains événements planifiés.
                    </p>

                    {/* Notification Subscription */}
                    <div className="max-w-sm mx-auto mb-8">
                      <Button
                        variant="outline"
                        className={`w-full rounded-xl h-12 ${
                          notificationsEnabled 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                            : ''
                        }`}
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      >
                        {notificationsEnabled ? (
                          <>
                            <Bell className="w-5 h-5 mr-2" />
                            Notifications activées ✓
                          </>
                        ) : (
                          <>
                            <BellOff className="w-5 h-5 mr-2" />
                            Me notifier au prochain direct
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Scheduled Streams */}
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Prochaines diffusions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingStreams.map((stream, index) => (
                      <motion.div
                        key={stream.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-shadow group">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl gradient-spiritual flex items-center justify-center shrink-0">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {stream.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {stream.description || stream.preacher}
                                </p>
                                
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                  <span className="flex items-center gap-1 text-primary font-medium">
                                    <Clock className="w-4 h-4" />
                                    {stream.time}
                                  </span>
                                  <span className="text-muted-foreground">{stream.date}</span>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setNotificationsEnabled(true)}
                              >
                                <Bell className="w-4 h-4" />
                                <span className="sr-only">Me rappeler</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Past Streams / Recordings */}
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Diffusions précédentes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastStreams.map((stream, index) => (
                      <motion.div
                        key={stream.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                      >
                        <Card className="hover:shadow-md transition-shadow group overflow-hidden">
                          {/* Thumbnail placeholder */}
                          <div className="aspect-video bg-gradient-to-br from-violet-900 to-purple-900 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white/50" />
                            </div>
                            
                            {/* Duration badge */}
                            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
                              {stream.duration}
                            </Badge>

                            {/* Recording available indicator */}
                            {stream.hasRecording && (
                              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white border-0">
                                Disponible
                              </Badge>
                            )}
                          </div>

                          <CardContent className="p-4">
                            <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {stream.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                              <span>{stream.date}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {stream.viewers}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PublicLayout>
  );
}
