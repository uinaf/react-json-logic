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

// Keep StrictMode across rerenders so double invocation exercises the same
// mounted subtree and its error-report dedupe state.
const render = (ui: ReactElement) => {
  const result = rtlRender(<StrictMode>{ui}</StrictMode>);
  return {
    ...result,
    rerender: (nextUi: ReactElement) => result.rerender(<StrictMode>{nextUi}</StrictMode>),
  };
};

const ignoreChange = () => {};

/** Keeps the builder controlled across multi-step interactions. */
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
  test("matches the canonical signatures and field contracts", () => {
    const expectedSignatures = [
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
    const signatures = OPERATORS.map((operator) => operator.signature);
    expect(signatures).toHaveLength(expectedSignatures.length);
    expect(new Set(signatures)).toEqual(new Set(expectedSignatures));

    const fieldTypes: string[] = Object.values(FIELD_TYPES);
    for (const operator of OPERATORS) {
      expect(operator.label.trim()).not.toBe("");
      expect(operator.fieldCount.min).toBeGreaterThanOrEqual(0);
      expect(operator.fieldCount.min).toBeLessThanOrEqual(operator.fieldCount.max);
      for (const field of operator.fields) expect(fieldTypes).toContain(field);
    }
  });

  test("higher-order operators take exactly two args [collection, predicate]", () => {
    const hofs = OPERATORS.filter((o) => o.type === "Higher Order");
    expect(hofs.map((operator) => operator.signature)).toEqual([
      "some",
      "all",
      "none",
      "map",
      "filter",
    ]);
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

describe("<JsonLogicBuilder /> render paths", () => {
  test("renders the value field by default", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} />);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("renders the active operator label for a populated rule", () => {
    render(<JsonLogicBuilder onChange={ignoreChange} value={{ "===": [1, 1] }} />);
    expect(screen.queryAllByText("===")).not.toHaveLength(0);
  });

  test("renders the canonical higher-order shape with [collection, predicate]", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ some: [{ var: "items" }, { "==": [{ var: "" }, 1] }] }}
        data={{ items: [{ x: 1 }] }}
      />,
    );
    expect(screen.queryAllByText("some")).not.toHaveLength(0);
    const arrows = container.querySelectorAll("[data-rjl-higher-order-arrow]");
    expect(arrows.length).toBe(1);
    const fields = container.querySelectorAll("[data-rjl-field]");
    expect(fields.length).toBeGreaterThanOrEqual(2);
  });

  test("hides the var/accessor operator when no data is provided", () => {
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} />);
    expect(container.querySelector("[data-rjl-accessor]")).toBeNull();
  });

  test("renders an accessor when value is a var rule and data is provided", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ var: ["a.b"] }} data={{ a: { b: 1 } }} />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("renders the var string shorthand path in the accessor", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ var: "a.b" }} data={{ a: { b: 1 } }} />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
    const inputs = container.querySelectorAll("[data-rjl-accessor-input]");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    expect((inputs[0] as HTMLInputElement).value).toBe("a");
    expect((inputs[1] as HTMLInputElement).value).toBe("b");
  });

  test("accepts a JSON string for data", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ var: ["a"] }}
        data={JSON.stringify({ a: 1 })}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("renders an accessor when data is an array of records", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ var: ["a"] }}
        data={[{ a: 1, b: 2 }] as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("[data-rjl-accessor]")).not.toBeNull();
  });

  test("renders nested arithmetic rules", () => {
    render(<JsonLogicBuilder onChange={ignoreChange} value={{ "===": [{ "+": [1, 2] }, 3] }} />);
    expect(screen.queryAllByText("===")).not.toHaveLength(0);
    expect(screen.queryAllByText("+")).not.toHaveLength(0);
  });

  test("preserves boolean literals inside and", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ and: [true, false] }} />,
    );
    const bools = container.querySelectorAll("[data-rjl-input-boolean]");
    expect(bools.length).toBe(2);
    expect(container.querySelectorAll("input[data-rjl-input-value]").length).toBe(0);
  });

  test("preserves null literals inside operator arguments", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ and: [null, true] }} />,
    );
    const inputs = container.querySelectorAll("[data-rjl-input]");
    const nullType = inputs[0]?.querySelector("[data-rjl-input-type-trigger]");
    expect(nullType?.textContent).toBe("null");
  });

  test("preserves an array haystack on in", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ in: ["a", ["a", "b"]] }} />,
    );
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    expect(editor).not.toBeNull();
    expect(JSON.parse(editor.value)).toEqual(["a", "b"]);
  });

  test("renders canonical operator labels", () => {
    const cases: Array<{ rule: JsonLogicValue; label: string }> = [
      { rule: { "!=": [1, 2] }, label: "!=" },
      { rule: { "!==": [1, 2] }, label: "!==" },
      { rule: { "!": [true] }, label: "!" },
      { rule: { and: [true, false] }, label: "and" },
      { rule: { or: [true, false] }, label: "or" },
      { rule: { "<": [1, 2] }, label: "<" },
      { rule: { "<=": [1, 2] }, label: "<=" },
      { rule: { ">": [1, 2] }, label: ">" },
      { rule: { ">=": [1, 2] }, label: ">=" },
      { rule: { if: [true, 1, 0] }, label: "if" },
      { rule: { min: [1, 2] }, label: "min" },
      { rule: { max: [1, 2] }, label: "max" },
      { rule: { in: ["a", ["a", "b"]] }, label: "in" },
      { rule: { cat: ["a", "b"] }, label: "cat" },
      { rule: { merge: [[1], [2]] }, label: "merge" },
      { rule: { missing: ["x", "y"] }, label: "missing" },
    ];
    for (const { rule, label } of cases) {
      cleanup();
      render(<JsonLogicBuilder onChange={ignoreChange} value={rule} />);
      expect(
        screen.getAllByText(label).length,
        `expected to render label "${label}"`,
      ).toBeGreaterThan(0);
    }
  });

  test("falls back to the value field for an unrecognized operator key", () => {
    const { container } = render(
      <JsonLogicBuilder
        onChange={ignoreChange}
        value={{ unknownOp: [1, 2] } satisfies JsonLogicValue}
      />,
    );
    expect(container.querySelector("input[data-rjl-input-value]")).not.toBeNull();
  });

  test("renders extra fields when value array exceeds operator default fields", () => {
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} value={{ or: [true, false, true, false] }} />,
    );
    expect(container.querySelectorAll("[data-rjl-field]").length).toBeGreaterThanOrEqual(4);
  });
});

describe("<JsonLogicBuilder /> onChange interactions", () => {
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
    expect(removeButtons).toHaveLength(3);
    fireEvent.click(removeButtons[0]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual({ "+": [2, 3] });
  });

  test("typing into the value input emits the new string", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const input = container.querySelector("input[data-rjl-input-value]") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Value");
    fireEvent.change(input, { target: { value: "hello" } });
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
    const emitted = onChange.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(emitted.some).toEqual([{ var: "items" }, "x"]);
  });

  test("opening the operator dropdown and picking a different op emits the new shape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const trigger = container.querySelector("[data-rjl-operator-trigger]") as HTMLElement;
    await user.click(trigger);
    // Base UI portals listboxes into document.body.
    const popup = await screen.findByRole("listbox");
    const option = within(popup).getByRole("option", { name: "and" });
    await user.click(option);
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

  test("opening the input-type dropdown and picking 'boolean' emits false", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "boolean" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  test("picking false on a boolean value emits false", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={true} />);
    const boolTrigger = container.querySelector("[data-rjl-input-boolean]") as HTMLElement;
    expect(boolTrigger).not.toBeNull();
    await user.click(boolTrigger);
    const popup = await screen.findByRole("listbox");
    expect(popup.closest("[data-rjl-input-boolean-popup]")).not.toBeNull();
    expect(popup.closest("[data-rjl-input-type-popup]")).toBeNull();
    await user.click(within(popup).getByRole("option", { name: "false" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  test("editing an array literal textarea emits the parsed array", () => {
    const onChange = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={onChange} value={[] as JsonLogicValue} />,
    );
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    expect(editor).not.toBeNull();
    expect(editor.getAttribute("aria-label")).toBe("Array value");
    fireEvent.change(editor, { target: { value: "[1,2]" } });
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([1, 2]);
  });

  test("clearing the array editor emits an empty array", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "" } });
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([]);
  });

  test("invalid JSON in the array editor does not emit", () => {
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "[1," } });
    expect(onChange).not.toHaveBeenCalled();
    expect(editor.value).toBe("[1,");
  });

  test("opening the input-type dropdown and picking 'null' emits null", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "null" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toBeNull();
  });

  test("opening the input-type dropdown and picking 'array' emits []", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "array" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([]);
  });

  test("switching an array value to text stringifies it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={[1, 2]} />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "text" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("[1,2]");
  });

  test("switching a boolean value to text stringifies it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value={true} />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "text" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("true");
  });

  test("switching non-array text to array emits []", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="hello" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "array" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([]);
  });

  test("switching a JSON-array string to array parses it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="[1,2]" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "array" }));
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([1, 2]);
  });

  test("array editor resyncs when the controlled value changes", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    expect(JSON.parse(editor.value)).toEqual([1]);
    rerender(<JsonLogicBuilder onChange={onChange} value={[2, 3]} />);
    const next = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    expect(JSON.parse(next.value)).toEqual([2, 3]);
  });

  test("keeps a newer array draft when the parent acknowledges an earlier edit", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "[1,2]" } });
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([1, 2]);

    fireEvent.change(editor, { target: { value: "[1,2," } });
    rerender(<JsonLogicBuilder onChange={onChange} value={[1, 2]} />);

    expect(editor.value).toBe("[1,2,");
  });

  test("resyncs an external array value after an equivalent local edit", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "[ 1 ]" } });
    fireEvent.change(editor, { target: { value: "[2]" } });
    rerender(<JsonLogicBuilder onChange={onChange} value={[2]} />);

    fireEvent.change(editor, { target: { value: "[2," } });
    rerender(<JsonLogicBuilder onChange={onChange} value={[1]} />);

    expect(editor.value).toBe("[1]");
  });

  test("resyncs after a local edit returns to the controlled array value", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<JsonLogicBuilder onChange={onChange} value={[1]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "[2]" } });
    fireEvent.change(editor, { target: { value: "[1]" } });
    fireEvent.change(editor, { target: { value: "[1," } });

    rerender(<JsonLogicBuilder onChange={onChange} value={[2]} />);

    expect(editor.value).toBe("[2]");
  });

  test("resyncs when an external value matches a superseded local edit", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<JsonLogicBuilder onChange={onChange} value={[0]} />);
    const editor = container.querySelector("[data-rjl-input-array]") as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: "[1]" } });
    fireEvent.change(editor, { target: { value: "[2]" } });
    fireEvent.change(editor, { target: { value: "[2," } });

    rerender(<JsonLogicBuilder onChange={onChange} value={[1]} />);

    expect(editor.value).toBe("[1]");
  });

  test("switching to number with non-numeric value emits 0 (NaN guard)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<JsonLogicBuilder onChange={onChange} value="hello" />);
    const typeTrigger = container.querySelector("[data-rjl-input-type-trigger]") as HTMLElement;
    await user.click(typeTrigger);
    const popup = await screen.findByRole("listbox");
    await user.click(within(popup).getByRole("option", { name: "number" }));
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
    const { container } = render(
      <StatefulHost initial={{ var: [""] }} data={{ alpha: 1, beta: 2 }} onChange={onChange} />,
    );
    const accessorInput = container.querySelector("[data-rjl-accessor-input]") as HTMLInputElement;
    expect(accessorInput).not.toBeNull();
    await user.click(accessorInput);
    await user.keyboard("alp");
    const last = onChange.mock.calls.at(-1)?.[0] as Record<string, JsonLogicValue>;
    expect(last.var).toEqual(["alp"]);
  });

  test("editing a var string shorthand normalizes to the array form", () => {
    const onChange = vi.fn();
    const { container } = render(
      <StatefulHost initial={{ var: "alpha" }} data={{ alpha: 1, beta: 2 }} onChange={onChange} />,
    );
    const accessorInput = container.querySelector("[data-rjl-accessor-input]") as HTMLInputElement;
    expect(accessorInput).not.toBeNull();
    expect(accessorInput.value).toBe("alpha");
    fireEvent.change(accessorInput, { target: { value: "beta" } });
    const last = onChange.mock.calls.at(-1)?.[0] as Record<string, JsonLogicValue>;
    expect(last.var).toEqual(["beta"]);
  });
});

describe("<JsonLogicBuilder /> error reporting", () => {
  test("calls onDataError with the parse error when data is malformed JSON", () => {
    const onDataError = vi.fn();
    render(
      <JsonLogicBuilder onChange={ignoreChange} data={"{not json"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("{not json");
  });

  test("warns to console when data is malformed and no onDataError is given", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<JsonLogicBuilder onChange={ignoreChange} data={"{nope"} />);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test("re-fires onDataError after a recovery (invalid → valid → invalid)", () => {
    const onDataError = vi.fn();
    const { rerender } = render(
      <JsonLogicBuilder onChange={ignoreChange} data={"{bad"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe("{bad");

    rerender(
      <JsonLogicBuilder
        onChange={ignoreChange}
        data={JSON.stringify({ a: 1 })}
        onDataError={onDataError}
      />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);

    rerender(<JsonLogicBuilder onChange={ignoreChange} data={"{bad"} onDataError={onDataError} />);
    expect(onDataError).toHaveBeenCalledTimes(2);
    expect(onDataError.mock.calls[1]?.[1]).toBe("{bad");
  });

  test.each(["null", "42", "true"])("reports primitive JSON %s", (raw) => {
    const onDataError = vi.fn();
    const { container } = render(
      <JsonLogicBuilder onChange={ignoreChange} data={raw} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    expect(onDataError.mock.calls[0]?.[1]).toBe(raw);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
  });

  test("warns to console when data JSON is a primitive and no onDataError is given", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<JsonLogicBuilder onChange={ignoreChange} data="null" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-rjl-builder]")).not.toBeNull();
    warn.mockRestore();
  });

  test("does not fire onDataError twice for the same persistent malformed data", () => {
    const onDataError = vi.fn();
    const { rerender } = render(
      <JsonLogicBuilder onChange={ignoreChange} data={"{bad"} onDataError={onDataError} />,
    );
    expect(onDataError).toHaveBeenCalledTimes(1);
    rerender(<JsonLogicBuilder onChange={ignoreChange} data={"{bad"} onDataError={onDataError} />);
    expect(onDataError).toHaveBeenCalledTimes(1);
  });
});
