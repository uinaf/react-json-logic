import Any from "./any.tsx";

interface Props {
  parent: string;
  data?: Record<string, unknown>;
  value?: unknown;
  onChange: (value: { "=>": unknown[] }) => void;
}

export function HigherOrder({ parent, data = {}, value, onChange }: Props) {
  const wrapped =
    value && typeof value === "object" && "=>" in value
      ? (value as { "=>": unknown[] })
      : { "=>": [] as unknown[] };

  const inner = wrapped["=>"][0] ?? {};

  const handleChange = (next: unknown) => {
    onChange({ "=>": [next] });
  };

  return (
    <span data-rjl-higher-order>
      <span data-rjl-higher-order-arrow>=&gt;</span>
      <span data-rjl-higher-order-child>
        <Any parent={parent} data={data} value={inner} onChange={handleChange} />
      </span>
    </span>
  );
}

export default HigherOrder;
