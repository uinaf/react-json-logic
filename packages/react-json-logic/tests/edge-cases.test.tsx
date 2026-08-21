import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, render as rtlRender } from "@testing-library/react";
import { StrictMode, type ReactElement } from "react";
import JsonLogicBuilder, { applyLogic, type JsonLogicValue, rule, validate } from "../src/index.ts";

const render = (ui: ReactElement) => {
  const result = rtlRender(<StrictMode>{ui}</StrictMode>);
  return {
    ...result,
    rerender: (nextUi: ReactElement) => result.rerender(<StrictMode>{nextUi}</StrictMode>),
  };
};

const ignoreChange = () => {};

afterEach(() => cleanup());

describe("edge cases — value shapes", () => {
  test("empty object value renders the operator dropdown but no children", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={{}} />);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    expect(container.querySelector("[data-rjl-operator-trigger]")).not.toBeNull();
    expect(container.querySelectorAll("[data-rjl-field]").length).toBe(0);
  });

  test("null value is tolerated and renders the null type", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={null} />);
    expect(container.querySelector("[data-rjl-input-type-trigger]")).not.toBeNull();
    expect(container.querySelector("input[data-rjl-input-value]")).toBeNull();
    expect(container.querySelector("[data-rjl-input-array]")).toBeNull();
  });

  test("number-typed value renders a number input", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={3.14} />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  test("boolean-shaped values render a boolean control", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={true} />);
    expect(container.querySelector("[data-rjl-input-boolean]")).not.toBeNull();
    expect(container.querySelector("input[data-rjl-input-value]")).toBeNull();
  });

  test("array-shaped values render an array editor", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={[1, 2, 3]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    expect(editor).not.toBeNull();
    expect(JSON.parse(editor.value)).toEqual([1, 2, 3]);
  });

  test("renders a deeply nested rule (10+ levels)", () => {
    let r: JsonLogicValue = 1;
    for (let i = 0; i < 12; i += 1) r = rule.add(r, 1);
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value={r} />);
    expect(container.querySelectorAll("[data-rjl-operator-trigger]").length).toBeGreaterThanOrEqual(
      12,
    );
  });
});

describe("edge cases — accessor / data shape", () => {
  test("accessor with primitive-array data renders no level inputs", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ var: ["a"] }}
        data={[1, 2, 3] as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
    expect(container.querySelectorAll("[data-rjl-accessor-input]").length).toBe(0);
  });

  test("accessor with nested-object data renders levels for each path segment", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ var: ["a.b.c"] }}
        data={{ a: { b: { c: 1, d: 2 } } }}
      />,
    );
    expect(container.querySelectorAll("[data-rjl-accessor-input]").length).toBeGreaterThanOrEqual(
      3,
    );
  });

  test("data prop accepts an empty object and the var operator stays hidden", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} value="" data={{}} />);
    expect(container.querySelector("[data-rjl-accessor]")).toBeNull();
  });

  test("primitive JSON data string is recovered to empty object", () => {
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value="" data={"null"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalled();
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });

  test("invalid JSON data string is recovered to empty object", () => {
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value=""
        data={"not json at all"}
        onDataError={onDataError}
      />,
    );
    expect(onDataError).toHaveBeenCalled();
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });
});

describe("edge cases — validate", () => {
  test("flags unary not with two operands", () => {
    const result = validate({ "!": [true, false] });
    if (result.ok) throw new Error("expected unary not to reject two operands");
    expect(result.errors[0]?.path).toBe("$.!");
  });

  test("walks deeply nested rules and reports all errors", () => {
    const bad = rule.and(
      { "===": [1] }, // arity violation
      { "<": [1, 2, 3] }, // arity violation
      true,
    );
    const result = validate(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBe(2);
      expect(result.errors[0]?.path).toMatch(/and\[0]/);
      expect(result.errors[1]?.path).toMatch(/and\[1]/);
    }
  });

  test("accepts every operator that the builder produces", () => {
    const samples = [
      rule.eq(1, 1),
      rule.looseEq("1", 1),
      rule.notEq(1, 2),
      rule.looseNotEq(1, 2),
      rule.and(true, false),
      rule.or(true, false),
      rule.not(true),
      rule.if(true, 1, 0),
      rule.lt(1, 2),
      rule.lte(1, 2),
      rule.gt(2, 1),
      rule.gte(2, 1),
      rule.add(1, 2),
      rule.sub(2, 1),
      rule.sub(5),
      rule.mul(2, 3),
      rule.div(6, 2),
      rule.mod(7, 3),
      rule.min(1, 2, 3),
      rule.max(1, 2, 3),
      rule.var("a"),
      rule.var("a", 0),
      rule.missing("x"),
      rule.missingSome(1, ["x", "y"]),
      rule.in("a", "abc"),
      rule.cat("a", "b"),
      rule.merge([1], [2]),
      rule.some(rule.var("xs"), rule.gt(rule.var(""), 0)),
      rule.all(rule.var("xs"), rule.gt(rule.var(""), 0)),
      rule.none(rule.var("xs"), rule.gt(rule.var(""), 0)),
      rule.map(rule.var("xs"), rule.var("")),
      rule.filter(rule.var("xs"), rule.gt(rule.var(""), 0)),
    ];
    for (const r of samples) {
      const result = validate(r);
      expect(result.ok, `expected validate to accept: ${JSON.stringify(r)}`).toBe(true);
    }
  });
});

describe("applyLogic", () => {
  test("applyLogic does not mutate the data argument", () => {
    const data = { a: 1, items: [1, 2, 3] };
    const snapshot = JSON.parse(JSON.stringify(data));
    applyLogic(rule.some(rule.var("items"), rule.gt(rule.var(""), 0)), data);
    expect(data).toEqual(snapshot);
  });
});
