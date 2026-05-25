import { h } from "preact";
import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  acceptBlueprint,
  blueprintsSignal,
  discardBlueprint,
  updateBlueprintThesis,
} from "../../signals/blueprints.ts";

type BlueprintStatus =
  | "all"
  | "pending"
  | "refining"
  | "accepted"
  | "discarded";

export default function BlueprintExplorer() {
  const [statusFilter, setStatusFilter] = useState<BlueprintStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedThesis, setEditedThesis] = useState("");
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(
    null,
  );

  const blueprints = blueprintsSignal.value;

  const filteredBlueprints = blueprints.filter((bp) => {
    if (statusFilter === "all") return true;
    return bp.status === statusFilter;
  });

  const statusColors = {
    pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    refining: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },
    accepted: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    discarded: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
    },
  };

  const statusIcons = {
    pending: Icons.Clock,
    refining: Icons.Wand2,
    accepted: Icons.CheckCircle2,
    discarded: Icons.Trash2,
  };

  const handleAccept = (id: string) => {
    acceptBlueprint(id);
    setSelectedBlueprint(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-bold text-[var(--muse-text)] flex items-center gap-3">
          <Icons.Aperture size={28} className="text-canvas-primary" />
          Blueprint Gallery
        </h3>
        <span className="px-4 py-2 bg-canvas-primary/10 border border-canvas-primary/30 rounded-xl text-xs font-bold uppercase tracking-widest text-canvas-primary">
          {filteredBlueprints.length}{" "}
          Blueprint{filteredBlueprints.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {([
          "all",
          "pending",
          "refining",
          "accepted",
          "discarded",
        ] as BlueprintStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-[var(--muse-text)]/15 text-[var(--muse-text)] border-[var(--muse-text)]/30"
                  : "bg-[var(--muse-text)]/5 text-[var(--muse-muted)] border-[var(--muse-text)]/10 hover:text-[var(--muse-text)]"
              } border`}
            >
              {status === "all"
                ? "All Blueprints"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Blueprints Grid */}
      {filteredBlueprints.length === 0
        ? (
          <div className="text-center py-12">
            <Icons.Lightbulb
              size={48}
              className="text-[var(--muse-muted)] mx-auto mb-4"
            />
            <p className="text-[var(--muse-muted)] font-serif italic">
              No blueprints found in this category
            </p>
          </div>
        )
        : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlueprints.map((bp) => {
              const colors = statusColors[bp.status];
              const Icon = statusIcons[bp.status];
              const isSelected = selectedBlueprint === bp.id;

              return (
                <div
                  key={bp.id}
                  onClick={() =>
                    setSelectedBlueprint(isSelected ? null : bp.id)}
                  className={`group relative overflow-hidden rounded-[2.5rem] border transition-all cursor-pointer ${
                    isSelected
                      ? `${colors.border} ${colors.bg} shadow-2xl`
                      : "border-[var(--muse-text)]/10 hover:border-[var(--muse-text)]/20"
                  }`}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Content */}
                  <div className="relative z-10 p-6 md:p-7 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg md:text-xl font-bold text-[var(--muse-text)] group-hover:text-canvas-primary transition-colors line-clamp-2">
                          {bp.suggestedTitle}
                        </h4>
                        <p className="text-xs text-[var(--muse-muted)] mt-1">
                          {bp.sourceRoomIds.length}{" "}
                          room{bp.sourceRoomIds.length !== 1 ? "s" : ""} •{" "}
                          {bp.itemIds.length}{" "}
                          signal{bp.itemIds.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg} border ${colors.border}`}
                      >
                        <Icon size={16} className={colors.text} />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[var(--muse-muted)] line-clamp-2 mb-4 flex-1">
                      {bp.suggestedDescription}
                    </p>

                    {/* Confidence Score */}
                    <div className="mb-6 pb-6 border-t border-[var(--muse-text)]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          AI Confidence
                        </span>
                        <span className={`text-lg font-bold ${colors.text}`}>
                          {bp.confidenceScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--muse-text)]/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colors.text}`}
                          style={{ width: `${bp.confidenceScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Thesis Preview */}
                    {isSelected && (
                      <div className="mb-6 p-4 bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-3">
                          Synthesized Thesis
                        </p>
                        <p className="text-sm text-[var(--muse-text)] font-serif italic leading-relaxed">
                          "{bp.thesis}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {isSelected && bp.status === "pending" && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(bp.id);
                          }}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-[var(--muse-text)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Icons.Check size={14} />
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            discardBlueprint(bp.id);
                            setSelectedBlueprint(null);
                          }}
                          className="flex-1 py-3 bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 hover:bg-[var(--muse-text)]/10 text-[var(--muse-muted)] hover:text-[var(--muse-text)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                        >
                          <Icons.X size={14} />
                        </button>
                      </div>
                    )}

                    {bp.status === "accepted" && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 mt-auto">
                        <Icons.CheckCircle2 size={14} />
                        <span className="font-bold uppercase">Accepted</span>
                      </div>
                    )}

                    {bp.status === "discarded" && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto">
                        <Icons.Trash2 size={14} />
                        <span className="font-bold uppercase">Discarded</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
