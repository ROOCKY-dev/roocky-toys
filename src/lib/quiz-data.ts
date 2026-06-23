export type QuizCategory = 'All' | 'Tech' | 'Science' | 'Islamic History' | 'Arab Culture' | 'General' | 'Gaming';
export type Language = 'en' | 'ar';

export interface LocalizedText {
  question: string;
  options: string[];
}

export interface Question {
  id: string;
  category: QuizCategory;
  en: LocalizedText;
  ar: LocalizedText;
  correct: number;
}

export const QUIZ_QUESTIONS: Question[] = [
  // Islamic History
  { 
    id: 'ih1', category: 'Islamic History', correct: 1,
    en: { question: 'In which city was the Prophet Muhammad (PBUH) born?', options: ['Medina', 'Mecca', 'Jerusalem', 'Damascus'] },
    ar: { question: 'في أي مدينة وُلد النبي محمد (صلى الله عليه وسلم)؟', options: ['المدينة المنورة', 'مكة المكرمة', 'القدس', 'دمشق'] }
  },
  { 
    id: 'ih2', category: 'Islamic History', correct: 2,
    en: { question: 'Who was the first Caliph of Islam?', options: ['Umar ibn Al-Khattab', 'Ali ibn Abi Talib', 'Abu Bakr Al-Siddiq', 'Uthman ibn Affan'] },
    ar: { question: 'من هو أول خليفة في الإسلام؟', options: ['عمر بن الخطاب', 'علي بن أبي طالب', 'أبو بكر الصديق', 'عثمان بن عفان'] }
  },
  { 
    id: 'ih3', category: 'Islamic History', correct: 0,
    en: { question: 'In which Islamic month is fasting obligatory?', options: ['Ramadan', 'Shawwal', 'Muharram', 'Rajab'] },
    ar: { question: 'في أي شهر هجري يجب الصيام؟', options: ['رمضان', 'شوال', 'محرم', 'رجب'] }
  },
  { 
    id: 'ih4', category: 'Islamic History', correct: 1,
    en: { question: 'Which battle is considered the first major battle in Islamic history?', options: ['Battle of Uhud', 'Battle of Badr', 'Battle of Khandaq', 'Battle of Yarmouk'] },
    ar: { question: 'ما هي المعركة التي تُعتبر أول معركة كبرى في التاريخ الإسلامي؟', options: ['غزوة أحد', 'غزوة بدر', 'غزوة الخندق', 'معركة اليرموك'] }
  },
  { 
    id: 'ih5', category: 'Islamic History', correct: 3,
    en: { question: 'Which Umayyad Caliph built the Dome of the Rock in Jerusalem?', options: ['Muawiyah I', 'Umar II', 'Al-Walid I', 'Abd al-Malik ibn Marwan'] },
    ar: { question: 'من هو الخليفة الأموي الذي بنى قبة الصخرة في القدس؟', options: ['معاوية بن أبي سفيان', 'عمر بن عبد العزيز', 'الوليد بن عبد الملك', 'عبد الملك بن مروان'] }
  },
  
  // Arab Culture
  { 
    id: 'ac1', category: 'Arab Culture', correct: 2,
    en: { question: 'What is the traditional Arab headdress worn by men called?', options: ['Fez', 'Turban', 'Keffiyeh / Ghutra', 'Taqiyah'] },
    ar: { question: 'ماذا يُسمى غطاء الرأس التقليدي الذي يرتديه الرجال العرب؟', options: ['الطربوش', 'العمامة', 'الكوفية / الغترة', 'الطاقية'] }
  },
  { 
    id: 'ac2', category: 'Arab Culture', correct: 0,
    en: { question: 'Which Arabic instrument is a short-necked, pear-shaped stringed instrument?', options: ['Oud', 'Qanun', 'Nay', 'Rebab'] },
    ar: { question: 'ما هي الآلة الموسيقية العربية الوترية ذات العنق القصير والشكل الكمثري؟', options: ['العود', 'القانون', 'الناي', 'الربابة'] }
  },
  { 
    id: 'ac3', category: 'Arab Culture', correct: 1,
    en: { question: 'Which Arab city is famous for its ancient Nabataean architecture carved into red rock?', options: ['Palmyra', 'Petra', 'Baalbek', 'Shibam'] },
    ar: { question: 'أي مدينة عربية تشتهر بعمارتها النبطية القديمة المنحوتة في الصخر الأحمر؟', options: ['تدمر', 'البتراء', 'بعلبك', 'شبام'] }
  },
  { 
    id: 'ac4', category: 'Arab Culture', correct: 3,
    en: { question: 'Who is considered one of the greatest Arab poets of all time (Al-Mutanabbi)?', options: ['Abu Nuwas', 'Antarah ibn Shaddad', 'Imru\' al-Qais', 'Al-Mutanabbi'] },
    ar: { question: 'من يُعتبر من أعظم الشعراء العرب في كل العصور وصاحب قصيدة "الخيل والليل والبيداء تعرفني"؟', options: ['أبو نواس', 'عنترة بن شداد', 'امرؤ القيس', 'المتنبي'] }
  },

  // Tech
  { 
    id: 't1', category: 'Tech', correct: 0,
    en: { question: 'What does "HTTP" stand for?', options: ['HyperText Transfer Protocol', 'HyperLink Transfer Technology', 'HyperText Transmission Process', 'Hyper Transfer Text Protocol'] },
    ar: { question: 'ماذا يعني اختصار "HTTP"؟', options: ['بروتوكول نقل النص التشعبي', 'تقنية نقل الروابط التشعبية', 'عملية إرسال النص التشعبي', 'بروتوكول نقل النصوص الفائقة'] }
  },
  { 
    id: 't2', category: 'Tech', correct: 1,
    en: { question: 'Which programming language is known as the "mother of all languages"?', options: ['Java', 'C', 'Assembly', 'Python'] },
    ar: { question: 'أي لغة برمجة تُعرف بـ "أم اللغات"؟', options: ['جافا (Java)', 'سي (C)', 'لغة التجميع (Assembly)', 'بايثون (Python)'] }
  },
  { 
    id: 't3', category: 'Tech', correct: 2,
    en: { question: 'What is the main function of a DNS?', options: ['Secure networks', 'Store databases', 'Translate domain names to IP addresses', 'Host websites'] },
    ar: { question: 'ما هي الوظيفة الرئيسية لنظام أسماء النطاقات (DNS)؟', options: ['تأمين الشبكات', 'تخزين قواعد البيانات', 'ترجمة أسماء النطاقات إلى عناوين IP', 'استضافة المواقع'] }
  },

  // Science
  { 
    id: 's1', category: 'Science', correct: 2,
    en: { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'] },
    ar: { question: 'ما هو الرمز الكيميائي للذهب؟', options: ['Go', 'Gd', 'Au', 'Ag'] }
  },
  { 
    id: 's2', category: 'Science', correct: 1,
    en: { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    ar: { question: 'أي كوكب يُعرف بالكوكب الأحمر؟', options: ['الزهرة', 'المريخ', 'المشتري', 'زحل'] }
  },

  // General
  { 
    id: 'g1', category: 'General', correct: 2,
    en: { question: 'What is the capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'] },
    ar: { question: 'ما هي عاصمة اليابان؟', options: ['سيول', 'بكين', 'طوكيو', 'بانكوك'] }
  },
  { 
    id: 'g2', category: 'General', correct: 2,
    en: { question: 'How many continents are there?', options: ['5', '6', '7', '8'] },
    ar: { question: 'كم عدد القارات في العالم؟', options: ['5', '6', '7', '8'] }
  },

  // Gaming
  { 
    id: 'v1', category: 'Gaming', correct: 0,
    en: { question: 'What is the best-selling video game of all time?', options: ['Minecraft', 'Tetris', 'GTA V', 'Wii Sports'] },
    ar: { question: 'ما هي لعبة الفيديو الأكثر مبيعًا في التاريخ؟', options: ['ماين كرافت (Minecraft)', 'تتريس (Tetris)', 'جتا 5 (GTA V)', 'وي سبورتس (Wii Sports)'] }
  },
  { 
    id: 'v2', category: 'Gaming', correct: 2,
    en: { question: 'Which character is the mascot of SEGA?', options: ['Mario', 'Pac-Man', 'Sonic', 'Crash Bandicoot'] },
    ar: { question: 'أي شخصية هي التميمة الرسمية لشركة سيجا (SEGA)؟', options: ['ماريو', 'باك مان', 'سونيك', 'كراش بانديكوت'] }
  }
];
