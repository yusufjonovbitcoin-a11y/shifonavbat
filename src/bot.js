import { Markup, Telegraf } from "telegraf";

/**
 * @param {string} token
 * @returns {import("telegraf").Telegraf}
 */
export function createBot(token) {
  const bot = new Telegraf(token);
  const userLang = new Map();
  const baseUrl = (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
  const checkinBaseUrl = (process.env.CHECKIN_PUBLIC_URL || "https://shifonavbat.vercel.app").replace(/\/$/, "");

  const ui = {
    uz: {
      chooseLang: "Tilni tanlang:",
      selected: "Til o'zbekcha tanlandi.",
      welcome:
        "Ushbu bot MHJ \"Bionur Medservis\" klinikasi xizmatlari haqida ma'lumot olishga yordam beradi.",
      menu: {
        booking: "🏥 Qabul",
        results: "✅ Natijalar",
        doctor: "🧸 Shifokor yozuvini o'qib berish",
        services: "🔎 Xizmatlarni qidirish (narx)",
        callOrder: "📲 Qo'ng'iroq buyurtma qilish",
        emergency: "🚑 Tez yordamni chaqirish",
        contact: "☎️ Biz bilan bog'lanish",
        address: "📍 Bizning manzillarimiz",
      },
      replies: {
        booking: "Qabul uchun ism, telefon va qulay vaqtni yuboring.",
        results: "Natijalar uchun ID yoki telefon raqamingizni yuboring.",
        doctor: "Shifokor yozuvini yuboring, yordam beramiz.",
        services: "Xizmatlar ro'yxati: /web",
        callOrder: "Qayta qo'ng'iroq uchun raqamingizni yuboring: +998...",
        emergency: "Shoshilinch holatda darhol 103 ga qo'ng'iroq qiling.",
        contact: "Bog'lanish: +998 90 000 00 00",
        address: "Manzil: Toshkent, Chilonzor tumani, namunaviy ko'cha 1-uy.",
        checkin: "Dinamik check-in link namunasi:",
      },
    },
    ru: {
      chooseLang: "Выберите язык:",
      selected: "Выбран русский язык.",
      welcome:
        "Этот бот помогает получить информацию об услугах клиники ООО \"Bionur Medservis\".",
      menu: {
        booking: "🏥 Запись",
        results: "✅ Результаты",
        doctor: "🧸 Разбор почерка направления",
        services: "🔎 Поиск услуг (цены)",
        callOrder: "📲 Заказать звонок",
        emergency: "🚑 Вызвать скорую",
        contact: "☎️ Связаться с нами",
        address: "📍 Наши адреса",
      },
      replies: {
        booking: "Для записи отправьте имя, телефон и удобное время.",
        results: "Для результатов отправьте ID или номер телефона.",
        doctor: "Отправьте направление, постараемся помочь с расшифровкой.",
        services: "Список услуг: /web",
        callOrder: "Оставьте номер для обратного звонка: +998...",
        emergency: "При экстренной ситуации срочно звоните 103.",
        contact: "Связь: +998 90 000 00 00",
        address: "Адрес: г. Ташкент, Чиланзарский район, ул. Образцовая, 1.",
        checkin: "Пример динамической ссылки check-in:",
      },
    },
    en: {
      chooseLang: "Choose your language:",
      selected: "English selected.",
      welcome:
        "This bot helps you get information about services of Bionur Medservis clinic.",
      menu: {
        booking: "🏥 Appointment",
        results: "✅ Results",
        doctor: "🧸 Referral handwriting check",
        services: "🔎 Find services (price)",
        callOrder: "📲 Request a call",
        emergency: "🚑 Call ambulance",
        contact: "☎️ Contact us",
        address: "📍 Our addresses",
      },
      replies: {
        booking: "Send your name, phone, and preferred time for appointment.",
        results: "Send your ID or phone number to get results.",
        doctor: "Send the referral image/text, we will help interpret it.",
        services: "Services list: /web",
        callOrder: "Leave your number for a callback: +998...",
        emergency: "In emergency, call 103 immediately.",
        contact: "Contact: +998 90 000 00 00",
        address: "Address: Tashkent, Chilonzor district, Sample street 1.",
        checkin: "Example dynamic check-in link:",
      },
    },
  };

  function getLang(ctx) {
    return userLang.get(ctx.from?.id) || "uz";
  }

  function t(ctx) {
    return ui[getLang(ctx)];
  }

  function languageKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇿 O'zbek", "lang_uz")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇬🇧 English", "lang_en")],
    ]);
  }

  function menuKeyboard(lang) {
    const m = ui[lang].menu;
    return Markup.keyboard([
      [m.booking, m.results],
      [m.doctor, m.services],
      [m.callOrder, m.emergency],
      [m.contact, m.address],
    ]).resize();
  }

  bot.telegram.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "web", description: "Veb sahifani ochish" },
    { command: "checkin", description: "Dinamik check-in link yaratish" },
  ]);

  bot.start((ctx) => ctx.reply(ui.uz.chooseLang, languageKeyboard()));

  bot.action(/^lang_(uz|ru|en)$/, async (ctx) => {
    const lang = ctx.match[1];
    userLang.set(ctx.from.id, lang);
    try {
      await ctx.answerCbQuery();
    } catch {
      // ignore expired callback errors
    }
    const loc = ui[lang];
    await ctx.reply(`${loc.selected}\n\n${loc.welcome}`, menuKeyboard(lang));
  });

  bot.command("web", async (ctx) => {
    await ctx.reply(`${t(ctx).replies.services}\n${baseUrl}`);
  });

  bot.command("checkin", async (ctx) => {
    const txt = ctx.message.text || "";
    const parts = txt.split(/\s+/).slice(1);
    const dept = parts[0] || "urolog";
    const doc = parts[1] || "102";
    const pid = parts[2] || "5501";
    const url = `${checkinBaseUrl}/?dept=${encodeURIComponent(dept)}&doc=${encodeURIComponent(doc)}&pid=${encodeURIComponent(pid)}`;
    await ctx.reply(`${t(ctx).replies.checkin}\n${url}\n\nFormat: /checkin <dept> <doc> <pid>`);
  });

  bot.on("text", async (ctx) => {
    const msg = ctx.message.text;
    const loc = t(ctx);
    const m = loc.menu;
    const r = loc.replies;

    if (msg === m.booking) return ctx.reply(r.booking);
    if (msg === m.results) return ctx.reply(r.results);
    if (msg === m.doctor) return ctx.reply(r.doctor);
    if (msg === m.services) return ctx.reply(r.services);
    if (msg === m.callOrder) return ctx.reply(r.callOrder);
    if (msg === m.emergency) return ctx.reply(r.emergency);
    if (msg === m.contact) return ctx.reply(r.contact);
    if (msg === m.address) return ctx.reply(r.address);

    return ctx.reply(loc.welcome, menuKeyboard(getLang(ctx)));
  });

  return bot;
}
