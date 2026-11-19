# Copilot Automation examples

These are configuration examples for GitHub Copilot repository automations. They are not GitHub Actions workflows and are not enabled by committing this file. Create or edit automations in the repository's Copilot Automations settings, using the available triggers and tools for that repository.

The request-shaped snippets below show the relevant fields. Replace or add any repository-specific fields required by the setup flow. Tool IDs and trigger names are shown as configured by Copilot Automations.

## 1. Triage new issues

Run when an issue opens. The automation should follow the classifier in `src/triage.js`, read the current repository labels, and apply only labels that already exist. Suggested labels are `type:bug`, `type:feature`, `type:docs`, `type:question`, `type:other`, `priority:high`, and `priority:normal`.

```json
{
  "name": "Triage new issues",
  "triggers": {
    "issues": {
      "types": ["opened"],
      "write_scope": "trigger"
    }
  },
  "tools": [
    "github/issue_read",
    "github/list_label",
    "github/update_issue_labels",
    "github/add_issue_comment"
  ],
  "require_actor_write_permission": true,
  "write_scope": "trigger",
  "prompt": "Read the issue and the classifier in src/triage.js. Apply the matching type and priority labels only if those labels exist in the repository. If details needed to reproduce or evaluate the report are missing, ask one concise follow-up question in a comment. Do not close or assign the issue."
}
```

## 2. Review pull requests

Run on new pull requests and new commits to an open pull request. Limit the trigger to source and test files, and keep writes scoped to the triggering pull request.

```json
{
  "name": "Review demo changes",
  "triggers": {
    "pull_request_opened": {
      "types": ["opened"],
      "paths": ["src/**", "test/**"],
      "write_scope": "trigger"
    },
    "pull_request_synchronize": {
      "types": ["synchronize"],
      "paths": ["src/**", "test/**"],
      "write_scope": "trigger"
    }
  },
  "tools": [
    "github/pull_request_read",
    "github/search_code",
    "github/get_file_contents",
    "github/create_pull_request_review"
  ],
  "require_actor_write_permission": true,
  "write_scope": "trigger",
  "prompt": "Review the pull request diff for correctness and regressions. Read relevant code and tests before drawing conclusions. Submit a review only for actionable findings; otherwise leave the PR without a review comment. Do not approve or merge the pull request."
}
```

## 3. Weekly issue queue summary

Use an interval trigger for a scheduled, read-only summary. Schedule times use UTC; `day_of_week` uses 0 for Sunday through 6 for Saturday.

```json
{
  "name": "Weekly issue queue summary",
  "triggers": {
    "interval": {
      "types": ["weekly"],
      "day_of_week": 1,
      "hour_utc": 15,
      "minute_utc": 0
    }
  },
  "tools": [
    "github/list_issues",
    "github/search_issues"
  ],
  "prompt": "Summarize open issues by type and priority labels. Call out issues that have no type label or appear to be missing reproduction details. Do not change issues, labels, or assignments."
}
```

## 4. Explain a failed check

The Actions workflow in `.github/workflows/test.yml` calls `.github/workflows/reusable-node-checks.yml`, which owns the test job. The `workflow_run` trigger connects the caller workflow to a read-only failure investigation.

```json
{
  "name": "Explain failed Node.js checks",
  "triggers": {
    "workflow_run": {
      "types": ["completed"],
      "workflows": ["Node.js checks"],
      "conclusions": ["failure"]
    }
  },
  "tools": [
    "github/actions_list",
    "github/actions_get",
    "github/get_job_logs"
  ],
  "prompt": "Inspect the failed Node.js checks run and its job logs. Summarize the likely cause and suggest the smallest fix. Do not modify the repository or post comments."
}
```

## Before enabling an example

- Create the label names used by issue triage, or change the prompt to match labels already in the repository.
- Review every tool in the automation's allowlist and grant only the write access its task needs.
- Prefer trigger-scoped writes for issue and pull request events. Use repository-wide write access only when the automation genuinely needs to update other resources.
- Keep scheduled summaries read-only. Add filters, limits, and instructions that prevent repeated comments or automation loops.
- GitHub Copilot Automations are separate from `.github/workflows/`; the workflow here runs tests, while a Copilot Automation can react to its failed run.
