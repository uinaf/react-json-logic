import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import JsonLogicBuilder, { applyLogic, OPERATORS } from "../src/index.ts";

describe("OPERATORS table", () => {
  test("is non-empty and well-formed", () => {
    expect(OPERATORS.length).toBeGreaterThan(0);
    for (const op of OPERATORS) {
      expect(op.signature).toBeTruthy();
      expect(op.label).toBeTruthy();
      expect(op.fieldCount.min).toBeLessThanOrEqual(op.fieldCount.max);
    }
  });

  test("does not include the legacy 'Between' fake operator", () => {
    expect(OPERATORS.find((o) => o.signature === "Between")).toBeUndefined();
  });

  test("signatures are unique", () => {
    const sigs = OPERATORS.map((o) => o.signature);
    expect(new Set(sigs).size).toBe(sigs.length);
  });
});

describe("applyLogic", () => {
  test("evaluates basic ops via upstream json-logic-js", () => {
    expect(applyLogic({ "==": [1, 1] }, {})).toBe(true);
    expect(applyLogic({ var: ["a"] }, { a: 42 })).toBe(42);
    expect(applyLogic({ "+": [1, 2, 3] }, {})).toBe(6);
    expect(applyLogic({ and: [true, true] }, {})).toBe(true);
    expect(applyLogic({ "!": [false] }, {})).toBe(true);
  });
});

describe("<JsonLogicBuilder />", () => {
  // run cleanup after each test
  afterEach(() => cleanup());

  test("renders the value field by default", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} />);
    expect(container.querySelector("input")).not.toBeNull();
  });

  test("renders the active operator label for a populated rule", () => {
    const onChange = vi.fn();
    render(<JsonLogicBuilder onChange={onChange} value={{ "===": [1, 1] }} />);
    expect(screen.getAllByText("===").length).toBeGreaterThan(0);
  });

  test("renders the higher-order chain for nested rules", () => {
    const onChange = vi.fn();
    render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ some: [{ "=>": [{ "==": [1, 1] }] }] }}
        data={{ items: [{ x: 1 }] }}
      />,
    );
    expect(screen.getAllByText("some").length).toBeGreaterThan(0);
    expect(screen.getByText("=>")).not.toBeNull();
  });

  test("calls onDataError with the parse error when data is malformed JSON", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    render(<JsonLogicBuilder onChange={onChange} data={"{not json"} onDataError={onDataError} />);
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("{not json");
  });

  test("warns to console when data is malformed and no onDataError is given", () => {
    const onChange = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<JsonLogicBuilder onChange={onChange} data={"{nope"} />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
