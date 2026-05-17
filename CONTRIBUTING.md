# Contributing

Thanks for thinking about contributing to CarIn. This document covers
the conventions we use so your PR can move through review quickly.

## Before you start

- Read `ARCHITECTURE.md` so you know which contract tree owns the
  behaviour you're touching. New feature work targets the Clarity
  tree under `smartcontracts/`; the Solidity tree under
  `smartcontracts-evm/` is a reference implementation.
- For non-trivial changes, open an issue first to align on scope. A
  one-line "I'd like to fix X, here's the plan" is enough.

## Branches

Use a topic prefix and a short kebab-case slug:

| Prefix | Use for |
| --- | --- |
| `feat/` | New user-facing or contract-level functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | Tooling, dependencies, repo housekeeping |
| `test/` | Test-only changes |
| `refactor/` | Internal restructuring without behavioural change |

Examples: `feat/dispute-evidence-upload`, `fix/escrow-refund-rounding`,
`docs/repo-hygiene`.

## Commits

We follow Conventional Commits. A commit looks like:

```
type(scope): short imperative summary

Optional body explaining the *why*, wrapped at ~72 columns. Reference
issues or prior commits if useful. No need to restate the diff — the
diff is right there.
```

`type` is one of `feat`, `fix`, `docs`, `chore`, `test`, `refactor`,
`perf`, `build`, `ci`. `scope` is optional but appreciated
(`security`, `readme`, `frontend`, `evm`, `clarity`, `escrow`, …).

Keep each commit focused on one logical change. Reviewers should be
able to read commits one at a time and understand each on its own.

## Pull requests

- Target `main`.
- Title: same format as a commit subject. Under 70 characters.
- Description: what changed and why. If the PR is split into
  meaningful commits, say so — reviewers will read commit-by-commit.
- Link any related issue.
- For contract changes, mention whether storage layout, ABI, or
  Clarity trait surface changed. This matters for downstream
  callers.

## Testing

- Frontend: `cd frontend && npm test`
- Clarity: `cd smartcontracts && npm test` (Clarinet runner)
- EVM: `cd smartcontracts-evm && npm test` (Hardhat)

CI will run these on every PR once the workflows under
`.github/workflows/` land.

## Security

Do not file vulnerability reports as public issues or PRs. See
`SECURITY.md` for the private reporting channel.
