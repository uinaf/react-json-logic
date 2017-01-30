/**
 * Field Types Available for Usage to Build JSON Logic Expressions
 *
 * ANY:       Consists of dropdown and selects its children fields.
 * Input:     Basic HTML input with type selection.
 * Accessor:  Data accessor field ("var" operator in JSON Logic)
 */
export const FIELD_TYPES = {
  ANY: require('./components/Any'),
  INPUT: require('./components/Input'),
  ACCESSOR: require('./components/Accessor'),
  HIGHER_ORDER: require('./components/HigherOrder'),
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
    type: 'Value Field',
    signature: 'value',
    label: 'value',
    fields: [FIELD_TYPES.INPUT],
    notAvailableUnder: ['master', 'or', 'and'],
    fieldCount: {
      min: 1,
      max: 1,
    },
  },
  {
    type: 'Higher Order',
    signature: 'some',
    label: 'some',
    fields: [FIELD_TYPES.HIGHER_ORDER, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 1,
      max: 10,
    },
  },
  {
    type: 'Accessor',
    signature: 'var',
    label: 'accessor',
    fields: [FIELD_TYPES.ACCESSOR],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 1,
      max: 1,
    },
  },
  {
    type: 'Statement',
    signature: 'or',
    label: 'or',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 10,
    },
  },
  {
    type: 'Statement',
    signature: 'and',
    label: 'and',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 10,
    },
  },
  {
    type: 'Logical',
    signature: '===',
    label: '===',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Logical',
    signature: '==',
    label: '==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Logical',
    signature: '!=',
    label: '!=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Logical',
    signature: '!==',
    label: '!==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Numeric',
    signature: '<=',
    label: '<=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Numeric',
    signature: '>=',
    label: '>=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Numeric',
    signature: '<',
    label: '<',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Numeric',
    signature: '>',
    label: '>',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Numeric',
    signature: 'Between',
    label: '<=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: [],
    fieldCount: {
      min: 3,
      max: 3,
    },
  },
  {
    type: 'Arithmetic',
    signature: '+',
    label: '+',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 1,
      max: 100,
    },
  },
  {
    type: 'Arithmetic',
    signature: '-',
    label: '-',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 1,
      max: 2,
    },
  },
  {
    type: 'Arithmetic',
    signature: '*',
    label: '*',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 2,
      max: 100,
    },
  },
  {
    type: 'Arithmetic',
    signature: '/',
    label: '/',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
  {
    type: 'Arithmetic',
    signature: '%',
    label: '%',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
    notAvailableUnder: ['master'],
    fieldCount: {
      min: 2,
      max: 2,
    },
  },
];
