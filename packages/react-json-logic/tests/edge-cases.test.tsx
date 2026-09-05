import { afterEach, describe, expect, test } from "vite-plus/test";
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

describe("edge-case value shapes", () => {
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

describe("edge-case accessor and data shapes", () => {
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
});

describe("edge-case validation", () => {
  test("flags unary not with two operands", () => {
    const result = validate({ "!": [true, false] });
    if (result.ok) throw new Error("expected unary not to reject two operands");
    expect(result.errors[0]?.path).toBe("$.!");
  });

  test("walks deeply nested rules and reports all errors", () => {
    const bad = rule.and({ "===": [1] }, { "<": [1, 2, 3, 4] }, true);
    const result = validate(bad);
    if (result.ok) throw new Error("expected nested arity errors");
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]?.path).toMatch(/and\[0]/);
    expect(result.errors[1]?.path).toMatch(/and\[1]/);
  });

  test("accepts every canonical operator shape", () => {
    const samples: JsonLogicValue[] = [
      { "==": [1, 1] },
      { "===": [1, 1] },
      { "!=": [1, 2] },
      { "!==": [1, 2] },
      { and: [true, false] },
      { or: [true, false] },
      { "!": [true] },
      { if: [true, 1, 0] },
      { "<": [1, 2] },
      { "<=": [1, 2] },
      { ">": [2, 1] },
      { ">=": [2, 1] },
      { "+": [1, 2] },
      { "-": [2, 1] },
      { "-": [5] },
      { "*": [2, 3] },
      { "/": [6, 2] },
      { "%": [7, 3] },
      { min: [1, 2, 3] },
      { max: [1, 2, 3] },
      { var: ["a"] },
      { var: ["a", 0] },
      { missing: ["x"] },
      { missing_some: [1, ["x", "y"]] },
      { in: ["a", "abc"] },
      { cat: ["a", "b"] },
      { merge: [[1], [2]] },
      { some: [{ var: ["xs"] }, { ">": [{ var: [""] }, 0] }] },
      { all: [{ var: ["xs"] }, { ">": [{ var: [""] }, 0] }] },
      { none: [{ var: ["xs"] }, { ">": [{ var: [""] }, 0] }] },
      { map: [{ var: ["xs"] }, { var: [""] }] },
      { filter: [{ var: ["xs"] }, { ">": [{ var: [""] }, 0] }] },
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
    applyLogic(rule.some(rule.var("items"), rule.gt(rule.var(""), 0)), data);
    expect(data).toEqual({ a: 1, items: [1, 2, 3] });
  });
});
