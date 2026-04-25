import jsonLogic from "json-logic-js";

export { default } from "./components/JsonLogicBuilder.tsx";
export { OPERATORS, FIELD_TYPES } from "./operators.ts";
export type { FieldType, Operator, JsonLogicValue } from "./operators.ts";

export const applyLogic = jsonLogic.apply;
