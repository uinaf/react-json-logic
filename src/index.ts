import jsonLogic from "json-logic-js";
import type { JsonLogicValue } from "./operators.ts";

export { default } from "./components/json-logic-builder.tsx";
export { OPERATORS, FIELD_TYPES } from "./operators.ts";
export type { FieldType, Operator, JsonLogicValue } from "./operators.ts";
export { rule } from "./builder.ts";
export { validate } from "./validator.ts";
export type { ValidationError, ValidationResult } from "./validator.ts";

/**
 * Evaluate a JsonLogic rule against a data object. Re-exported from
 * `json-logic-js` with loosened types so it accepts our `JsonLogicValue`.
 */
export const applyLogic = (rule: JsonLogicValue, data?: JsonLogicValue): unknown =>
  // upstream types are narrower than what we expose; widen at the boundary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonLogic.apply(rule as any, data as any);
