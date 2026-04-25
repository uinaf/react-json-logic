import jsonLogic from "json-logic-js";
import type { JsonLogicValue } from "./operators.ts";
import type { JsonLogicData } from "./components/json-logic-builder.tsx";

export { default } from "./components/json-logic-builder.tsx";
export type { JsonLogicData, JsonLogicBuilderProps } from "./components/json-logic-builder.tsx";
export { OPERATORS, FIELD_TYPES } from "./operators.ts";
export type { FieldType, Operator, JsonLogicValue } from "./operators.ts";
export { rule } from "./builder.ts";
export { validate } from "./validator.ts";
export type { ValidationError, ValidationResult } from "./validator.ts";

/**
 * Evaluate a JsonLogic rule against a data object.
 *
 * Re-exported from `json-logic-js`. The upstream type
 * (`RulesLogic<AdditionalOperation>`) is structurally narrower than what we
 * expose, so we widen at the boundary once: `rule` is `JsonLogicValue`, and
 * `data` accepts either a typed `JsonLogicValue` or the looser `JsonLogicData`
 * shape consumers commonly produce from `JSON.parse` (which yields
 * `Record<string, unknown> | unknown[]`). The return is `unknown` because the
 * eval result depends entirely on the rule + data.
 */
export const applyLogic = jsonLogic.apply as (
  rule: JsonLogicValue,
  data?: JsonLogicValue | JsonLogicData,
) => unknown;
