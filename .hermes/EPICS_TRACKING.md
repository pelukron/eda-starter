# EPICS_TRACKING — eda-starter

Cross-session continuity para agente Hermes.

## Active Epics
- #5 [Epic] Phase 0-2: Repo Setup + Core Domain + Application Layer (Pub/Sub Demo) — **IN PROGRESS** (milestone v0.1.0)
  - Sub-issues: #6 #7 #8 #9 #10 #11 #12 (todos open, linkeados como sub_issues)
  - Plan: .hermes/plans/2026-07-22_160000-eda-starter-ts-implementation.md (ADR-001 in-memory EventBus)
- #13 [Epic] Phase 3: Event Sourcing + Saga + Outbox Patterns — **PENDING** (milestone v0.2.0)
  - Sub-issues: #14 #15 #16 #17 (todos open, linkeados como sub_issues)

## Milestones
- v0.1.0 — MVP (Phase 0-2): due 2026-08-15 — OPEN (7/7 issues open)
- v0.2.0 — Patterns (Phase 3): due 2026-09-15 — OPEN (5/5 issues open)

## Notas
- Sub-issues nativos GitHub (GraphQL addSubIssue). No usar gh issue create --parent (no existe).
- Labels con emoji NO pasar en `gh issue create` (rompe shell) — añadir después con `gh issue edit --add-label`.
- Branch protection server-side NO disponible (repo público + plan free en API). Protección real = `.githooks/pre-push` (ACTIVO: core.hooksPath=.githooks) + PR obligatorio.
- GitHub Pro: usuario reporta tenerlo, pero API /users/pelukron dice plan:None y branch protection 403. Verificar en github.com/settings/billing.

## Pendiente
- Ejecutar sub-issues #6-#12 (v0.1.0) — Phase 0-2 implementation
- Ejecutar sub-issues #14-#17 (v0.2.0) — Phase 3 patterns
- Setup PROJECT_PAT secret para auto-add to project board (workflow .github/workflows/project-automation.yml)
- Memory Bank: crear .clinerules/memory-bank.md + memory-bank/ structure (skill memory-bank)