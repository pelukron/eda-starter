# eda-starter 🚀

Event-Driven Architecture starter kit demonstrating fundamental patterns:
**Pub/Sub Event Bus**, **Event Sourcing**, **Saga Orchestration**, **Outbox Pattern**.

[![CI](https://github.com/pelukron/eda-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/pelukron/eda-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)

## 🎯 Purpose

Learn EDA patterns by running a working demo. No external dependencies (Kafka, RabbitMQ, AWS) — pure Python, in-memory.

## 🏗 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Publisher  │────▶│  Event Bus   │────▶│  Subscribers    │
│  (Producer) │     │  (In-Memory) │     │  (Consumers)    │
└─────────────┘     └──────┬───────┘     └────────┬────────┘
                           │                      │
                    ┌──────▼──────┐      ┌────────▼────────┐
                    │ Event Store │      │  Notification   │
                    │ (Append-Log)│      │  (Wildcard *)   │
                    └─────────────┘      └───────────────┘
```

## 🚀 Quickstart

```bash
git clone https://github.com/pelukron/eda-starter
cd eda-starter
uv sync --all-extras
make demo
```

## 📚 Documentation

- [Architecture Overview](https://pelukron.github.io/eda-starter/architecture/overview/)
- [Patterns Guide](https://pelukron.github.io/eda-starter/architecture/patterns/)
- [API Reference](https://pelukron.github.io/eda-starter/reference/event-bus/)

## 🧪 Patterns Demonstrated

| Pattern | Component | Description |
|---------|-----------|-------------|
| **Pub/Sub** | `InMemoryEventBus` | Async event routing with wildcard support |
| **Event Sourcing** | `InMemoryEventStore` | Append-only log, stream reads, live subscriptions |
| **Saga** | `OrderSaga` | Orchestration with compensation |
| **Outbox** | `TransactionalOutbox` | Reliable publishing via dual-write |

## 🧱 Project Structure

```
eda_starter/
├── domain/
│   ├── events/          # Event definitions (Event, OrderCreated, ...)
│   └── ports/           # Interfaces (EventHandler)
├── application/
│   ├── handlers/        # Concrete handlers (Payment, Inventory, ...)
│   ├── sagas/           # Orchestrators (OrderSaga)
│   └── bootstrap.py     # Composition root
├── infrastructure/
│   ├── event_bus/       # InMemoryEventBus
│   ├── event_store/     # InMemoryEventStore
│   └── outbox/          # TransactionalOutbox
└── demo.py              # Runnable demo
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — uses conventional commits, pre-commit, TDD.

## 📄 License

MIT — see [LICENSE](LICENSE).