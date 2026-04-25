import { useMemo } from "react";
import Any from "./Any.tsx";
import styles from "./JsonLogicBuilder.module.css";

interface Props {
  onChange: (value: unknown) => void;
  value?: unknown;
  data?: Record<string, unknown> | string;
  /**
   * Called when `data` is a string and JSON.parse fails.
   * If omitted, the parse error is reported via console.warn.
   */
  onDataError?: (error: unknown, raw: string) => void;
}

function parseData(
  data: Record<string, unknown> | string,
  onError?: (error: unknown, raw: string) => void,
): Record<string, unknown> {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data) as Record<string, unknown>;
  } catch (err) {
    if (onError) onError(err, data);
    else console.warn("[react-json-logic] data prop is not valid JSON:", err);
    return {};
  }
}

export function JsonLogicBuilder({ onChange, value = {}, data = {}, onDataError }: Props) {
  const parsedData = useMemo(() => parseData(data, onDataError), [data, onDataError]);

  return (
    <div className={styles.Wrapper}>
      <Any parent="master" data={parsedData} value={value} onChange={onChange} />
    </div>
  );
}

export default JsonLogicBuilder;
