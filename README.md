# react-json-logic

Build and evaluate [JsonLogic](http://jsonlogic.com) rules with React components.

**Headless.** No CSS shipped — bring your own. Built on [Base UI](https://base-ui.com) primitives. Style with Tailwind, CSS modules, vanilla CSS, or whatever you like.

## Install

```bash
pnpm add react-json-logic react react-dom
```

## Usage

```tsx
import { useState } from "react";
import JsonLogicBuilder, { applyLogic } from "react-json-logic";

function Example() {
  const [rule, setRule] = useState<unknown>("");
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

| Prop          | Type                       | Default        | Description                                                                 |
| ------------- | -------------------------- | -------------- | --------------------------------------------------------------------------- |
| `onChange`    | `(value: unknown) => void` | —              | Called with the updated rule whenever the builder changes.                  |
| `value`       | `JsonLogicValue`           | `""`           | Current rule (controlled).                                                  |
| `data`        | `object \| string`         | `{}`           | Sample data — used by accessor (`var`) fields and `applyLogic`.             |
| `onDataError` | `(err, raw) => void`       | `console.warn` | Called when `data` is a string and `JSON.parse` fails (instead of warning). |

Named exports: `applyLogic`, `rule`, `validate`, `OPERATORS`, `FIELD_TYPES`, types `FieldType`, `Operator`, `JsonLogicValue`, `ValidationError`, `ValidationResult`.

## Building rules in code

`rule` is a typed factory you can use to construct JsonLogic rules without writing the JSON shape by hand:

```ts
import { applyLogic, rule, validate } from "react-json-logic";

const r = rule.and(
  rule.eq(rule.var("user.age"), 21),
  rule.gt(rule.var("score"), 100),
);

applyLogic(r, { user: { age: 21 }, score: 150 }); // → true
validate(r); // → { ok: true }
```

Each factory returns a `JsonLogicValue` shaped per the canonical [JsonLogic](http://jsonlogic.com) spec — the `<JsonLogicBuilder />` UI, `applyLogic`, and `validate` all consume the same shape. Arity is enforced at the function signature level (no runtime schema overhead).

| Group        | Factories                                                        |
| ------------ | ---------------------------------------------------------------- |
| Equality     | `eq`, `looseEq`, `notEq`, `looseNotEq`                           |
| Logical      | `and`, `or`, `not`                                               |
| Comparison   | `lt`, `lte`, `gt`, `gte`                                         |
| Arithmetic   | `add`, `sub`, `mul`, `div`, `mod`                                |
| Accessor     | `var(path, fallback?)`                                           |
| Higher-order | `some`, `all`, `none`, `map`, `filter`                           |

`validate(rule)` walks a rule against the operator table and reports structural problems (multi-key operator objects, arity violations, etc.) as `{ ok: false, errors: [{ path, message }] }`. Custom operators (registered via `json-logic-js`'s `add_operation`) are tolerated — only known operators get arity-checked.

## Styling

Components render unstyled. Target the rendered DOM via stable `data-rjl-*` attributes:

| Attribute                       | What it marks                                      |
| ------------------------------- | -------------------------------------------------- |
| `data-rjl-builder`              | Outermost wrapper                                  |
| `data-rjl-any`                  | Recursive operator container                       |
| `data-rjl-children`             | Wrapper around an operator's child fields          |
| `data-rjl-field`                | A single child field row                           |
| `data-rjl-add`                  | "Add field" button                                 |
| `data-rjl-remove`               | "Remove field" button                              |
| `data-rjl-operator-trigger`     | Operator dropdown trigger                          |
| `data-rjl-operator-popup`       | Operator dropdown popup (portaled)                 |
| `data-rjl-input`                | Value-input wrapper                                |
| `data-rjl-input-type-trigger`   | Type select trigger (`text` / `number`)            |
| `data-rjl-input-type-popup`     | Type select popup (portaled)                       |
| `data-rjl-input-value`          | The actual `<input>` element                       |
| `data-rjl-accessor`             | Accessor (`var`) wrapper                           |
| `data-rjl-accessor-level`       | One level of an accessor path                      |
| `data-rjl-accessor-level-index` | The level's index (`"0"`, `"1"`, …)                |
| `data-rjl-accessor-input`       | Accessor input element                             |
| `data-rjl-accessor-popup`       | Accessor suggestion popup (portaled)               |
| `data-rjl-higher-order`         | `some` / `all` / `none` / `map` / `filter` wrapper |
| `data-rjl-higher-order-arrow`   | The `=>` glyph                                     |
| `data-rjl-higher-order-child`   | The inner expression of a higher-order op          |

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

This repo runs on [Vite+](https://viteplus.dev). All workflows go through `vp`:

```bash
vp install        # install deps
vp check          # format + lint + typecheck
vp test           # run tests
vp test --coverage  # with coverage report
vp pack           # build the library
pnpm verify       # the full gate (check + test --coverage + pack)
```

See [AGENTS.md](AGENTS.md) for project layout and contributor notes.

## License

MIT
