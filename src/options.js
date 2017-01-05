/**
 * Field Types Available for Usage to Build JSON Logic Expressions
 *
 * ANY: Consists of dropdown and selects its children fields.
 * Input: Basic HTML input with type selection.
 */

export const FIELD_TYPES = {
  ANY: require('./components/Any'),
  INPUT: require('./components/Input'),
  ACCESSOR: require('./components/Accessor'),
};

/**
 * Operators Available for Usage to Build JSON Logic Expressions.
 *
 * - signature
 *   Signature of the operator.
 *
 * - label
 *   Visible name of the operator.
 *
 * - fields
 *   Child fields that operator's structure constists of.
 *
 * - notAvailableUnder
 *   Array of operators that wont be able to render this operator as its child field.
 */

export const OPERATORS = [
  {
    signature: 'value',
    label: 'value',
    fields: [FIELD_TYPES.INPUT],
    notAvailableUnder: ['master', 'or', 'and'],
  },
  {
    signature: 'var',
    label: 'accessor',
    fields: [FIELD_TYPES.ACCESSOR],
    notAvailableUnder: ['master'],
  },
  {
    signature: 'or',
    label: 'or',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: 'and',
    label: 'and',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '===',
    label: '===',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '==',
    label: '==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '<=',
    label: '<=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '>=',
    label: '>=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '<',
    label: '<',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '>',
    label: '>',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '!=',
    label: '!=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    signature: '!==',
    label: '!==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
];
