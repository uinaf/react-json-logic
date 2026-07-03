/**
 * Edge cases: weird value shapes, deep nesting, defensive paths.
 *
 * These tests exist to lock the library against breakage on unusual
 * but legal inputs — not just the happy path.
 */
import { afterEach, describe, expect, test, vi } from "vitest";
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

afterEach(() => cleanup());

describe("edge cases — value shapes", () => {
  test("empty object value renders the operator dropdown but no children", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={{}} />);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    expect(container.querySelector("[data-rjl-operator-trigger]")).not.toBeNull();
    expect(container.querySelectorAll("[data-rjl-field]").length).toBe(0);
  });

  test("null value is tolerated and renders the value field", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={null} />);
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("number-typed value renders a number input", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={3.14} />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  test("boolean-shaped values fall through to the value field", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} value={true as unknown as string} />,
    );
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("array-shaped value falls through to the value field", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={[1, 2, 3]} />);
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("renders a deeply nested rule (10+ levels)", () => {
    const onChange = vi.fn();
    let r: JsonLogicValue = 1;
    for (let i = 0; i < 12; i += 1) r = rule.add(r, 1);
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={r} />);
    // 12 nested + operators each rendered via SelectOperator
    expect(container.querySelectorAll("[data-rjl-operator-trigger]").length).toBeGreaterThanOrEqual(
      12,
    );
  });
});

describe("edge cases — accessor / data shape", () => {
  test("accessor with primitive-array data renders no level inputs", () => {
    // getIterator returns null when data is an array of primitives
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ var: ["a"] }}
        data={[1, 2, 3] as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
    expect(container.querySelectorAll("[data-rjl-accessor-input]").length).toBe(0);
  });

  test("accessor with nested-object data renders levels for each path segment", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ var: ["a.b.c"] }}
        data={{ a: { b: { c: 1, d: 2 } } }}
      />,
    );
    // 3 levels (a, b, c) → 3 inputs
    expect(container.querySelectorAll("[data-rjl-accessor-input]").length).toBeGreaterThanOrEqual(
      3,
    );
  });

  test("data prop accepts an empty object and the var operator stays hidden", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" data={{}} />);
    // No data → no var operator in the dropdown
    expect(container.querySelector("[data-rjl-accessor]")).toBeNull();
  });

  test("invalid JSON data string is recovered to empty object", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value=""
        data={"not json at all"}
        onDataError={onDataError}
      />,
    );
    expect(onDataError).toHaveBeenCalled();
    // Builder still renders something usable
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });
});

describe("edge cases — validate", () => {
  test("tolerates the var shorthand {var: 'path'}", () => {
    expect(validate({ var: "a" })).toEqual({ ok: true });
    // also nested
    expect(validate({ "===": [{ var: "a" }, { var: "b" }] })).toEqual({ ok: true });
  });

  test("flags arity violations on every operator with a known max", () => {
    // ! takes exactly 1
    const result = validate({ "!": [true, false] });
    expect(result.ok).toBe(false);
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

describe("edge cases — applyLogic round-trip with builder", () => {
  test("every builder rule round-trips through JSON.parse(JSON.stringify(...))", () => {
    const samples = [
      rule.eq(1, 1),
      rule.and(rule.eq(1, 1), rule.gt(2, 1)),
      rule.if(true, "a", "b"),
      rule.some(rule.var("items"), rule.gt(rule.var(""), 0)),
      rule.merge([1, 2], [3]),
      rule.missingSome(1, ["a", "b"]),
    ];
    for (const r of samples) {
      const round = JSON.parse(JSON.stringify(r));
      expect(round).toEqual(r);
      // …and it's still evaluable
      expect(() => applyLogic(round, {})).not.toThrow();
    }
  });

  test("applyLogic does not mutate the data argument", () => {
    const data = { a: 1, items: [1, 2, 3] };
    const snapshot = JSON.parse(JSON.stringify(data));
    applyLogic(rule.some(rule.var("items"), rule.gt(rule.var(""), 0)), data);
    expect(data).toEqual(snapshot);
  });
});
