import { useMemo, useState } from "react";
import JsonLogicBuilder, {
  applyLogic,
  type JsonLogicData,
  type JsonLogicValue,
  rule,
} from "react-json-logic";

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
  { title: "empty", rule: "" },
  { title: "simple comparison", rule: rule.eq(rule.var("user.age"), 21) },
  {
    title: "and / or",
    rule: rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("user.age"), 18)),
  },
  {
    title: "filter items, score > 70",
    rule: rule.filter(rule.var("items"), rule.gt(rule.var("score"), 70)),
  },
  {
    title: "if / elseif chain",
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
  const [activeSample, setActiveSample] = useState(0);
  const [r, setR] = useState<JsonLogicValue>(SAMPLES[0]!.rule);
  const [dataText, setDataText] = useState<string>(JSON.stringify(SAMPLE_DATA, null, 2));

  const { data, dataError } = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(dataText);
      if (parsed !== null && typeof parsed === "object") {
        return { data: parsed as JsonLogicData, dataError: null as string | null };
      }
      return { data: {} as JsonLogicData, dataError: "data must be an object or array" };
    } catch (err) {
      return {
        data: {} as JsonLogicData,
        dataError: err instanceof Error ? err.message : String(err),
      };
    }
  }, [dataText]);

  let evaluated: unknown = null;
  let evalError: string | null = null;
  try {
    evaluated = applyLogic(r, data);
  } catch (err) {
    evalError = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="page">
      <header className="head">
        <h1>react-json-logic</h1>
        <p className="meta">local dev harness</p>
      </header>

      <section>
        <h2>samples</h2>
        <div className="samples">
          {SAMPLES.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={activeSample === i}
              onClick={() => {
                setActiveSample(i);
                setR(s.rule);
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>builder</h2>
        <div className="builder">
          <JsonLogicBuilder value={r} data={data} onChange={setR} />
        </div>
      </section>

      <section className="cols">
        <div className="col">
          <div className="col-head">
            <h2>rule (json)</h2>
          </div>
          <pre>{JSON.stringify(r, null, 2)}</pre>
        </div>

        <div className="col">
          <div className="col-head">
            <h2>data</h2>
            <span className="status">
              <span className={`dot${dataError ? " err" : ""}`} aria-hidden="true" />
              {dataError ? "invalid" : "valid"}
            </span>
          </div>
          <textarea
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            rows={12}
            spellCheck={false}
          />
          {dataError && <p className="error">json parse error: {dataError}</p>}
        </div>
      </section>

      <section>
        <div className="col-head">
          <h2>evaluation</h2>
          <span className="status">
            <span className={`dot${evalError ? " err" : ""}`} aria-hidden="true" />
            {evalError ? "error" : "ok"}
          </span>
        </div>
        <pre>{evalError ?? JSON.stringify(evaluated, null, 2)}</pre>
        {evalError && <p className="error">applylogic threw: {evalError}</p>}
      </section>
    </main>
  );
}
