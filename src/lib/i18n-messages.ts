/**
 * i18n messages (t66): the genuinely translated chrome for the localized
 * landing tree — 11 hand-written locale packs, one contract.
 *
 * What is translated here (tier 1): the top bar, family labels, the locale
 * home hero, hub intros, the honest "full text is in English" notice, the
 * language switcher, status chip labels, and the footer band. What is NOT
 * translated (tier 2, by decision): any long-form content. Localized deep
 * pages are honest router pages that name and link the English original —
 * no machine-translated prose is faked. See DECISIONS.md #46.
 *
 * The English semantics of every key (the contract being translated):
 *  - studio: the "← Studio" back-link label
 *  - families: the 11 family names used in breadcrumbs, hub H1s, metadata
 *  - home: the /{locale} hero — eyebrow, headline, honest subhead, CTA
 *  - hub: intro line for family hubs ({count} is substituted), EN CTA
 *  - notice: the tier-2 honest notice card on every deep page
 *  - parity: the "kept for reference-sitemap parity" footnote
 *  - localeOnly: the variant for routes with no English original
 *  - switcher: the language menu label + the English entry
 *  - footer: the honest-clone closing band
 *  - status / blogFamily: the honest status vocabulary (help statuses,
 *    blog family banners)
 *  - meta.homeTitle: the /{locale} <title>
 */

import type { LocaleCode } from "./i18n";
import { LOCALE_NAMES } from "./i18n";

export interface LocaleMessages {
  studio: string;
  families: {
    pricing: string;
    prompts: string;
    switch: string;
    help: string;
    features: string;
    tools: string;
    styles: string;
    useCases: string;
    legal: string;
    subCategories: string;
    blog: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    subhead: string;
    explore: string;
  };
  hub: {
    intro: string;
    browse: string;
  };
  notice: {
    title: string;
    body: string;
    cta: string;
  };
  parity: string;
  localeOnly: {
    title: string;
    body: string;
  };
  switcher: {
    label: string;
    english: string;
  };
  footer: string;
  status: {
    works: string;
    partial: string;
    absent: string;
  };
  blogFamily: {
    written: string;
    news: string;
    core: string;
    game: string;
    off: string;
  };
  meta: {
    homeTitle: string;
  };
}

/** `{count}` substitution for hub intros. */
export function fillCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

/** The localized headline mentions the language by its own native name. */
export function localeHeadline(messages: LocaleMessages, locale: LocaleCode): string {
  return messages.home.headline.replace("{language}", LOCALE_NAMES[locale].native);
}

const zh: LocaleMessages = {
  studio: "工作室",
  families: {
    pricing: "定价",
    prompts: "3D 提示词",
    switch: "迁移指南",
    help: "帮助中心",
    features: "功能",
    tools: "工具",
    styles: "风格",
    useCases: "用例",
    legal: "法律条款",
    subCategories: "子分类",
    blog: "博客",
  },
  home: {
    eyebrow: "HYPER3D 克隆站",
    headline: "以{language}浏览 Hyper3D 克隆站",
    subhead:
      "这是 Hyper3D 克隆站的中文版：界面、导航中心与诚实状态页均为中文；所有长文内容保持英文，每个页面都附有指向英文原文的链接。",
    explore: "打开英文版工作室",
  },
  hub: {
    intro: "此中文导航下共有 {count} 个路由，每个页面都链接到对应的英文原文。",
    browse: "浏览英文导航中心",
  },
  notice: {
    title: "完整内容为英文",
    body:
      "本克隆站的长文内容仅以英文撰写。完整页面——各章节、常见问题与每一条锚定代码的声明——都在下方的英文原文中。",
    cta: "阅读英文原文",
  },
  parity: "此路由为对齐参考站点的站点地图而保留。",
  localeOnly: {
    title: "不存在英文原版",
    body:
      "参考站仅在本地化站点地图中提供此路由，没有对应的英文页面。克隆站为保持对等而保留该路由，并如实标注。",
  },
  switcher: {
    label: "语言",
    english: "English",
  },
  footer: "本页每一项声明都锚定于交付它的代码库——没有虚构的计划、报价或合作。",
  status: {
    works: "此处可用",
    partial: "此处部分可用",
    absent: "本克隆站没有",
  },
  blogFamily: {
    written: "此处已撰写",
    news: "参考站新闻",
    core: "真实 3D 主题",
    game: "游戏攻略 SEO",
    off: "并非 3D 主题",
  },
  meta: {
    homeTitle: "Hyper3D — 中文版",
  },
};

const de: LocaleMessages = {
  studio: "Studio",
  families: {
    pricing: "Preise",
    prompts: "3D-Prompts",
    switch: "Wechsel-Guide",
    help: "Hilfe-Center",
    features: "Funktionen",
    tools: "Tools",
    styles: "Stile",
    useCases: "Use-Cases",
    legal: "Rechtliches",
    subCategories: "Unterkategorien",
    blog: "Blog",
  },
  home: {
    eyebrow: "HYPER3D-CLONE",
    headline: "Hyper3D, navigierbar auf {language}",
    subhead:
      "Dies ist die deutsche Ausgabe des Hyper3D-Clones: Oberfläche, Hubs und ehrliche Statusseiten sind übersetzt; jeder längere Artikel bleibt auf Englisch, mit einem Link zum Original auf jeder Seite.",
    explore: "Das englische Studio öffnen",
  },
  hub: {
    intro: "Unter diesem deutschsprachigen Hub liegen {count} Routen — jede Seite verlinkt ihr englisches Original.",
    browse: "Den englischen Hub öffnen",
  },
  notice: {
    title: "Der vollständige Text ist auf Englisch",
    body:
      "Dieser Clone schreibt seine Langinhalte ausschließlich auf Englisch. Die vollständige Seite — Abschnitte, FAQs und jede im Code verankerte Aussage — liegt im englischen Original unten.",
    cta: "Das englische Original lesen",
  },
  parity: "Diese Route existiert zur Sitemap-Parität mit dem Referenzprojekt.",
  localeOnly: {
    title: "Kein englisches Original vorhanden",
    body:
      "Die Referenz liefert diese Route nur in ihrer lokalisierten Sitemap — es gibt keine englische Seite dazu. Der Clone hält die Route aus Paritätsgründen und kennzeichnet sie ehrlich.",
  },
  switcher: {
    label: "Sprache",
    english: "English",
  },
  footer:
    "Jede Aussage auf dieser Seite ist im ausgelieferten Code verankert — keine erfundenen Pläne, Angebote oder Partnerschaften.",
  status: {
    works: "FUNKTIONIERT HIER",
    partial: "TEILWEISE HIER",
    absent: "NICHT IN DIESEM CLONE",
  },
  blogFamily: {
    written: "HIER GESCHRIEBEN",
    news: "REFERENZ-NEWS",
    core: "ECHTES 3D-THEMA",
    game: "GAME-GUIDE-SEO",
    off: "KEIN 3D-THEMA",
  },
  meta: {
    homeTitle: "Hyper3D — Deutsche Ausgabe",
  },
};

const ja: LocaleMessages = {
  studio: "スタジオ",
  families: {
    pricing: "料金",
    prompts: "3D プロンプト",
    switch: "移行ガイド",
    help: "ヘルプセンター",
    features: "機能",
    tools: "ツール",
    styles: "スタイル",
    useCases: "ユースケース",
    legal: "法的情報",
    subCategories: "サブカテゴリ",
    blog: "ブログ",
  },
  home: {
    eyebrow: "HYPER3D クローン",
    headline: "{language}で迷わず見られる Hyper3D クローン",
    subhead:
      "これは Hyper3D クローンの日本語版です。インターフェース・ハブ・正直なステータスページは日本語で提供し、長文記事はすべて英語のまま、各ページから英語原文へリンクします。",
    explore: "英語版スタジオを開く",
  },
  hub: {
    intro: "この日本語ハブ配下には {count} 個のルートがあり、各ページは対応する英語原文へリンクします。",
    browse: "英語版ハブを見る",
  },
  notice: {
    title: "本文は英語で公開されています",
    body:
      "このクローンの長文コンテンツは英語のみで書かれています。セクション・FAQ・コードに根拠を持つすべての記述は、下の英語原文にあります。",
    cta: "英語原文を読む",
  },
  parity: "このルートは参照サイトのサイトマップとの一致のために保持されています。",
  localeOnly: {
    title: "英語版は存在しません",
    body:
      "参照サイトはこのルートをローカライズ版サイトマップにのみ載せており、対応する英語ページはありません。クローンは一致のためにこのルートを保持し、正直に明示しています。",
  },
  switcher: {
    label: "言語",
    english: "English",
  },
  footer:
    "このページのすべての記述は、それを支えるコードベースに根拠があります。架空のプラン・オファー・提携は一切ありません。",
  status: {
    works: "ここで利用可能",
    partial: "ここでは一部対応",
    absent: "このクローンには未実装",
  },
  blogFamily: {
    written: "ここに執筆済み",
    news: "参照サイトのニュース",
    core: "実際の 3D トピック",
    game: "ゲーム攻略 SEO",
    off: "3D トピックですらない",
  },
  meta: {
    homeTitle: "Hyper3D — 日本語版",
  },
};

const ko: LocaleMessages = {
  studio: "스튜디오",
  families: {
    pricing: "요금",
    prompts: "3D 프롬프트",
    switch: "전환 가이드",
    help: "도움말 센터",
    features: "기능",
    tools: "도구",
    styles: "스타일",
    useCases: "사용 사례",
    legal: "법적 고지",
    subCategories: "하위 카테고리",
    blog: "블로그",
  },
  home: {
    eyebrow: "HYPER3D 클론",
    headline: "{language}로 둘러보는 Hyper3D 클론",
    subhead:
      "Hyper3D 클론의 한국어판입니다. 인터페이스·허브·정직한 상태 페이지는 한국어로 제공하고, 모든 장문 콘텐츠는 영어로 유지되며 각 페이지에서 영어 원문으로 연결됩니다.",
    explore: "영어 스튜디오 열기",
  },
  hub: {
    intro: "이 한국어 허브 아래에는 {count}개의 라우트가 있으며, 각 페이지는 해당 영어 원문으로 연결됩니다.",
    browse: "영어 허브 둘러보기",
  },
  notice: {
    title: "전체 본문은 영어로 제공됩니다",
    body:
      "이 클론의 장문 콘텐츠는 영어로만 작성됩니다. 섹션, FAQ, 코드에 근거한 모든 설명은 아래 영어 원문에 있습니다.",
    cta: "영어 원문 읽기",
  },
  parity: "이 라우트는 참조 사이트 사이트맵과의 일치를 위해 유지됩니다.",
  localeOnly: {
    title: "영어 원문이 없습니다",
    body:
      "참조 사이트는 이 라우트를 현지화 사이트맵에만 싣고 있어 대응하는 영어 페이지가 없습니다. 클론은 일치를 위해 이 라우트를 유지하며 정직하게 표시합니다.",
  },
  switcher: {
    label: "언어",
    english: "English",
  },
  footer:
    "이 페이지의 모든 주장은 이를 뒷받침하는 코드베이스에 근거합니다. 가상의 플랜·제안·제휴는 없습니다.",
  status: {
    works: "여기서 동작함",
    partial: "여기서 일부 동작",
    absent: "이 클론에는 없음",
  },
  blogFamily: {
    written: "여기에 작성됨",
    news: "참조 사이트 뉴스",
    core: "실제 3D 주제",
    game: "게임 가이드 SEO",
    off: "3D 주제도 아님",
  },
  meta: {
    homeTitle: "Hyper3D — 한국어판",
  },
};

const ru: LocaleMessages = {
  studio: "Студия",
  families: {
    pricing: "Цены",
    prompts: "3D-промпты",
    switch: "Переход с других сервисов",
    help: "Центр помощи",
    features: "Возможности",
    tools: "Инструменты",
    styles: "Стили",
    useCases: "Сценарии использования",
    legal: "Юридическая информация",
    subCategories: "Подкатегории",
    blog: "Блог",
  },
  home: {
    eyebrow: "КЛОН HYPER3D",
    headline: "Hyper3D — навигация на русском",
    subhead:
      "Это русская версия клона Hyper3D: интерфейс, разделы и честные страницы статусов переведены; все развёрнутые материалы остаются на английском, и с каждой страницы есть ссылка на оригинал.",
    explore: "Открыть англоязычную студию",
  },
  hub: {
    intro: "В этом русскоязычном разделе {count} маршрутов — каждая страница ссылается на свой англоязычный оригинал.",
    browse: "Открыть англоязычный раздел",
  },
  notice: {
    title: "Полный текст — на английском",
    body:
      "Этот клон пишет развёрнутые материалы только на английском. Полная страница — разделы, FAQ и каждое утверждение, закреплённое в коде, — находится в англоязычном оригинале ниже.",
    cta: "Читать англоязычный оригинал",
  },
  parity: "Этот маршрут сохранён для соответствия карте сайта референса.",
  localeOnly: {
    title: "Англоязычного оригинала нет",
    body:
      "Референс публикует этот маршрут только в локализованной карте сайта — англоязычной страницы не существует. Клон сохраняет маршрут для соответствия и честно это помечает.",
  },
  switcher: {
    label: "Язык",
    english: "English",
  },
  footer:
    "Каждое утверждение на этой странице опирается на код, который её создаёт, — никаких вымышленных планов, предложений и партнёрств.",
  status: {
    works: "РАБОТАЕТ ЗДЕСЬ",
    partial: "ЧАСТИЧНО ЗДЕСЬ",
    absent: "НЕТ В ЭТОМ КЛОНЕ",
  },
  blogFamily: {
    written: "НАПИСАНО ЗДЕСЬ",
    news: "НОВОСТИ РЕФЕРЕНСА",
    core: "НАСТОЯЩАЯ 3D-ТЕМА",
    game: "SEO ПО ИГРОВЫМ ГАЙДАМ",
    off: "ДАЖЕ НЕ 3D-ТЕМА",
  },
  meta: {
    homeTitle: "Hyper3D — Русская версия",
  },
};

const pt: LocaleMessages = {
  studio: "Estúdio",
  families: {
    pricing: "Preços",
    prompts: "Prompts de 3D",
    switch: "Guia de migração",
    help: "Central de ajuda",
    features: "Recursos",
    tools: "Ferramentas",
    styles: "Estilos",
    useCases: "Casos de uso",
    legal: "Jurídico",
    subCategories: "Subcategorias",
    blog: "Blog",
  },
  home: {
    eyebrow: "CLONE DO HYPER3D",
    headline: "Hyper3D para navegar em {language}",
    subhead:
      "Esta é a edição em português do clone do Hyper3D: a interface, os hubs e as páginas honestas de status estão traduzidos; todos os artigos longos permanecem em inglês, com um link para o original em cada página.",
    explore: "Abrir o estúdio em inglês",
  },
  hub: {
    intro: "Neste hub em português existem {count} rotas — cada página aponta para o seu original em inglês.",
    browse: "Explorar o hub em inglês",
  },
  notice: {
    title: "O texto completo está em inglês",
    body:
      "Este clone escreve seu conteúdo longo apenas em inglês. A página completa — seções, perguntas frequentes e cada afirmação ancorada no código — está no original em inglês abaixo.",
    cta: "Ler o original em inglês",
  },
  parity: "Esta rota existe para manter a paridade do sitemap de referência.",
  localeOnly: {
    title: "Não existe original em inglês",
    body:
      "A referência publica esta rota apenas no sitemap localizado — não há página em inglês correspondente. O clone mantém a rota por paridade e a marca com honestidade.",
  },
  switcher: {
    label: "Idioma",
    english: "English",
  },
  footer:
    "Cada afirmação nesta página está ancorada no código-fonte que a entrega — sem planos, ofertas ou parcerias inventadas.",
  status: {
    works: "FUNCIONA AQUI",
    partial: "PARCIAL AQUI",
    absent: "NÃO EXISTE NESTE CLONE",
  },
  blogFamily: {
    written: "ESCRITO AQUI",
    news: "NOTÍCIAS DA REFERÊNCIA",
    core: "TEMA REAL DE 3D",
    game: "SEO DE GUIAS DE JOGOS",
    off: "NEM É UM TEMA DE 3D",
  },
  meta: {
    homeTitle: "Hyper3D — Edição em português",
  },
};

const fr: LocaleMessages = {
  studio: "Studio",
  families: {
    pricing: "Tarifs",
    prompts: "Prompts 3D",
    switch: "Guide de migration",
    help: "Centre d'aide",
    features: "Fonctionnalités",
    tools: "Outils",
    styles: "Styles",
    useCases: "Cas d'usage",
    legal: "Mentions légales",
    subCategories: "Sous-catégories",
    blog: "Blog",
  },
  home: {
    eyebrow: "CLONE HYPER3D",
    headline: "Hyper3D, navigable en {language}",
    subhead:
      "Voici l'édition française du clone Hyper3D : l'interface, les hubs et les pages honnêtes de statut sont traduits ; chaque article long reste en anglais, avec un lien vers l'original sur chaque page.",
    explore: "Ouvrir le studio en anglais",
  },
  hub: {
    intro: "Ce hub francophone contient {count} routes — chaque page renvoie vers son original anglais.",
    browse: "Parcourir le hub en anglais",
  },
  notice: {
    title: "Le texte complet est en anglais",
    body:
      "Ce clone rédige ses contenus longs uniquement en anglais. La page complète — sections, FAQ et chaque affirmation ancrée dans le code — se trouve dans l'original anglais ci-dessous.",
    cta: "Lire l'original anglais",
  },
  parity: "Cette route est conservée pour la parité du sitemap de référence.",
  localeOnly: {
    title: "Aucun original anglais n'existe",
    body:
      "La référence ne publie cette route que dans son sitemap localisé — il n'existe pas de page anglaise correspondante. Le clone conserve la route par parité et le signale honnêtement.",
  },
  switcher: {
    label: "Langue",
    english: "English",
  },
  footer:
    "Chaque affirmation de cette page est ancrée dans le code qui la livre — aucun plan, offre ou partenariat inventé.",
  status: {
    works: "FONCTIONNE ICI",
    partial: "PARTIEL ICI",
    absent: "ABSENT DE CE CLONE",
  },
  blogFamily: {
    written: "ÉCRIT ICI",
    news: "ACTUALITÉS DE LA RÉFÉRENCE",
    core: "VRAI SUJET 3D",
    game: "SEO DE GUIDES DE JEUX",
    off: "PAS MÊME UN SUJET 3D",
  },
  meta: {
    homeTitle: "Hyper3D — Édition française",
  },
};

const es: LocaleMessages = {
  studio: "Estudio",
  families: {
    pricing: "Precios",
    prompts: "Prompts de 3D",
    switch: "Guía de migración",
    help: "Centro de ayuda",
    features: "Funciones",
    tools: "Herramientas",
    styles: "Estilos",
    useCases: "Casos de uso",
    legal: "Información legal",
    subCategories: "Subcategorías",
    blog: "Blog",
  },
  home: {
    eyebrow: "CLON DE HYPER3D",
    headline: "Hyper3D para navegar en {language}",
    subhead:
      "Esta es la edición en español del clon de Hyper3D: la interfaz, los hubs y las páginas honestas de estado están traducidos; todos los artículos extensos permanecen en inglés, con un enlace al original en cada página.",
    explore: "Abrir el estudio en inglés",
  },
  hub: {
    intro: "En este hub en español hay {count} rutas — cada página enlaza a su original en inglés.",
    browse: "Explorar el hub en inglés",
  },
  notice: {
    title: "El texto completo está en inglés",
    body:
      "Este clon escribe su contenido extenso solo en inglés. La página completa — secciones, preguntas frecuentes y cada afirmación anclada en el código — está en el original en inglés de abajo.",
    cta: "Leer el original en inglés",
  },
  parity: "Esta ruta se mantiene por paridad con el sitemap de referencia.",
  localeOnly: {
    title: "No existe original en inglés",
    body:
      "La referencia publica esta ruta solo en su sitemap localizado — no hay página en inglés correspondiente. El clon mantiene la ruta por paridad y la marca con honestidad.",
  },
  switcher: {
    label: "Idioma",
    english: "English",
  },
  footer:
    "Cada afirmación de esta página está anclada en el código que la entrega — sin planes, ofertas ni asociaciones inventadas.",
  status: {
    works: "FUNCIONA AQUÍ",
    partial: "PARCIAL AQUÍ",
    absent: "NO ESTÁ EN ESTE CLON",
  },
  blogFamily: {
    written: "ESCRITO AQUÍ",
    news: "NOTICIAS DE LA REFERENCIA",
    core: "TEMA REAL DE 3D",
    game: "SEO DE GUÍAS DE JUEGOS",
    off: "NI SIQUIERA UN TEMA DE 3D",
  },
  meta: {
    homeTitle: "Hyper3D — Edición en español",
  },
};

const ar: LocaleMessages = {
  studio: "الاستوديو",
  families: {
    pricing: "الأسعار",
    prompts: "أوامر 3D",
    switch: "دليل الانتقال",
    help: "مركز المساعدة",
    features: "الميزات",
    tools: "الأدوات",
    styles: "الأنماط",
    useCases: "حالات الاستخدام",
    legal: "المعلومات القانونية",
    subCategories: "الفئات الفرعية",
    blog: "المدونة",
  },
  home: {
    eyebrow: "نسخة Hyper3D المطابقة",
    headline: "تصفّح نسخة Hyper3D المطابقة بال{language}",
    subhead:
      "هذه هي النسخة العربية من نسخة Hyper3D المطابقة: الواجهة والأقسام وصفحات الحالة الصادقة مترجمة، وتبقى جميع المقالات المطوّلة بالإنجليزية مع رابط إلى النص الأصلي في كل صفحة.",
    explore: "افتح الاستوديو بالإنجليزية",
  },
  hub: {
    intro: "يوجد في هذا القسم العربي {count} مسارًا، وترتبط كل صفحة بنصّها الأصلي بالإنجليزية.",
    browse: "تصفّح القسم بالإنجليزية",
  },
  notice: {
    title: "النص الكامل بالإنجليزية",
    body:
      "تكتب هذه النسخة المطابقة محتواها المطوّل بالإنجليزية فقط. الصفحة الكاملة — الأقسام والأسئلة الشائعة وكل عبارة مرتبطة بالكود — موجودة في النص الأصلي بالإنجليزية أدناه.",
    cta: "اقرأ النص الأصلي بالإنجليزية",
  },
  parity: "يُحتفظ بهذا المسار لمطابقة خريطة موقع المرجع.",
  localeOnly: {
    title: "لا يوجد نص أصلي بالإنجليزية",
    body:
      "ينشر الموقع المرجع هذا المسار في خريطة موقعه المعرَّبة فقط، ولا توجد صفحة إنجليزية مقابلة. تحتفظ النسخة المطابقة بالمسار للمطابقة وتوضّح ذلك بصدق.",
  },
  switcher: {
    label: "اللغة",
    english: "English",
  },
  footer:
    "كل عبارة في هذه الصفحة مرتبطة بالكود الذي يُسلّمها — لا خطوط ولا عروض ولا شراكات مُختلَقة.",
  status: {
    works: "يعمل هنا",
    partial: "جزئي هنا",
    absent: "غير موجود في هذه النسخة",
  },
  blogFamily: {
    written: "مكتوب هنا",
    news: "أخبار المرجع",
    core: "موضوع ثلاثي الأبعاد حقيقي",
    game: "SEO لأدلة الألعاب",
    off: "ليس حتى موضوعًا ثلاثي الأبعاد",
  },
  meta: {
    homeTitle: "Hyper3D — النسخة العربية",
  },
};

const tr: LocaleMessages = {
  studio: "Stüdyo",
  families: {
    pricing: "Fiyatlandırma",
    prompts: "3D Prompt'ları",
    switch: "Geçiş rehberi",
    help: "Yardım merkezi",
    features: "Özellikler",
    tools: "Araçlar",
    styles: "Stiller",
    useCases: "Kullanım senaryoları",
    legal: "Yasal bilgiler",
    subCategories: "Alt kategoriler",
    blog: "Blog",
  },
  home: {
    eyebrow: "HYPER3D KLONU",
    headline: "{language} gezilebilen Hyper3D klonu",
    subhead:
      "Bu, Hyper3D klonunun Türkçe sürümüdür: arayüz, hub'lar ve dürüst durum sayfaları çevrilidir; uzun içeriklerin tamamı İngilizce kalır ve her sayfada özgün metne bağlantı bulunur.",
    explore: "İngilizce stüdyoyu aç",
  },
  hub: {
    intro: "Bu Türkçe hub altında {count} rota var — her sayfa kendi İngilizce özgün metnine bağlantı verir.",
    browse: "İngilizce hub'a göz at",
  },
  notice: {
    title: "Tam metin İngilizcedir",
    body:
      "Bu klon uzun metinlerini yalnızca İngilizce yazar. Bölümleri, SSS'leri ve koda dayalı her iddiayı içeren tam sayfa, aşağıdaki İngilizce özgün metindedir.",
    cta: "İngilizce özgün metni oku",
  },
  parity: "Bu rota, referans site haritasıyla eşlik için tutulur.",
  localeOnly: {
    title: "İngilizce özgün metin yok",
    body:
      "Referans, bu rotayı yalnızca yerelleştirilmiş site haritasında yayınlar — karşılık gelen İngilizce sayfa yoktur. Klon rotayı eşlik için tutar ve bunu dürüstçe işaretler.",
  },
  switcher: {
    label: "Dil",
    english: "English",
  },
  footer:
    "Bu sayfadaki her iddia, onu teslim eden kod tabanına dayanır — uydurulmuş plan, teklif veya ortaklık yoktur.",
  status: {
    works: "BURADA ÇALIŞIR",
    partial: "BURADA KISMEN",
    absent: "BU KLONDA YOK",
  },
  blogFamily: {
    written: "BURADA YAZILDI",
    news: "REFERANS HABERLERİ",
    core: "GERÇEK 3D KONUSU",
    game: "OYUN REHBERİ SEO'SU",
    off: "3D KONUSU BİLE DEĞİL",
  },
  meta: {
    homeTitle: "Hyper3D — Türkçe sürüm",
  },
};

const it: LocaleMessages = {
  studio: "Studio",
  families: {
    pricing: "Prezzi",
    prompts: "Prompt 3D",
    switch: "Guida di migrazione",
    help: "Centro assistenza",
    features: "Funzionalità",
    tools: "Strumenti",
    styles: "Stili",
    useCases: "Casi d'uso",
    legal: "Note legali",
    subCategories: "Sottocategorie",
    blog: "Blog",
  },
  home: {
    eyebrow: "CLONE DI HYPER3D",
    headline: "Hyper3D, navigabile in {language}",
    subhead:
      "Questa è l'edizione italiana del clone di Hyper3D: interfaccia, hub e pagine oneste di stato sono tradotte; tutti gli articoli lunghi restano in inglese, con un link all'originale in ogni pagina.",
    explore: "Apri lo studio in inglese",
  },
  hub: {
    intro: "In questo hub in italiano ci sono {count} rotte — ogni pagina rimanda al suo originale in inglese.",
    browse: "Sfoglia l'hub in inglese",
  },
  notice: {
    title: "Il testo completo è in inglese",
    body:
      "Questo clone scrive i suoi contenuti lunghi solo in inglese. La pagina completa — sezioni, FAQ e ogni affermazione ancorata al codice — si trova nell'originale in inglese qui sotto.",
    cta: "Leggi l'originale in inglese",
  },
  parity: "Questa rotta è mantenuta per la parità della sitemap di riferimento.",
  localeOnly: {
    title: "Non esiste un originale in inglese",
    body:
      "Il sito di riferimento pubblica questa rotta solo nella sua sitemap localizzata — non esiste una pagina inglese corrispondente. Il clone mantiene la rotta per parità e la segnala onestamente.",
  },
  switcher: {
    label: "Lingua",
    english: "English",
  },
  footer:
    "Ogni affermazione in questa pagina è ancorata al codice che la pubblica — nessun piano, offerta o partnership inventato.",
  status: {
    works: "FUNZIONA QUI",
    partial: "PARZIALE QUI",
    absent: "NON ESISTE IN QUESTO CLONE",
  },
  blogFamily: {
    written: "SCRITTO QUI",
    news: "NEWS DI RIFERIMENTO",
    core: "VERO ARGOMENTO 3D",
    game: "SEO DI GUIDE DI GIOCHI",
    off: "NON È NEMMENO UN ARGOMENTO 3D",
  },
  meta: {
    homeTitle: "Hyper3D — Edizione italiana",
  },
};

export const LOCALE_MESSAGES: Record<LocaleCode, LocaleMessages> = {
  zh,
  de,
  ja,
  ko,
  ru,
  pt,
  fr,
  es,
  ar,
  tr,
  it,
};
