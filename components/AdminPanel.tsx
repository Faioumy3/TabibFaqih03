import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  X, 
  Copy, 
  RefreshCw, 
  Check, 
  Save, 
  Trash2,
  Code,
  Eye,
  Lock,
  Search,
  ArrowLeft,
  Filter,
  Sparkles,
  Loader2,
  Lightbulb,
  FileText,
  Pencil
} from 'lucide-react';
import { CategoryId, Fatwa, Latifa } from '../types';
import { CATEGORIES } from '../constants-1';
import { FatwaCard } from './FatwaCard';
import { getFatwaSuggestions } from '../services/geminiService';

interface AdminPanelProps {
  onClose: () => void;
  onAddFatwa: (fatwa: Fatwa) => void;
  onDeleteFatwa: (id: string) => void;
  currentFatwas: Fatwa[];
  currentLataif: Latifa[];
  onAddLatifa: (latifa: Latifa) => void;
  onUpdateLatifa: (latifa: Latifa) => void;
  onDeleteLatifa: (id: number) => void;
}

const CATEGORY_PREFIXES: Record<CategoryId, string> = {
  [CategoryId.SURGERY]: 'surg',
  [CategoryId.WOMEN_PREGNANCY]: 'obgyn',
  [CategoryId.ICU_DEATH]: 'icu',
  [CategoryId.FASTING_MEDICINE]: 'fast',
  [CategoryId.ETHICS]: 'ethics',
  [CategoryId.GENETICS_REPRODUCTION]: 'genetic',
  [CategoryId.TATTOO_CORTISONE]: 'tattoo',
  [CategoryId.PRAYER_PURITY]: 'prayer',
  [CategoryId.MEDICAL_EXPERIMENTS]: 'exp',
  [CategoryId.PHARMACY_DRUGS]: 'pharm',
  [CategoryId.MISCELLANEOUS]: 'misc',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  onAddFatwa, 
  onDeleteFatwa, 
  currentFatwas,
  currentLataif,
  onAddLatifa,
  onUpdateLatifa,
  onDeleteLatifa
}) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Main Section Toggle (Fatwas or Lataif)
  const [adminSection, setAdminSection] = useState<'fatwas' | 'lataif'>('fatwas');

  // Fatwas State
  const [fatwaActiveTab, setFatwaActiveTab] = useState<'add' | 'list'>('add');
  const [fatwaFormData, setFatwaFormData] = useState<Partial<Fatwa>>({
    verdict: 'CONDITIONAL',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [fatwaGeneratedCode, setFatwaGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fatwaSearchQuery, setFatwaSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | ''>('');

  // Lataif State
  const [latifaActiveTab, setLatifaActiveTab] = useState<'add' | 'list'>('add');
  const [latifaFormData, setLatifaFormData] = useState<Partial<Latifa>>({
    text: '',
    category: '',
    source: ''
  });
  const [latifaSearchQuery, setLatifaSearchQuery] = useState('');
  const [editingLatifaId, setEditingLatifaId] = useState<number | null>(null);
  const [editingLatifaDocId, setEditingLatifaDocId] = useState<string | undefined>(undefined);

  // Auto-ID for Latifa
  const [nextLatifaId, setNextLatifaId] = useState(0);

  useEffect(() => {
    if (currentLataif.length > 0) {
      const maxId = Math.max(...currentLataif.map(l => l.id));
      setNextLatifaId(maxId + 1);
    } else {
      setNextLatifaId(1);
    }
  }, [currentLataif, latifaActiveTab]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Faioumy9954') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // --- FATWA LOGIC ---
  // Auto-generate ID when category changes
  useEffect(() => {
    if (fatwaFormData.category && !fatwaFormData.id) {
      generateFatwaId(fatwaFormData.category);
    }
  }, [fatwaFormData.category]);

  const generateFatwaId = (category: CategoryId) => {
    const prefix = CATEGORY_PREFIXES[category];
    const count = currentFatwas.filter(f => f.category === category).length + 1;
    const year = new Date().getFullYear();
    const newId = `${prefix}_${String(count).padStart(3, '0')}_${year}`;
    setFatwaFormData(prev => ({ ...prev, id: newId }));
  };

  const validateFatwaForm = () => {
    return fatwaFormData.title && fatwaFormData.category && fatwaFormData.question && fatwaFormData.ruling && fatwaFormData.id;
  };

  const handleFatwaPreview = () => {
    if (!validateFatwaForm()) {
      alert('يرجى ملء الحقول الأساسية (التصنيف، العنوان، السؤال، الحكم)');
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmAddFatwa = () => {
    if (fatwaFormData && validateFatwaForm()) {
      onAddFatwa(fatwaFormData as Fatwa);
      alert('تم إضافة الفتوى بنجاح للقائمة الحالية (مؤقتاً)');
      // Reset
      setFatwaFormData({ verdict: 'CONDITIONAL', tags: [] });
      setShowPreview(false);
      setFatwaGeneratedCode('');
    }
  };

  const handleGenerateFatwaCode = () => {
    if (!validateFatwaForm()) {
      alert('يرجى ملء الحقول الأساسية (التصنيف، العنوان، السؤال، الحكم)');
      return;
    }

    const code = `  {
    id: '${fatwaFormData.id}',
    category: CategoryId.${fatwaFormData.category},
    title: '${fatwaFormData.title}',
    question: '${fatwaFormData.question}',
    medical_context: '${fatwaFormData.medical_context || ''}',
    ruling: \`${fatwaFormData.ruling}\`,
    verdict: '${fatwaFormData.verdict}',
    source: '${fatwaFormData.source || ''}',
    tags: [${(fatwaFormData.tags || []).map(t => `'${t}'`).join(', ')}]
  },`;
    
    setFatwaGeneratedCode(code);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      setFatwaFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFatwaFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  // AI Suggestion Handler
  const handleSmartSuggest = async () => {
    if (!fatwaFormData.title) {
      alert('يرجى كتابة عنوان الفتوى أولاً');
      return;
    }
    
    setIsSuggesting(true);
    try {
      const suggestions = await getFatwaSuggestions(fatwaFormData.title);
      setFatwaFormData(prev => ({
        ...prev,
        medical_context: suggestions.medical_context,
        tags: [...(prev.tags || []), ...suggestions.tags]
      }));
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء جلب الاقتراحات');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Filtered List for Fatwas
  const filteredFatwas = currentFatwas.filter(f => {
    const matchesSearch = f.title.includes(fatwaSearchQuery) || 
                          f.id.includes(fatwaSearchQuery) ||
                          f.question.includes(fatwaSearchQuery);
    
    const matchesCategory = selectedCategoryFilter ? f.category === selectedCategoryFilter : true;

    return matchesSearch && matchesCategory;
  });

  // --- LATAIF LOGIC ---
  const handleSaveLatifa = () => {
    if (!latifaFormData.text) {
        alert('يرجى كتابة نص اللطيفة');
        return;
    }

    if (editingLatifaId !== null) {
        // Update existing
        const updatedLatifa: Latifa = {
            id: editingLatifaId,
            text: latifaFormData.text!,
            category: latifaFormData.category || undefined,
            source: latifaFormData.source || undefined,
            _firestoreId: editingLatifaDocId // Keep the firestore ID for updates
        };
        onUpdateLatifa(updatedLatifa);
        alert('تم تعديل اللطيفة بنجاح');
        setEditingLatifaId(null);
        setEditingLatifaDocId(undefined);
    } else {
        // Add new
        const newLatifa: Latifa = {
            id: nextLatifaId,
            text: latifaFormData.text!,
            category: latifaFormData.category || undefined,
            source: latifaFormData.source || undefined
        };
        onAddLatifa(newLatifa);
        alert('تم إضافة اللطيفة بنجاح');
        setNextLatifaId(prev => prev + 1);
    }
    setLatifaFormData({ text: '', category: '', source: '' });
  };

  const startEditingLatifa = (latifa: Latifa) => {
      setLatifaFormData({
          text: latifa.text,
          category: latifa.category || '',
          source: latifa.source || ''
      });
      setEditingLatifaId(latifa.id);
      setEditingLatifaDocId(latifa._firestoreId);
      setLatifaActiveTab('add');
  };

  const cancelLatifaEdit = () => {
      setEditingLatifaId(null);
      setEditingLatifaDocId(undefined);
      setLatifaFormData({ text: '', category: '', source: '' });
  };

  const filteredLataif = currentLataif.filter(l => {
      const query = latifaSearchQuery.toLowerCase();
      return l.text.toLowerCase().includes(query) || 
             l.category?.toLowerCase().includes(query) || 
             l.source?.toLowerCase().includes(query);
  });


  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center font-cairo dir-rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">الدخول للإعدادات</h2>
            <p className="text-gray-500 text-sm mt-1">منطقة محمية للمسؤولين فقط</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center text-lg"
                placeholder="أدخل كلمة المرور"
                autoFocus
              />
            </div>
            {authError && (
              <div className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">
                كلمة المرور غير صحيحة
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors shadow-md"
              >
                دخول
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- PREVIEW MODAL (Fatwa) ---
  if (showPreview && fatwaFormData) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 font-cairo dir-rtl backdrop-blur-sm overflow-hidden">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50 rounded-t-3xl">
            <h3 className="font-bold text-purple-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              معاينة الشكل النهائي
            </h3>
            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-purple-100 rounded-full text-purple-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <div className="max-w-xl mx-auto">
               <FatwaCard fatwa={fatwaFormData as Fatwa} />
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl flex gap-3">
            <button 
              onClick={() => setShowPreview(false)}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              تعديل البيانات
            </button>
            <button 
              onClick={handleConfirmAddFatwa}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
            >
              <Check className="w-5 h-5" />
              اعتماد وإضافة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN PANEL ---
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto font-cairo dir-rtl text-right">
      
      {/* Header */}
      <div className="bg-[#7c3aed] text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="max-w-5xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">لوحة إدارة المحتوى</h1>
              <p className="text-purple-100 text-xs opacity-90">نظام إضافة الفتاوى واللطائف</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Section Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-center">
            <div className="flex w-full max-w-md p-1 bg-gray-100 rounded-xl my-2">
                <button
                    onClick={() => setAdminSection('fatwas')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        adminSection === 'fatwas' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    إدارة الفتاوى
                </button>
                <button
                    onClick={() => setAdminSection('lataif')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        adminSection === 'lataif' 
                        ? 'bg-white text-amber-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Lightbulb className="w-4 h-4" />
                    إدارة اللطائف
                </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto p-6">
        
        {/* ==================== FATWAS SECTION ==================== */}
        {adminSection === 'fatwas' && (
            <>
                {/* Sub Navigation */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-1">
                    <button 
                        onClick={() => setFatwaActiveTab('add')}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        fatwaActiveTab === 'add' 
                            ? 'border-[#7c3aed] text-[#7c3aed]' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <PlusCircle className="w-4 h-4" />
                        إضافة فتوى
                    </button>
                    <button 
                        onClick={() => setFatwaActiveTab('list')}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        fatwaActiveTab === 'list' 
                            ? 'border-[#7c3aed] text-[#7c3aed]' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        قائمة الفتاوى ({currentFatwas.length})
                    </button>
                </div>

                {fatwaActiveTab === 'add' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Fatwa Form */}
                    <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-800">
                        <PlusCircle className="w-6 h-6 text-[#7c3aed]" />
                        <h2 className="text-xl font-bold">إضافة فتوى جديدة</h2>
                        </div>
                        
                        <div className="space-y-5">
                        {/* Category & ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف *</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent outline-none transition-all"
                                value={fatwaFormData.category || ''}
                                onChange={(e) => setFatwaFormData({...fatwaFormData, category: e.target.value as CategoryId})}
                            >
                                <option value="">اختر تصنيفاً</option>
                                {CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            </div>
                            <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الفتوى (ID) - تلقائي</label>
                            <div className="flex gap-2">
                                <input 
                                type="text" 
                                readOnly
                                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm dir-ltr text-right"
                                value={fatwaFormData.id || ''}
                                />
                                <button 
                                onClick={() => fatwaFormData.category && generateFatwaId(fatwaFormData.category)} 
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                title="إعادة توليد"
                                >
                                <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                            </div>
                        </div>

                        {/* Title & AI Suggest */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">العنوان *</label>
                            <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none"
                                placeholder="مثال: حكم زراعة الأعضاء"
                                value={fatwaFormData.title || ''}
                                onChange={(e) => setFatwaFormData({...fatwaFormData, title: e.target.value})}
                            />
                            <button 
                                onClick={handleSmartSuggest}
                                disabled={isSuggesting}
                                className="min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl px-4 font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isSuggesting ? 'جاري التحليل...' : 'اقتراح ذكي'}
                            </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                            اكتب العنوان ثم اضغط "اقتراح ذكي" لملء الوسوم والسياق الطبي تلقائياً بالذكاء الاصطناعي.
                            </p>
                        </div>

                        {/* Question */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">السؤال *</label>
                            <textarea 
                            rows={3}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none"
                            placeholder="نص السؤال كما ورد..."
                            value={fatwaFormData.question || ''}
                            onChange={(e) => setFatwaFormData({...fatwaFormData, question: e.target.value})}
                            />
                        </div>

                        {/* Verdict & Source */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الحكم النهائي *</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none"
                                value={fatwaFormData.verdict}
                                onChange={(e) => setFatwaFormData({...fatwaFormData, verdict: e.target.value as any})}
                            >
                                <option value="CONDITIONAL">مشروط (فيه تفصيل)</option>
                                <option value="PERMITTED">جائز / مباح</option>
                                <option value="FORBIDDEN">حرام / ممنوع</option>
                            </select>
                            </div>
                            <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">المصدر *</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none"
                                placeholder="دار الإفتاء المصرية - فتوى رقم ..."
                                value={fatwaFormData.source || ''}
                                onChange={(e) => setFatwaFormData({...fatwaFormData, source: e.target.value})}
                            />
                            </div>
                        </div>

                        {/* Ruling */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نص الحكم والفتوى *</label>
                            <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg mb-2 text-xs text-orange-700">
                            نصيحة: استخدم سطرين فارغين للفصل بين الفقرات.
                            </div>
                            <textarea 
                            rows={8}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none font-mono text-sm leading-relaxed"
                            placeholder="اكتب تفاصيل الحكم هنا..."
                            value={fatwaFormData.ruling || ''}
                            onChange={(e) => setFatwaFormData({...fatwaFormData, ruling: e.target.value})}
                            />
                        </div>

                        {/* Medical Context */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">السياق الطبي (للبحث)</label>
                            <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none text-left dir-ltr placeholder:text-right"
                            placeholder="surgery, transplant, ... كلمات إنجليزية للبحث"
                            value={fatwaFormData.medical_context || ''}
                            onChange={(e) => setFatwaFormData({...fatwaFormData, medical_context: e.target.value})}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الكلمات المفتاحية (اضغط Enter للإضافة)</label>
                            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#7c3aed] focus-within:bg-white transition-all flex flex-wrap gap-2">
                            {fatwaFormData.tags?.map((tag, idx) => (
                                <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                                #{tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input 
                                type="text" 
                                className="bg-transparent outline-none flex-1 min-w-[120px]"
                                placeholder="أضف وسماً واضغط Enter"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 mt-4">
                            <div className="flex gap-3">
                            <button 
                                onClick={handleFatwaPreview}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                            >
                                <Eye className="w-5 h-5" />
                                معاينة ثم إضافة
                            </button>
                            <button 
                                onClick={() => setFatwaFormData({ verdict: 'CONDITIONAL', tags: [] })}
                                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
                            >
                                مسح الكل
                            </button>
                            </div>
                            <button 
                            onClick={handleGenerateFatwaCode}
                            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                            >
                            <Code className="w-4 h-4" />
                            توليد الكود فقط (للمطورين)
                            </button>
                        </div>

                        </div>
                    </div>
                    </div>

                    {/* Preview & Code Side */}
                    <div className="space-y-6">
                    
                    {/* Generated Code Area */}
                    <div className={`bg-[#1e1e1e] rounded-2xl shadow-lg border border-gray-800 overflow-hidden transition-all duration-500 ${fatwaGeneratedCode ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale'}`}>
                        <div className="bg-[#2d2d2d] p-3 flex justify-between items-center border-b border-gray-700">
                        <span className="text-gray-400 text-xs font-mono">constants.ts snippet</span>
                        <button 
                            onClick={() => copyToClipboard(fatwaGeneratedCode)}
                            disabled={!fatwaGeneratedCode}
                            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'تم النسخ' : 'نسخ'}
                        </button>
                        </div>
                        <div className="p-4 relative">
                        <textarea 
                            readOnly
                            value={fatwaGeneratedCode || '// اضغط "توليد الكود" إذا كنت تريد الكود المصدري...'}
                            className="w-full h-[400px] bg-transparent text-green-400 font-mono text-xs outline-none resize-none dir-ltr text-left"
                        />
                        </div>
                    </div>

                    {/* Instructions Card */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <List className="w-4 h-4" />
                        ملاحظة هامة
                        </h3>
                        <p className="text-sm text-blue-700/80 leading-relaxed">
                        زر <strong>"معاينة ثم إضافة"</strong> سيقوم بإضافة الفتوى للتطبيق فوراً ولكن بشكل مؤقت (ستختفي عند تحديث الصفحة). لحفظها بشكل دائم في الكود المصدري، استخدم زر <strong>"توليد الكود"</strong> وأرسله للمطور.
                        </p>
                    </div>

                    </div>
                </div>
                ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">جميع الفتاوى</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">{filteredFatwas.length}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value as CategoryId | '')}
                        className="p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm min-w-[150px]"
                        >
                        <option value="">كل التصنيفات</option>
                        {CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        </select>

                        <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="بحث في القائمة..."
                            value={fatwaSearchQuery}
                            onChange={(e) => setFatwaSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-right">ID</th>
                            <th className="px-4 py-3 text-right">التصنيف</th>
                            <th className="px-4 py-3 text-right">العنوان</th>
                            <th className="px-4 py-3 text-right">المصدر</th>
                            <th className="px-4 py-3 text-center">إجراءات</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredFatwas.length > 0 ? (
                            filteredFatwas.map(fatwa => (
                            <tr key={fatwa.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-4 py-3 font-mono text-gray-500 dir-ltr text-right text-xs">{fatwa.id}</td>
                                <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-xs whitespace-nowrap">
                                    {CATEGORIES.find(c => c.id === fatwa.category)?.name}
                                </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-800 max-w-xs truncate">{fatwa.title}</td>
                                <td className="px-4 py-3 text-gray-500 truncate max-w-[150px] text-xs">{fatwa.source}</td>
                                <td className="px-4 py-3 text-center">
                                <button 
                                    onClick={(e) => {
                                    e.stopPropagation(); // منع انتقال الحدث للصف
                                    if(window.confirm('هل أنت متأكد من حذف هذه الفتوى؟')) {
                                        onDeleteFatwa(fatwa.id);
                                    }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="حذف"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan={5} className="py-10 text-center text-gray-400">
                                لا توجد نتائج مطابقة للبحث
                            </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
                )}
            </>
        )}

        {/* ==================== LATAIF SECTION ==================== */}
        {adminSection === 'lataif' && (
            <>
                {/* Sub Navigation */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-1">
                    <button 
                        onClick={() => {
                            setLatifaActiveTab('add');
                            setEditingLatifaId(null);
                            setEditingLatifaDocId(undefined);
                            setLatifaFormData({ text: '', category: '', source: '' });
                        }}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        latifaActiveTab === 'add' 
                            ? 'border-amber-500 text-amber-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <PlusCircle className="w-4 h-4" />
                        {editingLatifaId !== null ? 'تعديل لطيفة' : 'إضافة لطيفة'}
                    </button>
                    <button 
                        onClick={() => setLatifaActiveTab('list')}
                        className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                        latifaActiveTab === 'list' 
                            ? 'border-amber-500 text-amber-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        قائمة اللطائف ({currentLataif.length})
                    </button>
                </div>

                {latifaActiveTab === 'add' ? (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-800">
                                {editingLatifaId !== null ? <Pencil className="w-6 h-6 text-amber-500" /> : <Lightbulb className="w-6 h-6 text-amber-500" />}
                                <h2 className="text-xl font-bold">{editingLatifaId !== null ? 'تعديل لطيفة' : 'إضافة لطيفة جديدة'}</h2>
                            </div>
                            {editingLatifaId !== null && (
                                <button onClick={cancelLatifaEdit} className="text-sm text-gray-500 hover:text-gray-700 underline">
                                    إلغاء التعديل
                                </button>
                            )}
                        </div>

                        <div className="space-y-5">
                            {/* ID */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الرقم (تلقائي)</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm"
                                    value={editingLatifaId !== null ? editingLatifaId : nextLatifaId}
                                />
                            </div>

                            {/* Text */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">نص اللطيفة *</label>
                                <textarea 
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                    placeholder="اكتب اللطيفة هنا..."
                                    value={latifaFormData.text}
                                    onChange={(e) => setLatifaFormData({...latifaFormData, text: e.target.value})}
                                />
                            </div>

                            {/* Category & Source */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="مثال: طب القلوب"
                                        value={latifaFormData.category || ''}
                                        onChange={(e) => setLatifaFormData({...latifaFormData, category: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">المصدر</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                        placeholder="مثال: سير أعلام النبلاء"
                                        value={latifaFormData.source || ''}
                                        onChange={(e) => setLatifaFormData({...latifaFormData, source: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveLatifa}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] mt-4"
                            >
                                {editingLatifaId !== null ? <Save className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                {editingLatifaId !== null ? 'حفظ التعديلات' : 'إضافة اللطيفة'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                        {/* List Header & Search */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-700">جميع اللطائف</span>
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">{filteredLataif.length}</span>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="بحث في اللطائف..."
                                    value={latifaSearchQuery}
                                    onChange={(e) => setLatifaSearchQuery(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* List Table */}
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-right w-16">#</th>
                                        <th className="px-4 py-3 text-right">النص</th>
                                        <th className="px-4 py-3 text-right w-32">التصنيف</th>
                                        <th className="px-4 py-3 text-right w-32">المصدر</th>
                                        <th className="px-4 py-3 text-center w-28">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLataif.length > 0 ? (
                                        filteredLataif.map(l => (
                                            <tr key={l.id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-gray-500">{l.id}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800 line-clamp-2">{l.text}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{l.category || '-'}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{l.source || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => startEditingLatifa(l)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                if(window.confirm('هل أنت متأكد من حذف هذه اللطيفة؟')) {
                                                                    onDeleteLatifa(l.id);
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-gray-400">
                                                لا توجد نتائج
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}

      </div>
    </div>
  );
};