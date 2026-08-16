import { OPERATORS } from "./operators.ts";

export interface ValidationError {
  /** JSON-pointer-ish path to the offending node, e.g. `$.and[0].===` */
  path: string;
  message: string;
}

export type ValidationResult = { ok: true } | { ok: false; errors: ValidationError[] };

/**
 * Walks a JsonLogic rule and reports structural problems against the operator
 * table — single-key operator objects, array-shaped argument lists, and arity
 * within `min`..`max`.
 *
 * Unknown operator keys (not in `OPERATORS`) are accepted — json-logic-js
 * supports custom operators via `add_operation`. Use this validator as a
 * sanity check, not a sealed schema.
 */
export function validate(rule: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  walk(rule, "$", errors);
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function pushArityErrors(
  op: (typeof OPERATORS)[number],
  key: string,
  path: string,
  argCount: number,
  errors: ValidationError[],
): void {
  if (argCount < op.fieldCount.min) {
    errors.push({
      path: `${path}.${key}`,
      message: `${key}: expected at least ${op.fieldCount.min} arg(s), got ${argCount}`,
    });
  }
  if (argCount > op.fieldCount.max) {
    errors.push({
      path: `${path}.${key}`,
      message: `${key}: expected at most ${op.fieldCount.max} arg(s), got ${argCount}`,
    });
  }
}

function walk(
  node: unknown,
  path: string,
  errors: ValidationError[],
  isArrayElement = false,
): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, errors, true));
    return;
  }

  const obj = node as Record<string, unknown>;
  const keys = Object.keys(obj);

  if (keys.length === 0) return;
  if (keys.length > 1) {
    // json-logic-js preserves multi-key objects inside arrays as literal
    // records rather than interpreting them as operator objects.
    if (isArrayElement) return;
    errors.push({
      path,
      message: `Operator object should have exactly one key, found ${keys.length}: ${keys.join(", ")}`,
    });
    return;
  }

  const [key] = keys;
  // keys.length is exactly 1 by the guards above, so `key` is defined.
  if (key === undefined) return;
  const op = OPERATORS.find((o) => o.signature === key);

  // Unknown operator keys are tolerated (custom ops registered via
  // json-logic-js's `add_operation`, plus legacy shapes that may still be
  // floating around). Their args are still walked for nested errors. The
  // permissive default is intentional — see the validator.test.ts case for
  // unknown operators. A future strict mode could opt callers into rejection.
  const args = obj[key];

  if (Array.isArray(args)) {
    if (op) pushArityErrors(op, key, path, args.length, errors);
    args.forEach((arg, i) => walk(arg, `${path}.${key}[${i}]`, errors, true));
    return;
  }

  // json-logic-js treats a non-array payload as a single argument.
  // `var` is the documented string-path shorthand and is not arity-flagged.
  if (op && key !== "var") {
    pushArityErrors(op, key, path, 1, errors);
  }
  walk(args, `${path}.${key}`, errors);
}
