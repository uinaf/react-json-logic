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

function getOperands(value: JsonLogicValue | undefined): JsonLogicValue[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
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

  // Preserve existing variadic arguments up to the operator's declared limit.
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

  // Add/remove controls only call this for a selected operator.
  const updateChildArray = (update: (arr: JsonLogicValue[]) => JsonLogicValue[]) => {
    const current = isPlainObject(value) ? value : {};
    const arr = getOperands(current[field]);
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
      childValue = value === undefined ? "" : value;
    } else if (isPlainObject(value)) {
      const operand = getOperands(value[field])[index];
      childValue = operand === undefined ? "" : operand;
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
              typeof childValue === "string" ||
              typeof childValue === "number" ||
              typeof childValue === "boolean" ||
              childValue === null ||
              Array.isArray(childValue)
                ? childValue
                : ""
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
