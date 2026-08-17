![react-json-logic — build and evaluate JsonLogic with React components.](https://uinaf.dev/og/banner/react-json-logic.png)

# uinaf/react-json-logic

Build and evaluate [JsonLogic](http://jsonlogic.com) rules with React components.

`react-json-logic` is headless. No CSS is shipped. You style it however you want.

## Installation

```bash
pnpm add react-json-logic react react-dom
```

Requires React 19 (`react` / `react-dom` peer `^19.0.0`).

## Basic Usage

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

## API Overview

- Default export: `JsonLogicBuilder`
- Named exports: `applyLogic`, `rule`, `validate`, `OPERATORS`, `FIELD_TYPES`
- Core types: `JsonLogicBuilderProps`, `JsonLogicValue`, `JsonLogicData`, `ValidationResult`, `ValidationError`

### Component Props

- `value: JsonLogicValue` - controlled current rule
- `onChange: (value: JsonLogicValue) => void` - called whenever the rule changes
- `data?: JsonLogicData | string` - sample data for accessor suggestions (`var`)
- `onDataError?: (err: unknown, raw: string) => void` - parse error hook when `data` is a string

## Styling

Use stable `data-rjl-*` attributes to style the rendered DOM (for example with Tailwind, CSS Modules, or vanilla CSS).

Common hooks include:

- `data-rjl-builder`
- `data-rjl-any`
- `data-rjl-field`
- `data-rjl-add`
- `data-rjl-remove`
- `data-rjl-operator-trigger`
- `data-rjl-operator-popup`
- `data-rjl-input-value`
- `data-rjl-accessor-input`
- `data-rjl-higher-order`

## Building Rules in Code

Use the typed `rule` factory to construct rules without hand-writing JSON:

```ts
import { applyLogic, rule, validate } from "react-json-logic";

const r = rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("score"), 100));

applyLogic(r, { user: { age: 21 }, score: 150 }); // true
validate(r); // { ok: true }
```

## Repo and Development

This repository is a workspace with:

- `packages/react-json-logic` (publishable npm package)
- `apps/example` (demo app)

From the workspace root:

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm dev:example
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
