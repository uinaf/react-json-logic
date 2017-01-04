/**
 * Field Types Available for Usage to Build JSON Logic Expressions
 *
 * ANY: Consists of dropdown and selects its children fields.
 * Input: Basic HTML input with type selection.
 */

export const FIELD_TYPES = {
  ANY: require('./components/Any'),
  INPUT: require('./components/Input'),
};

/**
 * Operators Available for Usage to Build JSON Logic Expressions.
 *
 * - label
 *   Signature (also the visible label) of the operator.
 *
 * - fields
 *   Child fields that operator's structure constists of.
 *
 * - notAvailableUnder
 *   Array of operators that wont be able to render this operator as its child field.
 */

export const OPERATORS = [
  {
    label: 'value',
    fields: [FIELD_TYPES.INPUT],
    notAvailableUnder: ['master', 'or', 'and'],
  },
  {
    label: 'or',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: 'and',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '===',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '<=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '>=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '<',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '>',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '!=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
  {
    label: '!==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
  },
];
