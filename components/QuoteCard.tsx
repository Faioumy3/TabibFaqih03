import React from 'react';
import { Quote } from '../types';

interface QuoteCardProps {
  quote: Quote;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  return (
    <div className="relative bg-white border-r-4 border-r-teal-500 border-y border-l border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 w-full mb-4 overflow-hidden group mx-auto">
      {/* Decorative quotes background watermark */}
      <div className="absolute -left-2 -top-1 text-[7rem] text-teal-50 opacity-40 font-serif select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
        ”
      </div>
       <div className="absolute -right-2 -bottom-4 text-[7rem] text-teal-50 opacity-40 font-serif select-none pointer-events-none rotate-180">
        ”
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-gray-800 text-xl font-bold leading-relaxed mb-3 font-amiri">
          "{quote.text}"
        </p>
        <div className="w-full flex justify-center">
          <p className="text-teal-700 text-sm font-bold bg-teal-50 px-4 py-1 rounded-full border border-teal-100 font-cairo">
            - {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
};