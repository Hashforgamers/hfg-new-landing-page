// Renders one or more schema.org objects as JSON-LD script tags.
export default function JsonLd({ data }) {
  return [].concat(data).map((d, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
  ));
}
