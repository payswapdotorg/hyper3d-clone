/**
 * <JsonLd> (t67): renders structured-data objects as
 * <script type="application/ld+json"> tags in the server HTML.
 *
 * Usage: pages spread the family bundles from src/lib/schema-org.ts:
 *
 *   const blocks = featureJsonLd(def);
 *   return <main>…{blocks.map((b, i) => <JsonLd key={i} data={b} />)}</main>;
 *
 * A server component on purpose — the reference ships its JSON-LD in the
 * initial HTML, and crawlers do not execute JS.
 */

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output of our own builders: no user input, no
      // "</script>" sequences (strings are our controlled copy).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
