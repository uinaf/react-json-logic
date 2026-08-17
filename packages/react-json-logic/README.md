# react-json-logic

Build and evaluate [JsonLogic](http://jsonlogic.com) rules with React components.

**Headless.** No CSS shipped; bring your own. Built on [Base UI](https://base-ui.com) primitives. Style with Tailwind, CSS modules, vanilla CSS, or whatever you like.

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

`JsonLogicValue` is the recursive any-shape type for rules and primitive
values. `JsonLogicData = Record<string, unknown> | unknown[]` is the
narrower shape the `data` prop accepts (objects or arrays; primitives
make no sense as accessor data).

Named exports: `applyLogic`, `rule`, `validate`, `OPERATORS`, `FIELD_TYPES`, types `JsonLogicBuilderProps`, `FieldType`, `Operator`, `JsonLogicValue`, `JsonLogicData`, `ValidationError`, `ValidationResult`.

## Building rules in code

`rule` is a typed factory you can use to construct JsonLogic rules without writing the JSON shape by hand:

```ts
import { applyLogic, rule, validate } from "react-json-logic";

const r = rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("score"), 100));

applyLogic(r, { user: { age: 21 }, score: 150 }); // → true
validate(r); // → { ok: true }
```

Each factory returns a `JsonLogicValue` shaped per the canonical [JsonLogic](http://jsonlogic.com) spec; the `<JsonLogicBuilder />` UI, `applyLogic`, and `validate` all consume the same shape. Arity is enforced at the function signature level (no runtime schema overhead).

| Group        | Factories                                                            |
| ------------ | -------------------------------------------------------------------- |
| Equality     | `eq`, `looseEq`, `notEq`, `looseNotEq`                               |
| Logical      | `and`, `or`, `not`, `if(...args)`                                    |
| Comparison   | `lt`, `lte`, `gt`, `gte`                                             |
| Arithmetic   | `add`, `sub`, `mul`, `div`, `mod`, `min`, `max`                      |
| Accessor     | `var(path, fallback?)`, `missing(...keys)`, `missingSome(min, keys)` |
| String/Array | `in(needle, haystack)`, `cat(...args)`, `merge(...args)`             |
| Higher-order | `some`, `all`, `none`, `map`, `filter`                               |

`validate(rule)` walks a rule against the operator table and reports structural problems (multi-key operator objects, arity violations, etc.) as `{ ok: false, errors: [{ path, message }] }`. Custom operators (registered via `json-logic-js`'s `add_operation`) are tolerated; only known operators get arity-checked.

## Styling

Components render unstyled. Target the rendered DOM via stable `data-rjl-*` attributes:

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

Example with Tailwind:

```css
[data-rjl-operator-trigger] {
  @apply inline-flex h-8 items-center rounded border px-2;
}
[data-rjl-operator-popup] {
  @apply rounded border bg-white shadow;
}
[data-rjl-add],
[data-rjl-remove] {
  @apply h-6 w-6 rounded border bg-white text-sm;
}
```

## Development

This repo runs on [Vite+](https://viteplus.dev). Bootstrap with pnpm and invoke
the repository-local Vite+ binary explicitly:

```bash
pnpm install --frozen-lockfile  # install deps
pnpm exec vp check              # format + lint + typecheck
pnpm exec vp test               # run tests
pnpm exec vp test --coverage    # with coverage report
pnpm exec vp pack               # build the library
pnpm verify       # the full gate (check + test --coverage + pack)
```

See [AGENTS.md](AGENTS.md) for project layout and contributor notes.

## License

MIT
