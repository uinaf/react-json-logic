import { useEffect, useRef, useState } from "react";
import { dequal } from "dequal";
import { FIELD_TYPES, OPERATORS, type FieldType, type Operator } from "../operators.ts";
import Accessor from "./Accessor.tsx";
import HigherOrder from "./HigherOrder.tsx";
import Input from "./Input.tsx";
import SelectOperator from "./SelectOperator.tsx";
import styles from "./Any.module.css";

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

function deriveState(value: unknown): DerivedState {
  let field = "value";

  if (value && typeof value === "object" && !Array.isArray(value)) {
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

  let fields: FieldType[] = selectedOperator ? [...selectedOperator.fields] : [];

  if (selectedOperator && value && typeof value === "object" && !Array.isArray(value)) {
    const valueAtField = (value as Record<string, unknown>)[field];
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
  const [derived, setDerived] = useState<DerivedState>(() => deriveState(value));
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!dequal(prevValueRef.current, value)) {
      prevValueRef.current = value;
      setDerived(deriveState(value));
    }
  }, [value]);

  const { field, selectedOperator, fields } = derived;

  const onFieldChange = (nextField: string) => {
    if (nextField === "value") {
      onChange("");
    } else {
      onChange({ [nextField]: [] });
    }
  };

  const onChildValueChange = (childValue: unknown, index: number) => {
    if (field === "value") {
      onChange(childValue);
      return;
    }
    const current = (value ?? {}) as Record<string, unknown>;
    const arr = Array.isArray(current[field]) ? [...(current[field] as unknown[])] : [];
    arr[index] = childValue;
    onChange({ ...current, [field]: arr });
  };

  const getAvailableOperators = (): Operator[] => {
    let operators = OPERATORS.filter((op) => !op.notAvailableUnder.includes(parent));
    if (Object.keys(data).length === 0) {
      operators = operators.filter((op) => op.signature !== "var");
    }
    return operators;
  };

  const addField = () => {
    setDerived({ ...derived, fields: [...fields, FIELD_TYPES.ANY] });
  };

  const removeField = (index: number) => {
    const nextFields = fields.filter((_, i) => i !== index);
    const current = (value ?? {}) as Record<string, unknown>;
    const arr = Array.isArray(current[field])
      ? (current[field] as unknown[]).filter((_, i) => i !== index)
      : [];
    setDerived({ ...derived, fields: nextFields });
    onChange({ ...current, [field]: arr });
  };

  const renderChild = (childField: FieldType, index: number) => {
    const isRemovable = selectedOperator ? fields.length > selectedOperator.fieldCount.min : false;

    let childValue: unknown = "";
    if (field === "value") {
      childValue = value;
    } else if (value && typeof value === "object") {
      const arr = (value as Record<string, unknown>)[field];
      if (Array.isArray(arr)) childValue = arr[index];
    }

    const childProps = {
      parent: field,
      value: childValue,
      data,
      onChange: (val: unknown) => onChildValueChange(val, index),
    };

    let element: React.ReactNode;
    switch (childField) {
      case "any":
        element = <Any {...childProps} />;
        break;
      case "input":
        element = (
          <Input value={childValue as string | number | undefined} onChange={childProps.onChange} />
        );
        break;
      case "accessor":
        element = (
          <Accessor
            value={typeof childValue === "string" ? childValue : ""}
            data={data}
            onChange={(val) => onChildValueChange(val, index)}
          />
        );
        break;
      case "higher-order":
        element = <HigherOrder {...childProps} />;
        break;
    }

    return (
      <div style={{ position: "relative" }} key={`${field}.${index}`}>
        {isRemovable && (
          <button
            type="button"
            className={styles.ChildrenControlButton}
            style={{ position: "absolute", left: -21, height: 26 }}
            onClick={() => removeField(index)}
          >
            x
          </button>
        )}
        {element}
      </div>
    );
  };

  const canAddMoreChildren = selectedOperator
    ? fields.length < selectedOperator.fieldCount.max
    : false;

  return (
    <div>
      <SelectOperator value={field} options={getAvailableOperators()} onChange={onFieldChange} />

      {canAddMoreChildren && (
        <button
          type="button"
          className={styles.ChildrenControlButton}
          style={{
            position: "absolute",
            width: 26,
            height: 26,
            marginLeft: 1,
          }}
          onClick={addField}
        >
          +
        </button>
      )}

      {selectedOperator && (
        <div style={{ marginLeft: 20, marginTop: 5, marginBottom: 5 }}>
          {fields.map(renderChild)}
        </div>
      )}
    </div>
  );
}

export default Any;
