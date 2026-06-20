import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// The dependency-direction rule from the lecture, enforced automatically: the domain and
// application layers must NEVER import the presentation layer (http/) or a web framework
// (express). Dependencies point downward only.
const inwardLayers = [
  "src/rides", "src/drivers", "src/matching",
  "src/payments", "src/notifications", "src/app", "src/shared",
];

function tsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...tsFiles(full));
    else if (full.endsWith(".ts")) out.push(full);
  }
  return out;
}

test("golden rule: inner layers never import the presentation layer or express", () => {
  for (const layer of inwardLayers) {
    for (const file of tsFiles(layer)) {
      const code = readFileSync(file, "utf8");
      assert.doesNotMatch(code, /from\s+["'][^"']*\/http\//, `${file} must not import the http (presentation) layer`);
      assert.doesNotMatch(code, /from\s+["']express["']/, `${file} must not import express`);
    }
  }
});
