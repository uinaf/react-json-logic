import { useMemo } from "react";
import { FIELD_TYPES, OPERATORS, type FieldType, type Operator } from "../operators.ts";
import Accessor from "./accessor.tsx";
import HigherOrder from "./higher-order.tsx";
import Input from "./input.tsx";
import SelectOperator from "./select-operator.tsx";

interface Props {
  parent: string;
  value?: unknown;
  data?: Record<string, unknown>;
  onChange: (value: unknown) => void;
}

interface DerivedState {
  field: string;
  selectedOperator: Operator | undefined;
  fields: FieldType[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deriveState(value: unknown): DerivedState {
  let field = "value";

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length > 0) {
      const firstElem = keys[0]!;
      const matches = OPERATORS.some((op) => op.signature === firstElem || op.label === firstElem);
      field = matches ? firstElem : "value";
    } else {
      field = "";
    }
  }

  const selectedOperator = OPERATORS.find((op) => op.signature === field || op.label === field);

  const fields: FieldType[] = selectedOperator ? [...selectedOperator.fields] : [];

  if (selectedOperator && isPlainObject(value)) {
    const valueAtField = value[field];
    if (
      Array.isArray(valueAtField) &&
      selectedOperator.fieldCount.min <= fields.length &&
      selectedOperator.fieldCount.max > fields.length &&
      valueAtField.length > fields.length
    ) {
      const extra = valueAtField.length - fields.length;
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

  const updateChildArray = (update: (arr: unknown[]) => unknown[]) => {
    if (field === "value") return;
    const current = isPlainObject(value) ? value : {};
    const arr = Array.isArray(current[field]) ? [...(current[field] as unknown[])] : [];
    onChange({ ...current, [field]: update(arr) });
  };

  const onChildValueChange = (childValue: unknown, index: number) => {
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

    let childValue: unknown = "";
    if (field === "value") {
      childValue = value;
    } else if (isPlainObject(value)) {
      const arr = value[field];
      if (Array.isArray(arr)) childValue = arr[index];
    }

    const childOnChange = (val: unknown) => onChildValueChange(val, index);

    let element: React.ReactNode;
    switch (childField) {
      case "any":
        element = <Any parent={field} value={childValue} data={data} onChange={childOnChange} />;
        break;
      case "input":
        element = (
          <Input value={childValue as string | number | undefined} onChange={childOnChange} />
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
