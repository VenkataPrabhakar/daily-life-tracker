import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('dlt-pwa-dismissed') === '1',
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred || dismissed) return null;

  const install = async () => {
    await deferred.prompt();
    setDeferred(null);
    localStorage.setItem('dlt-pwa-dismissed', '1');
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 animate-slide-up rounded-2xl border border-brand-500/30 bg-white p-4 shadow-xl dark:bg-slate-900 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <p className="text-sm font-semibold">Install Daily Life Tracker</p>
      <p className="mt-1 text-xs text-slate-500">Add to your home screen for offline access</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={install} className="btn-primary flex-1 text-xs">
          Install
        </button>
        <button
          type="button"
          onClick={() => { setDismissed(true); localStorage.setItem('dlt-pwa-dismissed', '1'); }}
          className="btn-secondary text-xs"
        >
          Later
        </button>
      </div>
    </div>
  );
}
