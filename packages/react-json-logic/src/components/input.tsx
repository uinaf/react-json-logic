import { Select } from "@base-ui/react/select";
import { useMemo } from "react";

const INPUT_TYPES = ["text", "number"] as const;
type InputType = (typeof INPUT_TYPES)[number];

interface Props {
  name?: string;
  value?: string | number;
  /** Initial type fallback if `value` is a string. Ignored if `value` is a number. */
  type?: InputType;
  /**
   * Called with the next value. Note: when the input type is `"number"` and
   * the user types something unparseable (rare — the browser usually filters
   * non-numeric input), the raw string is emitted unchanged rather than
   * `NaN`. Consumers that store the result into a numeric field should
   * coerce or validate at the boundary.
   */
  onChange: (value: string | number) => void;
}

const isNumeric = (value: unknown): value is number => typeof value === "number";

const getType = (value: unknown, fallback: InputType): InputType =>
  isNumeric(value) ? "number" : fallback;

export function Input({ name = "", value = "", type: typeProp = "text", onChange }: Props) {
  // Type is a pure derivation of (value, typeProp) — no useState/useEffect
  // mirror. When the user picks a different type from the dropdown, we emit
  // a re-typed value via `onChange`; the next render derives the new type
  // from the new value prop.
  const type = useMemo<InputType>(() => getType(value, typeProp), [value, typeProp]);

  const onTypeChange = (next: InputType | null) => {
    if (!next) return;
    if (next === "number") {
      const n = parseFloat(String(value));
      // Guard against `NaN` flowing back through the controlled input —
      // unparseable input becomes 0 rather than the literal string "NaN".
      onChange(Number.isFinite(n) ? n : 0);
    } else {
      onChange(String(value));
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

      <input
        name={name}
        value={String(value)}
        type={type}
        onChange={onValueChange}
        data-rjl-input-value
      />
    </span>
  );
}

export default Input;
