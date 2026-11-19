# GitHub Copilot Automation Demo

A small, dependency-free Node.js project for trying out GitHub Copilot repository automations. The demo classifies issue text into suggested type and priority labels, with unit tests and a GitHub Actions check.

## Try the issue triage helper

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm test
npm run triage -- "Bug: app crashes on startup" "The crash causes data loss."
```

The command prints:

```json
{
  "type": "bug",
  "priority": "high",
  "labels": ["type:bug", "priority:high"]
}
```

The classifier is deliberately small and transparent. Its rules live in [`src/triage.js`](src/triage.js), so an automation can use the same criteria when labeling new issues.

## Try the automation scenarios

1. Open a bug report or feature request using the templates in GitHub Issues.
2. Configure the **New issue triage** automation from [`docs/copilot-automations.md`](docs/copilot-automations.md). It reads the issue, applies matching labels, and asks for missing details.
3. Open a pull request. The **Review demo changes** example shows a path-filtered trigger and a restricted review scope.
4. Open Actions and inspect the **Node.js checks** workflow. The guide also includes a scheduled, read-only issue summary example.

The examples are guidance, not importable automation files. Copilot Automations are configured in GitHub repository settings; this setup does not create or enable any live automations.

## Project layout

- `src/triage.js`: issue classification rules
- `src/cli.js`: command-line interface
- `test/triage.test.js`: unit tests
- `.github/workflows/test.yml`: runs checks on pushes and pull requests
- `.github/workflows/reusable-node-checks.yml`: reusable workflow that runs the test suite
- `.github/ISSUE_TEMPLATE/`: sample bug and feature request forms
- `docs/copilot-automations.md`: example triggers, tool sets, write scopes, and prompts
