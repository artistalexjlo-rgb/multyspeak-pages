// Cloudflare Pages Function на голом «/»: определяем язык по браузеру → 302 на /<lang>/.
// Порядок: cookie `lang` (ручной выбор) → Accept-Language → дефолт ru.
// Языковые пути (/ru/ /en/ …) — статика, эта функция их НЕ трогает (она только на «/»).
const SUPPORTED = ["ru", "en", "es", "pt"];
const DEFAULT = "ru";

function pickLang(request) {
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)lang=([a-z]{2})/i);
  if (m && SUPPORTED.includes(m[1].toLowerCase())) return m[1].toLowerCase();

  const al = request.headers.get("accept-language") || "";
  for (const part of al.split(",")) {
    const code = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (SUPPORTED.includes(code)) return code;
  }
  return DEFAULT;
}

export async function onRequestGet(context) {
  const lang = pickLang(context.request);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${lang}/`,
      // ответ зависит от языка браузера — не кэшировать общий редирект под все языки
      "Cache-Control": "no-store",
      Vary: "Accept-Language, Cookie",
    },
  });
}
