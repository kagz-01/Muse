import * as Icons from "lucide-preact";

interface SocraticQuestion {
  question: string;
}

export interface ThreadBlueprint {
  theme: string;
  summary: string;
  socratic_questions: SocraticQuestion[];
}

export interface ThreadData {
  id: string;
  artifact_ids: string[];
  blueprint: ThreadBlueprint;
  created_at: string;
}

interface ThreadCardProps {
  thread: ThreadData;
  themeColor: string;
  onQuestionClick?: (threadId: string, question: string) => void;
}

export default function ThreadCard({ thread, themeColor, onQuestionClick }: ThreadCardProps) {
  const { theme, summary, socratic_questions } = thread.blueprint;

  return (
    <div className="relative group p-6 rounded-3xl bg-[var(--muse-surface)] border border-[var(--muse-border)] shadow-xl overflow-hidden mt-6">
      {/* Background glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-8 h-8 rounded-lg bg-[var(--muse-bg)] border border-[var(--muse-border)] flex items-center justify-center"
            style={{ color: themeColor }}
          >
            <Icons.Sparkles size={16} />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-[var(--muse-text)]">{theme}</h3>
        </div>

        <p className="text-[var(--muse-muted)] text-sm leading-relaxed mb-6 font-serif italic">
          "{summary}"
        </p>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
            Socratic Prompts
          </h4>
          <div className="grid gap-3">
            {socratic_questions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => onQuestionClick && onQuestionClick(thread.id, q.question)}
                className="text-left p-4 rounded-xl bg-[var(--muse-bg)] border border-[var(--muse-border)] hover:border-white/20 transition-colors group/btn flex items-start gap-3"
              >
                <div className="mt-0.5 text-[var(--muse-muted)] group-hover/btn:text-canvas-primary transition-colors">
                  <Icons.PenLine size={16} />
                </div>
                <span className="text-sm font-medium text-[var(--muse-text)] leading-snug">
                  {q.question}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--muse-border)]">
          <div className="flex -space-x-2">
            {/* Visual representation of connected artifacts */}
            {thread.artifact_ids.slice(0, 3).map((id, i) => (
              <div key={id} className="w-8 h-8 rounded-full bg-[var(--muse-surface)] border-2 border-[var(--muse-bg)] flex items-center justify-center z-10" style={{ zIndex: 10 - i }}>
                <Icons.File size={12} className="text-[var(--muse-muted)]" />
              </div>
            ))}
            {thread.artifact_ids.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-[var(--muse-surface)] border-2 border-[var(--muse-bg)] flex items-center justify-center z-0">
                <span className="text-[10px] font-bold text-[var(--muse-muted)]">+{thread.artifact_ids.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-[var(--muse-muted)] bg-[var(--muse-bg)] px-3 py-1 rounded-full">
            Synthesized Thread
          </span>
        </div>
      </div>
    </div>
  );
}
