import { Select } from "@base-ui/react/select";
import type { Operator } from "../operators.ts";

interface Props {
  value: string;
  options: Operator[];
  onChange: (value: string) => void;
}

interface Item {
  label: string;
  value: string;
}

export function SelectOperator({ value, options, onChange }: Props) {
  const items: Item[] = options.map((op) => ({
    label: op.label,
    value: op.signature,
  }));

  const handleChange = (next: string | null) => {
    if (next != null) onChange(next);
  };

  return (
    <Select.Root items={items} value={value} onValueChange={handleChange}>
      <Select.Trigger data-rjl-operator-trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup data-rjl-operator-popup>
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
  );
}

export default SelectOperator;
