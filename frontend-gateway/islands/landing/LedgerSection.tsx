import { Activity, Database, Lock, Shield } from "lucide-preact";

export default function LedgerSection() {
  return (
    <section
      id="ledger"
      className="max-w-[1800px] mx-auto px-6 md:px-10 py-32 space-y-20 relative border-t border-[var(--muse-border)] transition-colors duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="max-w-2xl">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--muse-muted)] mb-6 flex items-center gap-3 transition-colors duration-300">
            <Database size={14} /> The Ledger
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--muse-text)] leading-tight transition-colors duration-300">
            Cryptographically{" "}
            <span className="text-emerald-400 italic font-serif">Secure.</span>
          </h3>
        </div>
        <p className="text-[var(--muse-muted)] font-serif italic text-lg md:text-xl max-w-sm transition-colors duration-300">
          Your data is sovereign. Encrypted at rest, decentralized in spirit,
          and owned exclusively by you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Encrypted Vault",
            desc:
              "Military-grade encryption ensures only you hold the keys to your cognitive data.",
            icon: Lock,
            color: "text-[var(--muse-text)]",
            bg: "bg-[var(--muse-surface)]",
          },
          {
            title: "Proof of Resonance",
            desc:
              "A verifiable trail of your intellectual growth, completely untampered.",
            icon: Shield,
            color: "text-emerald-400",
            bg: "bg-emerald-500/5",
          },
          {
            title: "Node Status",
            desc:
              "Global distribution with 99.99% uptime. The network never sleeps.",
            icon: Activity,
            color: "text-canvas-primary",
            bg: "bg-canvas-primary/5",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`${item.bg} border border-[var(--muse-border)] rounded-[2.5rem] p-10 flex flex-col gap-8 hover:scale-[1.02] transition-all duration-300`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center ${item.color} transition-colors duration-300`}
            >
              <item.icon size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[var(--muse-text)] mb-2 transition-colors duration-300">
                {item.title}
              </h4>
              <p className="text-[var(--muse-muted)] text-sm leading-relaxed transition-colors duration-300">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
