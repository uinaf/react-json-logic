export type FieldType = "any" | "input" | "accessor" | "higher-order";

export const FIELD_TYPES = {
  ANY: "any",
  INPUT: "input",
  ACCESSOR: "accessor",
  HIGHER_ORDER: "higher-order",
} as const satisfies Record<string, FieldType>;

export interface Operator {
  type: string;
  signature: string;
  label: string;
  fields: FieldType[];
  notAvailableUnder: string[];
  fieldCount: { min: number; max: number };
}

export type JsonLogicValue =
  | string
  | number
  | boolean
  | null
  | JsonLogicValue[]
  | { [key: string]: JsonLogicValue };

/**
 * Soft cap on variadic-operator argument count (`+`, `*`, `min`, `max`,
 * `cat`, `merge`, `if`, `or`, `and`, `missing`). Picked large enough that
 * real-world rules never hit it; serves to keep the UI's "add field"
 * affordance from spinning a list to infinity.
 */
const MAX_VARIADIC = 100;

export const OPERATORS: Operator[] = [
  // ── Value field ────────────────────────────────────────────────────────
  {
    type: "Value Field",
    signature: "value",
    label: "value",
    fields: ["input"],
    notAvailableUnder: ["master", "or", "and"],
    fieldCount: { min: 1, max: 1 },
  },

  // ── Accessor ───────────────────────────────────────────────────────────
  {
    type: "Accessor",
    signature: "var",
    label: "accessor",
    fields: ["accessor"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: 2 },
  },
  {
    type: "Accessor",
    signature: "missing",
    label: "missing",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: MAX_VARIADIC },
  },
  {
    type: "Accessor",
    signature: "missing_some",
    label: "missing_some",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },

  // ── Logical ────────────────────────────────────────────────────────────
  {
    type: "Statement",
    signature: "or",
    label: "or",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: MAX_VARIADIC },
  },
  {
    type: "Statement",
    signature: "and",
    label: "and",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: MAX_VARIADIC },
  },
  {
    type: "Statement",
    signature: "if",
    label: "if",
    fields: ["any", "any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 3, max: MAX_VARIADIC - 1 },
  },
  {
    type: "Logical",
    signature: "===",
    label: "===",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Logical",
    signature: "==",
    label: "==",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Logical",
    signature: "!=",
    label: "!=",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Logical",
    signature: "!==",
    label: "!==",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Logical",
    signature: "!",
    label: "!",
    fields: ["any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 1 },
  },

  // ── Numeric comparison ────────────────────────────────────────────────
  {
    type: "Numeric",
    signature: "<=",
    label: "<=",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Numeric",
    signature: ">=",
    label: ">=",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Numeric",
    signature: "<",
    label: "<",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Numeric",
    signature: ">",
    label: ">",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },

  // ── Arithmetic ────────────────────────────────────────────────────────
  {
    type: "Arithmetic",
    signature: "+",
    label: "+",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: MAX_VARIADIC },
  },
  {
    type: "Arithmetic",
    signature: "-",
    label: "-",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: 2 },
  },
  {
    type: "Arithmetic",
    signature: "*",
    label: "*",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 2, max: MAX_VARIADIC },
  },
  {
    type: "Arithmetic",
    signature: "/",
    label: "/",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Arithmetic",
    signature: "%",
    label: "%",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Arithmetic",
    signature: "min",
    label: "min",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: MAX_VARIADIC },
  },
  {
    type: "Arithmetic",
    signature: "max",
    label: "max",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: MAX_VARIADIC },
  },

  // ── String / Array ────────────────────────────────────────────────────
  {
    type: "String",
    signature: "in",
    label: "in",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "String",
    signature: "cat",
    label: "cat",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: MAX_VARIADIC },
  },
  {
    type: "Array",
    signature: "merge",
    label: "merge",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 0, max: MAX_VARIADIC },
  },

  // ── Higher-order ──────────────────────────────────────────────────────
  // Field shape: [collection, predicate]. Predicate gets a visual `=>` cue.
  {
    type: "Higher Order",
    signature: "some",
    label: "some",
    fields: ["any", "higher-order"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Higher Order",
    signature: "all",
    label: "all",
    fields: ["any", "higher-order"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Higher Order",
    signature: "none",
    label: "none",
    fields: ["any", "higher-order"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Higher Order",
    signature: "map",
    label: "map",
    fields: ["any", "higher-order"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
  {
    type: "Higher Order",
    signature: "filter",
    label: "filter",
    fields: ["any", "higher-order"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 2 },
  },
];
