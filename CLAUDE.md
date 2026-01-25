# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Aedelore (UTVECKLINGSMILJÖ)

Fantasy RPG system med karaktärsblad (PWA) och DM-verktyg.

**Produktion:** https://aedelore.nu
**Utveckling:** http://localhost:9030

## Dokumentation

Läs ALLTID dessa filer vid sessionsstart:
- `Claude/INSTRUCTIONS.md` - Regler och arbetsflöden
- `Claude/INDEX.md` - Projektstruktur och snabbreferens
- `Claude/MEMORY.md` - Projekthistorik, beslut och TODO-lista
- `Claude/FUNCTIONS.md` - **Komplett funktionsdokumentation** (vid refaktorering)

**VIKTIGT:** Uppdatera dokumentationen efter betydande ändringar.

## Stack

| Komponent | Teknologi |
|-----------|-----------|
| Webb | Vanilla HTML/CSS/JS (PWA) |
| API | Node.js + Express |
| Databas | PostgreSQL 16 (Docker) |
| Webbserver | nginx (Docker) |

## Snabbkommandon

```bash
# Starta utvecklingsmiljön
cd /opt/aedelore-development && docker compose up -d

# Visa loggar
docker compose logs -f aedelore-dev-api

# Bygg om API efter ändringar
docker compose build --no-cache aedelore-dev-api && docker compose up -d aedelore-dev-api

# Databas
docker exec -it aedelore-dev-db psql -U aedelore -d aedelore
```

## Projektstruktur

```
/opt/aedelore-development/
├── api/                    # Backend API (Node.js + Express)
│   ├── server.js           # Huvudserver (2863 rader, 63 endpoints)
│   ├── db.js               # Databasanslutning
│   └── email.js            # E-postmodul
│
├── html/                   # Frontend (nginx)
│   ├── character-sheet.html# Karaktärsblad (PWA)
│   ├── dm-session.html     # DM-verktyg
│   ├── service-worker.js   # PWA cache (v285)
│   ├── css/styles.css      # Stilmallar
│   ├── js/                 # JavaScript
│   │   ├── main.js         # Karaktärsblad (3048 rader)
│   │   ├── dm-session.js   # DM-verktyg (9000+ rader)
│   │   └── ...             # Övriga moduler
│   └── data/               # Speldata (250+ spells, 50+ vapen, etc.)
│
├── Claude/                 # Dokumentation
│   ├── INDEX.md            # Projektstruktur
│   ├── INSTRUCTIONS.md     # Arbetsregler
│   ├── MEMORY.md           # Historik och TODO
│   └── FUNCTIONS.md        # Komplett funktionsdokumentation (891 rader)
│
├── compose.yml             # Docker Compose (dev containers)
├── nginx.conf              # Nginx konfiguration
└── .env                    # Miljövariabler (HEMLIGT)
```

## Viktiga platser

| Vad | Var |
|-----|-----|
| Speldata (vapen, spells) | `html/data/*.js` |
| Karaktärsblad (PWA) | `html/character-sheet.html`, `html/js/main.js` |
| PWA-filer | `html/manifest.json`, `html/service-worker.js` |
| DM-verktyg | `html/dm-session.html`, `html/js/dm-session.js` |
| API | `api/server.js` |
| Databasschema | `db/schema.sql` |
| Docker | `compose.yml` |
| Hemligheter | `.env` (exponera ALDRIG) |

## Speldata

Speldata finns på två ställen - håll synkat:
1. `html/data/*.js` (webb - källa)
2. `docs/game-data/*.txt` (dokumentation)
3. `html/dm-session.html` Reference-flik
