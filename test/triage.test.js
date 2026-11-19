import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { triageIssue } from "../src/triage.js";

test("classifies a bug and detects high priority from the body", () => {
  assert.deepEqual(
    triageIssue({
      title: "Bug: app fails to start",
      body: "This causes data loss.",
    }),
    {
      type: "bug",
      priority: "high",
      labels: ["type:bug", "priority:high"],
    },
  );
});

test("classifies documentation requests case-insensitively", () => {
  assert.deepEqual(triageIssue({ title: "Fix README typo" }), {
    type: "docs",
    priority: "normal",
    labels: ["type:docs", "priority:normal"],
  });
});

test("uses other and normal when no rule matches", () => {
  assert.deepEqual(triageIssue({ title: "Improve the example output" }), {
    type: "other",
    priority: "normal",
    labels: ["type:other", "priority:normal"],
  });
});

test("rejects a missing or blank title", () => {
  assert.throws(() => triageIssue(), {
    name: "TypeError",
    message: "Issue title must be a non-empty string.",
  });
  assert.throws(() => triageIssue({ title: "  " }), TypeError);
});

test("rejects a non-string body", () => {
  assert.throws(() => triageIssue({ title: "Bug", body: null }), {
    name: "TypeError",
    message: "Issue body must be a string.",
  });
});

test("CLI prints JSON and returns a usage error without a title", () => {
  const valid = spawnSync(
    process.execPath,
    ["src/cli.js", "Feature: add export", "Support JSON"],
    { encoding: "utf8" },
  );
  assert.equal(valid.status, 0);
  assert.deepEqual(JSON.parse(valid.stdout), {
    type: "feature",
    priority: "normal",
    labels: ["type:feature", "priority:normal"],
  });

  const invalid = spawnSync(process.execPath, ["src/cli.js"], {
    encoding: "utf8",
  });
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /Usage:/);
});
