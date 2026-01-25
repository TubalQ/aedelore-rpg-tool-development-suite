# Aedelore RPG Tool - Development Suite

This is the testing and development environment for [Aedelore RPG Tool](https://aedelore.nu), a fantasy RPG character sheet PWA with DM tools.

## Right Now We Are Testing and Implementing

- **Jest Testing Framework** - 52 API tests covering authentication, character management, and helper functions
- **CSRF Protection** - Double Submit Cookie pattern for protection against cross-site request forgery
- **httpOnly Cookies** - Secure authentication token storage with backward compatibility
- **JavaScript Build Process** - esbuild minification reducing main.js by 74%
- **Modular API Architecture** - Refactored monolithic server.js into organized route modules

## Quick Start

```bash
# Start all services
docker compose up -d

# Run tests
docker exec -it aedelore-dev-api npm test

# Build minified JS
docker compose --profile build run --rm aedelore-dev-build

# View API logs
docker compose logs -f aedelore-dev-api
```

## Project Structure

```
/opt/aedelore-development/
├── api/                      # Backend API
│   ├── server.js             # Express server
│   ├── routes/               # Route modules
│   │   ├── auth.js           # Authentication routes
│   │   ├── characters.js     # Character CRUD
│   │   ├── campaigns.js      # Campaign management
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # Auth & rate limiting
│   │   └── csrf.js           # CSRF protection
│   └── __tests__/            # Jest tests
│
├── html/                     # Frontend
│   ├── js/                   # JavaScript
│   ├── css/                  # Stylesheets
│   ├── data/                 # Game data
│   └── build.js              # esbuild script
│
├── db/                       # Database
│   └── schema.sql            # PostgreSQL schema
│
└── compose.yml               # Docker services
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
- **Docker Compose** for orchestration

## Related

- Production: https://aedelore.nu
