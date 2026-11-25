import { userSignal } from "../signals/user.ts";

export default function DemoModeBanner() {
  const user = userSignal.value;
  const isDemo = user?.id === "__demo__";
  if (!isDemo) return null;

  return (
    <div className="px-6 md:px-10 pt-6 max-w-[1800px] mx-auto">
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
          Demo Mode
        </p>
        <p className="text-sm text-amber-100/90 mt-1">
          You are exploring a sample workspace. Changes here are for preview and
          may be reset.
        </p>
      </div>
    </div>
  );
}
