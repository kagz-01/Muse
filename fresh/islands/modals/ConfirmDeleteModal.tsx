import * as Icons from "lucide-preact";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
          {/* Red warning stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

          <div className="p-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
              <Icons.Trash2 size={24} className="text-red-400" />
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-white text-center tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-sm text-gray-400 text-center font-serif italic leading-relaxed mb-8">
              {description}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/25 hover:text-red-300 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Icons.Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
