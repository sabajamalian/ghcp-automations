# Copilot Automation examples

Copilot Automations are configured in GitHub repository settings, not by committing this file. The **AI CI failure investigator** is configured live for this repository and comments on PRs with failing CI; the other examples below are starting points and are not enabled.

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

When **Node.js checks** fails on a pull request, the investigator reads the job logs, source, and tests, then comments on that PR with the root cause and smallest fix. See PR #1 for a live example: it removes `data loss` from the high-priority keywords, a test fails, and Copilot explains why.

`workflow_run` triggers only have a place to post when the run belongs to a pull request, so demo it from a PR. The manual **Intentional failure demo** workflow also matches the trigger, but a run on `main` has no PR to comment on.

```json
{
  "name": "AI CI failure investigator",
  "triggers": {
    "workflow_run": {
      "types": ["completed"],
      "workflows": ["Node.js checks", "Intentional failure demo"],
      "conclusions": ["failure"],
      "write_scope": "trigger"
    }
  },
  "tools": [
    "github/actions_list",
    "github/actions_get",
    "github/get_job_logs",
    "github/search_code",
    "github/get_file_contents",
    "github/pull_request_read",
    "github/add_issue_comment"
  ],
  "prompt": "A CI workflow failed on a pull request. Read the failed run and its job logs, then read the relevant source and test files. Post one concise comment on the triggering pull request with the failing step and test, the likely root cause with file and line, and the smallest fix. Do not push code, approve, or merge."
}
```

`write_scope: trigger` limits the comment to the PR that triggered the run.

## Before enabling an example

- Create the label names used by issue triage, or change the prompt to match labels already in the repository.
- Review every tool in the automation's allowlist and grant only the write access its task needs.
- Prefer trigger-scoped writes for issue and pull request events. Use repository-wide write access only when the automation genuinely needs to update other resources.
- Keep scheduled summaries read-only. Add filters, limits, and instructions that prevent repeated comments or automation loops.
- GitHub Copilot Automations are separate from `.github/workflows/`; the workflow here runs tests, while a Copilot Automation can react to its failed run.
