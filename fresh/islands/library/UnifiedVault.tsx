import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import RoomsGallery from "../rooms/RoomsGallery.tsx";
import ThreadsGallery from "../threads/ThreadsGallery.tsx";

export default function UnifiedVault() {
  const [activeTab, setActiveTab] = useState<"rooms" | "threads">("rooms");

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location?.search);
    const tab = params.get("tab");
    if (tab === "threads" || tab === "rooms") {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: "rooms" | "threads") => {
    setActiveTab(tab);
    const url = new URL(globalThis.location.href);
    url.searchParams.set("tab", tab);
    globalThis.history.pushState({}, "", url.toString());
  };

  return (
    <div className="w-full mx-auto pb-20 animate-in fade-in duration-700">
      {/* VAULT HEADER */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-10 pt-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
              <Icons.Layout size={12} className="text-canvas-primary" />
              Vault Archive
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Your Digital{" "}
              <span className="text-gray-600 italic font-serif">
                Collection.
              </span>
            </h1>
            <p className="mt-4 text-gray-400 font-serif italic text-lg max-w-xl">
              A unified space for your raw materials and synthesized thoughts.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTabChange("rooms")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "rooms"
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Icons.Layout size={14} /> Rooms
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("threads")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === "threads"
                  ? "bg-white text-black shadow-lg"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Icons.Layers size={14} /> Threads
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="transition-all duration-500">
        {activeTab === "rooms"
          ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoomsGallery />
            </div>
          )
          : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ThreadsGallery />
            </div>
          )}
      </div>

      {/* GLOBAL SEARCH / FILTER FLOATING BAR (Optional Suggestion) */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-6">
        <div className="bg-[#1a1a1a]/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl">
          <div className="flex-1 flex items-center gap-3 px-4 py-2 text-gray-500">
            <Icons.Search size={16} />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder:text-gray-600"
            />
          </div>
          <button
            type="button"
            className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
          >
            <Icons.Filter size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
