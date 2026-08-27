import { useEffect, useMemo, useRef } from "react";
import type { JsonLogicValue } from "../operators.ts";
import Any from "./any.tsx";

/** Sample data the builder uses for accessor (`var`) suggestions. */
export type JsonLogicData = Record<string, unknown> | unknown[];

type ParseResult = { ok: true; data: JsonLogicData } | { ok: false; error: unknown; raw: string };

export interface JsonLogicBuilderProps {
  onChange: (value: JsonLogicValue) => void;
  value?: JsonLogicValue | undefined;
  data?: JsonLogicData | string | undefined;
  /**
   * Called once whenever `data` is a string and `JSON.parse` fails. The
   * callback is de-duplicated by raw value, so it fires exactly once per
   * malformed `data` value even under React's StrictMode double-mount.
   * If omitted, the parse error is reported via `console.warn`.
   */
  onDataError?: ((error: unknown, raw: string) => void) | undefined;
}

export function JsonLogicBuilder({
  onChange,
  value = "",
  data = {},
  onDataError,
}: JsonLogicBuilderProps) {
  // A fresh callback must not report the same failed input again.
  const onDataErrorRef = useRef(onDataError);
  onDataErrorRef.current = onDataError;

  // Parsing stays pure under StrictMode.
  const parseResult = useMemo<ParseResult>(() => {
    if (typeof data !== "string") return { ok: true, data };
    try {
      const parsed: unknown = JSON.parse(data);
      if (parsed !== null && typeof parsed === "object") {
        return { ok: true, data: parsed as JsonLogicData };
      }
      return { ok: false, error: new Error("data must be an object or array"), raw: data };
    } catch (error) {
      return { ok: false, error, raw: data };
    }
  }, [data]);

  // Recovery clears the dedupe key so the same invalid value can be reported
  // after it becomes invalid again.
  const lastReportedRaw = useRef<string | null>(null);
  const failedRaw: string | null = parseResult.ok ? null : parseResult.raw;
  useEffect(() => {
    if (failedRaw === null) {
      lastReportedRaw.current = null;
      return;
    }
    if (lastReportedRaw.current === failedRaw) return;
    lastReportedRaw.current = failedRaw;
    if (parseResult.ok) return;
    const cb = onDataErrorRef.current;
    if (cb) cb(parseResult.error, parseResult.raw);
    else console.warn("[react-json-logic] data prop is not valid JSON:", parseResult.error);
  }, [failedRaw, parseResult]);

  const parsedData: JsonLogicData = parseResult.ok ? parseResult.data : {};

  return (
    <span data-rjl-builder>
      <Any parent="master" data={parsedData} value={value} onChange={onChange} />
    </span>
  );
}

export default JsonLogicBuilder;
