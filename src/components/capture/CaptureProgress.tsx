import React from 'react';
import { motion } from 'framer-motion';

interface CaptureProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function CaptureProgress({ currentStep, totalSteps }: CaptureProgressProps) {
  return (
    <div className="flex gap-2 mb-8 justify-center">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <motion.div 
            initial={false}
            animate={{ 
              width: currentStep === i ? 40 : 8,
              backgroundColor: i <= currentStep ? 'var(--canvas-primary)' : 'rgba(255,255,255,0.1)',
              opacity: i <= currentStep ? 1 : 0.3
            }}
            className="h-1 rounded-full transition-colors duration-500"
          />
          <span className={`text-[8px] font-bold uppercase tracking-widest transition-opacity duration-500 ${currentStep === i ? 'opacity-100 text-canvas-primary' : 'opacity-0'}`}>
            Step {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
