/** Safe formula evaluator for user-defined Life OS metrics. */
const ALLOWED = /^[\d\s+\-*/().a-zA-Z_%]+$/;

const VARS: Record<string, number> = {};

export function setFormulaContext(ctx: Record<string, number>) {
  Object.assign(VARS, ctx);
}

export function evaluateFormula(expression: string, ctx: Record<string, number> = {}): number {
  if (!ALLOWED.test(expression)) return 0;
  const merged = { ...VARS, ...ctx };
  let expr = expression;
  for (const [key, val] of Object.entries(merged)) {
    expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    return typeof result === 'number' && Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export function parseFormulaVariables(expression: string): string[] {
  const tokens = expression.match(/[a-zA-Z_][a-zA-Z0-9_-]*/g) ?? [];
  return [...new Set(tokens.filter((t) => !['min', 'max'].includes(t)))];
}
