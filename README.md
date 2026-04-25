# react-json-logic

Build and evaluate [JsonLogic](http://jsonlogic.com) rules with React components.

> **Heads up — v3 is in active rewrite.** The v2 line targeted React 15 and is no longer maintained. v3 targets React 19 and uses a different toolchain (Vite+, TypeScript). API surface is preserved; styling and demo site are being rebuilt.

## Install

```bash
pnpm add react-json-logic react react-dom
```

## Usage

```tsx
import JsonLogicBuilder, { applyLogic } from "react-json-logic";
import "react-json-logic/style.css";

function Example() {
  const [rule, setRule] = useState({});
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

| Prop       | Type               | Default | Description                                                    |
| ---------- | ------------------ | ------- | -------------------------------------------------------------- |
| `onChange` | `(value) => void`  | —       | Called with the updated rule whenever the builder changes      |
| `value`    | `JsonLogicValue`   | `{}`    | Current rule (controlled).                                     |
| `data`     | `object \| string` | `{}`    | Sample data — used by accessor (`var`) fields and `applyLogic` |

## Development

This repo runs on [Vite+](https://viteplus.dev). All workflows go through `vp`:

```bash
vp install        # install deps
vp check          # format + lint + typecheck
vp test           # run tests
vp pack           # build the library
```

See [AGENTS.md](AGENTS.md) for project layout and contributor notes.

## License

MIT
