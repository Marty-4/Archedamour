'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// External store for PWA state
const pwaStore = {
  value: {
    isInstalled: false,
    isIOS: false,
  },
  listeners: new Set<() => void>(),
  getSnapshot() {
    return pwaStore.value;
  },
  getServerSnapshot() {
    return { isInstalled: false, isIOS: false };
  },
  subscribe(listener: () => void) {
    pwaStore.listeners.add(listener);
    return () => pwaStore.listeners.delete(listener);
  },
  notify() {
    pwaStore.value = { ...pwaStore.value };
    pwaStore.listeners.forEach(l => l());
  }
};

// Initialize on module load
if (typeof window !== 'undefined') {
  pwaStore.value.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  
  const isIPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  pwaStore.value.isIOS = !!(isIPhone && isSafari);
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  
  // Use external store for installed/iOS state
  const { isInstalled, isIOS } = useSyncExternalStore(
    pwaStore.subscribe,
    pwaStore.getSnapshot,
    pwaStore.getServerSnapshot
  );

  useEffect(() => {
    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    const handleAppInstalled = () => {
      pwaStore.value.isInstalled = true;
      pwaStore.notify();
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      pwaStore.value.isInstalled = true;
      pwaStore.notify();
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't show if: installed or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  // Don't show if no prompt available and not iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <Card className="border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30">
      <CardContent className="p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/25">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Installer Arche d&apos;Amour</h4>
              <p className="text-xs text-muted-foreground">
                Accédez rapidement depuis votre écran d&apos;accueil
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {deferredPrompt ? (
              <Button
                size="sm"
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-sm shadow-md shadow-sky-500/25"
                onClick={handleInstall}
              >
                <Download className="w-4 h-4 mr-2" />
                Installer
              </Button>
            ) : isIOS ? (
              <div className="text-xs text-muted-foreground bg-white dark:bg-slate-800 rounded-lg p-3 border border-sky-200 dark:border-sky-800">
                <p className="font-medium mb-1 text-slate-900 dark:text-white">Pour installer sur iOS :</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Appuyez sur l&apos;icône Partager</li>
                  <li>Faites défiler et appuyez sur &quot;Sur l&apos;écran d&apos;accueil&quot;</li>
                  <li>Appuyez sur &quot;Ajouter&quot;</li>
                </ol>
              </div>
            ) : null}

            {isInstalled && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Application installée
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function usePWAInstall() {
  const { isInstalled } = useSyncExternalStore(
    pwaStore.subscribe,
    pwaStore.getSnapshot,
    pwaStore.getServerSnapshot
  );
  
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    const handleAppInstalled = () => {
      setCanInstall(false);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { canInstall, isInstalled };
}
