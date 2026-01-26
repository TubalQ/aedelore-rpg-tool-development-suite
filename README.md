# Aedelore RPG Tool - Development Suite

Development and testing environment for [Aedelore RPG Tool](https://aedelore.nu).

> **Status:** All features below are **live in production** at [aedelore.nu](https://aedelore.nu).

## What Has Been Implemented

### Security
- **CSRF Protection** - Double Submit Cookie pattern
- **httpOnly Cookies** - Secure authentication token storage
- **Redis Rate Limiting** - Persistent rate limiting and account lockout

### Testing & Quality
- **Jest Testing** - 52 API tests covering auth, characters, and helpers
- **ESLint + Prettier** - Code linting and formatting
- **Structured Logging** - Pino logger with JSON output

### Build & Performance
- **JavaScript Build Process** - esbuild minification (74% reduction)
- **Modular Architecture** - API split into route modules, main.js into 8 modules

### Operations
- **Database Backups** - Automated pg_dump scripts with 30-day retention

## Quick Start

```bash
# Start all services
docker compose up -d

# Run tests
docker exec aedelore-dev-api npm test

# View logs
docker compose logs -f aedelore-dev-api
```

## Documentation

For complete technical documentation (architecture, API endpoints, database schema, project structure, development guides), see:

- **[DEVELOPER.md](https://github.com/TubalQ/aedelore-rpg-tools/blob/main/docs/DEVELOPER.md)** - Full technical documentation
- **[Main Repository](https://github.com/TubalQ/aedelore-rpg-tools)** - Production code and README
- **[aedelore.nu](https://aedelore.nu)** - Live site
