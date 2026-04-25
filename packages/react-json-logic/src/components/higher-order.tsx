import Any from "./any.tsx";

interface Props {
  parent: string;
  data?: Record<string, unknown>;
  value?: unknown;
  onChange: (value: unknown) => void;
}

/**
 * Visual wrapper for the predicate of a higher-order operator (`some`, `all`,
 * `none`, `map`, `filter`). Renders an `Any` directly — value flows through
 * untouched, so the surrounding rule keeps its canonical JsonLogic shape:
 *
 *   {some: [<collection>, <predicate>]}
 *
 * The `=>` glyph is a pure UX cue, surfaced via the `data-rjl-higher-order-arrow`
 * attribute for consumers to style. It does NOT appear in the emitted JSON.
 */
export function HigherOrder({ parent, data = {}, value, onChange }: Props) {
  return (
    <span data-rjl-higher-order>
      <span data-rjl-higher-order-arrow>=&gt;</span>
      <span data-rjl-higher-order-child>
        <Any parent={parent} data={data} value={value} onChange={onChange} />
      </span>
    </span>
  );
}

export default HigherOrder;
