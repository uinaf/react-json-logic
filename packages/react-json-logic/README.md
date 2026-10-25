# react-json-logic

Build and evaluate [JsonLogic](http://jsonlogic.com) rules with React components.

Headless: no CSS ships. Built on [Base UI](https://base-ui.com) primitives.

## Install

```bash
pnpm add react-json-logic react react-dom
```

Requires React 19 (`react` / `react-dom` peer `^19.0.0`).

## Usage

```tsx
import { useState } from "react";
import JsonLogicBuilder, { applyLogic, type JsonLogicValue } from "react-json-logic";

function Example() {
  const [rule, setRule] = useState<JsonLogicValue>("");
  const data = { user: { age: 21 } };

  return (
    <>
      <JsonLogicBuilder value={rule} data={data} onChange={setRule} />
      <p>Result: {String(applyLogic(rule, data))}</p>
    </>
  );
}
```

## Props

| Prop          | Type                                  | Default        | Description                                                                                                               |
| ------------- | ------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `onChange`    | `(value: JsonLogicValue) => void`     | none           | Called with the updated rule whenever the builder changes.                                                                |
| `value`       | `JsonLogicValue`                      | `""`           | Current rule (controlled).                                                                                                |
| `data`        | `JsonLogicData \| string`             | `{}`           | Sample data, used by accessor (`var`) field suggestions. Pass an object/array directly or a JSON string (parsed for you). |
| `onDataError` | `(err: unknown, raw: string) => void` | `console.warn` | Called when `data` is a string and `JSON.parse` fails. De-duplicated by raw value, fires once per malformed input.        |

`JsonLogicValue` is any rule or primitive value. `JsonLogicData` is
`Record<string, unknown> | unknown[]`.

## Building rules in code

`rule` builds JsonLogic rules with typed factories:

```ts
import { applyLogic, rule, validate } from "react-json-logic";

const r = rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("score"), 100));

applyLogic(r, { user: { age: 21 }, score: 150 }); // → true
validate(r); // → { ok: true }
```

Each factory returns a standard JsonLogic `JsonLogicValue`, which the builder, `applyLogic`, and `validate` all accept. Fixed-arity factories enforce argument counts in their types; check variadic ones with `validate()`.

| Group        | Factories                                                            |
| ------------ | -------------------------------------------------------------------- |
| Equality     | `eq`, `looseEq`, `notEq`, `looseNotEq`                               |
| Logical      | `and`, `or`, `not`, `if(...args)`                                    |
| Comparison   | `lt`, `lte`, `gt`, `gte`                                             |
| Arithmetic   | `add`, `sub`, `mul`, `div`, `mod`, `min`, `max`                      |
| Accessor     | `var(path, fallback?)`, `missing(...keys)`, `missingSome(min, keys)` |
| String/Array | `in(needle, haystack)`, `cat(...args)`, `merge(...args)`             |
| Higher-order | `some`, `all`, `none`, `map`, `filter`                               |

`validate(rule)` returns `{ ok: false, errors: [{ path, message }] }` for multi-key operator objects and arity violations.

- Variadic arity follows `json-logic-js`: no maximum, and empty argument lists pass except for `*` (`rule.mul`). A valid rule can still evaluate to `undefined` (empty `and`/`or`), ±infinity (`min`/`max`), or `null` (`if`).
- Custom operators from `json-logic-js`'s `add_operation` pass; only known operators are arity-checked.
- `OPERATORS[].fieldCount` limits only the editor's add and remove controls. `rule.add()` evaluates to `0`, and `rule.add(...Array(101).fill(1))` to `101`.

## Styling

Target these stable `data-rjl-*` attributes:

| Attribute                       | What it marks                                                          |
| ------------------------------- | ---------------------------------------------------------------------- |
| `data-rjl-builder`              | Outermost wrapper                                                      |
| `data-rjl-any`                  | Recursive operator container                                           |
| `data-rjl-children`             | Wrapper around an operator's child fields                              |
| `data-rjl-field`                | A single child field row                                               |
| `data-rjl-add`                  | "Add field" button                                                     |
| `data-rjl-remove`               | "Remove field" button                                                  |
| `data-rjl-operator-trigger`     | Operator dropdown trigger                                              |
| `data-rjl-operator-popup`       | Operator dropdown popup (portaled)                                     |
| `data-rjl-input`                | Value-input wrapper                                                    |
| `data-rjl-input-type-trigger`   | Type select trigger (`text` / `number` / `boolean` / `null` / `array`) |
| `data-rjl-input-type-popup`     | Type select popup (portaled)                                           |
| `data-rjl-input-value`          | The text/number `<input>`, or the array `<textarea>`                   |
| `data-rjl-input-boolean`        | Boolean `true` / `false` select trigger                                |
| `data-rjl-input-boolean-popup`  | Boolean `true` / `false` select popup (portaled)                       |
| `data-rjl-input-array`          | Array-literal `<textarea>`                                             |
| `data-rjl-accessor`             | Accessor (`var`) wrapper                                               |
| `data-rjl-accessor-level`       | One level of an accessor path                                          |
| `data-rjl-accessor-level-index` | The level's index (`"0"`, `"1"`, …)                                    |
| `data-rjl-accessor-input`       | Accessor input element                                                 |
| `data-rjl-accessor-popup`       | Accessor suggestion popup (portaled)                                   |
| `data-rjl-higher-order`         | `some` / `all` / `none` / `map` / `filter` wrapper                     |
| `data-rjl-higher-order-arrow`   | The `=>` glyph                                                         |
| `data-rjl-higher-order-child`   | The inner expression of a higher-order op                              |

## Contributing

See [CONTRIBUTING.md](https://github.com/uinaf/react-json-logic/blob/main/CONTRIBUTING.md).

## License

MIT
