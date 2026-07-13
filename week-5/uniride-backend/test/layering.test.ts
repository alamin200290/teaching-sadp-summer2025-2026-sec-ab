import { test } from "node:test"; import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs"; import { join } from "node:path";
const inwardLayers = ["src/rides","src/drivers","src/matching","src/payments","src/notifications","src/app","src/providers","src/patterns","src/geocoding","src/pricing","src/shared"];
function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) { const f = join(dir, e);
    if (statSync(f).isDirectory()) out.push(...tsFiles(f)); else if (f.endsWith(".ts")) out.push(f); }
  return out;
}
test("golden rule: inner layers never import presentation (http) or express", () => {
  for (const layer of inwardLayers) for (const file of tsFiles(layer)) {
    const code = readFileSync(file, "utf8");
    assert.doesNotMatch(code, /from\s+["'][^"']*\/http\//, `${file} must not import http`);
    assert.doesNotMatch(code, /from\s+["']express["']/, `${file} must not import express`);
  }
});
