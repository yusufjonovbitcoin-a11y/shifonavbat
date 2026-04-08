/** Kardiovaskulyar skrining savollari — bitta manba */

export type CardioQuestion = {
  id: number;
  block: string;
  type: "binary" | "scale" | "text" | "number" | "select" | "multiInput" | "bodyMap";
  question: string;
  options?: string[];
  placeholder?: string;
  fields?: { name: string; placeholder: string; type?: string }[];
  /** Binary: o'ngdagi ijobiy javob qaysi — default Yo'q (simptom yo'q). "ha" bo'lsa chap Yo'q (salbiy), o'ng Ha (ijobiy). */
  binaryIjobiyOption?: "yoq" | "ha";
}

// Questions defined outside component to avoid re-creation on each render
export const CARDIO_QUESTIONS: CardioQuestion[] = [
  // Blok 1: Demografiya va Skrining (1-5)
  { id: 1,  block: "Demografiya va Skrining", type: "number",   question: "Yoshingiz nechada?", placeholder: "Yoshingizni kiriting" },
  { id: 2,  block: "Demografiya va Skrining", type: "select",   question: "Jinsingiz?", options: ["Erkak", "Ayol"] },
  { id: 3,  block: "Demografiya va Skrining", type: "multiInput", question: "Vazningiz va bo'yingiz? (BMI hisoblash uchun)",
    fields: [
      { name: "weight", placeholder: "Vazn (kg)",  type: "number" },
      { name: "height", placeholder: "Bo'y (sm)",  type: "number" },
    ],
  },
  { id: 4,  block: "Demografiya va Skrining", type: "number",   question: "Odatda tinch holatda yurak urishingiz (puls) bir daqiqada nechta?", placeholder: "Puls (urish/min)" },
  { id: 5,  block: "Demografiya va Skrining", type: "select",   question: "Oxirgi marta qachon EKG yoki UZI (ExoKG) tekshiruvidan o'tgansiz?",
    options: ["1 oy ichida", "3 oy ichida", "6 oy ichida", "1 yil ichida", "1 yildan ko'p", "Hech qachon"],
  },

  // Blok 2: "Qizil bayroqchalar" (6-12) - WITH BODY MAP
  { id: 6,  block: "Qizil bayroqchalar", type: "binary",  question: "Hozir ko'krak qafasida siquvchi, og'irlik yoki kuydiruvchi og'riq bormi?" },
  { id: 7,  block: "Qizil bayroqchalar", type: "bodyMap", question: "Og'riq tanangiznig qaysi qismlariga tarqaladi? (Bosib ko'rsating)" },
  { id: 8,  block: "Qizil bayroqchalar", type: "binary",  question: "Og'riq bilan birga kuchli sovuq ter bosishi kuzatildimi?" },
  { id: 9,  block: "Qizil bayroqchalar", type: "binary",  question: "To'satdan paydo bo'lgan kuchli nafas qisishi bormi?" },
  { id: 10, block: "Qizil bayroqchalar", type: "binary",  question: "Oxirgi vaqtlarda to'satdan hushingizdan ketish holatlari bo'ldimi?" },
  { id: 11, block: "Qizil bayroqchalar", type: "binary",  question: "Oyoqlaringizda keskin paydo bo'lgan kuchli shish va og'riq bormi?" },
  { id: 12, block: "Qizil bayroqchalar", type: "binary",  question: "Yurak urishi juda tezlashib (120+), bosh aylanishi bilan kuzatilyaptimi?" },

  // Blok 3: Arterial qon bosimi (13-18)
  { id: 13, block: "Arterial qon bosimi", type: "binary", question: "Sizda gipertoniya (qon bosimi ko'tarilishi) tashxisi bormi?" },
  { id: 14, block: "Arterial qon bosimi", type: "text",   question: "Odatdagi (ishchi) qon bosimingiz necha?", placeholder: "Mis: 120/80" },
  { id: 15, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimingiz 140/90 dan tez-tez ko'tarilib turadimi?" },
  { id: 16, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimi ko'tarilganda bosh aylanishi yoki ko'ngil ayniши bo'ladimi?" },
  { id: 17, block: "Arterial qon bosimi", type: "binary", question: "Boshning orqa (ensa) qismida og'irlik yoki og'riq sezasizmi?" },
  { id: 18, block: "Arterial qon bosimi", type: "binary", question: "Qon bosimini tushiruvchi dorilarni muntazam ichасizmi?" },

  // Blok 4: Yurak yetishmovchiligi va Nafas qisishi (19-25)
  { id: 19, block: "Yurak yetishmovchiligi", type: "binary", question: "Oddiy yurishda (masalan, 100-200 metr) nafas qisishi seziladimi?" },
  { id: 20, block: "Yurak yetishmovchiligi", type: "binary", question: "Zinadan 1-2 qavat ko'tarilganda to'xtab dam olishga ehtiyoj sezasizmi?" },
  { id: 21, block: "Yurak yetishmovchiligi", type: "binary", question: "Kechasi yotib uxlaganda nafas qisishidan uyg'onib ketasizmi?" },
  { id: 22, block: "Yurak yetishmovchiligi", type: "binary", question: "Past yostiqda yotish sizga noqulaylik tug'diradimi?" },
  { id: 23, block: "Yurak yetishmovchiligi", type: "binary", question: "Oyoq to'piqlari sohasida kechqurun shishlar paydo bo'ladimi?" },
  { id: 24, block: "Yurak yetishmovchiligi", type: "binary", question: "Tez charchash va doimiy holsizlik sizni bezovta qiladimi?" },
  { id: 25, block: "Yurak yetishmovchiligi", type: "binary", question: "Quruq yo'tal (ayniqsa kechasi yotishda) bezovta qiladimi?" },

  // Blok 5: Yurak ritmi va Stenokardiya (26-32)
  { id: 26, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Yuragingiz \"o'ynashi\", \"kinab qolishi\" yoki \"urib ketishi\"ni sezasizmi?" },
  { id: 27, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Yurak urishi bir tekis emasligini (aritmiya) his qilasizmi?" },
  { id: 28, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Ko'krakdagi og'riq asosan jismoniy harakat vaqtida paydo bo'ladimi?" },
  { id: 29, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Harakatni to'xtatganingizda og'riq 2-5 daqiqada o'tib ketadimi?" },
  { id: 30, block: "Yurak ritmi va Stenokardiya", type: "binary",  question: "Sovuq havoda yurganda ko'krak sohasida noqulaylik seziladimi?" },
  {
    id: 31,
    block: "Yurak ritmi va Stenokardiya",
    type: "binary",
    question: "Og'riq paytida til ostiga Nitroglitserin qo'ysangiz ta'sir qiladimi?",
    binaryIjobiyOption: "ha",
  },
  { id: 32, block: "Yurak ritmi va Stenokardiya", type: "bodyMap", question: "Ko'krak qafasidagi og'riq qaerga tarqaladi?" },

  // Blok 6: Xavf omillari va Irsiyat (33-40)
  { id: 33, block: "Xavf omillari va Irsiyat", type: "select", question: "Tamaki mahsulotlarini chekasizmi?",
    options: ["Yo'q, hech qachon chekmаganman", "Yo'q, tashladim (1 yildan ko'p)", "Yo'q, tashladim (1 yil ichida)", "Ha, chekaman"],
  },
  { id: 34, block: "Xavf omillari va Irsiyat", type: "binary", question: "Qandli diabet (shakar) kasalligingiz bormi?" },
  { id: 35, block: "Xavf omillari va Irsiyat", type: "binary", question: "Qondagi xolesterin miqdori yuqoriligini bilasizmi?" },
  { id: 36, block: "Xavf omillari va Irsiyat", type: "binary", question: "Ota-onangiz yoki yaqinlaringizda erta yoshda (55 yoshgacha) infarkt yoki insult bo'lganmi?" },
  { id: 37, block: "Xavf omillari va Irsiyat", type: "binary", question: "Sizda buyrak kasalliklari bormi?" },
  { id: 38, block: "Xavf omillari va Irsiyat", type: "binary", question: "Ilgari infarkt yoki insult o'tkazganmisiz?" },
  { id: 39, block: "Xavf omillari va Irsiyat", type: "binary", question: "Yuragingizda stent yoki shunt bormi?" },
  { id: 40, block: "Xavf omillari va Irsiyat", type: "select", question: "Spirtli ichimliklarni qay darajada iste'mol qilasiz?",
    options: ["Hech qachon", "Oyiga 1-2 marta", "Haftada 1-2 marta", "Deyarli har kuni"],
  },

  // Blok 7: Turmush tarzi va Psixosomatika (41-50)
  { id: 41, block: "Turmush tarzi va Psixosomatika", type: "number", question: "Kuniga o'rtacha necha soat uхlаysiz?", placeholder: "Soatlar soni" },
  { id: 42, block: "Turmush tarzi va Psixosomatika", type: "scale",  question: "Ishingiz va hayotingizda stress darajasi qanday? (1-10 ball)" },
  { id: 43, block: "Turmush tarzi va Psixosomatika", type: "binary", question: "Oxirgi vaqtlarda sabаbsiz xavotir yoki qo'rquv hissi bo'lyaptimi?" },
  { id: 44, block: "Turmush tarzi va Psixosomatika", type: "select", question: "Ovqatlanishda tuzni ko'p iste'mol qilasizmi?",
    options: ["Kam iste'mol qilаman", "O'rtacha", "Ko'p iste'mol qilаman"],
  },
  { id: 45, block: "Turmush tarzi va Psixosomatika", type: "number", question: "Haftada necha marta jismoniy mashqlar yoki faol yurish bilan shug'ullanasiz?", placeholder: "Marta/hafta" },
  { id: 46, block: "Turmush tarzi va Psixosomatika", type: "select", question: "Oxirgi marta qachon umumiy qon tahlili topshirgansiz?",
    options: ["3 oy ichida", "6 oy ichida", "1 yil ichida", "1 yildan ko'p", "Eslаy olmаyman"],
  },
  { id: 47, block: "Turmush tarzi va Psixosomatika", type: "text",   question: "Doimiy ravishda ichadigan barcha dorilar ro'yxatini bilasizmi?", placeholder: "Dorilar nomi (masalan: Aspirin, Enalapril...)" },
  { id: 48, block: "Turmush tarzi va Psixosomatika", type: "text",   question: "Sizda allergik reaksiyalar bormi (ayniqsa dorilarga)?", placeholder: "Allergiya bo'lsa kiriting" },
  { id: 49, block: "Turmush tarzi va Psixosomatika", type: "binary", question: "Ko'krak qafasidagi og'riq chuqur nafas olganda yoki tanani burgan daо'zgaradimi?" },
  { id: 50, block: "Turmush tarzi va Psixosomatika", type: "scale",  question: "Hayot sifati: Hozirgi sog'lig'ingiz sizni necha foiz qoniqtiradi?" },
];

export const CARDIO_TOTAL = CARDIO_QUESTIONS.length;
