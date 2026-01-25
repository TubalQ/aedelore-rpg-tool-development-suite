# Aedelore - Projektminne

Historik över ändringar och beslut.

**OBS:** Detta är utvecklingsmiljön. Se `FUNCTIONS.md` för komplett funktionsdokumentation.

---

## Utvecklingsmiljö

**Skapad:** 2026-01-25
**Plats:** `/opt/aedelore-development`
**Port:** 9030 (http://localhost:9030)

**Containers:**
- `aedelore-dev-db` - PostgreSQL
- `aedelore-dev-api` - Node.js API
- `aedelore-dev-web` - nginx

**Starta:** `cd /opt/aedelore-development && docker compose up -d`

---

## Dokumentation

| Fil | Rader | Beskrivning |
|-----|-------|-------------|
| `FUNCTIONS.md` | 891 | Alla funktioner, API-endpoints, integrationer |
| `INDEX.md` | - | Projektstruktur |
| `MEMORY.md` | - | Denna fil - historik och TODO |
| `INSTRUCTIONS.md` | - | Arbetsregler |

**Vid refaktorering:** Använd `FUNCTIONS.md` som referens för:
- Spelarfunktioner (86+)
- DM-funktioner (100+)
- API-endpoints (63)
- Integration DM ↔ Spelare
- Speldata

---

## TODO: Produktionsberedskap

Analys gjord 2026-01-25. Checklista för att göra Aedelore mer produktionsredo.

### 🔴 Kritiskt (måste fixas)

- [x] **login_history saknas i db.js** - Tabellen skapas inte vid init, bryter login (FIXAD 2026-01-25)
- [x] **Inga tester** - Jest + 52 tester för auth, characters, helpers (FIXAD 2026-01-25)
- [x] **Ingen CSRF-skydd** - Double-submit cookie pattern implementerat (FIXAD 2026-01-25)
- [x] **Token i localStorage** - httpOnly cookies nu sätts vid login/register (FIXAD 2026-01-25)
- [x] **Ominifierad JavaScript** - esbuild build-process tillagd (FIXAD 2026-01-25)

### 🟡 Bör fixas

- [ ] **Ingen linting** - Lägg till ESLint + Prettier config
- [ ] **Monolitiska filer** - server.js (2863 rader), main.js (3048 rader) - dela upp
- [ ] **Generisk felhantering** - Strukturerad logging med pino/winston
- [ ] **Ingen monitoring** - Health endpoints, Prometheus metrics
- [ ] **Ingen backup-automatisering** - pg_dump cronjob
- [ ] **Secrets i .env** - Docker secrets eller HashiCorp Vault
- [ ] **Rate limit i minne** - Kontolåsning försvinner vid omstart, använd Redis

### 🟢 Nice-to-have

- [ ] TypeScript-migrering
- [ ] API-dokumentation (OpenAPI/Swagger)
- [ ] E2E-tester (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] CDN för statiska filer
- [ ] HTTP/2 server push

### ✅ Redan implementerat

- bcrypt lösenordshashning (SALT_ROUNDS=10)
- Parameteriserade SQL-queries (skydd mot SQL injection)
- Rate limiting (express-rate-limit)
- Helmet.js säkerhetsheaders
- Token-autentisering med 24h expiry
- Kontolåsning efter 5 misslyckade försök (15 min)
- Transaktioner med radlåsning (FOR UPDATE)
- PWA med service worker och offline-stöd
- Frontend error logging med batching
- Soft delete för characters/campaigns/sessions

---

## Session 2026-01-25 (kritisk produktionsberedskap)

### Jest Testing Framework

**Implementation:**
- 52 automatiska tester med Jest + Supertest
- Tester för: auth (login, register, logout, /me, password change), characters (CRUD, locking), helpers
- Coverage: 28% overall, 100% för helpers.js
- Rate limiting skippas automatiskt i test-miljö

**Filer:**
- `api/package.json` - Nya devDependencies: jest, supertest
- `api/jest.config.js` - Jest-konfiguration
- `api/__tests__/auth.test.js` - Auth-endpoint tester (25 st)
- `api/__tests__/characters.test.js` - Character-endpoint tester (18 st)
- `api/__tests__/helpers.test.js` - Helper-funktion tester (16 st)
- `api/__tests__/setup.js` - Test setup
- `api/middleware/auth.js` - `skip` funktion för rate limiters i test

**Kör tester:** `docker compose exec aedelore-dev-api npm test`

---

### CSRF Protection (Double Submit Cookie)

**Implementation:**
- Ny middleware `middleware/csrf.js`
- CSRF token sätts i cookie (`csrf_token`, httpOnly: false)
- Frontend läser cookie och skickar i `X-CSRF-Token` header
- Server validerar att header matchar cookie
- Timing-safe comparison för att förhindra timing attacks
- Skippas för GET/HEAD/OPTIONS och i test-miljö

**Filer:**
- `api/middleware/csrf.js` - CSRF middleware
- `api/server.js` - csrfCookieSetter + csrfProtection middleware
- `html/js/main.js` - `getCsrfToken()`, `apiRequest()` helper
- `html/js/dm-session.js` - Samma helpers

**API endpoint:** `GET /api/csrf-token` - Returnerar CSRF token

---

### httpOnly Cookies för Auth

**Implementation:**
- Login/register sätter nu `auth_token` cookie (httpOnly, secure, sameSite: strict)
- Authenticate middleware läser token från både header och cookie
- Logout rensar cookie
- Frontend behåller backward-kompatibilitet (localStorage + cookie)

**Säkerhetsförbättring:** XSS-attacker kan inte längre stjäla auth tokens.

**Filer:**
- `api/routes/auth.js` - Cookie-inställningar vid login/register/logout
- `api/middleware/auth.js` - Läser från cookie eller header

---

### JavaScript Build Process (esbuild)

**Implementation:**
- esbuild för minifiering av JavaScript
- Docker-baserad build (`docker compose --profile build run --rm aedelore-dev-build`)
- Separata inställningar för main files (tree-shaking) vs data files (no tree-shaking)

**Resultat:**
- main.js: 103KB → 27KB (74% mindre)
- dm-session.js: 434KB → 306KB (30% mindre)
- Data-filer: 16-46% mindre
- System-filer: 10-39% mindre

**Filer:**
- `html/package.json` - Build scripts
- `html/build.js` - Build script
- `html/Dockerfile.build` - Docker build image
- `compose.yml` - Build service (profile: build)

**Bygg:** `docker compose --profile build run --rm aedelore-dev-build`

---

### Server.js Refaktorering

**Genomfört:** Delat upp monolitiska server.js (2863 rader) i moduler:

| Fil | Rader | Innehåll |
|-----|-------|----------|
| `routes/auth.js` | 430 | Login, register, logout, password reset |
| `routes/characters.js` | 605 | Character CRUD, locking, items |
| `routes/campaigns.js` | 554 | Campaign CRUD, share codes |
| `routes/sessions.js` | 233 | Session CRUD |
| `routes/dm.js` | 441 | DM-only endpoints |
| `routes/trash.js` | 188 | Soft delete/restore |
| `routes/errors.js` | 86 | Error logging |
| `middleware/auth.js` | 105 | Rate limiters, authenticate |
| `helpers.js` | 40 | Token generation, validation |

---

## Session 2026-01-25 (fortsättning)

### Login History - IP-loggning

**Önskemål:** Spara IP-adress och enhet vid inloggning för säkerhet/analys.

**Implementation:**
1. Ny tabell `login_history` med user_id, ip_address, user_agent, created_at
2. Loggas automatiskt vid lyckad inloggning i `/api/login`
3. Stödjer IPv4/IPv6 (VARCHAR 45)
4. CASCADE delete när användare tas bort

**Filer:**
- `api/server.js` - INSERT vid login

---

### Databasrensning - Testkonton

**Åtgärd:** Raderade 14 testkonton och 10 testkaraktärer.

**Borttagna konton:**
- Alla med "test" i användarnamnet (13 st)
- `otheruser_1769023602` med karaktären "XPTest" (1 st)

**Kvarvarande användare (6):**
| Användare | Registrerad |
|-----------|-------------|
| Patrik | 2026-01-19 |
| slfplz | 2026-01-20 |
| M44ltie | 2026-01-22 |
| Vicjo | 2026-01-23 |
| Jenka | 2026-01-23 |
| Jessika | 2026-01-24 |

---

## Session 2026-01-25

### Starting Equipment - Race+Class Matris

**Önskemål:** Balansera starting equipment baserat på ras+klass-kombination.

**Lösning:** Ny datafil `starting-equipment.js` med 42 unika kombinationer (7 raser × 6 klasser).

**Designval:**
- Chainmail = starkaste starting armor (inte Plate)
- Två-händare (Greataxe, Glaive, Katana) = ingen sköld
- Mages = alltid Quarterstaff + Cloth
- Hunters = varierad ranged (Longbow, Crossbow, Shortbow, Javelin)
- Race/Class-logik påverkar val (Dwarves = tunga vapen, Halflings = lätta vapen)

**Stat-matchning (v282):** Korrigerade 8 vapen som inte matchade rasens primära stat:
| Kombination | Före → Efter |
|-------------|--------------|
| High Elf_Warrior | Longsword → Rapier (DEX) |
| Troll_Warrior | Glaive → Quarterstaff (DEX) |
| Dwarf_Thief/Rogue | Shortsword → Handaxe (STR) |
| Troll_Thief/Rogue | Club → Dagger (DEX) |
| Troll_Outcast | Flail → Quarterstaff (DEX) |
| Troll_Hunter | Javelin → Shortbow (DEX) |
| High Elf_Druid | Spear → Quarterstaff (DEX) |
| Moon Elf_Druid | Sickle → Quarterstaff (DEX) |

**Fallback:** Om kombination saknas i STARTING_EQUIPMENT, används gamla systemet (RACES/CLASSES).

**Filer:**
- `html/data/starting-equipment.js` (NY)
- `html/character-sheet.html` (autoFillStartingEquipment)
- `html/service-worker.js` (v282)

---

### Armor Disadvantage - Ombalansering och Auto-Apply

**Ändringar:**

1. **Förenklad syntax:** `-1D10 on X` → `-1 X`
2. **Förkortningar:** Stl, Per, Acro, Ath, SoH
3. **Ombalanserat:** Tyngre armor = mer penalty, -2 på tyngsta
4. **Auto-apply:** Penalties visas automatiskt i Overview (orange färg)

**Skill-mappning:**
| Förk | Skill | Field |
|------|-------|-------|
| Stl | Stealth | dexterity_stealth |
| Per | Perception | wisdom_perception |
| Acro | Acrobatics | dexterity_acrobatics |
| Ath | Athletics | strength_athletics |
| SoH | Sleight of Hand | dexterity_sleight_of_hand |

**Kroppsdellogik:**
- Head → Per (begränsad syn)
- Shoulders → Acro (rörlighet)
- Chest → Stl (bullerkälla)
- Hands → SoH (fingerfärdighet)
- Legs → Ath, Acro (benrörlighet)

**Full Heavy-set penalty:**
Stl -2, Acro -5, Ath -3, Per -2, SoH -2

**Filer:** armor.js, dashboard.js, styles.css
**Service Worker:** v280

---

### Armor HP System - Current HP istället för Damage Taken

**Önskemål:** Ändra armor-systemet från "damage taken" till "current HP" (som HP-slider).

**Före:**
```
Armor HP: 24 (max)
Dmg Taken: 5 (räknas upp)
Trasig: när dmg >= hp
```

**Efter:**
```
Armor: 24/24 (current/max)
Tar skada: 19/24
Trasig/röd: när current <= 0
```

**Ändringar:**

| Fil | Ändring |
|-----|---------|
| `character-sheet.html` | Kolumnrubriker → "Current HP" |
| `character-sheet.html` | Fält `shield_dmg_taken` → `shield_current` |
| `character-sheet.html` | Fält `armor_X_dmg` → `armor_X_current` |
| `character-sheet.html` | `checkEquipmentBroken()` → trasig när current ≤ 0 |
| `dashboard.js` | `quickArmorDmg()` → subtraherar skada |
| `dashboard.js` | `updateQuickEquipment()` → visar current/max |
| `armor.js` | Auto-fill sätter current = max vid armor-val |

**Service Worker:** v277

---

### Quick Actions - Arcana Hidden for Non-Magic Classes

**Önskemål:** Dölja Arcana-raden i Quick Actions för klasser som inte är Mage eller Druid.

**Lösning (dashboard.js rad ~55-59):**
```javascript
// Hide arcana row in Quick Actions for non-magic classes
const quickArcanaRow = document.querySelector('.stat-arcana');
if (quickArcanaRow) {
    quickArcanaRow.style.display = isMagicClass ? 'flex' : 'none';
}
```

**Service Worker:** v274

---

### Quick Actions - Weapon Check Display

**Önskemål:** Visa vapnets check (attribut + bonus) i Quick Actions.

**Lösning (dashboard.js `updateQuickWeapons()`):**
- Slår upp vapnets `ability` och `bonus` från `WEAPONS_DATA`
- Förkortar: Strength → STR, Dexterity → DEX
- Visar som `CHK STR+2` eller `CHK DEX+1`

**Exempel:**
```
⚔️ Longsword
ATK +2 | DMG 1d10 | RNG 2 | CHK STR+2
```

**Service Worker:** v275

---

### Weapons Data - Quarterstaff Fix

**Ändring:** Quarterstaff ändrad från Strength till Dexterity.

**Fix (weapons.js):**
```javascript
"Quarterstaff": { ability: "Dexterity", ... }
```

**Service Worker:** v276

---

### During Play - Item Location Locking

**Problem:** Samma item kunde visas på flera ställen i During Play (encounters, platser, items-lista).

**Lösning:** När DM markerar ett item som "found", låses det till den platsen via `actualLocation`.

**Ändringar (dm-session.js):**
- `renderPlayItem(item, location)` - accepterar location-parameter
- `renderPlayItemInline(item, location)` - accepterar location-parameter
- `renderPlayItemsList()` - filtrerar bort items som hittats på annan plats
- Vid "found" checkbox → sätter `actualLocation` till aktuell plats
- Items med `actualLocation` som inte matchar renderas inte

**Planning-vyn:** Oförändrad - items visas fortfarande på alla planerade platser.

---

### Player Sync - Dubblettprevention

**Problem:** Dubletter av spelare i session 1 - manuella + campaign members.

**Orsak:** Sync-funktionen matchade bara på `userId`, inte karaktärsnamn.

**Fix (dm-session.js):**
```javascript
// Matcha både på userId OCH karaktärsnamn
const existingByUserId = new Map();
const existingByCharacter = new Map();
// Om ingen match på userId, försök matcha på karaktärsnamn
if (existingIndex === undefined && cp.character && cp.character.name) {
    existingIndex = existingByCharacter.get(cp.character.name.toLowerCase());
}
```

**Databasrensning:** Session 1 rensades från 9 → 5 spelare.

---

### Player Summary - Personlig Loot-filtrering

**Problem:** Spelare såg all loot i session summary, inte bara sin egen.

**Lösning:** Filtrera items i API baserat på spelarens karaktärsnamn.

**Ändringar (server.js):**

1. **Hämta spelarens karaktär:**
   ```javascript
   const playerCharacter = await db.get(
       'SELECT name FROM characters WHERE campaign_id = $1 AND user_id = $2',
       [campaignId, userId]
   );
   ```

2. **Filtrera items i `generateSessionSummary()`:**
   ```javascript
   if (playerCharacterName) {
       foundItems = foundItems.filter(item =>
           item.givenTo.toLowerCase() === playerCharacterName.toLowerCase()
       );
   }
   ```

**Resultat:** Varje spelare ser bara items som tilldelats deras karaktär.

---

### Logout - Spara + Rensa Cache + Reload

**Önskemål:** Vid logout ska lokal cache rensas och sidan laddas om.

**Implementation (dm-session.js + main.js):**

```javascript
async function doLogout() {
    // 1. Spara osparade ändringar först
    if (currentSessionId && !isSessionLocked && authToken) {
        await saveSession();
    }

    // 2. Server logout
    await fetch('/api/logout', { ... });

    // 3. Rensa localStorage
    localStorage.removeItem('aedelore_auth_token');

    // 4. Rensa Service Worker cache
    if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 5. Ladda om sidan
    location.reload();
}
```

**Resultat:**
- Alla ändringar sparas till servern
- Cache rensas (användaren får färska filer vid nästa besök)
- Sidan laddas om med ren state

**Service Worker:** v263

---

### Visibility Settings - Spelarspecifikt innehåll

**Önskemål:** DM ska kunna tilldela encounters/places/NPCs/read-aloud till specifika spelare så att andra spelare inte ser dem i Summary.

**Lösning:** Nytt `visibleTo`-fält på varje innehållstyp.

**Ändringar (dm-session.js):**

1. **Hjälpfunktion för dropdown:**
   ```javascript
   function generateVisibilityDropdown(currentValue, onchangeHandler) {
       const players = (sessionData.players || []).filter(p => p.characterName);
       const selected = currentValue || 'all';
       // Returnerar <select> med "All Players" + spelarnamn
   }
   ```

2. **Uppdaterade render-funktioner:**
   - `renderNPCsList()` - Visar "Visible To" dropdown
   - `renderPlacesList()` - Visar "Visible To" dropdown
   - `renderEncountersList()` - Visar "Visible To" dropdown
   - `renderReadAloudList()` - Visar "Visible To" dropdown

**Ändringar (server.js):**

1. **Filtrering i `generateSessionSummary()`:**
   ```javascript
   const isVisibleToPlayer = (visibleTo) => {
       if (!playerCharacterName) return true;  // DM ser allt
       if (!visibleTo || visibleTo === 'all') return true;
       return visibleTo.toLowerCase() === playerCharacterName.toLowerCase();
   };

   // Applicera på alla innehållstyper
   usedNPCs = usedNPCs.filter(npc => isVisibleToPlayer(npc.visibleTo));
   visitedPlaces = visitedPlaces.filter(place => isVisibleToPlayer(place.visibleTo));
   completedEncounters = completedEncounters.filter(enc => isVisibleToPlayer(enc.visibleTo));
   readAloud = readAloud.filter(ra => isVisibleToPlayer(ra.visibleTo));
   ```

**Bakåtkompatibilitet:**
- Om `visibleTo` saknas → behandlas som "all" (nuvarande beteende bibehålls)

**Buggfix:** Dropdown visade bara "All Players" - fältet hette `character` inte `characterName`.

**Multi-select (checkboxar):**
Användaren önskade kunna välja flera spelare. Ändrat från dropdown till checkboxar.

**Datastruktur:**
```javascript
visibleTo: "all"              // Alla spelare (standard)
visibleTo: "Luna"             // En spelare (bakåtkompatibelt)
visibleTo: ["Luna", "Tillo"]  // Flera spelare (nytt)
```

**Nya funktioner (dm-session.js):**
- `generateVisibilityDropdown(value, dataPath)` - Renderar checkboxar
- `toggleVisibilityAll(dataPath, isChecked)` - Växla "All"
- `toggleVisibilityPlayer(dataPath, name, isChecked)` - Växla enskild spelare

**API-filtrering (server.js):**
```javascript
// Hanterar både string och array
if (Array.isArray(visibleTo)) {
    return visibleTo.some(name => name.toLowerCase() === playerNameLower);
}
return visibleTo.toLowerCase() === playerNameLower;
```

**Uppdaterade vyer:**
- Planning by Day (huvudvy) - alla compact-funktioner
- Dolda listor (renderNPCsList, renderPlacesList, etc.)
- Unlinked content-sektion

**DM-only fält i Summary:**
Följande fält visas endast för DM, inte för spelare:
- `turning_points`
- `event_log`
- `session_notes.wentWell` (What Went Well)
- `session_notes.improve` (What to Improve)

Spelare ser endast:
- `session_notes.followUp` (Follow Up Next Session)

```javascript
if (!playerCharacterName) {
    summary.session_notes = data.sessionNotes || null;  // DM ser allt
} else {
    // Spelare ser endast followUp
    if (data.sessionNotes && data.sessionNotes.followUp) {
        summary.session_notes = { followUp: data.sessionNotes.followUp };
    }
}
```

**UI-etikett:** "Follow up next session (visible to players)"

---

### Mobile Tab Panel - Quest Items & Notes

**Önskemål:** Lägga till "Quest Items & Notes" i mobile-tab-panel (höger sidebar).

**Implementation:**

1. **Ny sida (character-sheet.html):**
   - `page-quest` - innehåller Quest Items + Notes
   - `quest-items-container-mobile` - kopia av quest items
   - `inventory_freetext_mobile` + `notes_freetext_mobile` - synkade textareas

2. **Mobile tab panel item:**
   ```html
   <div class="mobile-tab-panel-item" onclick="switchTabMobile('page-quest')">
       <svg>...</svg>
       <span>Quest & Notes</span>
   </div>
   ```

3. **Synkronisering (main.js):**
   - `syncNotesToMobile()` - synkar desktop → mobile vid laddning
   - Event listeners synkar i realtid mellan desktop/mobile textareas
   - `renderQuestItems()` renderar till båda containers

**Service Worker:** v269

---

### Quest Items Archive

**Önskemål:** Spelare ska kunna arkivera quest items, grupperade per session.

**Implementation:**

1. **UI (character-sheet.html):**
   - "📦 Archive" knapp i Quest Items-sektionen (desktop + mobile)
   - Klick på quest item → modal med detaljer + "Archive" knapp
   - Arkiv-modal visar items grupperade per session med "↩️ Restore" knappar

2. **API (server.js):**
   - `POST /api/characters/:id/archive-item` - arkiverar item
   - `POST /api/characters/:id/unarchive-item` - återställer item
   - Items flyttas mellan `quest_items` och `quest_items_archived` arrays
   - Transaktioner för atomära operationer

3. **DM → Player item-flöde:**
   - `sessionName` sparas nu med varje quest item vid give-item
   - dm-session.js skickar `sessionName: sessionData.title`

4. **Client state (main.js):**
   - `window._questItemsArchived` - arkiverade items
   - Laddas vid character load
   - `archiveCurrentQuestItem()` + `unarchiveQuestItem()` anropar API

**Service Worker:** v271

---

### AI Export - Fullständig sessionsdata

**Önskemål:** När man exporterar med "include previous sessions" ska all data följa med, inte bara summary.

**Tidigare:** Endast summary, turning points och event log inkluderades.

**Nu inkluderas:**
- Prolog
- Hook
- Summary
- Key Moments (Turning Points)
- Events (Event Log)
- NPCs (namn, roll, beskrivning)
- Places (namn, beskrivning)
- Encounters (namn, beskrivning, participants)
- Read-Aloud (titel + text, trunkerat)
- Items/Loot (namn, beskrivning, vem som fick)

**Ny funktion:** `formatSessionForAI(session)` - formaterar all sessionsdata för AI-kontext.

---

### Visibility Checkboxes - Fix för specialtecken

**Problem:** Spelarnamn med specialtecken (ä, ö, å, apostrofer) bröt onclick-hanteraren.

**Orsak:** Spelarnamn inbäddades direkt i JavaScript-strängar i `onchange` attribut.

**Lösning:** Använder `data-` attribut istället:
```javascript
<input data-datapath="..." data-playername="..." onchange="handleVisibilityPlayerChange(this)">

function handleVisibilityPlayerChange(checkbox) {
    const dataPath = checkbox.dataset.datapath;
    const playerName = checkbox.dataset.playername;
    toggleVisibilityPlayer(dataPath, playerName, checkbox.checked);
}
```

**Service Worker:** v273

---

### Dublettrensning - Karaktärer

**Problem:** Spelare såg inte quest items - det fanns dubletter av karaktärer (en med campaign-länk och items, en utan).

**Orsak:** Okänd - möjligen skapade av misstag.

**Åtgärd:** Soft-delete av dubletter utan campaign-länk:
```sql
UPDATE characters SET deleted_at = NOW() WHERE id IN (73, 69);
```

| Borttagen | Namn | User |
|-----------|------|------|
| id 73 | Thorfir Stenhand | user 18 |
| id 69 | Unnamed Character | user 47 |

**Kvarvarande i Campaign 1:**
- Haphina (5 items)
- Luna (3 items)
- Ralfdor (1 item)
- Thorfir Stenhand (4 items)
- Tillo Vindsnäva (5 items)

---

## Session 2026-01-24 (fortsättning 14)

### Quest Items - Synkronisering och Databasrensning

**Problem:** Quest items hamnade hos fel spelare. Flera buggar identifierade:
1. Items lades till men togs aldrig bort vid omtilldelning
2. Dubletter skapades vid upprepad tilldelning
3. Auktorisering kunde kringgås
4. Race condition utan transaktioner

**Fixar (server.js):**

1. **Transaktioner och radlåsning:**
   - `BEGIN/COMMIT/ROLLBACK` för atomära operationer
   - `FOR UPDATE` för att låsa raden under uppdatering

2. **Dublettkontroll:**
   ```javascript
   const existingIndex = charData.quest_items.findIndex(
       qi => qi.name.toLowerCase() === trimmedName.toLowerCase()
   );
   if (existingIndex >= 0) {
       // Uppdatera befintlig istället för att lägga till ny
       charData.quest_items[existingIndex].description = description;
   }
   ```

3. **Ny endpoint för borttagning:**
   ```
   POST /api/dm/characters/:id/remove-item
   Body: { name, campaign_id }
   ```

**Fixar (dm-session.js):**

1. **Spårning av tidigare tilldelning:**
   ```javascript
   const oldPlayer = sessionData.items[itemIndex].givenTo;
   // Ta bort från gamla spelaren först
   if (oldPlayer && oldPlayer !== newPlayer) {
       await removeItemFromPlayer(itemIndex, oldPlayer);
   }
   ```

2. **Case-insensitive spelar-matchning:**
   ```javascript
   const playerLower = playerName.trim().toLowerCase();
   player = players.find(p => p.name.trim().toLowerCase() === playerLower);
   ```

**Databasrensning:**
Körde SQL för att synka karaktärer med session-tilldelningar:

| Karaktär | Före | Efter |
|----------|------|-------|
| Luna | 5 items | 2 items |
| Haphina | 6 items | 4 items |
| Tillo Vindsnäva | 8 items | 4 items |
| Thorfir Stenhand | 2 items | 2 items |

**Service Worker:** v257

---

## Session 2026-01-24 (fortsättning 13)

### Weapons Mobile Labels Fix

**Problem:** På mobil visade Weapons-tabellen fel labels - "Damage" istället för "Atk Bonus", "Hands" istället för "Damage", etc.

**Orsak:** CSS mobil-labels i styles.css matchade inte HTML-kolumnstrukturen.

**Fix (styles.css rad ~7216-7220):**
```css
/* Weapons table labels - BEFORE (wrong) */
td:nth-child(2)::before { content: "Damage"; }
td:nth-child(3)::before { content: "Hands"; }
td:nth-child(5)::before { content: "Special"; }

/* Weapons table labels - AFTER (correct) */
td:nth-child(2)::before { content: "Atk Bonus"; }
td:nth-child(3)::before { content: "Damage"; }
td:nth-child(5)::before { content: "Break"; }
```

**Service Worker:** v253

---

### Onboarding - Dold för inloggade användare

**Problem:** Getting Started-guiden visades även för inloggade användare som redan visste hur sidan fungerade.

**Lösning:** Lägg till `if (isLoggedIn) { return; }` i `initOnboarding()`.

**Fix (main.js rad ~2504):**
```javascript
const isLoggedIn = !!authToken;

// Hide guide for logged in users (they can open it manually via help button)
if (isLoggedIn) {
    return;
}
```

Användare kan fortfarande öppna guiden manuellt via "Getting Started Guide"-knappen i headern.

**Service Worker:** v254

---

## Session 2026-01-24 (fortsättning 12)

### Quest Items - Server-side merge (säker lösning)

**Problem:** Quest items kunde skrivas över om spelaren sparade karaktär innan de laddade om sidan efter att DM gett ett item.

**Lösning:** Server-side merge - API:et behåller alltid quest_items från databasen.

**Ändringar:**

1. **server.js (PUT /api/characters/:id):**
   - Hämtar befintlig `data` från DB
   - Mergar: `mergedData.quest_items = existingData.quest_items || []`
   - Klienten kan aldrig skriva över quest_items

2. **main.js (getAllFields):**
   - Tog bort `data.quest_items = window._questItems`
   - Quest items hanteras nu endast server-side

**Ägandeskap:**
- Quest items kan ENDAST modifieras via `/api/dm/characters/:id/give-item`
- Spelaren kan aldrig påverka quest_items genom vanlig sparning

**Service Worker:** v252

---

## Session 2026-01-24 (fortsättning 11)

### Quick Stats Synkronisering - Komplett fix

**Problem:** Quick Stats uppdaterades inte efter karaktärsladdning eller ras/klass-val.

**Orsak:** `setAllFields()` och `autoFillAttributes()` satte värden utan att trigga events, och anropade inte `updateDashboard()`.

**Fix:**
1. Lagt till `updateDashboard()` i slutet av `setAllFields()` (main.js)
2. Lagt till `updateDashboard()` i slutet av `autoFillAttributes()` (character-sheet.html)

**Service Worker:** v251

---

## Session 2026-01-24 (fortsättning 10)

### Privacy Banner - Modal på mobil

**Problem:** Privacy-bannern visades dåligt på telefon (för liten, svår att trycka på).

**Lösning:** På mobil (< 768px) visas bannern nu som en centrerad modal istället för en bottom bar.

**Ändringar (styles.css):**
- Mörk overlay (`rgba(0, 0, 0, 0.7)`)
- Centrerad box med rundade hörn
- Full-width knappar (min-height 44px för touch)
- Staplade knappar vertikalt

**Service Worker:** v250

---

## Session 2026-01-24 (fortsättning 9)

### Quick Stats Synkroniseringsfix

**Problem:** Quick Stats visade inte alltid samma värden som Stats-tabben.

**Orsaker:**
1. **Third Eye saknades helt** - inget HTML-element, inte i stats array
2. **Skills uppdaterades inte i realtid** - `watchFields` innehöll bara 6 huvudattribut, inte skills eller third_eye

**Fix:**
1. Lagt till Third Eye-kort i Quick Stats HTML (character-sheet.html)
2. Lagt till `{ id: 'dash-thi', field: 'third_eye_value' }` i stats array (dashboard.js)
3. Utökat `watchFields` med `third_eye_value` och alla 21 skill-fält

**Service Worker:** v249

---

## Session 2026-01-24 (fortsättning 8)

### Quest Items Buggfix

**Problem:** Quest items som DM gav till spelare försvann ibland.

**Orsak:** `getAllFields()` samlade in data från DOM-element men inkluderade INTE `quest_items` (som lagras i `window._questItems`). Vid autosave skrevs charData över utan quest_items.

**Bugg-flöde:**
1. DM ger quest item → sparas i databasen ✅
2. Spelare laddar karaktär → quest_items visas ✅
3. Spelare gör ändring → autosave körs
4. `getAllFields()` returnerar data UTAN quest_items ❌
5. PUT /api/characters/:id → quest_items försvinner

**Fix (main.js rad ~543):**
```javascript
// Save quest items (given by DM, stored in window._questItems, not in DOM)
data.quest_items = window._questItems || [];
```

**Service Worker:** v248

---

## Session 2026-01-24 (fortsättning 7)

### Mobile Tab Menu - Swipe-gest

**Lagt till swipe-gest som alternativ till toggle-knappen för att öppna/stänga mobilmenyn.**

**Problem:** På iPhone kolliderade toggle-knappen med iOS skrollindikator på höger sida.

**Lösning:** Behåll knappen men lägg till swipe-gest som komplement. Användare kan nu välja:
- Trycka på knappen (◀)
- Swipe från höger kant inåt (←) för att öppna
- Swipe åt höger (→) för att stänga

**Implementation (character-sheet.html):**
```javascript
// Swipe gesture for mobile tab menu
let touchStartX, touchStartY, touchEndX, touchEndY;
const edgeThreshold = 40;  // px from right edge
const swipeThreshold = 50; // minimum swipe distance

// touchstart → touchend → handleSwipe()
// Ignorerar vertikala swipes (scroll)
```

**Tröskelvärden:**
- `edgeThreshold: 40px` - Swipe måste starta inom 40px från höger kant
- `swipeThreshold: 50px` - Minsta swipe-avstånd för att trigga

**Service Worker:** v247

---

## Session 2026-01-24 (fortsättning 6)

### Frontend Error Logging

**Implementerat egen error-logging-lösning för att fånga JavaScript-fel.**

#### Nya filer
- `html/js/error-logger.js` - Frontend error handler

#### Databasändringar (db.js)
- Ny tabell `frontend_errors` för att lagra fel

#### API-ändringar (server.js)
- `POST /api/errors` - Logga fel (rate limited: 30/min/IP)
- `GET /api/errors` - Hämta senaste fel (kräver auth)
- Ny metrics-kategori `frontendErrors` i metrics-objektet
- Frontend Errors-sektion i metrics.txt

#### Frontend (error-logger.js)
Features:
- `window.onerror` - Fångar uncaught exceptions
- `unhandledrejection` - Fångar promise rejections
- Batching (skickar max var 5:e sekund)
- Deduplicering (samma fel inom 1 minut skickas bara en gång)
- `AedeloreErrors.log()` för manuell loggning
- `AedeloreErrors.logFetch()` för API-fel
- `AedeloreErrors.flush()` för att skicka direkt

#### HTML-ändringar
- Script-tag för error-logger.js tillagd först i alla sidor

#### Verifiering
Testat och verifierat:
- API endpoint fungerar (POST/GET)
- Fel sparas i databas med user_id om inloggad
- Metrics uppdateras korrekt per feltyp
- Simulerad användarresa: registrering → karaktär → fel → logout

#### Kommandon för att se fel
```bash
# Senaste fel i databasen
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "SELECT id, user_id, error_type, message, url, created_at FROM frontend_errors ORDER BY created_at DESC LIMIT 10;"

# Metrics-sammanfattning
cat /opt/aedelore/api/data/metrics.txt
```

**Service Worker:** v246

---

## Session 2026-01-24 (fortsättning 5)

### Campaign Chat - Borttagen

**Chat-funktionen implementerades men togs bort på grund av problem med mobilvisning.**

#### Vad som togs bort:
- `html/js/chat.js` - Chattlogik
- Socket.io-kod från `api/server.js`
- `chat_messages`-tabell från databasen
- Chat-relaterad HTML från character-sheet.html och dm-session.html
- Chat-relaterad CSS från styles.css
- `socket.io` dependency från package.json

#### Git:
- Commit `d24f4e6 Add campaign chat with Socket.io` borttagen med `git reset --hard` + force push

#### Lärdomar:
- Mobil-first design krävs för nya funktioner
- Testa på både desktop och mobil innan commit

---

