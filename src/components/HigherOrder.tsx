import Any from "./Any.tsx";
import styles from "./HigherOrder.module.css";

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
    <div className={styles.Wrapper}>
      <div className={styles.FatArrow}>{"=>"}</div>

      <div className={styles.Child}>
        <Any parent={parent} data={data} value={inner} onChange={handleChange} />
      </div>
    </div>
  );
}

export default HigherOrder;
