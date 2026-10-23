import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Monitor, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  ExternalLink,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'primary' | 'header' | 'compact';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'primary' }) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isInIframe, 
    installStatus, 
    install 
  } = usePWAInstall();

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleDirectInstall = async () => {
    setLoading(true);
    setFeedback('جاري بدء التثبيت...');

    try {
      const result = await install();

      if (result.success) {
        if (result.reason === 'already_installed') {
          setFeedback('التطبيق مثبت بالفعل على جهازك وهو جاهز للعمل!');
        } else {
          setFeedback('تم تثبيت التطبيق بنجاح على جهازك!');
        }
        setTimeout(() => setFeedback(null), 4000);
      } else {
        if (result.reason === 'iframe') {
          // In iframe (AI Studio preview): open in full window for direct 1-click install
          setFeedback('جاري فتح التطبيق في نافذة مستقلة لإتمام التثبيت مباشرة...');
          setTimeout(() => {
            window.open(window.location.href, '_blank');
            setFeedback(null);
          }, 1000);
        } else if (result.reason === 'ios' || result.reason === 'manual_guide' || !isInstallable) {
          setShowGuideModal(true);
          setFeedback(null);
        } else if (result.reason) {
          setFeedback(result.reason);
          setTimeout(() => setFeedback(null), 4000);
        }
      }
    } catch (err) {
      console.error(err);
      setShowGuideModal(true);
    } finally {
      setLoading(false);
    }
  };

  const openInFullWindow = () => {
    window.open(window.location.href, '_blank');
  };

  // If already running standalone on header, show badge
  if (isInstalled && variant === 'header') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">التطبيق مثبت على الجهاز</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {variant === 'header' ? (
          <button
            onClick={handleDirectInstall}
            disabled={loading}
            title="تثبيت مركز رتاج الطبي مباشرة على سطح المكتب والشاشة الرئيسية"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-rose-200 dark:shadow-none bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 text-white cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التثبيت...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">تثبيت التطبيق على الجهاز</span>
                <span className="sm:hidden">تثبيت التطبيق</span>
              </>
            )}
          </button>
        ) : variant === 'compact' ? (
          <button
            onClick={handleDirectInstall}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>تثبيت التطبيق</span>
          </button>
        ) : (
          <button
            onClick={handleDirectInstall}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-red-600 hover:from-sky-700 hover:via-blue-700 hover:to-red-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تثبيت Retaj Today على جهازك...</span>
              </>
            ) : (
              <>
                <Monitor className="w-5 h-5" />
                <span>تثبيت تطبيق مركز رتاج على سطح المكتب والشاشة الرئيسية</span>
                <Download className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Feedback message tooltip */}
        {feedback && (
          <div className="absolute top-full mt-2 right-0 sm:left-0 z-50 min-w-[240px] p-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl border border-slate-700 text-center animate-in fade-in slide-in-from-top-1">
            {feedback}
          </div>
        )}
      </div>

      {/* Guide Modal for iOS or when ambient browser install needs 1-tap instruction */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    تثبيت تطبيق Retaj Today
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    مركز رتاج الطبي • يعمل مباشرة على هاتفك أو حاسوبك
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Platform Instructions */}
            {isIOS ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>طريقة التثبيت على أجهزة iPhone / iPad (Safari):</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 font-medium leading-relaxed">
                  <li>
                    اضغط على أيقونة <strong>المشاركة (Share ⎋)</strong> في أسفل شاشة Safari.
                  </li>
                  <li>
                    مرر للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen ⊕)</strong>.
                  </li>
                  <li>
                    اضغط على <strong>إضافة (Add)</strong> في أعلى اليمين ليظهر التطبيق مباشرة على شاشتك كبرنامج مستقل.
                  </li>
                </ol>
              </div>
            ) : isInIframe ? (
              <div className="space-y-3 bg-sky-50 dark:bg-sky-950/50 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200">
                <p className="font-extrabold flex items-center gap-2 text-sky-950 dark:text-white">
                  <ExternalLink className="w-4 h-4 text-sky-600" />
                  <span>التثبيت المباشر من المتصفح:</span>
                </p>
                <p className="leading-relaxed">
                  نظراً لأنك تشاهد التطبيق داخل إطار المعاينة، المتصفح يحتاج فتح الرابط مباشرة لتثبيت أيقونة التطبيق على سطح المكتب أو شاشة الهاتف بنقرة واحدة.
                </p>
                <button
                  onClick={openInFullWindow}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح الرابط المباشر وتثبيت التطبيق الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-600" />
                  <span>طريقة التثبيت على الحاسوب أو أندرويد (Chrome / Edge):</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 font-medium leading-relaxed">
                  <li>
                    انقر على أيقونة التثبيت <strong>(⊕ تثبيت التطبيق)</strong> الموجودة في أقصى يمين شريط العنوان بالمتصفح.
                  </li>
                  <li>
                    أو اضغط على زر القائمة <strong>(⋮)</strong> في المتصفح ثم اختر <strong>"تثبيت Retaj Today"</strong>.
                  </li>
                  <li>
                    سيتم إنشاء اختصار رسمي على سطح المكتب وشريط المهام فوراً.
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-colors"
            >
              حسناً، فهمت
            </button>

          </div>
        </div>
      )}
    </>
  );
};
