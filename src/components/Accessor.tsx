import CreatableSelect from "react-select/creatable";
import styles from "./Accessor.module.css";

interface Option {
  label: string;
  value: string;
}

interface Props {
  value?: string;
  data?: Record<string, unknown> | unknown[];
  onChange: (value: string) => void;
}

function getIterator(data: unknown): string[] | null {
  if (Array.isArray(data)) {
    const head = data[0];
    if (head && typeof head === "object") return Object.keys(head);
    return null;
  }
  if (data !== null && typeof data === "object") {
    return Object.keys(data as Record<string, unknown>);
  }
  return null;
}

export function Accessor({ value = "", data = {}, onChange }: Props) {
  const splitValue = value.split(".");

  const renderSelector = (current: unknown, level: number): React.ReactNode => {
    const levelValue = splitValue[level] ?? "";
    let iterator = getIterator(current);
    if (!iterator) return null;

    if (levelValue !== "" && !iterator.includes(levelValue)) {
      iterator = [levelValue, ...iterator];
    }

    const handleChange = (option: Option | null) => {
      if (!option) return;
      const next = splitValue.slice(0, level);
      next[level] = option.value;
      onChange(next.join("."));
    };

    const options: Option[] = iterator.map((item) => ({
      label: item,
      value: item,
    }));
    const selected = options.find((o) => o.value === levelValue) ?? null;

    const next = Array.isArray(current)
      ? current[0]?.[levelValue as never]
      : (current as Record<string, unknown>)[levelValue];

    return (
      <div className={styles.IteratorWrapper}>
        <div className={styles.SelectWrapper}>
          <CreatableSelect<Option>
            isClearable={false}
            value={selected}
            onChange={handleChange}
            options={options}
            formatCreateLabel={(label) => `Create option: ${label}`}
          />
        </div>

        {renderSelector(next, level + 1)}
      </div>
    );
  };

  return <div>{renderSelector(data, 0)}</div>;
}

export default Accessor;
