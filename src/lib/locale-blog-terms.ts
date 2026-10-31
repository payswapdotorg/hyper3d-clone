/**
 * The reference's own blog-family UI translations, pinned byte-faithfully
 * from the t79 probe (recon/t79/heads.json — every locale category/pagination
 * route the reference serves; generator: recon/t79/build-locale-blog-terms.py).
 *
 * These are the ONLY per-locale strings the blog category/pagination head
 * needs: the reference derives every one of its 341 locale routes' titles
 * and descriptions from these ~155 words by pure template (verified 0
 * mismatches across the full probe), so this clone derives, not pins,
 * the route-level strings.
 */

import type { LocaleCode } from "./i18n";
import type { BlogCategory } from "./blog-types";

/** The localized word for "Blog" as the reference uses it in blog
 * pagination titles ("博客 — 页 2 | Hyper3D"). */
export const LOCALE_BLOG_WORD: Record<LocaleCode, string> = {
  zh: "博客",
  de: "Blog",
  ja: "ブログ",
  ko: "블로그",
  ru: "Блог",
  pt: "Blog",
  fr: "Blog",
  es: "Blog",
  ar: "المدونة",
  tr: "Blog",
  it: "Blog",
};

/** The localized word for "Page" as the reference uses it in blog
 * pagination titles and description prefixes ("页 2: …"). */
export const LOCALE_PAGE_WORD: Record<LocaleCode, string> = {
  zh: "页",
  de: "Seite",
  ja: "ページ",
  ko: "페이지",
  ru: "Страница",
  pt: "Página",
  fr: "Page",
  es: "Página",
  ar: "الصفحة",
  tr: "Sayfa",
  it: "Pagina",
};

/** The localized category names as the reference uses them in locale
 * category titles and description templates — 11 locales x 12 categories,
 * the reference's own next-intl strings. */
export const LOCALE_CATEGORY_NAMES: Record<LocaleCode, Record<BlogCategory, string>> = {
  zh: {
    "news": "新闻",
    "comparisons": "对比评测",
    "xr": "XR",
    "ai-texturing": "AI 纹理",
    "game-development": "游戏开发",
    "prompt-guide": "提示词指南",
    "text-to-3d": "文本生成 3D",
    "image-to-3d": "图片生成 3D",
    "insights": "洞察",
    "3d-printing": "3D 打印",
    "workflow": "工作流",
    "animation": "动画",
  },
  de: {
    "news": "News",
    "comparisons": "Vergleiche",
    "xr": "XR",
    "ai-texturing": "KI-Texturierung",
    "game-development": "Spieleentwicklung",
    "prompt-guide": "Prompt-Leitfaden",
    "text-to-3d": "Text zu 3D",
    "image-to-3d": "Bild zu 3D",
    "insights": "Einblicke",
    "3d-printing": "3D-Druck",
    "workflow": "Workflow",
    "animation": "Animation",
  },
  ja: {
    "news": "ニュース",
    "comparisons": "比較",
    "xr": "XR",
    "ai-texturing": "AIテクスチャ生成",
    "game-development": "ゲーム開発",
    "prompt-guide": "プロンプトガイド",
    "text-to-3d": "テキストから3D",
    "image-to-3d": "画像から3D",
    "insights": "インサイト",
    "3d-printing": "3Dプリント",
    "workflow": "ワークフロー",
    "animation": "アニメーション",
  },
  ko: {
    "news": "뉴스",
    "comparisons": "비교",
    "xr": "XR",
    "ai-texturing": "AI 텍스처링",
    "game-development": "게임 개발",
    "prompt-guide": "프롬프트 가이드",
    "text-to-3d": "텍스트 to 3D",
    "image-to-3d": "이미지 to 3D",
    "insights": "인사이트",
    "3d-printing": "3D 프린팅",
    "workflow": "워크플로",
    "animation": "애니메이션",
  },
  ru: {
    "news": "Новости",
    "comparisons": "Сравнения",
    "xr": "XR",
    "ai-texturing": "AI-текстурирование",
    "game-development": "Разработка игр",
    "prompt-guide": "Гид по промптам",
    "text-to-3d": "Текст в 3D",
    "image-to-3d": "Изображение в 3D",
    "insights": "Аналитика",
    "3d-printing": "3D-печать",
    "workflow": "Рабочий процесс",
    "animation": "Анимация",
  },
  pt: {
    "news": "Notícias",
    "comparisons": "Comparações",
    "xr": "XR",
    "ai-texturing": "Texturização IA",
    "game-development": "Desenvolvimento de Jogos",
    "prompt-guide": "Guia de Prompts",
    "text-to-3d": "Texto para 3D",
    "image-to-3d": "Imagem para 3D",
    "insights": "Insights",
    "3d-printing": "Impressão 3D",
    "workflow": "Fluxo de Trabalho",
    "animation": "Animação",
  },
  fr: {
    "news": "Actualités",
    "comparisons": "Comparaisons",
    "xr": "XR",
    "ai-texturing": "Texturation IA",
    "game-development": "Développement de Jeux",
    "prompt-guide": "Guide de Prompts",
    "text-to-3d": "Texte vers 3D",
    "image-to-3d": "Image vers 3D",
    "insights": "Analyses",
    "3d-printing": "Impression 3D",
    "workflow": "Flux de travail",
    "animation": "Animation",
  },
  es: {
    "news": "Noticias",
    "comparisons": "Comparaciones",
    "xr": "XR",
    "ai-texturing": "Texturizado IA",
    "game-development": "Desarrollo de Juegos",
    "prompt-guide": "Guía de Prompts",
    "text-to-3d": "Texto a 3D",
    "image-to-3d": "Imagen a 3D",
    "insights": "Perspectivas",
    "3d-printing": "Impresión 3D",
    "workflow": "Flujo de Trabajo",
    "animation": "Animación",
  },
  ar: {
    "news": "أخبار",
    "comparisons": "مقارنات",
    "xr": "XR",
    "ai-texturing": "نسيج بالذكاء الاصطناعي",
    "game-development": "تطوير الألعاب",
    "prompt-guide": "دليل الأوامر",
    "text-to-3d": "نص إلى 3D",
    "image-to-3d": "صورة إلى 3D",
    "insights": "رؤى",
    "3d-printing": "طباعة ثلاثية الأبعاد",
    "workflow": "سير العمل",
    "animation": "رسوم متحركة",
  },
  tr: {
    "news": "Haberler",
    "comparisons": "Karşılaştırmalar",
    "xr": "XR",
    "ai-texturing": "AI Doku Oluşturma",
    "game-development": "Oyun Geliştirme",
    "prompt-guide": "Prompt Rehberi",
    "text-to-3d": "Metinden 3D'ye",
    "image-to-3d": "Görüntüden 3D'ye",
    "insights": "Görüşler",
    "3d-printing": "3D Baskı",
    "workflow": "İş Akışı",
    "animation": "Animasyon",
  },
  it: {
    "news": "Notizie",
    "comparisons": "Confronti",
    "xr": "XR",
    "ai-texturing": "Texturing IA",
    "game-development": "Sviluppo Giochi",
    "prompt-guide": "Guida ai Prompt",
    "text-to-3d": "Testo a 3D",
    "image-to-3d": "Immagine a 3D",
    "insights": "Approfondimenti",
    "3d-printing": "Stampa 3D",
    "workflow": "Flusso di Lavoro",
    "animation": "Animazione",
  },
};

/** The EN category names in the exact title case the reference puts in
 * its EN category <title>/og:title ("Text To 3D", not "Text to 3D" — the
 * BLOG_CATEGORIES display names differ; both are the reference's own). */
export const EN_CATEGORY_TITLE_NAMES: Record<BlogCategory, string> = {
  "news": "News",
  "comparisons": "Comparisons",
  "xr": "XR",
  "ai-texturing": "AI Texturing",
  "game-development": "Game Development",
  "prompt-guide": "Prompt Guide",
  "text-to-3d": "Text To 3D",
  "image-to-3d": "Image To 3D",
  "insights": "Insights",
  "3d-printing": "3D Printing",
  "workflow": "Workflow",
  "animation": "Animation",
};
