import type { JsonLogicValue } from "../operators.ts";
import Any from "./any.tsx";

interface Props {
  parent: string;
  data?: Record<string, unknown> | unknown[] | undefined;
  value?: JsonLogicValue | undefined;
  onChange: (value: JsonLogicValue) => void;
}

/** Adds a styleable `=>` cue to predicates without changing their JSON shape. */
export function HigherOrder({ parent, data = {}, value, onChange }: Props) {
  return (
    <span data-rjl-higher-order>
      <span data-rjl-higher-order-arrow>=&gt;</span>
      <span data-rjl-higher-order-child>
        <Any parent={parent} data={data} value={value} onChange={onChange} />
      </span>
    </span>
  );
}

export default HigherOrder;
