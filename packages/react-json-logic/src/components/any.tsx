import { useMemo } from "react";
import {
  FIELD_TYPES,
  OPERATORS,
  type FieldType,
  type JsonLogicValue,
  type Operator,
} from "../operators.ts";
import Accessor from "./accessor.tsx";
import HigherOrder from "./higher-order.tsx";
import Input from "./input.tsx";
import SelectOperator from "./select-operator.tsx";

type DataObject = Record<string, unknown> | unknown[];

interface Props {
  parent: string;
  value?: JsonLogicValue | undefined;
  data?: DataObject | undefined;
  onChange: (value: JsonLogicValue) => void;
}

interface DerivedState {
  field: string;
  selectedOperator: Operator | undefined;
  fields: FieldType[];
}

function isPlainObject(value: unknown): value is Record<string, JsonLogicValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deriveState(value: JsonLogicValue | undefined): DerivedState {
  let field = "value";

  if (isPlainObject(value)) {
    const [first] = Object.keys(value);
    if (first === undefined) {
      field = "";
    } else {
      const matches = OPERATORS.some((op) => op.signature === first || op.label === first);
      field = matches ? first : "value";
    }
  }

  const selectedOperator = OPERATORS.find((op) => op.signature === field || op.label === field);

  // Start from the operator's declared field shape, then grow if `value`
  // already carries more args than the default. Variadic operators like `+`
  // can carry up to `fieldCount.max` args; we cap growth at `max` to stay
  // within the operator's declared bounds.
  const fields: FieldType[] = selectedOperator ? [...selectedOperator.fields] : [];

  if (selectedOperator && isPlainObject(value)) {
    const valueAtField = value[field];
    if (
      Array.isArray(valueAtField) &&
      valueAtField.length > fields.length &&
      fields.length < selectedOperator.fieldCount.max
    ) {
      const extra = Math.min(
        valueAtField.length - fields.length,
        selectedOperator.fieldCount.max - fields.length,
      );
      for (let i = 0; i < extra; i += 1) {
        fields.push(FIELD_TYPES.ANY);
      }
    }
  }

  return { field, selectedOperator, fields };
}

export function Any({ parent, value, data = {}, onChange }: Props) {
  const { field, selectedOperator, fields } = useMemo(() => deriveState(value), [value]);

  const availableOperators = useMemo(() => {
    let operators = OPERATORS.filter((op) => !op.notAvailableUnder.includes(parent));
    if (Object.keys(data).length === 0) {
      operators = operators.filter((op) => op.signature !== "var");
    }
    return operators;
  }, [parent, data]);

  const onFieldChange = (nextField: string) => {
    if (nextField === "value") {
      onChange("");
    } else {
      onChange({ [nextField]: [] });
    }
  };

  // Add/remove are gated by the UI on `canAddMoreChildren` / `isRemovable`,
  // both of which require a real `selectedOperator`. So `field` here is
  // always a known operator key, never the "value" pseudo-op.
  const updateChildArray = (update: (arr: JsonLogicValue[]) => JsonLogicValue[]) => {
    const current = isPlainObject(value) ? value : {};
    const slot = current[field];
    const arr = Array.isArray(slot) ? [...slot] : [];
    onChange({ ...current, [field]: update(arr) });
  };

  const onChildValueChange = (childValue: JsonLogicValue, index: number) => {
    if (field === "value") {
      onChange(childValue);
      return;
    }
    updateChildArray((arr) => {
      const next = [...arr];
      next[index] = childValue;
      return next;
    });
  };

  const addField = () => {
    updateChildArray((arr) => [...arr, ""]);
  };

  const removeField = (index: number) => {
    updateChildArray((arr) => arr.filter((_, i) => i !== index));
  };

  const renderChild = (childField: FieldType, index: number) => {
    const isRemovable = selectedOperator ? fields.length > selectedOperator.fieldCount.min : false;

    let childValue: JsonLogicValue = "";
    if (field === "value") {
      childValue = value ?? "";
    } else if (isPlainObject(value)) {
      const arr = value[field];
      if (Array.isArray(arr)) childValue = arr[index] ?? "";
    }

    const childOnChange = (val: JsonLogicValue) => onChildValueChange(val, index);

    let element: React.ReactNode;
    switch (childField) {
      case "any":
        element = <Any parent={field} value={childValue} data={data} onChange={childOnChange} />;
        break;
      case "input":
        element = (
          <Input
            value={
              typeof childValue === "string" || typeof childValue === "number" ? childValue : ""
            }
            onChange={childOnChange}
          />
        );
        break;
      case "accessor":
        element = (
          <Accessor
            value={typeof childValue === "string" ? childValue : ""}
            data={data}
            onChange={childOnChange}
          />
        );
        break;
      case "higher-order":
        element = (
          <HigherOrder parent={field} value={childValue} data={data} onChange={childOnChange} />
        );
        break;
    }

    return (
      <span data-rjl-field key={`${field}.${index}`}>
        {isRemovable && (
          <button
            type="button"
            aria-label={`Remove field ${index + 1}`}
            data-rjl-remove
            onClick={() => removeField(index)}
          >
            x
          </button>
        )}
        {element}
      </span>
    );
  };

  const canAddMoreChildren = selectedOperator
    ? fields.length < selectedOperator.fieldCount.max
    : false;

  return (
    <span data-rjl-any>
      <SelectOperator value={field} options={availableOperators} onChange={onFieldChange} />

      {canAddMoreChildren && (
        <button type="button" aria-label="Add field" data-rjl-add onClick={addField}>
          +
        </button>
      )}

      {selectedOperator && <span data-rjl-children>{fields.map(renderChild)}</span>}
    </span>
  );
}

export default Any;
