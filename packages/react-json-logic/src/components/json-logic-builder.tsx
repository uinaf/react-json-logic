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
  // cycle. Keying the effect on `failedRaw` (vs the whole parseResult) makes
  // the effect a no-op when nothing relevant changed.
  const lastReportedRaw = useRef<string | null>(null);
  const failedRaw: string | null = parseResult.ok ? null : parseResult.raw;
  useEffect(() => {
    if (failedRaw === null) {
      lastReportedRaw.current = null;
      return;
    }
    if (lastReportedRaw.current === failedRaw) return;
    lastReportedRaw.current = failedRaw;
    // failedRaw being non-null implies parseResult is the error variant.
    if (parseResult.ok) return;
    const cb = onDataErrorRef.current;
    if (cb) cb(parseResult.error, parseResult.raw);
    else console.warn("[react-json-logic] data prop is not valid JSON:", parseResult.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parseResult is keyed via failedRaw
  }, [failedRaw]);

  const parsedData: JsonLogicData = parseResult.ok ? parseResult.data : {};

  return (
    <span data-rjl-builder>
      <Any parent="master" data={parsedData} value={value} onChange={onChange} />
    </span>
  );
}

export default JsonLogicBuilder;
