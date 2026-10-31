"use client";

/**
 * The content-preview host — the clone's honest implementation of the
 * reference's postMessage protocol (recon 2026-10-31, from the reference's
 * own inline module):
 *
 *  READY    h3d-content-preview:ready    page → parent/opener, {version: 1}
 *  RENDER   h3d-content-preview:render   editor → page, {id, mode, locale, slug, document}
 *  RENDERED h3d-content-preview:rendered page → editor, {id, unknownTypes, width, viewportWidth, height}
 *  SIZE     h3d-content-preview:size     page → editor, on every iframe resize
 *  ERROR    h3d-content-preview:error    page → editor, {id, status, message}
 *  REFUSED  h3d-content-preview:refused  page → any disallowed origin
 *
 * Origin gate: the reference reads an allowlist from a data attribute on
 * <html> (its admin console's origin). This clone has no admin console,
 * so the allowlist is exactly one entry — the origin the page is served
 * from. Any same-origin editor can drive the preview; everything else is
 * refused. The render POST itself is additionally gated server-side on
 * Sec-Fetch-Site: same-origin.
 */

import { useCallback, useEffect, useRef } from "react";

import {
  PREVIEW_MESSAGES,
  PREVIEW_RENDER_PATH,
  PREVIEW_STANDALONE_MESSAGE,
  PREVIEW_UNKNOWN_HEADER,
  PREVIEW_WAITING_MESSAGE,
} from "@/lib/content-preview";

interface RenderMessageData {
  type: string;
  id?: unknown;
  mode?: unknown;
  locale?: unknown;
  slug?: unknown;
  document?: unknown;
}

export function ContentPreviewHost() {
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  /** The editor this host currently serves (source window + origin). */
  const editorRef = useRef<{ source: Window; origin: string } | null>(null);
  const renderSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastSizeRef = useRef("");
  const observerRef = useRef<ResizeObserver | null>(null);

  const setStatus = useCallback((text: string) => {
    if (statusRef.current) statusRef.current.textContent = text;
  }, []);

  /* ---- geometry: measure the live iframe and stream sizes to the editor */
  const measure = useCallback(() => {
    const frame = frameRef.current;
    const win = frame?.contentWindow;
    const doc = frame?.contentDocument;
    if (!win || !doc) return { width: 0, viewportWidth: 0, height: 0 };
    return {
      width: doc.documentElement.scrollWidth,
      viewportWidth: win.innerWidth,
      height: doc.documentElement.scrollHeight,
    };
  }, []);

  const send = useCallback((message: Record<string, unknown>) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.source.postMessage(message, editor.origin);
  }, []);

  const observeFrame = useCallback(
    (frame: HTMLIFrameElement) => {
      observerRef.current?.disconnect();
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) return;
      // ResizeObserver lives on the iframe's own window; the DOM lib types
      // it on globalThis only, so reach it through the child window.
      const ResizeObserverCtor = (
        win as unknown as { ResizeObserver?: typeof ResizeObserver }
      ).ResizeObserver;
      if (!ResizeObserverCtor) return;
      let queued = false;
      const observer = new ResizeObserverCtor(() => {
        if (queued) return;
        queued = true;
        win.requestAnimationFrame(() => {
          queued = false;
          const size = measure();
          const key = `${size.width}x${size.viewportWidth}x${size.height}`;
          if (key === lastSizeRef.current) return;
          lastSizeRef.current = key;
          send({ type: PREVIEW_MESSAGES.size, ...size });
        });
      });
      observer.observe(doc.documentElement);
      observerRef.current = observer;
    },
    [measure, send],
  );

  /* ---- link interception: links inside the draft open in a new tab, not here */
  const wireLinks = useCallback((doc: Document) => {
    doc.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        const anchor = target instanceof Element ? target.closest("a") : null;
        if (!anchor) return;
        const href = anchor.getAttribute("href") ?? "";
        if (href.startsWith("#")) return;
        if (/^\s*javascript:/i.test(href)) return;
        event.preventDefault();
        window.open(anchor.href, "_blank", "noopener,noreferrer");
      },
      true,
    );
  }, []);

  /* ---- the RENDER message: POST the draft, swap in the rendered frame */
  const render = useCallback(
    async (data: RenderMessageData) => {
      const id = typeof data.id === "string" || typeof data.id === "number" ? data.id : undefined;
      const seq = (renderSeqRef.current += 1);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fail = (status: number, message: string) => {
        send({ type: PREVIEW_MESSAGES.error, id, status, message });
      };

      let response: Response;
      let body: string;
      try {
        response = await fetch(PREVIEW_RENDER_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: data.mode,
            locale: data.locale,
            slug: data.slug,
            document: data.document,
          }),
          credentials: "omit",
          cache: "no-store",
          referrerPolicy: "same-origin",
          signal: controller.signal,
        });
        body = await response.text();
      } catch {
        if (!controller.signal.aborted && seq === renderSeqRef.current) {
          fail(0, "The site could not be reached.");
        }
        return;
      }
      if (seq !== renderSeqRef.current) return;
      if (!response.ok) {
        fail(response.status, body.slice(0, 2000) || `HTTP ${response.status}`);
        return;
      }

      // Unknown content types arrive URL-encoded and comma-separated.
      const unknownTypes = (response.headers.get(PREVIEW_UNKNOWN_HEADER) ?? "")
        .split(",")
        .filter(Boolean)
        .map((entry) => {
          try {
            return decodeURIComponent(entry);
          } catch {
            return entry;
          }
        });

      const previous = frameRef.current;
      const frame = document.createElement("iframe");
      frame.title = "Draft preview";
      frame.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms",
      );
      frame.style.cssText = "width:100%;border:0;display:block;";
      frame.srcdoc = body;
      frame.addEventListener("load", () => {
        if (frameRef.current !== frame) return;
        const doc = frame.contentDocument;
        if (!doc || doc.URL === "about:srcdoc" && doc.readyState === "loading") return;
        wireLinks(doc);
        previous?.remove();
        setStatus("");
        lastSizeRef.current = "";
        observeFrame(frame);
        send({ type: PREVIEW_MESSAGES.rendered, id, unknownTypes, ...measure() });
      });
      frameRef.current = frame;
      document.body.append(frame);
    },
    [measure, observeFrame, send, setStatus, wireLinks],
  );

  /* ---- boot: announce READY to the editor, listen for RENDER/REFUSED */
  useEffect(() => {
    const editors: Window[] = [];
    if (window.parent !== window) editors.push(window.parent);
    if (window.opener) {
      editors.push(window.opener as Window);
      try {
        window.opener = null;
      } catch {
        /* some browsers lock opener; the protocol works without clearing it */
      }
    }

    // The origin allowlist: this clone's own origin, and nothing else.
    const allowed = window.location.origin;

    if (editors.length > 0) {
      setStatus(PREVIEW_WAITING_MESSAGE);
      for (const editor of editors) {
        editor.postMessage({ type: PREVIEW_MESSAGES.ready, version: 1 }, "*");
      }
    } else {
      setStatus(PREVIEW_STANDALONE_MESSAGE);
    }

    const onMessage = (event: MessageEvent) => {
      const source = event.source;
      // Duck-typed window check — `source instanceof Window` is FALSE for
      // windows from other realms (the parent's Window belongs to the
      // parent's realm), and identity against the collected editors is
      // the check that actually matters.

      if (!source || typeof source !== "object") return;
      if (!editors.includes(source as Window)) return;
      const data = event.data as RenderMessageData | null;
      if (!data || typeof data !== "object" || typeof data.type !== "string") return;
      if (!data.type.startsWith("h3d-content-preview:")) return;
      if (event.origin !== allowed) {
        (source as Window).postMessage(
          { type: PREVIEW_MESSAGES.refused, origin: event.origin },
          event.origin,
        );
        return;
      }
      if (data.type === PREVIEW_MESSAGES.render) {
        editorRef.current = { source: source as Window, origin: event.origin };
        void render(data);
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
      abortRef.current?.abort();
      observerRef.current?.disconnect();
    };
  }, [render, setStatus]);

  return (
    <p id="preview-status" role="status" ref={statusRef}>
      Loading…
    </p>
  );
}
