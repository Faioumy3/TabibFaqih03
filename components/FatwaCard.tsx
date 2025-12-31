import React, { useState } from 'react';
import { Fatwa } from '../types';
import ReactMarkdown from 'react-markdown';
import { 
  Book, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Gavel,
  Tag,
  Share2,
  Copy,
  Check,
  X
} from 'lucide-react';
import { CATEGORIES } from '../constants-1';

interface FatwaCardProps {
  fatwa: Fatwa;
}

export const FatwaCard: React.FC<FatwaCardProps> = ({ fatwa }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'PERMITTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONDITIONAL': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FORBIDDEN': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'PERMITTED': return 'جائز / مباح';
      case 'CONDITIONAL': return 'جائز بشروط / فيه تفصيل';
      case 'FORBIDDEN': return 'حرام / ممنوع';
      default: return 'غير محدد';
    }
  };

  const getVerdictIcon = (verdict: string) => {
     switch (verdict) {
      case 'PERMITTED': return <CheckCircle className="w-4 h-4" />;
      case 'CONDITIONAL': return <AlertCircle className="w-4 h-4" />;
      case 'FORBIDDEN': return <XCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const generateShareText = () => {
    return `*${fatwa.title}*\n\n*السؤال:* ${fatwa.question}\n\n*الحكم:* ${fatwa.ruling.substring(0, 300)}${fatwa.ruling.length > 300 ? '...' : ''}\n\n*المصدر:* ${fatwa.source}\n\nتم النسخ من تطبيق "الطبيب الفقيه"`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(generateShareText())}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(fatwa.title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(generateShareText())}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fatwa.title)}&url=${encodeURIComponent(window.location.href)}`
  };

  const categoryName = CATEGORIES.find(c => c.id === fatwa.category)?.name || fatwa.category;

  // Process Ruling Text
  // 1. Bold the word "الحكم"
  // 2. Preserve spacing: 
  //    - Single newline in code -> Hard break (no gap) in UI
  //    - Double newline in code -> Paragraph break (gap) in UI
  const processRuling = (text: string) => {
    if (!text) return '';
    // Bold 'الحكم'
    const bolded = text.replace(/الحكم/g, '**الحكم**');
    
    // Split by double newlines to identify paragraphs
    return bolded
      .split(/\n\n+/)
      .map(part => part.replace(/\n/g, '  \n')) // Single newline becomes hard break
      .join('\n\n'); // Join paragraphs
  };

  const processedRuling = processRuling(fatwa.ruling);

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden font-cairo text-right dir-rtl animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full max-h-[85vh]">
      
      {/* Header with Title and Verdict */}
      <div className="bg-gradient-to-b from-gray-50 to-white p-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col gap-3">
           <div className="flex flex-wrap items-center gap-2">
             <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit shadow-sm ${getVerdictStyle(fatwa.verdict)}`}>
               {getVerdictIcon(fatwa.verdict)}
               {getVerdictLabel(fatwa.verdict)}
             </span>
             <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1">
               {categoryName}
             </span>
           </div>
           <h3 className="text-xl font-bold text-gray-800 leading-snug tracking-tight">
             {fatwa.title}
           </h3>
        </div>
      </div>

      {/* Body Content - Scrollable */}
      <div className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Question Section */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 text-teal-700">
            <div className="bg-teal-50 p-1.5 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold">السؤال:</span>
          </div>
          <p className="text-gray-700 font-medium text-base leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {fatwa.question}
          </p>
        </div>

        {/* Medical Context Section */}
        {fatwa.medical_context && (
          <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
            <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5 shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 block mb-1">السياق الطبي والكلمات المفتاحية:</span>
              <p className="text-xs text-blue-800/80 font-mono leading-relaxed dir-ltr text-right">
                {fatwa.medical_context}
              </p>
            </div>
          </div>
        )}

        {/* Ruling Section - Enhanced Typography for Organization */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800 border-b border-gray-100 pb-2 font-cairo">
            <div className="bg-teal-100 p-1.5 rounded-lg">
              <Gavel className="w-4 h-4 text-teal-700" />
            </div>
            <span className="font-bold text-base">الحكم الشرعي والتفصيل:</span>
          </div>
          <div 
            className="prose prose-lg max-w-none text-gray-800 leading-loose"
            style={{ fontFamily: "'Amiri', serif" }}
          >
             <ReactMarkdown
               components={{
                 p: ({node, ...props}) => <p className="mb-6" {...props} />,
                 li: ({node, ...props}) => <li className="mb-2" {...props} />,
                 h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-teal-900" {...props} />,
                 h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 text-teal-800" {...props} />,
                 h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4 text-teal-700" {...props} />,
                 strong: ({node, ...props}) => <strong className="font-bold text-teal-900" {...props} />,
               }}
             >
               {processedRuling}
             </ReactMarkdown>
          </div>
        </div>

        {/* Footer: Source & Tags */}
        <div className="pt-4 border-t border-dashed border-gray-200 flex flex-col gap-3 font-cairo">
           {/* Source */}
           <div className="flex items-start gap-2">
             <Book className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
             <div className="text-xs text-gray-500">
               <span className="font-bold text-gray-600">المصدر: </span>
               <span className="italic">{fatwa.source}</span>
             </div>
           </div>

           {/* Tags */}
           {fatwa.tags && fatwa.tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Tag className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <div className="flex gap-1.5">
                {fatwa.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
           )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 p-3 border-t border-gray-100 flex-shrink-0 font-cairo">
        {!showShareMenu ? (
          <div className="flex justify-between items-center gap-3">
            <button 
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-teal-600 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "تم النسخ" : "نسخ النص"}
            </button>
            <button 
              onClick={() => setShowShareMenu(true)}
              className="flex-1 flex items-center justify-center gap-2 text-white bg-teal-600 hover:bg-teal-700 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              مشاركة الفتوى
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-500">اختر منصة المشاركة:</span>
              <button 
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              {/* WhatsApp */}
              <a 
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">واتساب</span>
              </a>

              {/* Facebook */}
              <a 
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">فيسبوك</span>
              </a>

              {/* Telegram */}
              <a 
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">تيليجرام</span>
              </a>

              {/* X (Twitter) */}
              <a 
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-600">تويتر</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};