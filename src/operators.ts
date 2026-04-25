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

export const OPERATORS: Operator[] = [
  {
    type: "Value Field",
    signature: "value",
    label: "value",
    fields: ["input"],
    notAvailableUnder: ["master", "or", "and"],
    fieldCount: { min: 1, max: 1 },
  },
  {
    type: "Higher Order",
    signature: "some",
    label: "some",
    fields: ["higher-order", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 10 },
  },
  {
    type: "Higher Order",
    signature: "all",
    label: "all",
    fields: ["higher-order", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 10 },
  },
  {
    type: "Higher Order",
    signature: "none",
    label: "none",
    fields: ["higher-order", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 10 },
  },
  {
    type: "Higher Order",
    signature: "map",
    label: "map",
    fields: ["higher-order", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 10 },
  },
  {
    type: "Higher Order",
    signature: "filter",
    label: "filter",
    fields: ["higher-order", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 1, max: 10 },
  },
  {
    type: "Accessor",
    signature: "var",
    label: "accessor",
    fields: ["accessor"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: 1 },
  },
  {
    type: "Statement",
    signature: "or",
    label: "or",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 10 },
  },
  {
    type: "Statement",
    signature: "and",
    label: "and",
    fields: ["any", "any"],
    notAvailableUnder: [],
    fieldCount: { min: 2, max: 10 },
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
  {
    type: "Arithmetic",
    signature: "+",
    label: "+",
    fields: ["any", "any"],
    notAvailableUnder: ["master"],
    fieldCount: { min: 1, max: 100 },
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
    fieldCount: { min: 2, max: 100 },
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
];
