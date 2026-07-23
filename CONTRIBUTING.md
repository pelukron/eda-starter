# Contributing to eda-starter

Thank you for contributing! This project follows conventional commits, TDD, and clean architecture principles.

## Quick Start

```bash
git clone https://github.com/pelukron/eda-starter
cd eda-starter
uv sync --all-extras
pre-commit install
make test
```

## Development Workflow

1. **Create issue** — Use bug report or feature request template
2. **Branch** — `git checkout -b feat/short-description` (or `fix/`, `docs/`, `refactor/`)
3. **Develop** — Write failing test first (TDD), then minimal implementation
4. **Validate** — Run `make lint && make typecheck && make test`
5. **Commit** — Conventional commits: `feat: add EventStore persistence`
6. **Push & PR** — Open PR, CI must pass
7. **Review** — Maintainer reviews, merges (no force-push, no amend after push)

## Code Standards

- **Python 3.11+** — type hints mandatory (`mypy --strict`)
- **Format** — `ruff format` (double quotes, 100 cols)
- **Lint** — `ruff check` (auto-fix with `ruff check --fix`)
- **Tests** — `pytest` with coverage (`--cov=eda_starter`)
- **Architecture** — Clean Architecture layers: `domain/` → `application/` → `infrastructure/`
- **No external deps in core** — `domain/` and `application/` zero deps (YAGNI)

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`

Example:
```
feat(event-bus): add wildcard subscription support

Allows subscribing to all events with "*" pattern.
Useful for logging/monitoring.

Closes #12
```

## Pull Request Requirements

- [ ] CI passes (lint, typecheck, tests)
- [ ] Coverage ≥ 90% on new code
- [ ] CHANGELOG.md entry for user-facing changes
- [ ] Docs updated if API changes
- [ ] No merge conflicts

## Architecture Decisions

See [docs/adr/](docs/adr/) for ADRs. New ADR for significant decisions.

## License

By contributing, you agree your contributions are licensed under MIT.