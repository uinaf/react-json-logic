import Select from "react-select";
import type { Operator } from "../operators.ts";

interface Props {
  value: string;
  options: Operator[];
  onChange: (value: string) => void;
}

interface Option {
  label: string;
  value: string;
}

export function SelectOperator({ value, options, onChange }: Props) {
  const selectOptions: Option[] = options.map((option) => ({
    label: option.label,
    value: option.signature,
  }));

  const selected = selectOptions.find((o) => o.value === value) ?? null;

  return (
    <div style={{ display: "inline-block", fontWeight: "bold", width: 150 }}>
      <Select<Option>
        isClearable={false}
        value={selected}
        onChange={(option) => onChange(option?.value ?? "")}
        options={selectOptions}
      />
    </div>
  );
}

export default SelectOperator;
