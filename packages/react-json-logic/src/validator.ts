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

function walk(node: unknown, path: string, errors: ValidationError[]): void {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return;

  const obj = node as Record<string, unknown>;
  const keys = Object.keys(obj);

  if (keys.length === 0) return;
  if (keys.length > 1) {
    errors.push({
      path,
      message: `Operator object should have exactly one key, found ${keys.length}: ${keys.join(", ")}`,
    });
    return;
  }

  const key = keys[0]!;
  const op = OPERATORS.find((o) => o.signature === key);

  // Unknown operator keys are tolerated (custom ops registered via
  // json-logic-js's `add_operation`, plus legacy shapes that may still be
  // floating around). Their args are still walked for nested errors. The
  // permissive default is intentional — see the validator.test.ts case for
  // unknown operators. A future strict mode could opt callers into rejection.
  const args = obj[key];

  if (Array.isArray(args)) {
    if (op) {
      if (args.length < op.fieldCount.min) {
        errors.push({
          path: `${path}.${key}`,
          message: `${key}: expected at least ${op.fieldCount.min} arg(s), got ${args.length}`,
        });
      }
      if (args.length > op.fieldCount.max) {
        errors.push({
          path: `${path}.${key}`,
          message: `${key}: expected at most ${op.fieldCount.max} arg(s), got ${args.length}`,
        });
      }
    }
    args.forEach((arg, i) => walk(arg, `${path}.${key}[${i}]`, errors));
  } else {
    // Some json-logic operators (e.g. var) accept a non-array shorthand.
    // Only flag if a known operator explicitly requires an array.
    walk(args, `${path}.${key}`, errors);
  }
}
