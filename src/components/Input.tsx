import { useEffect, useState } from "react";
import Select from "react-select";
import styles from "./Input.module.css";

const INPUT_TYPES = ["text", "number"] as const;
type InputType = (typeof INPUT_TYPES)[number];

interface Option {
  label: InputType;
  value: InputType;
}

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

  const onTypeChange = (option: Option | null) => {
    if (!option) return;
    const nextType = option.value;
    setType(nextType);

    if (nextType === "number") {
      onChange(parseFloat(String(value)));
    } else {
      onChange(String(value));
    }
  };

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(type === "number" ? parseFloat(raw) : raw);
  };

  const options: Option[] = INPUT_TYPES.map((t) => ({ label: t, value: t }));
  const selected = options.find((o) => o.value === type) ?? null;

  return (
    <div>
      <div className={styles.SelectWrapper}>
        <Select<Option>
          isClearable={false}
          value={selected}
          onChange={onTypeChange}
          options={options}
        />
      </div>

      <div className={styles.InputWrapper}>
        <input name={name} value={String(value)} type={type} onChange={onValueChange} />
      </div>
    </div>
  );
}

export default Input;
