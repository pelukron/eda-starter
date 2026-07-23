# Spec: Repository Governance Setup

## Requirement: Public GitHub repo with governance files

### Scenario: Initialize repository with standard governance
- **GIVEN** a new GitHub repository `pelukron/eda-starter`
- **WHEN** creating the repository with governance files
- **THEN** the repo has:
  - CI workflow (GitHub Actions): lint, typecheck, test, docs deploy
  - Dependabot config (weekly for github-actions, pnpm)
  - Issue templates: bug_report, feature_request, epic
  - PR template with conventional commit checklist
  - CONTRIBUTING.md with workflow, commit conventions, PR requirements
  - LICENSE (MIT)
  - .gitignore for Node + pnpm + Biome
  - README.md placeholder with architecture diagram

### Scenario: CI workflow validates code quality
- **GIVEN** a push to main or PR
- **WHEN** GitHub Actions runs
- **THEN** it executes: biome check, tsc --noEmit, vitest run --coverage
- **AND** docs deploy to GitHub Pages on main branch

---

## Requirement: Branch protection (via pre-push hook)

### Scenario: Prevent direct pushes to main
- **GIVEN** a developer tries to push to main
- **WHEN** pre-push hook runs
- **THEN** push is blocked with message "Use PR workflow"
- **AND** hook is managed via `.githooks/pre-push` + `core.hooksPath=.githooks`

---

## Non-goals
- Branch protection via GitHub API (plan free limitation)
- Automated releases (manual tags for v0.x)
- CodeQL (requires GitHub Advanced Security)

---

## Related GitHub Issues
- #6 chore: init repo with governance (CI, dependabot, templates, contributing, license)