const typeRules = [
  ["bug", /\b(?:bug|broken|breaks?|error|crash(?:es|ed)?|fails?)\b/i],
  ["feature", /\b(?:feature|enhancement|support|add)\b/i],
  ["docs", /\b(?:docs?|documentation|readme|typo)\b/i],
  ["question", /\b(?:how|question|help|why)\b/i],
];

const highPriorityPattern =
  /\b(?:critical|security|data loss|production outage|crash(?:es|ed)?)\b/i;

export function triageIssue({ title, body = "" } = {}) {
  if (typeof title !== "string" || title.trim() === "") {
    throw new TypeError("Issue title must be a non-empty string.");
  }
  if (typeof body !== "string") {
    throw new TypeError("Issue body must be a string.");
  }

  const text = `${title}\n${body}`;
  const type = typeRules.find(([, pattern]) => pattern.test(text))?.[0] ?? "other";
  const priority = highPriorityPattern.test(text) ? "high" : "normal";

  return {
    type,
    priority,
    labels: [`type:${type}`, `priority:${priority}`],
  };
}
