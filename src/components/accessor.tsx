import { Autocomplete } from "@base-ui/react/autocomplete";
import type { ReactNode } from "react";

interface Props {
  value?: string;
  data?: Record<string, unknown> | unknown[];
  onChange: (value: string) => void;
}

function getIterator(data: unknown): string[] | null {
  if (Array.isArray(data)) {
    const head = data[0];
    if (head && typeof head === "object") return Object.keys(head);
    return null;
  }
  if (data !== null && typeof data === "object") {
    return Object.keys(data as Record<string, unknown>);
  }
  return null;
}

export function Accessor({ value = "", data = {}, onChange }: Props) {
  const splitValue = value.split(".");

  const renderSelector = (current: unknown, level: number): ReactNode => {
    const levelValue = splitValue[level] ?? "";
    const iterator = getIterator(current);
    if (!iterator) return null;

    const handleChange = (newText: string) => {
      const next = splitValue.slice(0, level);
      next[level] = newText;
      onChange(next.join("."));
    };

    const nextNode = Array.isArray(current)
      ? (current[0] as Record<string, unknown> | undefined)?.[levelValue]
      : (current as Record<string, unknown>)[levelValue];

    return (
      <span data-rjl-accessor-level data-rjl-accessor-level-index={level}>
        <Autocomplete.Root items={iterator} value={levelValue} onValueChange={handleChange}>
          <Autocomplete.Input data-rjl-accessor-input />
          <Autocomplete.Portal>
            <Autocomplete.Positioner>
              <Autocomplete.Popup data-rjl-accessor-popup>
                <Autocomplete.List>
                  {(item: string) => <Autocomplete.Item value={item}>{item}</Autocomplete.Item>}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
        {renderSelector(nextNode, level + 1)}
      </span>
    );
  };

  return <span data-rjl-accessor>{renderSelector(data, 0)}</span>;
}

export default Accessor;
