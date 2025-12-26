# Contributing to Story Portal

Thanks for your interest in contributing to Story Portal!

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/story-portal.git
cd story-portal

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Requirements

- **Node.js** 24.x (check `.nvmrc`)
- **pnpm** 10.x

## Development

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run tests
```

## Project Structure

```
src/
├── components/     # React components
├── legacy/         # Legacy steampunk wheel UI
│   ├── components/ # UI components (R3F, animations)
│   ├── effects/    # WebGL effects (electricity)
│   ├── hooks/      # Custom hooks
│   └── views/      # View components
├── styles/         # Global styles
└── App.tsx         # Main app entry

animations/         # Visual iteration pipeline
docs/              # Documentation
```

## Code Style

- **TypeScript** strict mode enabled
- **ESLint** enforced (run `pnpm lint`)
- **Functional components** only (no class components)
- **Conventional commits** preferred

## Commit Messages

Format: `type: description`

Types:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm build`
4. Submit PR with clear description
5. Wait for review

## Questions?

Open an issue or reach out to the maintainers.
