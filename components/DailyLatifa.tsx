import React, { useState, useEffect } from 'react';
import { Lightbulb, Quote, Sparkles, X } from 'lucide-react';
import { Latifa } from '../types';

interface DailyLatifaProps {
  data: Latifa[];
}

export const DailyLatifa: React.FC<DailyLatifaProps> = ({ data }) => {
  const [latifa, setLatifa] = useState<Latifa | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const hasShown = sessionStorage.getItem('latifa_shown_session');

    if (!hasShown && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setLatifa(data[randomIndex]);
      setIsVisible(true);
      // Mark as shown for this session
      sessionStorage.setItem('latifa_shown_session', 'true');
    }
  }, [data]);

  if (!latifa || !isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-500 cursor-pointer"
      onClick={() => setIsVisible(false)}
    >
      <div 
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-amber-100 p-6 relative transform transition-all hover:scale-[1.02] duration-300"
        onClick={(e) => {
            // Also dismiss when clicking the card itself
            setIsVisible(false);
        }}
      >
        {/* Close Button */}
        <button 
            className="absolute top-4 left-4 p-2 bg-gray-100/50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
            }}
        >
            <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-full shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-600 fill-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg font-cairo">من اللطائف</h3>
            {latifa.category && (
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 font-bold">
                {latifa.category}
              </span>
            )}
          </div>
        </div>

        {/* Decorative Icon (Subtle) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <Lightbulb className="w-48 h-48" />
        </div>

        {/* Content */}
        <div className="text-center py-2 px-2 relative z-10">
          <p className="text-xl font-bold text-gray-800 font-amiri leading-10 text-right dir-rtl whitespace-pre-wrap">
            "{latifa.text}"
          </p>
          
          {latifa.source && (
            <div className="mt-4 flex items-center justify-end gap-1 text-sm text-gray-500 font-medium dir-rtl">
              <span className="text-amber-500">~</span>
              <span>{latifa.source}</span>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-6 flex justify-center">
            <p className="text-[10px] text-gray-400 font-cairo animate-pulse">
                (اضغط في أي مكان للإخفاء)
            </p>
        </div>
      </div>
    </div>
  );
};