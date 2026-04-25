import { Select } from "@base-ui/react/select";
import { useEffect, useState } from "react";

const INPUT_TYPES = ["text", "number"] as const;
type InputType = (typeof INPUT_TYPES)[number];

interface Props {
  name?: string;
  value?: string | number;
  type?: InputType;
  onChange: (value: string | number) => void;
}

const isNumeric = (value: unknown): value is number => typeof value === "number";

const getType = (value: unknown, fallback: InputType): InputType =>
  isNumeric(value) ? "number" : fallback;

export function Input({ name = "", value = "", type: typeProp = "text", onChange }: Props) {
  const [type, setType] = useState<InputType>(() => getType(value, typeProp));

  useEffect(() => {
    setType(getType(value, typeProp));
  }, [value, typeProp]);

  const onTypeChange = (next: InputType | null) => {
    if (!next) return;
    setType(next);
    if (next === "number") {
      onChange(parseFloat(String(value)));
    } else {
      onChange(String(value));
    }
  };

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(type === "number" ? parseFloat(raw) : raw);
  };

  const items = INPUT_TYPES.map((t) => ({ label: t, value: t }));

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
