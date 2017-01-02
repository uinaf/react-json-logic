export const FIELD_TYPES = {
  ANY: require('./components/Any'),
  INPUT: require('./components/Input'),
};

export const OPERATORS = [
  {
    label: 'or',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: 'and',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: 'value',
    fields: [FIELD_TYPES.INPUT],
  },
  {
    label: '===',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '<=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '>=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '<',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '>',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '!=',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
  {
    label: '!==',
    fields: [FIELD_TYPES.ANY, FIELD_TYPES.ANY],
  },
];
