export interface Quote {
  text: string;
  author: string;
  id: number;
}

export interface Latifa {
  id: number;
  text: string;
  category?: string; // e.g., "تاريخ الطب", "رقائق", "نوادر"
  source?: string;
  _firestoreId?: string;
}

export enum CategoryId {
  SURGERY = 'SURGERY',
  WOMEN_PREGNANCY = 'WOMEN_PREGNANCY',
  ICU_DEATH = 'ICU_DEATH',
  FASTING_MEDICINE = 'FASTING_MEDICINE',
  ETHICS = 'ETHICS',
  GENETICS_REPRODUCTION = 'GENETICS_REPRODUCTION',
  TATTOO_CORTISONE = 'TATTOO_CORTISONE',
  PRAYER_PURITY = 'PRAYER_PURITY',
  MEDICAL_EXPERIMENTS = 'MEDICAL_EXPERIMENTS',
  PHARMACY_DRUGS = 'PHARMACY_DRUGS',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export interface Fatwa {
  id: string;
  category: CategoryId;
  title: string;
  question: string;
  medical_context: string;
  ruling: string;
  verdict: 'CONDITIONAL' | 'PERMITTED' | 'FORBIDDEN';
  source: string;
  tags: string[];
  _firestoreId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string | Fatwa | Fatwa[];
  timestamp: Date;
  isFatwa?: boolean;
}