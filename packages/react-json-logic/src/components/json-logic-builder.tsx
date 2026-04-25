import { useEffect, useMemo, useRef } from "react";
import type { JsonLogicValue } from "../operators.ts";
import Any from "./any.tsx";

/** Sample data the builder uses for accessor (`var`) suggestions. */
export type JsonLogicData = Record<string, unknown> | unknown[];

type ParseResult = { ok: true; data: JsonLogicData } | { ok: false; error: unknown; raw: string };

interface Props {
  onChange: (value: JsonLogicValue) => void;
  value?: JsonLogicValue;
  data?: JsonLogicData | string;
  /**
   * Called once whenever `data` is a string and `JSON.parse` fails. The
   * callback is de-duplicated by raw value, so it fires exactly once per
   * malformed `data` value even under React's StrictMode double-mount.
   * If omitted, the parse error is reported via `console.warn`.
   */
  onDataError?: (error: unknown, raw: string) => void;
}

export function JsonLogicBuilder({ onChange, value = "", data = {}, onDataError }: Props) {
  // Keep `onDataError` in a ref so we don't re-fire the side-effect just
  // because the consumer passed a fresh callback closure on render.
  const onDataErrorRef = useRef(onDataError);
  onDataErrorRef.current = onDataError;

  // Pure parse — never fires side effects so it's safe under StrictMode's
  // double-invoke-of-pure-functions check.
  const parseResult = useMemo<ParseResult>(() => {
    if (typeof data !== "string") return { ok: true, data };
    try {
      return { ok: true, data: JSON.parse(data) as JsonLogicData };
    } catch (error) {
      return { ok: false, error, raw: data };
    }
  }, [data]);

  // Side effect lives in useEffect with a ref-guarded dedupe so it fires
  // once per (failed) raw value across the StrictMode mount → cleanup → mount
  // cycle. Reset the dedupe whenever the parse succeeds so a later failure
  // can re-fire.
  const lastReportedRaw = useRef<string | null>(null);
  useEffect(() => {
    if (parseResult.ok) {
      lastReportedRaw.current = null;
      return;
    }
    if (lastReportedRaw.current === parseResult.raw) return;
    lastReportedRaw.current = parseResult.raw;
    const cb = onDataErrorRef.current;
    if (cb) cb(parseResult.error, parseResult.raw);
    else console.warn("[react-json-logic] data prop is not valid JSON:", parseResult.error);
  }, [parseResult]);

  const parsedData: JsonLogicData = parseResult.ok ? parseResult.data : {};

  return (
    <span data-rjl-builder>
      <Any parent="master" data={parsedData} value={value} onChange={onChange} />
    </span>
  );
}

export default JsonLogicBuilder;
