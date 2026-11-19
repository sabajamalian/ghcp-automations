import { triageIssue } from "./triage.js";

const [title, ...bodyParts] = process.argv.slice(2);

if (!title) {
  console.error('Usage: npm run triage -- "<issue title>" ["issue body"]');
  process.exitCode = 2;
} else {
  const result = triageIssue({ title, body: bodyParts.join(" ") });
  console.log(JSON.stringify(result, null, 2));
}
