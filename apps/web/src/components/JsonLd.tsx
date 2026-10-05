/**
 * Structured data as a plain `<script type="application/ld+json">`, rendered
 * on the server so it is in the HTML crawlers fetch. `<` is escaped so no
 * value can close the script element.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
