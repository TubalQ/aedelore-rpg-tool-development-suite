# Aedelore - Arbetsregler

Regler och rutiner för att arbeta med projektet.

**OBS:** Detta är utvecklingsmiljön (`/opt/aedelore-development`).

---

## Vid sessionsstart

1. **Läs dokumentation:**
   ```
   Claude/INDEX.md      - Projektstruktur
   Claude/MEMORY.md     - Tidigare beslut och TODO
   Claude/FUNCTIONS.md  - Komplett funktionsdokumentation (vid refaktorering)
   ```

2. **Kolla service worker version:**
   ```
   html/service-worker.js → CACHE_NAME (nuvarande: v285)
   ```

3. **Starta utvecklingsmiljön:**
   ```bash
   cd /opt/aedelore-development && docker compose up -d
   # Öppna http://localhost:9030
   ```

---

## Efter ändringar

### Frontend-ändringar (HTML/CSS/JS)

1. **Öka service worker version:**
   ```javascript
   // html/service-worker.js
   const CACHE_NAME = 'aedelore-vXXX';  // Öka med 1
   ```

2. **Testa på mobil** - Kontrollera responsivitet

### API-ändringar (server.js)

1. **Bygg om container:**
   ```bash
   cd /opt/aedelore-development
   docker compose build --no-cache aedelore-dev-api && docker compose up -d aedelore-dev-api
   ```

2. **Verifiera:**
   ```bash
   docker compose logs -n 20 aedelore-dev-api
   ```

### Databasändringar

1. **Lägg till kolumn via API init** (server.js `initializeDatabase()`)
2. **Bygg om API-container**

---

## Kodkonventioner

### JavaScript
- Funktioner: `camelCase`
- Variabler: `camelCase`
- Konstanter: `UPPER_SNAKE_CASE`
- DOM-element ID: `kebab-case`

### CSS
- Klasser: `kebab-case`
- ID: `kebab-case`
- Variabler: `--kebab-case`

### HTML
- ID: `kebab-case`
- Klasser: `kebab-case`
- Data-attribut: `data-kebab-case`

---

## Vanliga platser

### Lägga till ny lås-funktion
1. `api/server.js` - Endpoint + DB-kolumn
2. `html/js/main.js` - Variabel + funktion + uppdatera applyLockState
3. `html/character-sheet.html` - UI-element
4. `html/css/styles.css` - Styling
5. `html/js/dm-session.js` - DM unlock modal

### Lägga till ny data (vapen, spells, etc)
1. `html/data/*.js` - Lägg till data
2. Uppdatera rendering-funktion om nödvändigt

### Lägga till ny API-endpoint
1. `api/server.js` - Definiera endpoint
2. Bygg om API-container

---

## Felsökning

### "Ändringar syns inte"
- Öka service worker version
- Hard refresh (Ctrl+Shift+R)
- Rensa cache i DevTools

### "API-fel"
```bash
docker compose logs -f aedelore-proffs-api
```

### "Databas-fel"
```bash
docker exec -it aedelore-dev-db psql -U aedelore -d aedelore
\d characters  # Visa tabellstruktur
```

### "Frontend-fel" (JavaScript-buggar)
```bash
# Visa senaste fel från användare
docker exec aedelore-dev-db psql -U aedelore -d aedelore \
  -c "SELECT * FROM frontend_errors ORDER BY created_at DESC LIMIT 10;"

# Visa metrics-sammanfattning
cat /opt/aedelore-development/api/data/metrics.txt
```

---

## Git-commits

**VIKTIGT:** Inkludera INTE "Co-Authored-By" raden i commits. Ägaren vill inte ha Claude listad som medförfattare.

```bash
# Exempel på korrekt commit (utan Co-Authored-By)
git commit -m "Fix bug in player list"
```

---

## Uppdatera dokumentation

Efter betydande ändringar:

1. **INDEX.md** - Uppdatera projektstruktur
2. **MEMORY.md** - Lägg till session-logg
3. **FUNCTIONS.md** - Uppdatera vid nya funktioner/endpoints
4. **Service worker** - Öka version vid frontend-ändringar

---

## Mobiltest-checklista

- [ ] Knappar tillräckligt stora (min 44px touch target)
- [ ] Text läsbar (min 14px)
- [ ] Flex-wrap på rader med flera element
- [ ] Fixed-element undviker bottom navigation
- [ ] Modal scrollbar vid långt innehåll
