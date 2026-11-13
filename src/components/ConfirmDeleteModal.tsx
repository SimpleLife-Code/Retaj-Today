import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (extraChecked?: boolean) => Promise<void> | void;
  title: string;
  targetName: string;
  description: string;
  extraCheckboxLabel?: string;
  defaultExtraChecked?: boolean;
  confirmButtonText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  targetName,
  description,
  extraCheckboxLabel,
  defaultExtraChecked = true,
  confirmButtonText = 'نعم، حذف نهائي'
}) => {
  const [extraChecked, setExtraChecked] = useState(defaultExtraChecked);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setExtraChecked(defaultExtraChecked);
      setIsDeleting(false);
    }
  }, [isOpen, defaultExtraChecked]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(extraChecked);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4 text-center animate-in zoom-in-95">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {title}
          </h4>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            هل أنت متأكد من حذف{' '}
            <span className="text-red-600 dark:text-red-400 font-black">«{targetName}»</span>؟
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-right space-y-2 leading-relaxed">
          <p>{description}</p>

          {extraCheckboxLabel && (
            <label className="flex items-start gap-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/70 cursor-pointer font-bold text-red-700 dark:text-red-300">
              <input
                type="checkbox"
                checked={extraChecked}
                onChange={(e) => setExtraChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-red-600 rounded-sm shrink-0"
              />
              <span>{extraCheckboxLabel}</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء وتراجع
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-red-200 dark:shadow-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
