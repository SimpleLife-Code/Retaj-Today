import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'خطأ غير متوقع في تشغيل التطبيق'
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Retaj Today Runtime Error:', error, info);
  }

  handleReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-xl border border-red-200 dark:border-red-900/60 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              حدث خلل مؤقت أثناء تحميل المنصة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يرجى الضغط على الزر أدناه لتحديث المنصة ومسح الملفات المؤقتة على جهازك.
            </p>
            {this.state.errorMessage && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 break-words" dir="ltr">
                {this.state.errorMessage}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث وإعادة تشغيل Retaj Today</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
