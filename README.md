# Aedelore RPG Tool - Development Suite

This is the testing and development environment for [Aedelore RPG Tool](https://aedelore.nu), a fantasy RPG character sheet PWA with DM tools.

> **Note:** All features listed below are currently live in production at [aedelore.nu](https://aedelore.nu). This repository documents what has been implemented and serves as the development/testing ground for new features.

## Features Implemented

### Security
- **CSRF Protection** - Double Submit Cookie pattern with query param fallback for sendBeacon
- **httpOnly Cookies** - Secure authentication token storage
- **Redis Rate Limiting** - Persistent rate limiting and account lockout storage

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
# Start all services (API, DB, Redis, nginx)
docker compose up -d

# Run tests
docker exec aedelore-dev-api npm test

# Lint code
docker exec aedelore-dev-api npm run lint

# Build minified JS
docker compose --profile build run --rm aedelore-dev-build

# Database backup
./scripts/backup.sh

# View API logs (structured JSON)
docker compose logs -f aedelore-dev-api
```

## Project Structure

```
/opt/aedelore-development/
├── api/                      # Backend API
│   ├── server.js             # Express server
│   ├── logger.js             # Pino structured logging
│   ├── routes/               # Route modules
│   │   ├── auth.js           # Authentication
│   │   ├── characters.js     # Character CRUD
│   │   ├── campaigns.js      # Campaign management
│   │   ├── sessions.js       # DM sessions
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # Auth & Redis rate limiting
│   │   └── csrf.js           # CSRF protection
│   ├── __tests__/            # Jest tests (52)
│   ├── .eslintrc.json        # ESLint config
│   └── .prettierrc           # Prettier config
│
├── html/                     # Frontend
│   ├── js/                   # JavaScript
│   │   ├── main.js           # Entry point
│   │   └── modules/          # Modular components
│   ├── css/                  # Stylesheets
│   ├── data/                 # Game data
│   └── build.js              # esbuild script
│
├── scripts/                  # Utility scripts
│   ├── backup.sh             # Database backup
│   └── restore.sh            # Database restore
│
├── db/                       # Database
│   └── schema.sql            # PostgreSQL schema
│
└── compose.yml               # Docker services (API, DB, Redis, nginx)
```

## Testing

```bash
# Run all tests
docker exec -it aedelore-dev-api npm test

# Run with coverage
docker exec -it aedelore-dev-api npm test -- --coverage

# Run specific test file
docker exec -it aedelore-dev-api npm test -- auth.test.js
```

## Environment

- **Node.js** 20.x
- **PostgreSQL** 16
- **Redis** 7 (rate limiting, account lockout)
- **Docker Compose** for orchestration

## Related

- Production: https://aedelore.nu
