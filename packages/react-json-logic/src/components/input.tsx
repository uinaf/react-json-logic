import { Select } from "@base-ui/react/select";
import { useMemo, useState } from "react";
import type { JsonLogicValue } from "../operators.ts";

const INPUT_TYPES = ["text", "number", "boolean", "null", "array"] as const;
type InputType = (typeof INPUT_TYPES)[number];

const BOOLEAN_ITEMS = [
  { label: "true", value: "true" },
  { label: "false", value: "false" },
] as const;

interface Props {
  name?: string;
  value?: JsonLogicValue;
  /** Initial type fallback if `value` is a string. Ignored for number/boolean/null/array. */
  type?: InputType;
  /**
   * Called with the next value. For unparseable numeric input, emits the raw
   * string instead of `NaN`. Consumers should validate numeric fields at their
   * boundary.
   */
  onChange: (value: JsonLogicValue) => void;
}

const getType = (value: JsonLogicValue | undefined, fallback: InputType): InputType => {
  if (typeof value === "number" && Number.isFinite(value)) return "number";
  if (typeof value === "boolean") return "boolean";
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return fallback;
};

const toText = (value: JsonLogicValue | undefined): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};

const toBoolean = (value: JsonLogicValue | undefined): boolean =>
  value === true || value === "true" || value === 1;

const toArray = (value: JsonLogicValue | undefined): JsonLogicValue[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

interface ArrayEditorState {
  draft: string;
  serializedValue: string;
  pendingValue: string | null;
}

function ArrayEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: JsonLogicValue[];
  onChange: (value: JsonLogicValue[]) => void;
}) {
  const serialized = JSON.stringify(value);
  const [editor, setEditor] = useState<ArrayEditorState>(() => ({
    draft: serialized,
    serializedValue: serialized,
    pendingValue: null,
  }));
  if (serialized !== editor.serializedValue) {
    const isAcknowledgement = editor.pendingValue === serialized;
    setEditor({
      draft: isAcknowledgement ? editor.draft : serialized,
      serializedValue: serialized,
      pendingValue: null,
    });
  }

  const onDraftChange = (raw: string) => {
    let emitted: JsonLogicValue[] | undefined;
    if (raw.trim() === "") {
      emitted = [];
    } else {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) emitted = parsed;
      } catch {}
    }
    const emittedSerialized = emitted === undefined ? undefined : JSON.stringify(emitted);
    setEditor((current) => {
      const pendingValue =
        emittedSerialized === undefined
          ? current.pendingValue
          : emittedSerialized === current.serializedValue
            ? null
            : emittedSerialized;
      return { ...current, draft: raw, pendingValue };
    });
    if (emitted !== undefined) onChange(emitted);
  };

  return (
    <textarea
      name={name}
      aria-label={name || "Array value"}
      data-rjl-input-array
      data-rjl-input-value
      value={editor.draft}
      onChange={(e) => onDraftChange(e.target.value)}
    />
  );
}

export function Input({ name = "", value = "", type: typeProp = "text", onChange }: Props) {
  // The controlled value determines the type. A type selection emits a
  // converted value, and the next render derives its new type.
  const type = useMemo<InputType>(() => getType(value, typeProp), [value, typeProp]);

  const onTypeChange = (next: InputType | null) => {
    if (!next) return;
    switch (next) {
      case "number": {
        const n = parseFloat(toText(value));
        onChange(Number.isFinite(n) ? n : 0);
        return;
      }
      case "text":
        onChange(toText(value));
        return;
      case "boolean":
        onChange(toBoolean(value));
        return;
      case "null":
        onChange(null);
        return;
      case "array":
        onChange(toArray(value));
        return;
    }
  };

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (type !== "number") {
      onChange(raw);
      return;
    }
    if (raw === "") {
      onChange("");
      return;
    }
    const n = parseFloat(raw);
    onChange(Number.isFinite(n) ? n : raw);
  };

  const items = useMemo(() => INPUT_TYPES.map((t) => ({ label: t, value: t })), []);

  return (
    <span data-rjl-input>
      <Select.Root<InputType> items={items} value={type} onValueChange={onTypeChange}>
        <Select.Trigger data-rjl-input-type-trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup data-rjl-input-type-popup>
              <Select.List>
                {items.map(({ label, value: itemValue }) => (
                  <Select.Item key={itemValue} value={itemValue}>
                    <Select.ItemText>{label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>

      {(type === "text" || type === "number") && (
        <input
          name={name}
          aria-label={name || "Value"}
          value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
          type={type}
          onChange={onValueChange}
          data-rjl-input-value
        />
      )}

      {type === "boolean" && (
        <Select.Root
          items={[...BOOLEAN_ITEMS]}
          value={value === true ? "true" : "false"}
          onValueChange={(next) => {
            if (next == null) return;
            onChange(next === "true");
          }}
        >
          <Select.Trigger data-rjl-input-boolean>
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup data-rjl-input-boolean-popup>
                <Select.List>
                  {BOOLEAN_ITEMS.map(({ label, value: itemValue }) => (
                    <Select.Item key={itemValue} value={itemValue}>
                      <Select.ItemText>{label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      )}

      {type === "array" && (
        <ArrayEditor name={name} value={Array.isArray(value) ? value : []} onChange={onChange} />
      )}
    </span>
  );
}

export default Input;
