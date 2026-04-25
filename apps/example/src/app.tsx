import { useState } from "react";
import JsonLogicBuilder, { applyLogic, type JsonLogicValue, rule } from "react-json-logic";

const SAMPLE_DATA = {
  user: { age: 21, name: "Ada" },
  items: [
    { score: 90, label: "alpha" },
    { score: 75, label: "beta" },
    { score: 40, label: "gamma" },
  ],
  flag: true,
};

const SAMPLES: Array<{ title: string; rule: JsonLogicValue }> = [
  { title: "empty (start typing)", rule: "" },
  { title: "simple comparison", rule: rule.eq(rule.var("user.age"), 21) },
  {
    title: "and / or composition",
    rule: rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("user.age"), 18)),
  },
  {
    title: "higher-order: items where score > 70",
    rule: rule.filter(rule.var("items"), rule.gt(rule.var("score"), 70)),
  },
  {
    title: "if-elseif chain",
    rule: rule.if(
      rule.gt(rule.var("user.age"), 65),
      "senior",
      rule.gt(rule.var("user.age"), 18),
      "adult",
      "minor",
    ),
  },
];

export default function App() {
  const [r, setR] = useState<JsonLogicValue>(SAMPLES[0]!.rule);
  const [dataText, setDataText] = useState<string>(JSON.stringify(SAMPLE_DATA, null, 2));

  let data: JsonLogicValue = {};
  let dataError: string | null = null;
  try {
    data = JSON.parse(dataText) as JsonLogicValue;
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  let evaluated: unknown = "—";
  let evalError: string | null = null;
  try {
    evaluated = applyLogic(r, data);
  } catch (err) {
    evalError = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="page">
      <header>
        <h1>react-json-logic</h1>
        <p>headless · React 19 · Base UI · {`${process.env.NODE_ENV ?? ""}`.trim()}</p>
      </header>

      <section>
        <h2>Try a sample</h2>
        <div className="samples">
          {SAMPLES.map((s, i) => (
            <button key={i} type="button" onClick={() => setR(s.rule)}>
              {s.title}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Builder</h2>
        <div className="builder">
          <JsonLogicBuilder
            value={r}
            data={
              typeof data === "object" && data !== null
                ? (data as Record<string, unknown> | unknown[])
                : {}
            }
            onChange={setR}
          />
        </div>
      </section>

      <section className="cols">
        <div>
          <h2>Rule (JSON)</h2>
          <pre>{JSON.stringify(r, null, 2)}</pre>
        </div>

        <div>
          <h2>Data (editable)</h2>
          <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={12} />
          {dataError && <p className="error">JSON parse error: {dataError}</p>}
        </div>
      </section>

      <section>
        <h2>Evaluation</h2>
        <pre>{evalError ?? JSON.stringify(evaluated, null, 2)}</pre>
        {evalError && <p className="error">applyLogic threw: {evalError}</p>}
      </section>

      <footer>
        <p>
          <a href="https://github.com/uinaf/react-json-logic">github</a> ·{" "}
          <a href="https://npmjs.com/package/react-json-logic">npm</a>
        </p>
      </footer>
    </main>
  );
}
