import { useEffect, useState } from "preact/hooks";

export default function MuseLogoAnimation(
  { onClose }: { onClose: () => void },
) {
  const [visible, setVisible] = useState(true);

  // The total animation takes ~4 seconds. Fade out and close at 4.2s.
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Wait for fade out to complete
    }, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[500] flex items-center justify-center bg-[#050505] transition-opacity duration-500 overflow-hidden ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        // Allow early dismissal
        setVisible(false);
        setTimeout(onClose, 500);
      }}
    >
      <div className="relative flex items-center justify-center w-full h-full perspective-[1000px]">
        {/* The M Logo Container */}
        <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] relative animate-camera-push">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* DEFINITIONS for gradients/glows */}
            <defs>
              <filter
                id="glow-cyan"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-purple"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-emerald"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="glow-amber"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Path 1: Left Vertical (Cyan) */}
            <path
              d="M 20 80 L 20 20"
              fill="transparent"
              stroke="#22d3ee" // text-cyan-400
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-cyan)"
              className="m-path path-1"
              style={{ "--len": "60", "--delay": "0s" } as any}
            />

            {/* Path 2: Left Diagonal (Purple) */}
            <path
              d="M 20 20 L 50 65"
              fill="transparent"
              stroke="#c084fc" // text-purple-400
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-purple)"
              className="m-path path-2"
              style={{ "--len": "55", "--delay": "0.3s" } as any}
            />

            {/* Path 3: Right Diagonal (Emerald) */}
            <path
              d="M 50 65 L 80 20"
              fill="transparent"
              stroke="#34d399" // text-emerald-400
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-emerald)"
              className="m-path path-3"
              style={{ "--len": "55", "--delay": "0.6s" } as any}
            />

            {/* Path 4: Right Vertical (Amber) */}
            <path
              d="M 80 20 L 80 80"
              fill="transparent"
              stroke="#fbbf24" // text-amber-400
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-amber)"
              className="m-path path-4"
              style={{ "--len": "60", "--delay": "0.9s" } as any}
            />
          </svg>
        </div>

        {/* Text Fade In/Out */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center animate-text-reveal">
          <span className="text-4xl md:text-6xl font-bold tracking-[0.2em] text-white">
            MUSE
          </span>
        </div>
      </div>

      <style>
        {`
          .m-path {
            stroke-dasharray: var(--len);
            stroke-dashoffset: var(--len);
            opacity: 0;
            animation: draw-line 0.8s ease-out forwards;
            animation-delay: var(--delay);
          }

          @keyframes draw-line {
            0% {
              stroke-dashoffset: var(--len);
              opacity: 0;
            }
            1% {
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
          }

          /* The Netflix-style camera push */
          .animate-camera-push {
            animation: camera-push 4s cubic-bezier(0.8, 0, 0.2, 1) forwards;
          }

          @keyframes camera-push {
            0% {
              transform: scale(0.9) translateZ(-100px);
            }
            40% {
              transform: scale(1) translateZ(0);
            }
            70% {
              transform: scale(1) translateZ(0);
              opacity: 1;
            }
            100% {
              transform: scale(15) translateZ(500px);
              opacity: 0;
            }
          }

          .animate-text-reveal {
            opacity: 0;
            animation: text-reveal 3.5s ease-in-out forwards;
          }

          @keyframes text-reveal {
            0%, 20% { opacity: 0; transform: translateX(-50%) translateY(20px); filter: blur(10px); }
            40%, 60% { opacity: 1; transform: translateX(-50%) translateY(0); filter: blur(0px); }
            80%, 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); filter: blur(10px); }
          }
        `}
      </style>
    </div>
  );
}
