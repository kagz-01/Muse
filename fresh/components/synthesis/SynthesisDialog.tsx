import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  createArtifactFromLink,
  LinkMetadata,
} from "../../signals/synthesis.ts";
import LinkPreview from "./LinkPreview.tsx";

interface SynthesisDialogProps {
  linkMetadata: LinkMetadata;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (artifactId: string) => void;
  rooms: Array<{ id: string; name: string }>;
}

export default function SynthesisDialog({
  linkMetadata,
  isOpen,
  onClose,
  onSuccess,
  rooms,
}: SynthesisDialogProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateArtifact = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const artifact = await createArtifactFromLink(
        linkMetadata,
        createNewRoom ? undefined : selectedRoom || undefined,
      );

      onSuccess?.(artifact.id);
      setNewRoomName("");
      setSelectedRoom(null);
      setCreateNewRoom(false);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create artifact",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = createNewRoom ? newRoomName.trim().length > 0 : selectedRoom;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--muse-surface)] rounded-2xl border border-[var(--muse-border)] w-full max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--muse-border-light)]">
          <h2 className="text-xl font-semibold text-[var(--muse-text)]">
            Save Link as Artifact
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muse-surface-soft)] rounded-lg transition-colors"
          >
            <Icons.X size={20} className="text-[var(--muse-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Link Preview */}
          <div>
            <p className="text-sm font-medium text-[var(--muse-text-muted)] mb-3">
              Parsed Link
            </p>
            <LinkPreview metadata={linkMetadata} />
          </div>

          {/* Room Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--muse-text-muted)]">
              Choose Destination
            </p>

            {/* Option: Artifact Only */}
            <label className="flex items-center gap-3 p-4 rounded-lg border border-[var(--muse-border-light)] hover:bg-[var(--muse-surface-soft)] cursor-pointer transition-colors">
              <input
                type="radio"
                name="destination"
                checked={!createNewRoom && !selectedRoom}
                onChange={() => {
                  setCreateNewRoom(false);
                  setSelectedRoom(null);
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <div>
                <p className="font-medium text-[var(--muse-text)]">
                  Save as Artifact Only
                </p>
                <p className="text-xs text-[var(--muse-text-muted)]">
                  Create artifact without adding to a room
                </p>
              </div>
            </label>

            {/* Option: Add to Existing Room */}
            {rooms.length > 0 && (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <label
                    key={room.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-[var(--muse-border-light)] hover:bg-[var(--muse-surface-soft)] cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="destination"
                      checked={selectedRoom === room.id && !createNewRoom}
                      onChange={() => {
                        setSelectedRoom(room.id);
                        setCreateNewRoom(false);
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-medium text-[var(--muse-text)]">
                        {room.name}
                      </p>
                      <p className="text-xs text-[var(--muse-text-muted)]">
                        Add to this room
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Option: Create New Room */}
            <label className="flex items-start gap-3 p-4 rounded-lg border border-[var(--muse-border-light)] hover:bg-[var(--muse-surface-soft)] cursor-pointer transition-colors">
              <input
                type="radio"
                name="destination"
                checked={createNewRoom}
                onChange={() => setCreateNewRoom(true)}
                className="w-4 h-4 cursor-pointer mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-[var(--muse-text)] mb-2">
                  Create New Room
                </p>
                <input
                  type="text"
                  placeholder="Room name..."
                  value={newRoomName}
                  onInput={(e) =>
                    setNewRoomName((e.target as HTMLInputElement).value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateNewRoom(true);
                  }}
                  className="w-full px-3 py-2 bg-[var(--muse-surface-bright)] border border-[var(--muse-border-light)] rounded-lg text-sm text-[var(--muse-text)] placeholder-[var(--muse-text-muted)] focus:outline-none focus:border-[var(--muse-accent)]"
                />
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <Icons.AlertCircle
                size={18}
                className="text-red-500 flex-shrink-0"
              />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--muse-border-light)]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-[var(--muse-border-light)] text-[var(--muse-text-muted)] hover:bg-[var(--muse-surface-soft)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateArtifact}
            disabled={isLoading || !isValid}
            className="px-4 py-2 rounded-lg bg-[var(--muse-accent)] text-white font-medium hover:bg-[var(--muse-accent-bright)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading
              ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating...
                </>
              )
              : (
                <>
                  <Icons.CheckCircle2 size={18} />
                  Create Artifact
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
}
