export type GynecologyQuestion = {
  id: number;
  block: string;
  type: "binary" | "text" | "number" | "select" | "multiInput" | "date";
  question: string;
  options?: string[];
  placeholder?: string;
  fields?: { name: string; placeholder: string; type?: string }[];
  optional?: boolean;
};

export const GYNECOLOGY_QUESTIONS: GynecologyQuestion[] = [
  // 1) Pasport va umumiy ma'lumotlar (7)
  { id: 1, block: "Pasport va umumiy ma'lumotlar", type: "number", question: "Yoshingiz nechada?", placeholder: "Masalan: 29" },
  {
    id: 2,
    block: "Pasport va umumiy ma'lumotlar",
    type: "multiInput",
    question: "Vazningiz va bo'yingizni kiriting (BMI uchun)",
    fields: [
      { name: "weight", placeholder: "Vazn (kg)", type: "number" },
      { name: "height", placeholder: "Bo'y (sm)", type: "number" },
    ],
  },
  { id: 3, block: "Pasport va umumiy ma'lumotlar", type: "select", question: "Oilaviy holatingiz?", options: ["Turmush qurmagan", "Turmush qurgan", "Ajrashgan", "Beva"] },
  { id: 4, block: "Pasport va umumiy ma'lumotlar", type: "binary", question: "Chekasizmi?" },
  { id: 5, block: "Pasport va umumiy ma'lumotlar", type: "select", question: "Alkogol iste'moli", options: ["Hech qachon", "Oyiga 1-2 marta", "Haftada 1-2 marta", "Tez-tez"] },
  { id: 6, block: "Pasport va umumiy ma'lumotlar", type: "text", question: "Dori vositalariga allergiyangiz bormi?", placeholder: "Bo'lsa nomini yozing, bo'lmasa 'Yo'q'" },
  { id: 7, block: "Pasport va umumiy ma'lumotlar", type: "text", question: "Doimiy qabul qiladigan dorilar", placeholder: "Ixtiyoriy", optional: true },

  // 2) Menstrual sikl (9)
  { id: 8, block: "Menstrual sikl", type: "date", question: "Oxirgi hayz boshlangan sana" },
  { id: 9, block: "Menstrual sikl", type: "number", question: "Sikl davomiyligi (kun)", placeholder: "Masalan: 28" },
  { id: 10, block: "Menstrual sikl", type: "select", question: "Sikl muntazamligi", options: ["Muntazam", "Ba'zida buziladi", "Doimiy nomuntazam"] },
  { id: 11, block: "Menstrual sikl", type: "select", question: "Hayz davomiyligi (kun)", options: ["1-2 kun", "3-5 kun", "6-8 kun", "8 kundan ko'p"] },
  { id: 12, block: "Menstrual sikl", type: "select", question: "Hayz paytidagi og'riq darajasi", options: ["Yo'q", "Yengil", "O'rtacha", "Kuchli"] },
  { id: 13, block: "Menstrual sikl", type: "select", question: "Qon ketish miqdori", options: ["Kam", "O'rtacha", "Ko'p", "Juda ko'p"] },
  { id: 14, block: "Menstrual sikl", type: "binary", question: "Sikl orasida kutilmagan qon ketish bo'ladimi?" },
  { id: 15, block: "Menstrual sikl", type: "binary", question: "Hayzlar oralig'ida jigarrang ajralma bo'ladimi?" },
  { id: 16, block: "Menstrual sikl", type: "binary", question: "Hayz kechikishi (10 kundan ko'p) tez-tez uchraydimi?" },

  // 3) Akusherlik tarixi (6)
  { id: 17, block: "Akusherlik tarixi (G-P-A-L)", type: "number", question: "Jami homiladorliklar soni (G)", placeholder: "Masalan: 2" },
  { id: 18, block: "Akusherlik tarixi (G-P-A-L)", type: "number", question: "Tug'ruqlar soni (P)", placeholder: "Masalan: 1" },
  { id: 19, block: "Akusherlik tarixi (G-P-A-L)", type: "number", question: "Abort/tushishlar soni (A)", placeholder: "Masalan: 0" },
  { id: 20, block: "Akusherlik tarixi (G-P-A-L)", type: "number", question: "Tirik farzandlar soni (L)", placeholder: "Masalan: 1" },
  { id: 21, block: "Akusherlik tarixi (G-P-A-L)", type: "select", question: "Oxirgi tug'ruq turi", options: ["Tabiiy", "Kesarcha kesish", "Bo'lmagan"] },
  { id: 22, block: "Akusherlik tarixi (G-P-A-L)", type: "binary", question: "Bachadon yoki tuxumdonlarda operatsiya bo'lganmi?" },

  // 4) Hozirgi shikoyatlar (12)
  { id: 23, block: "Hozirgi shikoyatlar", type: "binary", question: "Qorin pastida og'riq bormi?" },
  { id: 24, block: "Hozirgi shikoyatlar", type: "select", question: "Agar og'riq bo'lsa, xarakteri", options: ["Doimiy", "Vaqti-vaqti bilan", "Faqat hayzda", "Og'riq yo'q"] },
  { id: 25, block: "Hozirgi shikoyatlar", type: "text", question: "Ajralma rangi", placeholder: "Masalan: oq/sarg'ish/yashil/qon aralash" },
  { id: 26, block: "Hozirgi shikoyatlar", type: "select", question: "Ajralma hidi", options: ["Hidsiz", "Yengil hid", "Yoqimsiz o'tkir hid"] },
  { id: 27, block: "Hozirgi shikoyatlar", type: "select", question: "Ajralma miqdori", options: ["Kam", "O'rtacha", "Ko'p"] },
  { id: 28, block: "Hozirgi shikoyatlar", type: "binary", question: "Jinsiy aloqa paytida og'riq bo'ladimi?" },
  { id: 29, block: "Hozirgi shikoyatlar", type: "binary", question: "Jinsiy aloqadan keyin qon ketish bo'ladimi?" },
  { id: 30, block: "Hozirgi shikoyatlar", type: "binary", question: "Siydik chiqarishda achishish yoki og'riq bormi?" },
  { id: 31, block: "Hozirgi shikoyatlar", type: "binary", question: "Tez-tez siydik chiqarish bezovta qiladimi?" },
  { id: 32, block: "Hozirgi shikoyatlar", type: "binary", question: "Tana harorati ko'tarilishi yoki holsizlik bo'ladimi?" },
  { id: 33, block: "Hozirgi shikoyatlar", type: "binary", question: "Qichishish yoki achishish hissi bormi?" },
  { id: 34, block: "Hozirgi shikoyatlar", type: "text", question: "Qo'shimcha shikoyatlar", placeholder: "Ixtiyoriy", optional: true },

  // 5) Skrining va profilaktika (4)
  { id: 35, block: "Skrining va profilaktika", type: "select", question: "Oxirgi Pap-test qachon topshirilgan?", options: ["6 oy ichida", "1 yil ichida", "3 yil ichida", "3 yildan ko'p", "Hech qachon"] },
  { id: 36, block: "Skrining va profilaktika", type: "binary", question: "Oxirgi 1 yilda ginekolog ko'rigidan o'tganmisiz?" },
  { id: 37, block: "Skrining va profilaktika", type: "binary", question: "Ona/opa-singillarda onkologik kasalliklar bo'lganmi?" },
  { id: 38, block: "Skrining va profilaktika", type: "binary", question: "HPV testi topshirganmisiz?" },
];

export const GYNECOLOGY_TOTAL = GYNECOLOGY_QUESTIONS.length;
