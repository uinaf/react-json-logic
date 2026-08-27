import type { JsonLogicValue } from "./operators.ts";

/** Typed factories for canonical JsonLogic rules. */
export const rule = {
  eq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "===": [a, b] }),
  looseEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "==": [a, b] }),
  notEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "!==": [a, b] }),
  looseNotEq: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "!=": [a, b] }),

  and: (...args: JsonLogicValue[]): JsonLogicValue => ({ and: args }),
  or: (...args: JsonLogicValue[]): JsonLogicValue => ({ or: args }),
  not: (x: JsonLogicValue): JsonLogicValue => ({ "!": [x] }),

  /**
   * `if(cond, then, else)` for the simple case;
   * `if(cond1, then1, cond2, then2, ..., else)` for elseif chains.
   * Mirrors json-logic-js' variadic-odd-args `if` operator.
   */
  if: (...args: JsonLogicValue[]): JsonLogicValue => ({ if: args }),

  lt: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "<": [a, b] }),
  lte: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "<=": [a, b] }),
  gt: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ ">": [a, b] }),
  gte: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ ">=": [a, b] }),

  add: (...args: JsonLogicValue[]): JsonLogicValue => ({ "+": args }),
  sub: (a: JsonLogicValue, b?: JsonLogicValue): JsonLogicValue =>
    b !== undefined ? { "-": [a, b] } : { "-": [a] },
  mul: (...args: JsonLogicValue[]): JsonLogicValue => ({ "*": args }),
  div: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "/": [a, b] }),
  mod: (a: JsonLogicValue, b: JsonLogicValue): JsonLogicValue => ({ "%": [a, b] }),
  min: (...args: JsonLogicValue[]): JsonLogicValue => ({ min: args }),
  max: (...args: JsonLogicValue[]): JsonLogicValue => ({ max: args }),

  /** Read a value from the data object by dotted path. */
  var: (path: string, fallback?: JsonLogicValue): JsonLogicValue =>
    fallback !== undefined ? { var: [path, fallback] } : { var: [path] },
  /** Returns the keys (from the given list) that are missing from the data. */
  missing: (...keys: string[]): JsonLogicValue => ({ missing: keys }),
  /** `missing_some(min, keys)` returns keys when fewer than `min` are present. */
  missingSome: (min: number, keys: string[]): JsonLogicValue => ({
    missing_some: [min, keys],
  }),

  /** Substring or array containment check. `in("foo", "foobar")` → true. */
  in: (needle: JsonLogicValue, haystack: JsonLogicValue): JsonLogicValue => ({
    in: [needle, haystack],
  }),
  /** Concatenate strings or coerce-to-string arguments. */
  cat: (...args: JsonLogicValue[]): JsonLogicValue => ({ cat: args }),
  /** Flatten a list of arrays into one array. */
  merge: (...args: JsonLogicValue[]): JsonLogicValue => ({ merge: args }),

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
