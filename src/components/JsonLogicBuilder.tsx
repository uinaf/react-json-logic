import { useMemo } from "react";
import Any from "./Any.tsx";
import styles from "./JsonLogicBuilder.module.css";

interface Props {
  onChange: (value: unknown) => void;
  value?: unknown;
  data?: Record<string, unknown> | string;
}

function parseData(data: Record<string, unknown> | string): Record<string, unknown> {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function JsonLogicBuilder({ onChange, value = {}, data = {} }: Props) {
  const parsedData = useMemo(() => parseData(data), [data]);

  return (
    <div className={styles.Wrapper}>
      <Any parent="master" data={parsedData} value={value} onChange={onChange} />
    </div>
  );
}

export default JsonLogicBuilder;
