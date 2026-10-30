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
 *  - prompts: the localized prompt-library chrome (t70): index intro
    ({count}), pagination labels, card chips, the community
    not-reproduced banner, and the model-hub parity banner
    ({model}/{count})
  - meta.homeTitle: the /{locale} <title>
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
  prompts: {
    /** Index intro under the localized prompts H1 ({count} routes). */
    indexIntro: string;
    /** Pagination eyebrow: "Page {page} of {total}". */
    pageOf: string;
    /** Prev/next pagination link labels. */
    prev: string;
    next: string;
    /** Card chips — the written/community vocabulary. */
    writtenChip: string;
    communityChip: string;
    /** Hub member row tail labels. */
    writtenLabel: string;
    communityLabel: string;
    /** The localized not-reproduced banner on community routes. */
    communityTitle: string;
    communityBody: string;
    /** The localized parity banner on model hubs ({model}/{count}). */
    hubTitle: string;
    hubBody: string;
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
  prompts: {
    indexIntro:
      "该提示词库共 {count} 条路由——本克隆真实撰写的提示词排在前面，其后是参考站点的社区目录，均如实标注；卡片标题为英文路由数据。",
    pageOf: "第 {page} 页，共 {total} 页",
    prev: "上一页",
    next: "下一页",
    writtenChip: "此处可运行",
    communityChip: "未转载",
    writtenLabel: "本站撰写",
    communityLabel: "社区路由",
    communityTitle: "社区提示词——此处未转载",
    communityBody:
      "该路由是参考站点的社区提交条目。本克隆没有社区画廊，也不转载社区内容；此路由仅为对等而保留，完整说明见英文原文。",
    hubTitle: "仅参考站使用的分类——路由对等",
    hubBody:
      "{model} 是参考站点社区提示词所面向的第三方聊天模型之一。本克隆的生成器是自有管线，此页仅作路由对等；下方 {count} 条成员路由均指向同样如实的页面。",
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
  prompts: {
    indexIntro:
      "{count} Routen in dieser Prompt-Bibliothek — zuerst die Prompts, die dieser Clone selbst geschrieben hat, danach der Community-Katalog der Referenz, ehrlich markiert. Kartentitel sind englische Routendaten.",
    pageOf: "Seite {page} von {total}",
    prev: "Zurück",
    next: "Weiter",
    writtenChip: "LÄUFT HIER",
    communityChip: "NICHT REPRODUZIERT",
    writtenLabel: "Hier geschrieben",
    communityLabel: "Community-Route",
    communityTitle: "COMMUNITY-PROMPT — HIER NICHT REPRODUZIERT",
    communityBody:
      "Diese Route ist ein Community-Eintrag der Referenzsite. Dieser Clone hat keine Community-Galerie und reproduziert keine Community-Inhalte; die Route existiert aus Paritätsgründen, die vollständige Erklärung steht im englischen Original.",
    hubTitle: "NUR-REFERENZ-TAXONOMIE — ROUTENPARITÄT",
    hubBody:
      "{model} ist eines der Third-Party-Chat-Modelle, für die die Community-Prompts der Referenz geschrieben wurden. Der Generator dieses Clones ist eine eigene Pipeline — dieser Hub ist eine Paritätsroute, und die {count} Mitgliederrouten unten führen auf dieselben ehrlichen Seiten.",
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
  prompts: {
    indexIntro:
      "このプロンプトライブラリは {count} ルートで構成されます。先頭に本クローンが実際に執筆したプロンプト、続いて参照サイトのコミュニティカタログを正直なラベル付きで掲載します。カードのタイトルは英語のルートデータです。",
    pageOf: "全 {total} ページ中 {page} ページ目",
    prev: "前へ",
    next: "次へ",
    writtenChip: "ここで実行可能",
    communityChip: "未転載",
    writtenLabel: "本クローン執筆",
    communityLabel: "コミュニティルート",
    communityTitle: "コミュニティプロンプト——ここには転載しません",
    communityBody:
      "このルートは参照サイトのコミュニティ投稿です。本クローンにはコミュニティギャラリーがなく、コミュニティコンテンツも転載しません。ルートは整合性のためにのみ存在し、完全な説明は英語原文にあります。",
    hubTitle: "参照サイト専用の分類——ルート整合",
    hubBody:
      "{model} は、参照サイトのコミュニティプロンプトが対象としたサードパーティ製チャットモデルのひとつです。本クローンのジェネレーターは独自パイプラインであり、このハブは整合用ルートです。下の {count} 件のメンバールートは同じ正直なページへつながります。",
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
  prompts: {
    indexIntro:
      "이 프롬프트 라이브러리는 {count}개 라우트로 구성됩니다. 이 클론이 직접 작성한 프롬프트가 먼저, 이어 참조 사이트의 커뮤니티 카탈로그를 정직한 표시와 함께 게시합니다. 카드 제목은 영어 라우트 데이터입니다.",
    pageOf: "전체 {total} 페이지 중 {page} 페이지",
    prev: "이전",
    next: "다음",
    writtenChip: "여기서 실행 가능",
    communityChip: "재게시하지 않음",
    writtenLabel: "이 클론 작성",
    communityLabel: "커뮤니티 라우트",
    communityTitle: "커뮤니티 프롬프트 — 여기에 재게시하지 않음",
    communityBody:
      "이 라우트는 참조 사이트의 커뮤니티 제출 항목입니다. 이 클론에는 커뮤니티 갤러리가 없으며 커뮤니티 콘텐츠를 재게시하지도 않습니다. 라우트는 동등성을 위해서만 존재하며, 전체 설명은 영어 원문에 있습니다.",
    hubTitle: "참조 사이트 전용 분류 — 라우트 동등성",
    hubBody:
      "{model}은(는) 참조 사이트의 커뮤니티 프롬프트가 작성 대상으로 삼은 서드파티 채팅 모델 중 하나입니다. 이 클론의 생성기는 자체 파이프라인이며 이 허브는 동등성용 라우트입니다. 아래 {count}개 멤버 라우트는 같은 정직한 페이지로 이어집니다.",
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
  prompts: {
    indexIntro:
      "В этой библиотеке промптов {count} маршрутов: сначала промпты, написанные самим этим клоном, затем комьюнити-каталог референса с честной маркировкой. Заголовки карточек — англоязычные данные маршрутов.",
    pageOf: "Страница {page} из {total}",
    prev: "Назад",
    next: "Далее",
    writtenChip: "РАБОТАЕТ ЗДЕСЬ",
    communityChip: "НЕ ВОСПРОИЗВЕДЕНО",
    writtenLabel: "Написано здесь",
    communityLabel: "Маршрут комьюнити",
    communityTitle: "ПРОМПТ СООБЩЕСТВА — НЕ ВОСПРОИЗВЕДЁН",
    communityBody:
      "Этот маршрут — запись из сообщества референс-сайта. У клона нет галереи сообщества, и он не воспроизводит чужой контент; маршрут существует только ради паритета, полное объяснение — в англоязычном оригинале.",
    hubTitle: "ТАКСОНОМИЯ ТОЛЬКО РЕФЕРЕНСА — ПАРИТЕТ МАРШРУТА",
    hubBody:
      "{model} — одна из сторонних чат-моделей, для которых писались промпты сообщества референса. Генератор этого клона — собственный пайплайн, поэтому этот хаб — маршрут паритета. {count} маршрутов-участников ниже ведут на те же честные страницы.",
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
  prompts: {
    indexIntro:
      "Esta biblioteca de prompts tem {count} rotas — primeiro os prompts que este clone escreveu de verdade, depois o catálogo da comunidade da referência, marcados com honestidade. Os títulos dos cartões são dados de rota em inglês.",
    pageOf: "Página {page} de {total}",
    prev: "Anterior",
    next: "Próxima",
    writtenChip: "RODA AQUI",
    communityChip: "NÃO REPRODUZIDO",
    writtenLabel: "Escrito aqui",
    communityLabel: "Rota da comunidade",
    communityTitle: "PROMPT DA COMUNIDADE — NÃO REPRODUZIDO AQUI",
    communityBody:
      "Esta rota é uma entrada da comunidade do site de referência. Este clone não tem galeria da comunidade e não reproduz conteúdo dela; a rota existe apenas por paridade, e a explicação completa está no original em inglês.",
    hubTitle: "TAXONOMIA SÓ DA REFERÊNCIA — PARIDADE DE ROTA",
    hubBody:
      "{model} é um dos modelos de chat de terceiros para os quais os prompts da comunidade da referência foram escritos. O gerador deste clone é um pipeline próprio — este hub é uma rota de paridade, e as {count} rotas membros abaixo levam às mesmas páginas honestas.",
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
  prompts: {
    indexIntro:
      "Cette bibliothèque de prompts compte {count} routes — d'abord les prompts rédigés par ce clone, puis le catalogue communautaire de la référence, honnêtement signalés. Les titres des cartes sont des données de route en anglais.",
    pageOf: "Page {page} sur {total}",
    prev: "Précédent",
    next: "Suivant",
    writtenChip: "FONCTIONNE ICI",
    communityChip: "NON REPRODUIT",
    writtenLabel: "Écrit ici",
    communityLabel: "Route communautaire",
    communityTitle: "PROMPT COMMUNAUTAIRE — NON REPRODUIT ICI",
    communityBody:
      "Cette route est une soumission communautaire du site de référence. Ce clone n'a pas de galerie communautaire et ne reproduit aucun contenu communautaire ; la route n'existe que par parité, et l'explication complète se trouve dans l'original anglais.",
    hubTitle: "TAXONOMIE DE RÉFÉRENCE UNIQUEMENT — PARITÉ DE ROUTE",
    hubBody:
      "{model} est l'un des modèles de chat tiers pour lesquels les prompts communautaires de la référence ont été écrits. Le générateur de ce clone est son propre pipeline — ce hub est une route de parité, et les {count} routes membres ci-dessous mènent aux mêmes pages honnêtes.",
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
  prompts: {
    indexIntro:
      "Esta biblioteca de prompts tiene {count} rutas: primero los prompts que este clon escribió de verdad, luego el catálogo comunitario de la referencia, marcados con honestidad. Los títulos de las tarjetas son datos de ruta en inglés.",
    pageOf: "Página {page} de {total}",
    prev: "Anterior",
    next: "Siguiente",
    writtenChip: "FUNCIONA AQUÍ",
    communityChip: "NO REPRODUCIDO",
    writtenLabel: "Escrito aquí",
    communityLabel: "Ruta comunitaria",
    communityTitle: "PROMPT COMUNITARIO — NO REPRODUCIDO AQUÍ",
    communityBody:
      "Esta ruta es una entrada comunitaria del sitio de referencia. Este clon no tiene galería comunitaria ni reproduce contenido comunitario; la ruta existe solo por paridad, y la explicación completa está en el original en inglés.",
    hubTitle: "TAXONOMÍA SOLO DE LA REFERENCIA — PARIDAD DE RUTA",
    hubBody:
      "{model} es uno de los modelos de chat de terceros para los que se escribieron los prompts comunitarios de la referencia. El generador de este clon es un pipeline propio — este hub es una ruta de paridad, y las {count} rutas miembro de abajo llevan a las mismas páginas honestas.",
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
  prompts: {
    indexIntro:
      "تحتوي هذه المكتبة على {count} مسارًا — أولًا الأوامر التي كتبتها هذه النسخة المطابقة فعلًا، ثم فهرس مجتمع المرجع بوسم صادق. عناوين البطاقات بيانات مسارات بالإنجليزية.",
    pageOf: "صفحة {page} من {total}",
    prev: "السابق",
    next: "التالي",
    writtenChip: "يعمل هنا",
    communityChip: "غير معاد نشره",
    writtenLabel: "مكتوب هنا",
    communityLabel: "مسار مجتمعي",
    communityTitle: "أمر مجتمعي — غير معاد نشره هنا",
    communityBody:
      "هذا المسار إدخال من مجتمع الموقع المرجع. لا تملك هذه النسخة المطابقة معرضًا للمجتمع ولا تعيد نشر محتواه؛ المسار موجود للمطابقة فقط، والشرح الكامل في النص الأصلي بالإنجليزية.",
    hubTitle: "تصنيف للمرجع فقط — مطابقة مسار",
    hubBody:
      "{model} أحد نماذج الدردشة الخارجية التي كُتبت لها أوامر مجتمع المرجع. مولّد هذه النسخة المطابقة خط إنتاج خاص بها، لذا هذا المركز مسار مطابقة، ومسارات الأعضاء البالغة {count} أدناه تؤدي إلى الصفحات الصادقة نفسها.",
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
  prompts: {
    indexIntro:
      "Bu prompt kütüphanesinde {count} rota vardır — önce bu klonun gerçekten yazdığı promptlar, sonra referansın topluluk kataloğu, dürüstçe işaretlenmiş durumda. Kart başlıkları İngilizce rota verileridir.",
    pageOf: "Sayfa {page} / {total}",
    prev: "Önceki",
    next: "Sonraki",
    writtenChip: "BURADA ÇALIŞIR",
    communityChip: "YENİDEN YAYIMLANMADI",
    writtenLabel: "Burada yazıldı",
    communityLabel: "Topluluk rotası",
    communityTitle: "TOPLULUK PROMPT'U — BURADA YENİDEN YAYIMLANMADI",
    communityBody:
      "Bu rota, referans sitesinin bir topluluk gönderisidir. Bu klonun topluluk galerisi yoktur ve topluluk içeriğini yeniden yayımlamaz; rota yalnızca eşlik için var, tam açıklama İngilizce orijinaldedir.",
    hubTitle: "YALNIZCA REFERANS TAKSONOMİSİ — ROTA EŞLİĞİ",
    hubBody:
      "{model}, referansın topluluk promptlarının yazıldığı üçüncü taraf sohbet modellerinden biridir. Bu klonun üreticisi kendi hattıdır — bu merkez bir eşlik rotasıdır ve aşağıdaki {count} üye rota aynı dürüst sayfalara götürür.",
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
  prompts: {
    indexIntro:
      "Questa libreria di prompt conta {count} rotte — prima i prompt scritti davvero da questo clone, poi il catalogo community della referenza, contrassegnati con onestà. I titoli delle card sono dati di rotta in inglese.",
    pageOf: "Pagina {page} di {total}",
    prev: "Precedente",
    next: "Successiva",
    writtenChip: "FUNZIONA QUI",
    communityChip: "NON RIPRODOTTO",
    writtenLabel: "Scritto qui",
    communityLabel: "Rotta community",
    communityTitle: "PROMPT DELLA COMMUNITY — NON RIPRODOTTO QUI",
    communityBody:
      "Questa rotta è una voce community del sito di riferimento. Questo clone non ha una galleria community e non ne riproduce i contenuti; la rotta esiste solo per parità, e la spiegazione completa è nell'originale inglese.",
    hubTitle: "TASSONOMIA SOLO DELLA REFERENZA — PARITÀ DI ROTTA",
    hubBody:
      "{model} è uno dei modelli di chat di terze parti per cui sono stati scritti i prompt community della referenza. Il generatore di questo clone è una pipeline propria — questo hub è una rotta di parità, e le {count} rotte membro qui sotto portano alle stesse pagine oneste.",
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
