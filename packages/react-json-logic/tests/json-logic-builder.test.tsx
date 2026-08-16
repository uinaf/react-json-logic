import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render as rtlRender, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StrictMode, useState, type ReactElement } from "react";
import JsonLogicBuilder, {
  applyLogic,
  FIELD_TYPES,
  OPERATORS,
  type JsonLogicValue,
} from "../src/index.ts";

// All component renders go through StrictMode so React 19's double-invoke
// of effects + memo getters surfaces any unstable behavior in the suite.
// `rerender` is wrapped too — RTL's default `rerender` would otherwise drop
// the StrictMode parent and unmount/remount the subtree, breaking ref-based
// dedupe assertions across re-renders.
const render = (ui: ReactElement) => {
  const result = rtlRender(<StrictMode>{ui}</StrictMode>);
  return {
    ...result,
    rerender: (nextUi: ReactElement) => result.rerender(<StrictMode>{nextUi}</StrictMode>),
  };
};

/**
 * Stateful host that mirrors what a real consumer does — wires the builder
 * to local React state via onChange. Use when a test needs to observe the
 * accumulated rule across multiple interactions, not just the first emit.
 */
function StatefulHost(props: {
  initial?: JsonLogicValue;
  data?: Parameters<typeof JsonLogicBuilder>[0]["data"];
  onChange?: (next: JsonLogicValue) => void;
}) {
  const [value, setValue] = useState<JsonLogicValue>(props.initial ?? "");
  return (
    <JsonLogicBuilder
      value={value}
      data={props.data}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

afterEach(() => cleanup());

describe("OPERATORS table", () => {
  test("is non-empty and well-formed", () => {
    expect(OPERATORS.length).toBeGreaterThan(0);
    for (const op of OPERATORS) {
      expect(op.signature).toBeTruthy();
      expect(op.label).toBeTruthy();
      expect(op.fieldCount.min).toBeLessThanOrEqual(op.fieldCount.max);
      expect(op.fieldCount.min).toBeGreaterThanOrEqual(0);
    }
  });

  test("does not include the legacy 'Between' fake operator", () => {
    expect(OPERATORS.find((o) => o.signature === "Between")).toBeUndefined();
  });

  test("does not include the legacy 'every' fake operator", () => {
    expect(OPERATORS.find((o) => o.signature === "every")).toBeUndefined();
  });

  test("signatures are unique", () => {
    const sigs = OPERATORS.map((o) => o.signature);
    expect(new Set(sigs).size).toBe(sigs.length);
  });

  test("only references declared field types", () => {
    const allowed: string[] = Object.values(FIELD_TYPES);
    for (const op of OPERATORS) {
      for (const f of op.fields) {
        expect(allowed).toContain(f);
      }
    }
  });

  test("has stable signatures for the canonical JsonLogic operators", () => {
    const expected = [
      "value",
      "var",
      "missing",
      "missing_some",
      "==",
      "===",
      "!=",
      "!==",
      "!",
      "and",
      "or",
      "if",
      "<",
      "<=",
      ">",
      ">=",
      "+",
      "-",
      "*",
      "/",
      "%",
      "min",
      "max",
      "in",
      "cat",
      "merge",
      "some",
      "all",
      "none",
      "map",
      "filter",
    ];
    const sigs = new Set(OPERATORS.map((o) => o.signature));
    for (const s of expected) {
      expect(sigs.has(s), `expected operator "${s}" to be defined`).toBe(true);
    }
  });

  test("higher-order operators take exactly two args [collection, predicate]", () => {
    const hofs = OPERATORS.filter((o) => o.type === "Higher Order");
    expect(hofs.length).toBeGreaterThan(0);
    for (const op of hofs) {
      expect(op.fieldCount.min).toBe(2);
      expect(op.fieldCount.max).toBe(2);
      expect(op.fields).toEqual(["any", "higher-order"]);
    }
  });
});

describe("applyLogic", () => {
  test("evaluates basic ops", () => {
    expect(applyLogic({ "==": [1, 1] }, {})).toBe(true);
    expect(applyLogic({ var: ["a"] }, { a: 42 })).toBe(42);
    expect(applyLogic({ "+": [1, 2, 3] }, {})).toBe(6);
    expect(applyLogic({ and: [true, true] }, {})).toBe(true);
    expect(applyLogic({ or: [false, true] }, {})).toBe(true);
    expect(applyLogic({ "!": [false] }, {})).toBe(true);
  });

  test("evaluates higher-order operators with canonical [collection, predicate]", () => {
    expect(
      applyLogic({ some: [{ var: "items" }, { ">": [{ var: "" }, 0] }] }, { items: [-1, 2, 3] }),
    ).toBe(true);
    expect(
      applyLogic({ all: [{ var: "items" }, { ">": [{ var: "" }, 0] }] }, { items: [1, 2, 3] }),
    ).toBe(true);
    expect(
      applyLogic({ none: [{ var: "items" }, { ">": [{ var: "" }, 0] }] }, { items: [-1, -2, -3] }),
    ).toBe(true);
    expect(
      applyLogic({ map: [{ var: "items" }, { "*": [{ var: "" }, 2] }] }, { items: [1, 2, 3] }),
    ).toEqual([2, 4, 6]);
    expect(
      applyLogic(
        { filter: [{ var: "items" }, { ">": [{ var: "" }, 1] }] },
        { items: [0, 1, 2, 3] },
      ),
    ).toEqual([2, 3]);
  });

  test("evaluates if / cond chains", () => {
    expect(applyLogic({ if: [true, "yes", "no"] }, {})).toBe("yes");
    expect(applyLogic({ if: [false, "yes", "no"] }, {})).toBe("no");
    // elseif chain
    expect(
      applyLogic(
        {
          if: [{ "===": [{ var: "x" }, 1] }, "one", { "===": [{ var: "x" }, 2] }, "two", "many"],
        },
        { x: 2 },
      ),
    ).toBe("two");
  });

  test("evaluates min / max / merge / in / cat / missing", () => {
    expect(applyLogic({ min: [3, 1, 2] }, {})).toBe(1);
    expect(applyLogic({ max: [3, 1, 2] }, {})).toBe(3);
    expect(
      applyLogic(
        {
          merge: [
            [1, 2],
            [3, 4],
          ],
        },
        {},
      ),
    ).toEqual([1, 2, 3, 4]);
    expect(applyLogic({ in: ["foo", "foobar"] }, {})).toBe(true);
    expect(applyLogic({ in: ["x", ["a", "b"]] }, {})).toBe(false);
    expect(applyLogic({ cat: ["a", "b", "c"] }, {})).toBe("abc");
    expect(applyLogic({ missing: ["x", "y"] }, { x: 1 })).toEqual(["y"]);
    expect(applyLogic({ missing_some: [1, ["x", "y"]] }, { x: 1 })).toEqual([]);
    expect(applyLogic({ missing_some: [2, ["x", "y"]] }, { x: 1 })).toEqual(["y"]);
  });
});

describe("<JsonLogicBuilder /> — render paths", () => {
  test("renders the value field by default", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} />);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("renders the active operator label for a populated rule", () => {
    const onChange = vi.fn();
    render(<JsonLogicBuilder onChange={onChange} value={{ "===": [1, 1] }} />);
    expect(screen.getAllByText("===").length).toBeGreaterThan(0);
  });

  test("renders the canonical higher-order shape with [collection, predicate]", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ some: [{ var: "items" }, { "==": [{ var: "" }, 1] }] }}
        data={{ items: [{ x: 1 }] }}
      />,
    );
    expect(screen.getAllByText("some").length).toBeGreaterThan(0);
    // The => glyph appears on the predicate (second child) only
    const arrows = container.querySelectorAll("[data-rjl-higher-order-arrow]");
    expect(arrows.length).toBe(1);
    // The first child (collection) is a plain Any (no arrow wrapper)
    const fields = container.querySelectorAll("[data-rjl-field]");
    expect(fields.length).toBeGreaterThanOrEqual(2);
  });

  test("hides the var/accessor operator when no data is provided", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} />);
    expect(container.querySelector("[data-rjl-accessor]")).toBeNull();
  });

  test("renders an accessor when value is a var rule and data is provided", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} value={{ var: ["a.b"] }} data={{ a: { b: 1 } }} />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("accepts a JSON string for data", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ var: ["a"] }}
        data={JSON.stringify({ a: 1 })}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("renders an accessor when data is an array of records", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ var: ["a"] }}
        data={[{ a: 1, b: 2 }] as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("renders nested arithmetic rules", () => {
    const onChange = vi.fn();
    render(<JsonLogicBuilder onChange={onChange} value={{ "===": [{ "+": [1, 2] }, 3] }} />);
    expect(screen.getAllByText("===").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+").length).toBeGreaterThan(0);
  });

  test("renders the not-equals operators", () => {
    const onChange = vi.fn();
    const { rerender } = render(<JsonLogicBuilder onChange={onChange} value={{ "!=": [1, 2] }} />);
    expect(screen.getAllByText("!=").length).toBeGreaterThan(0);
    rerender(<JsonLogicBuilder onChange={onChange} value={{ "!==": [1, 2] }} />);
    expect(screen.getAllByText("!==").length).toBeGreaterThan(0);
  });

  test("renders unary not", () => {
    const onChange = vi.fn();
    render(<JsonLogicBuilder onChange={onChange} value={{ "!": [true] }} />);
    expect(screen.getAllByText("!").length).toBeGreaterThan(0);
  });

  test("renders boolean operators", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <JsonLogicBuilder onChange={onChange} value={{ and: [true, false] }} />,
    );
    expect(screen.getAllByText("and").length).toBeGreaterThan(0);
    rerender(<JsonLogicBuilder onChange={onChange} value={{ or: [true, false] }} />);
    expect(screen.getAllByText("or").length).toBeGreaterThan(0);
  });

  test("renders comparison operators", () => {
    const onChange = vi.fn();
    for (const op of ["<", "<=", ">", ">="] as const) {
      cleanup();
      render(<JsonLogicBuilder onChange={onChange} value={{ [op]: [1, 2] }} />);
      expect(screen.getAllByText(op).length).toBeGreaterThan(0);
    }
  });

  test("renders the new canonical operators", () => {
    const onChange = vi.fn();
    const cases: Array<{ rule: JsonLogicValue; label: string }> = [
      { rule: { if: [true, 1, 0] }, label: "if" },
      { rule: { min: [1, 2] }, label: "min" },
      { rule: { max: [1, 2] }, label: "max" },
      { rule: { in: ["a", ["a", "b"]] }, label: "in" },
      { rule: { cat: ["a", "b"] }, label: "cat" },
      { rule: { merge: [[1], [2]] }, label: "merge" },
      { rule: { missing: ["x", "y"] }, label: "missing" },
    ];
    for (const c of cases) {
      cleanup();
      render(<JsonLogicBuilder onChange={onChange} value={c.rule} />);
      expect(
        screen.getAllByText(c.label).length,
        `expected to render label "${c.label}"`,
      ).toBeGreaterThan(0);
    }
  });

  test("falls back to the value field for an unrecognized operator key", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ unknownOp: [1, 2] } satisfies JsonLogicValue}
      />,
    );
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("renders extra fields when value array exceeds operator default fields", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} value={{ or: [true, false, true, false] }} />,
    );
    expect(container.querySelectorAll("[data-rjl-field]").length).toBeGreaterThanOrEqual(4);
  });
});

describe("<JsonLogicBuilder /> — interaction (onChange)", () => {
  test("addField appends an empty entry through onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={{ "+": [1, 2] }} />);
    const addButton = container.querySelector("[data-rjl-add]");
    expect(addButton).not.toBeNull();
    fireEvent.click(addButton!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual({ "+": [1, 2, ""] });
  });

  test("removeField drops the entry at the given index through onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} value={{ "+": [1, 2, 3] }} />,
    );
    const removeButtons = container.querySelectorAll("[data-rjl-remove]");
    expect(removeButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeButtons[0]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual({ "+": [2, 3] });
  });

  test("typing into the value input emits the new string", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("hello");
  });

  test("typing a number into a number-typed input parses to number", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={42} />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    expect(input.type).toBe("number");
    fireEvent.change(input, { target: { value: "123" } });
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(123);
  });

  test("typing into a higher-order predicate input emits a canonical-shaped rule", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder
        onChange={onChange}
        value={{ some: [{ var: "items" }, ""] }}
        data={{ items: [1, 2, 3] }}
      />,
    );
    const innerInput = container.querySelector(
      "[data-rjl-higher-order-child] input[data-rjl-input-value]",
    ) as HTMLInputElement;
    expect(innerInput).not.toBeNull();
    fireEvent.change(innerInput, { target: { value: "x" } });
    expect(onChange).toHaveBeenCalled();
    // No `=>` envelope — canonical shape preserved
    const emitted = onChange.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(emitted.some).toEqual([{ var: "items" }, "x"]);
  });

  test("opening the operator dropdown and picking a different op emits the new shape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const trigger = container.querySelector("[data-rjl-operator-trigger]") as HTMLElement;
    await user.click(trigger);
    // The popup is portaled into document.body — query via screen
    const popup = await screen.findByRole("listbox");
    // Find the "and" option
    const option = within(popup).getByRole("option", { name: "and" });
    await user.click(option);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({ and: [] });
  });

  test("opening the input-type dropdown and picking 'number' coerces the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="42" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    expect(typeTrigger).not.toBeNull();
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    const numberOption = within(popup).getByRole("option", { name: "number" });
    await user.click(numberOption);
    expect(onChange).toHaveBeenCalled();
    // value "42" → 42 after switching to number
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(42);
  });

  test("switching from number back to text coerces the value to a string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={42} />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    const textOption = within(popup).getByRole("option", { name: "text" });
    await user.click(textOption);
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("42");
  });

  test("switching to number with non-numeric value emits 0 (NaN guard)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="hello" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "number" }));
    // parseFloat("hello") → NaN → guarded to 0
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(0);
  });

  test("clearing a number-typed input emits empty string instead of NaN", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={42} />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    expect(input.type).toBe("number");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("");
  });

  test("typing into the accessor input accumulates into the var path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Use the StatefulHost so the rule actually accumulates across keystrokes
    // (StrictMode + a stateless test would reset per-char and we'd only see
    // the most recent character — that was the previous bug in this test).
    const { container } = render(
      <StatefulHost initial={{ var: [""] }} data={{ alpha: 1, beta: 2 }} onChange={onChange} />,
    );
    const accessorInput = container.querySelector("[data-rjl-accessor-input]") as HTMLInputElement;
    expect(accessorInput).not.toBeNull();
    await user.click(accessorInput);
    await user.keyboard("alp");
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0] as Record<string, JsonLogicValue>;
    // the var operator carries an array of [path] (or [path, fallback])
    expect(last.var).toEqual(["alp"]);
  });
});

describe("<JsonLogicBuilder /> — error surfacing", () => {
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

  test("re-fires onDataError after a recovery (invalid → valid → invalid)", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { rerender } = render(
      <JsonLogicBuilder onChange={onChange} data={"{bad"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("{bad");

    // valid data — dedupe ref must reset so the same raw can re-fire later
    rerender(
      <JsonLogicBuilder
        onChange={onChange}
        data={JSON.stringify({ a: 1 })}
        onDataError={onDataError}
      />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1); // still 1; valid parse doesn't fire

    // back to the same malformed string — should fire again
    rerender(<JsonLogicBuilder onChange={onChange} data={"{bad"} onDataError={onDataError} />);
    expect(onDataError).toHaveBeenCalledTimes(2);
    expect(onDataError.mock.calls[1]?.[1]).toBe("{bad");
  });

  test("calls onDataError when data JSON parses to null", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} data="null" onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("null");
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });

  test("calls onDataError when data JSON parses to a number", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} data="42" onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("42");
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });

  test("calls onDataError when data JSON parses to a boolean", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} data="true" onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("true");
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });

  test("warns to console when data JSON is a primitive and no onDataError is given", () => {
    const onChange = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<JsonLogicBuilder onChange={onChange} data="null" />);
    expect(warn).toHaveBeenCalled();
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    warn.mockRestore();
  });

  test("does not fire onDataError twice for the same persistent malformed data", () => {
    const onChange = vi.fn();
    const onDataError = vi.fn();
    const { rerender } = render(
      <JsonLogicBuilder onChange={onChange} data={"{bad"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    // Re-render with the same data — must stay at 1 call
    rerender(<JsonLogicBuilder onChange={onChange} data={"{bad"} onDataError={onDataError} />);
    expect(onDataError).toHaveBeenCalledTimes(1);
  });
});
