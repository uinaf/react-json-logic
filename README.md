# react-json-logic — workspace

This is the monorepo for [`react-json-logic`](packages/react-json-logic), a headless React component library for building [JsonLogic](http://jsonlogic.com) rules visually.

## Layout

```
.
├── packages/
│   └── react-json-logic/        # the published library — see its README
└── apps/
    └── example/                 # interactive demo, deployed to Cloudflare Pages
```

## Toolchain

[Vite+](https://viteplus.dev) drives everything. From the workspace root:

```bash
vp install          # bootstrap (workspace-aware)
pnpm verify         # run check + test --coverage + pack across every package
pnpm test           # tests in every package
pnpm check          # format + lint + typecheck across every package
pnpm build          # build the library
pnpm dev:example    # run the demo app locally
pnpm build:example  # build the demo for deploy
```

## Library

The published artifact lives in [`packages/react-json-logic`](packages/react-json-logic). See that directory's [README](packages/react-json-logic/README.md) for usage, props, the styling-hooks contract, and the `rule` builder API.

## Demo

The interactive demo lives in [`apps/example`](apps/example). It consumes the local library via `workspace:*`, so changes flow through immediately during development.

## License

[MIT](LICENSE)
