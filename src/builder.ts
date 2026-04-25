import type { JsonLogicValue } from "./operators.ts";

/**
 * Typed factories for constructing JsonLogic rules.
 *
 * Each factory returns a `JsonLogicValue` shaped per the canonical JsonLogic
 * spec. Use these to get autocomplete + arity-checked rule construction
 * without paying for a runtime schema library.
 *
 * Example:
 *   const r = rule.and(
 *     rule.eq(rule.var("user.age"), 21),
 *     rule.gt(rule.var("score"), 100),
 *   );
 *   applyLogic(r, { user: { age: 21 }, score: 150 }); // → true
 */
export const rule = {
  // -- Equality
  eq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "===": [a, b] }),
  looseEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "==": [a, b] }),
  notEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "!==": [a, b] }),
  looseNotEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "!=": [a, b] }),

  // -- Logical
  and: (...args: JsonLogicValue[]): JsonLogicValue => ({ and: args }),
  or: (...args: JsonLogicValue[]): JsonLogicValue => ({ or: args }),
  not: (x: JsonLogicValue): JsonLogicValue => ({ "!": [x] }),

  // -- Comparison
  lt: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "<": [a, b] }),
  lte: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "<=": [a, b] }),
  gt: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ ">": [a, b] }),
  gte: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ ">=": [a, b] }),

  // -- Arithmetic
  add: (...args: JsonLogicValue[]): JsonLogicValue => ({ "+": args }),
  sub: (a: JsonLogicValue, b?: JsonLogicValue): JsonLogicValue =>
    b !== undefined ? { "-": [a, b] } : { "-": [a] },
  mul: (...args: JsonLogicValue[]): JsonLogicValue => ({ "*": args }),
  div: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "/": [a, b] }),
  mod: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "%": [a, b] }),

  // -- Accessor
  /** Read a value from the data object by dotted path. */
  var: (path: string, fallback?: JsonLogicValue): JsonLogicValue =>
    fallback !== undefined ? { var: [path, fallback] } : { var: [path] },

  // -- Higher-order
  some: (collection: JsonLogicValue, predicate: JsonLogicValue): JsonLogicValue => ({
    some: [collection, predicate],
  }),
  all: (collection: JsonLogicValue, predicate: JsonLogicValue): JsonLogicValue => ({
    all: [collection, predicate],
  }),
  none: (collection: JsonLogicValue, predicate: JsonLogicValue): JsonLogicValue => ({
    none: [collection, predicate],
  }),
  map: (collection: JsonLogicValue, mapper: JsonLogicValue): JsonLogicValue => ({
    map: [collection, mapper],
  }),
  filter: (collection: JsonLogicValue, predicate: JsonLogicValue): JsonLogicValue => ({
    filter: [collection, predicate],
  }),
} as const;
