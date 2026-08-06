---
name: commit-msg
description: Use whenever writing a git commit message or
  committing changes. Enforces Conventional Commits format.
---

# Commit message format

Always use: `type(scope): short description`

Allowed types:
- feat     - a new feature
- fix      - a bug fix
- refactor - code change that is neither a feature nor a fix
- docs     - documentation only
- style    - formatting, no code change
- test     - adding or fixing tests
- chore    - build process, dependencies, tooling

## Rules
- Description is lowercase, no full stop at the end.
- Keep the first line under 60 characters.
- If the change touches more than one area, write a body:
  a blank line, then bullet points starting with "-".
- Never write "update code" or "fix stuff". Say what changed.

## Examples
feat(auth): add password reset flow
fix(cart): prevent duplicate items on fast clicks
chore(deps): bump next to 16.2.1