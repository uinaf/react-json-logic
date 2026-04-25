import jsonLogic from "json-logic-js";
import type { JsonLogicValue } from "./operators.ts";

export { default } from "./components/json-logic-builder.tsx";
export type { JsonLogicData } from "./components/json-logic-builder.tsx";
export { OPERATORS, FIELD_TYPES } from "./operators.ts";
export type { FieldType, Operator, JsonLogicValue } from "./operators.ts";
export { rule } from "./builder.ts";
export { validate } from "./validator.ts";
export type { ValidationError, ValidationResult } from "./validator.ts";

/**
 * Evaluate a JsonLogic rule against a data object.
 *
 * Re-exported from `json-logic-js`. The upstream type
 * (`RulesLogic<AdditionalOperation>`) is structurally narrower than our
 * exported `JsonLogicValue` even though the two are runtime-compatible —
 * we widen the function's signature once at the boundary instead of forcing
 * every caller to cast. The return is `unknown` because `applyLogic` can
 * yield any value depending on the rule and data.
 */
export const applyLogic = jsonLogic.apply as (
  rule: JsonLogicValue,
  data?: JsonLogicValue,
) => unknown;
