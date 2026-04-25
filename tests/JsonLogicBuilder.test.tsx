import { expect, test, vi } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";
import JsonLogicBuilder, { applyLogic, OPERATORS } from "../src/index.ts";

test("OPERATORS table is non-empty and well-formed", () => {
  expect(OPERATORS.length).toBeGreaterThan(0);
  for (const op of OPERATORS) {
    expect(op.signature).toBeTruthy();
    expect(op.label).toBeTruthy();
    expect(op.fieldCount.min).toBeLessThanOrEqual(op.fieldCount.max);
  }
});

test("applyLogic evaluates rules via upstream json-logic-js", () => {
  expect(applyLogic({ "==": [1, 1] }, {})).toBe(true);
  expect(applyLogic({ var: ["a"] }, { a: 42 })).toBe(42);
  expect(applyLogic({ "+": [1, 2, 3] }, {})).toBe(6);
});

test("renders without crashing", () => {
  const onChange = vi.fn();
  const html = renderToStaticMarkup(<JsonLogicBuilder onChange={onChange} value={{}} data={{}} />);
  expect(html).toContain("<div");
});
