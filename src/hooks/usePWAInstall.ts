import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global variable to capture beforeinstallprompt before React mounts
declare global {
  interface Window {
    __retajDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__retajDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__retajDeferredPrompt) {
      return window.__retajDeferredPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'installed' | 'dismissed'>('idle');

  useEffect(() => {
    // Check if running inside iframe (e.g. AI Studio preview)
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    // Check if already in standalone/PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      setInstallStatus('installed');
    }

    // Detect User Agent
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__retajDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__retajDeferredPrompt = null;
      setDeferredPrompt(null);
      setInstallStatus('installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also check if already captured before this hook mounted
    if (window.__retajDeferredPrompt) {
      setDeferredPrompt(window.__retajDeferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<{ success: boolean; reason?: string }> => {
    // Case 1: Prompt is ready
    const promptToUse = deferredPrompt || window.__retajDeferredPrompt;

    if (promptToUse) {
      setInstallStatus('installing');
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          window.__retajDeferredPrompt = null;
          setInstallStatus('installed');
          return { success: true };
        } else {
          setInstallStatus('dismissed');
          return { success: false, reason: 'تم إلغاء التثبيت من قبل المستخدم' };
        }
      } catch (err) {
        console.error('Error during PWA installation:', err);
        setInstallStatus('idle');
        return { success: false, reason: 'حدث خطأ أثناء التثبيت' };
      }
    }

    // Case 2: In Iframe
    if (isInIframe) {
      return { success: false, reason: 'iframe' };
    }

    // Case 3: iOS Safari
    if (isIOS) {
      return { success: false, reason: 'ios' };
    }

    // Case 4: Already installed or ambient browser install
    if (isInstalled) {
      return { success: true, reason: 'already_installed' };
    }

    return { success: false, reason: 'manual_guide' };
  };

  return {
    isInstallable: !!deferredPrompt || !!(typeof window !== 'undefined' && window.__retajDeferredPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    installStatus,
    install,
    deferredPrompt
  };
}
