# Aedelore - Projektminne

Historik över ändringar och beslut.

---

## Session 2026-01-25

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

## Session 2026-01-23 (fortsättning 12)

### E-postbaserad Lösenordsåterställning

**Implementerat komplett "Glömt lösenord"-funktion med e-postbaserad återställning.**

#### Databasändringar (db.js)
- Ny kolumn `email TEXT UNIQUE` i `users`-tabellen
- Nytt index `idx_users_email`
- Ny tabell `password_reset_tokens`:
  - `token TEXT PRIMARY KEY`
  - `user_id INTEGER REFERENCES users(id)`
  - `created_at TIMESTAMP`
  - `expires_at TIMESTAMP`
  - `used BOOLEAN`

#### Nya API-endpoints (server.js)

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/api/forgot-password` | POST | Begär återställningslänk (rate limited: 3/timme) |
| `/api/reset-password` | POST | Återställ lösenord med token |
| `/api/reset-password/validate` | GET | Validera token |
| `/api/account/email` | PUT | Lägg till/ändra e-post (kräver lösenord) |

#### Uppdaterade endpoints
- `POST /api/register` - Kräver nu `email` (förutom username/password)
- `GET /api/me` - Returnerar nu `email`

#### Nya filer
- `api/email.js` - E-postmodul med nodemailer
- `html/reset-password.html` - Fristående återställningssida

#### Frontend-ändringar

**Auth Modal (character-sheet.html, dm-session.html):**
- Nytt e-postfält (visas vid registrering)
- Nytt "Confirm Password"-fält (visas vid registrering)
- "Forgot password?"-länk (visas vid login)

**Forgot Password Modal (båda sidor):**
- E-postfält
- Skickar reset-länk
- Bekräftelsemeddelande

**My Data (dm-session.html):**
- Visar e-post eller "Not set"
- "Add Email" / "Change"-knapp
- Email-modal med lösenordsbekräftelse

**JavaScript-funktioner (main.js, dm-session.js):**
- `showForgotPasswordModal()` - Öppnar forgot password modal
- `hideForgotPasswordModal()` - Stänger modal
- `requestPasswordReset()` - Skickar reset-request
- `showEmailModal(mode)` - Öppnar email-modal (dm-session)
- `hideEmailModal()` - Stänger email-modal
- `saveEmail()` - Sparar ny e-post

**Reset Password Page (reset-password.html):**
- Token-validering vid laddning
- Nytt lösenord + bekräfta-formulär
- Framgångs/fel-meddelanden

#### Säkerhet

| Åtgärd | Implementation |
|--------|----------------|
| Rate limiting | 3 reset-requests/timme/IP (`passwordResetLimiter`) |
| Token-säkerhet | 32-byte random, 1h utgångstid, engångsbruk |
| Email enumeration | Samma svar oavsett om e-post finns |
| Session-invalidering | Alla auth_tokens raderas vid reset |
| Lösenordsbekräftelse | Krävs för att ändra e-post |
| Lösenordsvalidering | Min 8 tecken, bokstäver + siffror |

#### CSS-fix
Lade till `input[type="email"]` i alla input-selektorer (bas, :hover, :focus) i styles.css.

#### Dependencies
- `nodemailer: ^6.9.0` tillagd i package.json

#### Miljövariabler (.env)
```
SMTP_HOST=smtp.protonmail.ch
SMTP_PORT=587
SMTP_USER=admin@aedelore.nu
SMTP_PASS=<app-password>
SMTP_FROM=Aedelore <admin@aedelore.nu>
APP_URL=https://aedelore.nu
```

**OBS:** Proton Mail kräver att SMTP_FROM matchar SMTP_USER (eller ett alias). `noreply@` fungerar inte utan alias.

**Service Worker:** v234

---

## Session 2026-01-24 (fortsättning 3)

### DM Calculator

**Implementerat Calculator-flik i DM Session för snabba tärningsberäkningar.**

Ny flik "Calculator" i tab-raden (efter Reference, före Summary) med tre delar:

#### Defense Calculator
- **Pool Size:** Antal D10 att rulla
- **Defense Type:** Block/Dodge/Parry/Take Hit
- **Sannolikhetsvisning:** 0/1/2+ successes procent
- **Roll Defense:** Rullar pool, visar tärningar färgkodade, outcome och effekt

#### Damage Calculator
- **Incoming Damage:** Total skada från attack
- **Defense Successes:** 0/1/2+ (välj från dropdown)
- **Defense Type:** Block/Dodge/Parry/Take Hit
- **Shield/Armor HP:** Utrustningens HP (för overflow-beräkning)
- **Calculate Damage:** Visar fördelning till Armor/Shield/Character HP

#### NPC Quick Roll
- **Pool Size Buttons:** 3/5/7/10 + custom input
- **Sannolikhetsvisning:** Direkt feedback på odds
- **Roll Buttons:** Attack/Defense/Skill
- **Resultat:** Tärningar + successes + outcome

#### Quick Reference
Snabbreferens för D10 success levels (1-4 Fail, 5-6 Barely, 7-9 Success, 10 Critical) och defense outcomes-tabell.

#### Nya funktioner (dm-session.js)
| Funktion | Beskrivning |
|----------|-------------|
| `interpretD10(value)` | Tolkar D10: failure/barely/success/critical |
| `rollD10Pool(poolSize)` | Rullar D10-pool |
| `countSuccesses(results)` | Räknar 7+ som successes |
| `calculateSuccessProbability(poolSize, target)` | Binomialfördelning |
| `updateDefenseOdds()` | Uppdaterar defense sannolikhet |
| `rollDefense()` | Rullar och visar defense-resultat |
| `calculateDamage()` | Beräknar skadefördelning |
| `setNpcPool(size)` | Sätter NPC pool-storlek |
| `updateNpcOdds()` | Uppdaterar NPC sannolikhet |
| `rollNpc(type)` | Rullar attack/defense/skill för NPC |
| `initCalculator()` | Initierar vid sidladdning |

#### CSS (dm-session.html)
- `.npc-pool-btn` - Pool-knappar med hover/active states

**Service Worker:** v246

#### Buggfix: Defense Calculator regler
Korrigerade felaktiga beräkningar i Damage Calculator:

**Block (fixat):**
- 2+ success: 50% → Shield HP (var 100%)
- 1 success: Full → Shield HP (var 50%)

**Take Hit (fixat):**
- 0 success: Full → Armor HP + Stun (tog bort felaktig 50% char damage)

**Terminologi (fixat):**
- "Weapon Skill" → "Weapon Atk Bonus" för Parry (alla ställen)

---

## Session 2026-01-24 (fortsättning 2)

### README Screenshots

**Lagt till screenshots i README.md:**
- `aedelore.png` - Character Sheet (Overview-fliken)
- `DMtool.png` - DM Session Tools (Planning-fliken)

Bilderna visas direkt efter titeln och beskrivningen i README.

---

## Session 2026-01-24 (fortsättning)

### Onboarding Anpassning för Andra Spelsystem

**Getting Started-panelen visar olika steg beroende på valt spelsystem.**

**Aedelore (standard):** Alla 10 steg visas
1. Register an account
2. Name your character
3. Save to cloud
4. Choose race, class & religion
5. Lock race & class
6. Distribute attribute points
7. Lock attributes
8. Join a campaign
9. View campaign details (informativt, ingen check)
10. Go to Overview

**Andra system (D&D 5e, Pathfinder 2e, etc.):** Endast 6 steg visas
1. Register an account
2. Name your character
3. Save to cloud
4. Join a campaign (omnumrerat från 8)
5. View campaign details (omnumrerat från 9, informativt)
6. Go to Overview (omnumrerat från 10)

**Borttagna element för andra system:**
- Steg 4-7 tas bort från DOM (Aedelore-specifikt lås-system)
- "No DM?"-noten tas bort (refererar till lås-stegen)
- Ändrad subtitle: "Follow these steps to get started:" (utan "campaign mode")

**Implementation:**
- `updateOnboardingProgress()` kör borttagningen varje sekund (hanterar systembyte)
- Stegen tas bort med `element.remove()` för att säkerställa att de försvinner
- Steg 9/5 (dm-session) är informativt och spåras inte (ingen checkmark)

**Nya funktioner (main.js):**
| Funktion | Beskrivning |
|----------|-------------|
| `isAedeloreSystem()` | Returnerar true om nuvarande system är Aedelore |
| `adjustOnboardingForSystem()` | Tar bort steg vid init om icke-Aedelore |
| `adjustOnboardingForSystemInContainer(container)` | Samma för mobil-klon |
| `getStepDataAttr(stepNum)` | Mapper steg-nummer till data-step attribut |

**Service Worker:** v242

---

## Session 2026-01-24

### Gitignore för Känsliga Dokument

**Lagt till i .gitignore och tagit bort från git-tracking:**

| Fil/Mapp | Beskrivning |
|----------|-------------|
| `AEDELORE-RULES-COMPLETE.md` | Fullständiga spelregler (root) |
| `docs/rules/AEDELORE-RULES-COMPLETE.md` | Fullständiga spelregler (docs) |
| `docs/security/` | Säkerhetsaudit och rekommendationer |

**Kommando för att ta bort från tracking:**
```bash
git rm --cached docs/rules/AEDELORE-RULES-COMPLETE.md
git rm --cached -r docs/security/
```

Filerna finns kvar lokalt men synkas inte längre till GitHub.

---

### Auto-Refresh vid Tab-byte

**Implementerat automatisk uppdatering av karaktärsdata vid tab-byte.**

Löser problemet att användare måste trycka F5 för att se quest items som DM gett dem.

#### Triggers

| Trigger | Beskrivning |
|---------|-------------|
| Byter till **Gear**-fliken | Hämtar quest items m.m. |
| Byter till **Overview**-fliken | Uppdaterar dashboard |
| Sidan blir synlig igen | Page Visibility API (t.ex. efter DM Session) |

#### Implementation (main.js)

```javascript
async function refreshCharacterData() {
    if (!authToken || !currentCharacterId) return;

    // 150ms delay för att låta DOM uppdateras
    await new Promise(resolve => setTimeout(resolve, 150));

    // Spara först
    await checkAndSaveToCloud();

    // Sen hämta ny data
    await loadCharacterById(currentCharacterId);
}
```

#### Säkerhet mot dataförlust

- **150ms fördröjning** innan refresh (låter input-events processas)
- **Sparar ändringar** innan reload (await checkAndSaveToCloud)
- **Endast read-heavy tabs** (Gear, Overview) triggar refresh

#### Ändrade filer
- `html/js/main.js` - `refreshCharacterData()` + visibility listener
- `html/js/tabs.js` - Anropar refresh på Gear/Overview

**Service Worker:** v234

---

## Session 2026-01-23 (fortsättning 12)

### Success Level Rules Change

**Ändrade success level-trösklar för att göra spelet något enklare:**

| Slag | Gammalt | Nytt |
|------|---------|------|
| Failure | 1-5 | 1-4 |
| Barely | 6-7 | 5-6 |
| Success | 8-9 | 7-9 |
| Critical | 10 | 10 |

**D10:** 40% fail, 20% barely, 30% success, 10% crit
**D12:** 33% fail, 25% barely, 33% success, 8% crit (1-4, 5-7, 8-11, 12)
**D20:** 40% fail, 20% barely, 35% success, 5% crit (1-8, 9-12, 13-19, 20)

**Uppdaterade filer:**
- `html/js/diceroller.js` - Logik och kommentarer
- `html/character-sheet.html` - 3 ställen (mode-description, success levels, help)
- `html/dm-session.html` - 2 ställen (reference quick card, critical roll box)
- `docs/rules/AEDELORE-RULES-COMPLETE.md` - 2 tabeller
- `docs/rules/AEDELORE-RULES-EN.md` - 2 tabeller
- `docs/dev/RULES-OPTIMIZATION.md` - 1 tabell

**Service Worker:** v229

---

## Session 2026-01-23 (fortsättning 10)

### DM View Player Build

**Ny funktion:** DM kan se spelarens build (attribut, skills, abilities) via 📊-knapp på player card.

**API Endpoint:**
```
GET /api/dm/characters/:id/build
```
Returnerar karaktärens `data` JSON (endast för DM som äger kampanjen).

**Frontend (dm-session.js):**
- `showPlayerBuild(characterId, characterName)` - Hämtar och visar modal
- `hidePlayerBuildModal()` - Stänger modal
- `renderPlayerBuildContent(data)` - Renderar attribut grupperat med skills

**Modal visar:**
- **Attributes & Skills** - Grupperat per attribut (STRENGTH med Athletics, Raw Power, Unarmed, etc.)
- **Abilities** - Lista över valda abilities (`spell_1_type` till `spell_10_type`)

**Attributgrupper:**
| Attribut | Skills |
|----------|--------|
| STRENGTH | Athletics, Raw Power, Unarmed |
| DEXTERITY | Endurance, Acrobatics, Sleight of Hand, Stealth |
| TOUGHNESS | Bonus Injured, Resistance |
| INTELLIGENCE | Arcana, History, Investigation, Nature, Religion |
| WISDOM | Luck, Animal Handling, Insight, Medicine, Perception, Survival |
| FORCE OF WILL | Deception, Intimidation, Performance, Persuasion |
| THIRD EYE | (inga sub-skills) |

---

### DM Lock Management (Både Låsa och Låsa Upp)

**Förbättring:** 🔓-knappen öppnar nu en modal där DM kan **toggla** lås-status (inte bara låsa upp).

**API Endpoint:**
```
POST /api/dm/characters/:id/set-locks
Body: { race_class_locked: bool, attributes_locked: bool, abilities_locked: bool }
```

**Frontend (dm-session.js):**
- `manageLocks(characterId, name, rcLocked, attrLocked, abilLocked)` - Öppnar modal
- `toggleLockState(type)` - Togglar rc/attr/abil
- `saveLockStates()` - Sparar till API
- `updateLockModalButtons()` - Uppdaterar UI

**Modal UI:**
```
┌─────────────────────────────────┐
│  🔒 Race/Class  │ 🔓 Attributes │ 🔒 Abilities │
│    (Locked)     │  (Unlocked)   │   (Locked)   │
├─────────────────────────────────┤
│  [Save Changes]     [Cancel]    │
└─────────────────────────────────┘
```
- Grön = Låst
- Röd = Olåst
- Klicka för att toggla

---

## Session 2026-01-23 (fortsättning 9)

### Number Input Spinner Fix (Desktop)

**Problem:** Attribut och skills hade dubbla kontroller på desktop:
- Custom +/− knappar (fungerar bra)
- Webbläsarens inbyggda upp/ner-pilar på `<input type="number">`

Mobil visar endast custom-knapparna, men desktop visade båda.

**Lösning:** Dölj webbläsarens inbyggda spinners med CSS:
```css
/* Hide native number input spinners */
input[type="number"] {
    -moz-appearance: textfield;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
```

**Fil:** `html/css/styles.css` (rad ~3210)

---

### Nginx Real IP Fix

**Problem:** Nginx loggade Traefik-IP:n istället för riktiga klient-IP:er trots `set_real_ip_from` direktiv.

**Orsak:** Containern hade cachat gammal config. `nginx -s reload` räckte inte.

**Lösning:**
```bash
docker compose restart aedelore-proffs-web
```

**Verifierat:** Loggar visar nu riktiga klient-IP:er (t.ex. `46.246.0.182`) istället för proxy-IP.

**Säkerhet:** Proxy-IP:n är **inte commitad till git** - endast placeholder finns i repo. Lokalt används den riktiga IP:n.

---

## Session 2026-01-23 (fortsättning 8)

### Trafiksäkerhet - Inkommande Requests

**Genomförd säkerhetsaudit fokuserad på inkommande trafik.**

#### Node.js Server Timeouts (server.js)

```javascript
server.headersTimeout = 60000;    // 60 sekunder för headers
server.requestTimeout = 30000;    // 30 sekunder för full request
server.keepAliveTimeout = 65000;  // 65 sekunder keep-alive
server.timeout = 120000;          // 2 minuter övergripande timeout
```

**Skyddar mot:** Slowloris, slow POST-attacker, connection exhaustion.

#### Nginx Säkerhetskonfiguration (nginx.conf)

| Direktiv | Värde | Syfte |
|----------|-------|-------|
| `set_real_ip_from` | [proxy IP] | Hämta riktig klient-IP från reverse proxy |
| `real_ip_header` | X-Forwarded-For | Header att läsa IP från |
| `server_tokens` | off | Dölj nginx-version |
| `client_max_body_size` | 10m | Max request-storlek |
| `client_body_timeout` | 30s | Timeout för request body |
| `client_header_timeout` | 30s | Timeout för headers |
| `limit_req_zone general` | 10r/s | Rate limit för statiska filer |
| `limit_req_zone api` | 30r/s | Rate limit för API |
| `limit_conn_zone` | 20 per IP | Max samtidiga connections |

**HTTP-metoder begränsade till:** GET, POST, PUT, DELETE, HEAD, OPTIONS

**Proxy timeouts:**
- `proxy_connect_timeout`: 30s
- `proxy_send_timeout`: 60s
- `proxy_read_timeout`: 60s

#### Filrättigheter

| Fil | Rättigheter | Syfte |
|-----|-------------|-------|
| `api/data/metrics.json` | 600 | Endast root kan läsa |
| `api/data/metrics.txt` | 600 | Endast root kan läsa |
| `backups/*.sql` | 600 | Skydda databas-dumps |

#### Traefik-integration

Traefik (reverse proxy) hanterar:
- HTTPS/TLS med Let's Encrypt
- CrowdSec bot-skydd
- Egen rate limiting
- HSTS headers

Nginx rate limiting fungerar som **defense in depth** tillsammans med Traefik.

---

## Session 2026-01-23 (fortsättning 7)

### Säkerhetsaudit och Fixar

**Genomförd säkerhetsaudit med flera agenter som letade efter:**
- XSS-sårbarheter
- SQL injection
- Auth/IDOR-problem
- Input validation
- Secrets/config-problem

**Fixade sårbarheter:**

#### API (server.js)

| Sårbarhet | Fix |
|-----------|-----|
| Type coercion på amount (give-xp) | `parseInt(amount, 10)` + `Number.isInteger()` + gräns 1-10000 |
| Type coercion på count (spend-points) | `parseInt(count, 10)` + `Number.isInteger()` + gräns 1-100 |
| Dynamisk SQL i unlock | Ersatt string concatenation med parameteriserad CASE-sats |
| IDOR i give-item | Verifierar att karaktär tillhör kampanj DM äger |
| Saknad stränglängdsbegränsning | Name: 1-100, Description: max 2000 tecken |
| Ingen system whitelist | Endast godkända system tillåtna |
| JSON parse utan error handling | try/catch runt character data parsing |
| UPDATE utan user_id safeguard | Lagt till user_id i WHERE-klausul |

#### Frontend JavaScript

| Sårbarhet | Fix |
|-----------|-----|
| Avatar innerHTML XSS | `innerHTML` → `textContent` + URL-validering |
| Trash onclick XSS | Inline onclick → data-attributes + addEventListener |
| eval() i system-selector | Ersatt med `safeMathEval()` som endast tillåter siffror/operatorer |

#### Övrigt

| Sårbarhet | Fix |
|-----------|-----|
| Backup SQL i web root | Flyttad till `/opt/aedelore/backups/` |

**Ej åtgärdade (kräver större ändringar):**
- Auth token i localStorage (kräver cookie-omskrivning)
- Token i query params (används av mobile sendBeacon)
- unsafe-inline i CSP (kräver refaktorering av alla inline handlers)

**Hanteras av Traefik:**
- HTTPS/TLS (Let's Encrypt)
- CrowdSec bot-skydd
- HSTS headers

---

## Session 2026-01-23 (fortsättning 6)

### Status Bar Desktop/Mobile Fix

**Problem:** Status bar (HP, Arcana, Willpower, Bleed, Weakened, Worth) syntes på desktop när man bytte från Overview till andra flikar.

**Lösning:** Status bar ska vara dold på desktop (>1024px) men synlig på mobil/tablet (≤1024px).

**CSS (styles.css):**
```css
.status-bar {
    display: none; /* Hidden by default on desktop */
}

@media (max-width: 1024px) {
    .status-bar {
        display: flex;
    }
    .status-bar.status-bar-hidden {
        display: none;
    }
}
```

---

### Quick Actions Button Colors

**Problem:** Half Rest, Status och Worth saknade färger på mobil. Half Rest saknade färg på desktop.

**Lösning:** Lade till styling för alla action-knappar med tema-variabler:

| Knapp | Färg | Beskrivning |
|-------|------|-------------|
| `.action-half-rest` | Cyan | Muted version av Rest |
| `.action-status` | Grön/Röd | Grön vid OK, röd vid conditions |
| `.action-worth` | Amber/Grön/Röd | Amber neutral, grön positiv, röd negativ |

**CSS-variabler:** Alla action-knappar använder nu `var(--accent-*)` för tema-anpassning.

---

### Status Bar Box Sizing (Mobile)

**Problem:** Boxarna (HP, Willpower, Bleed, Weakened, Worth) hade olika storlek på mobil.

**Lösning:**
```css
.status-item {
    min-height: 52px;
    justify-content: center;
}

.status-desc {
    display: none; /* Dölj Worth-beskrivning på mobil */
}
```

---

## Session 2026-01-23 (fortsättning 5)

### Nya Teman (5 st)

**Lagt till 8 nya teman till befintliga 4 (totalt 12 teman):**

| Tema | Beskrivning | Primärfärg |
|------|-------------|------------|
| **Forest** | Djup skog, druider, naturmagi | Emerald `#10b981` |
| **Frost** | Is, vinter, kristaller | Isblå `#7dd3fc` |
| **Void** | Kosmisk, mystisk, stjärnor | Rosa `#e879f9` |
| **Pure Darkness** | Ren svart, silver/guld-text med glow | Guld `#d4af37` |
| **Blood** | Vampyrer, mörk magi, hotfull | Blodröd `#dc2626` |
| **Necro** | Nekromanti, gift, förfall | Giftgrön `#84cc16` |
| **Royal** | Kunglighet, lyx, elegant | Guld `#fbbf24` |
| **Crimson** | Krig, slagfält, intensiv | Crimson `#be123c` |

**Filer ändrade:**
- `html/js/main.js` - THEMES array och THEME_COLORS
- `html/js/dm-session.js` - THEMES array och THEME_COLORS
- `html/css/styles.css` - CSS-variabler och tema-specifika regler (~600 rader)
- `html/character-sheet.html` - Tema-dropdown med 5 nya knappar
- `html/dm-session.html` - Tema-dropdown med 5 nya knappar
- `html/service-worker.js` - Version v216

**Pure Darkness design-principer:**
- Ren svart bakgrund (`#000000`)
- Silver text (`#d0d0d0`) för läsbarhet
- Guld (`#d4af37`) för headers och accenter med glow
- Subtila borders (`rgba(255,255,255,0.05-0.08)`)
- HP/Arcana/Willpower/Worthiness behåller sina funktionella färger
- Glow-effekter på hover för interaktivt feedback

---

## Session 2026-01-23 (fortsättning 4)

### Campaign Player Sync Fix

**Problem:** Spelare som togs bort via "Revoke Access" försvann inte från session players-listan.

**Orsak:** `syncCampaignPlayers()` i dm-session.js lade till/uppdaterade spelare men tog aldrig bort de som inte längre fanns i kampanjen.

**Flöde efter revoke:**
1. Backend raderar från `campaign_players` tabell ✅
2. `sessionData.players` (JSON i sessions.data) behöll gamla spelare ❌
3. `syncCampaignPlayers()` ignorerade borttagna spelare ❌

**Fix (dm-session.js ~rad 3489):**
```javascript
// Remove campaign members who are no longer in the campaign
const campaignUserIds = new Set(campaignPlayers.map(cp => cp.id));
sessionData.players = sessionData.players.filter(p => {
    if (p.isCampaignMember && p.userId && !campaignUserIds.has(p.userId)) {
        return false;
    }
    return true;
});
```

### Onboarding Step 9: View Campaign Details

**Ny instruktion:** Lagt till steg 9 i Getting Started-guiden:
- "View campaign details" → Cloud menu → DM Session
- Informativt steg utan auto-check
- Nuvarande steg 9 "Go to Overview" blev steg 10

---

### Manual Player Removal Override

**Ny feature:** DM kan nu manuellt ta bort ALLA spelare från session players-listan, inklusive campaign members.

**Ändringar:**
1. Campaign members har nu × knapp (tidigare dold)
2. Bekräftelse-dialog visas för campaign members
3. `removeSessionPlayer(index, isMember = false)` accepterar nu `isMember` parameter

**Kod (dm-session.js ~rad 3313):**
```javascript
const removeBtn = isCampaignMember
    ? `<button class="remove-btn" onclick="removeSessionPlayer(${i}, true)" title="Force remove">&times;</button>`
    : `<button class="remove-btn" onclick="removeSessionPlayer(${i})">&times;</button>`;
```

---

## Session 2026-01-23 (fortsättning 3)

### Melee Abilities Balansering

**Problem:** Abilities hade checks som krävde skills klassen inte hade från start.

**Lösning steg 1 - Ändrade checks:**

| Klass | Ability | Gammalt | Nytt |
|-------|---------|---------|------|
| Warrior | Me First | Initiative | Athletics |
| Warrior | Shield Wall | Defense | Toughness |
| Thief/Rogue | Awareness | Third Eye | Perception |
| Outcast | Wilderness Survival | Survival | Nature |
| Outcast | Street Smarts | Insight | Investigation |
| Outcast | Unseen Ally | Animal Handling | Nature |
| Outcast | Improvised Weaponry | Unarmed | Strength |
| Outcast | Resilient Spirit | Endurance | Toughness |
| Outcast | Counterculture | History | Investigation |
| Outcast | Blend In | Deception | Stealth |
| Outcast | Iron Will | Endurance | Toughness |
| Outcast | Dirty Fighting | Unarmed | Strength |
| Outcast | Underground Network | Insight | Investigation |
| Outcast | Endure Elements | Survival | Toughness |
| Outcast | Adapt | Intelligence | Investigation |

**Lösning steg 2 - Balanserade success-krav:**
- **1 success** = Normal abilities
- **2 success** = Kraftfulla abilities (AoE, osynlighet, extra damage, etc.)
- Tog bort alla 3 success krav

**Uppdaterade filer:**
- `html/data/spells.js` - Alla ability checks och success-krav
- `html/dm-session.html` - Reference-tabeller för abilities

---

### Worthiness Uppdateringar

**Nya beskrivningar för 0 och 1-2:**
| Värde | Gammalt | Nytt |
|-------|---------|------|
| 0 | Nobody | Unremarkable |
| 1-2 | Unknown | Stranger |

**DM Cheat Sheet:**
Lade till Worthiness-kort i Reference-fliken med komplett skala.

---

### Onboarding Guide

**Ny notis för solo-spelare:**
Lade till fotnot efter steg 9:
> 📝 No DM? You can still distribute points and pick abilities – just skip the lock steps (5 & 7).

**Buggfix:** `checkStepAttributes()` markerade steg 6 som klart innan steg 5 var klart.
- Orsak: `baseAttributeValues` var tomt innan race/class låstes
- Fix: Lade till `if (!raceClassLocked) return false;`

---

## Session 2026-01-23 (fortsättning 2)

### Worthiness Extremvärden

**Separerade beskrivningar för +9/+10 och -9/-10:**

| Värde | Kort (dashboard.js) | Lång (sliders.js) |
|-------|---------------------|-------------------|
| +10 | Esteemed | "You are highly esteemed and treated with great respect everywhere" |
| +9 | Trustworthy | "You seem trustworthy and are welcomed in most cities" |
| -9 | Hunted | "You are hunted from cities and have wanted posters up" |
| -10 | Public Enemy | "You are a public enemy, actively hunted with a bounty on your head" |

**Ändrade filer:**
- `html/js/dashboard.js` - `getSimpleWorthiness()`
- `html/js/sliders.js` - `getWorthinessDescription()`

---

## Session 2026-01-23 (fortsättning)

### Quick Status & Worthiness i Quick Actions

**Ny status-visning på mobil/tablet i Quick Actions-raden:**

1. **Status (mobile/tablet)**
   - Visar `Status: ✓ OK` eller `Status: 🩸X 😫Y`
   - Grön när inga conditions, röd bakgrund vid bleed/weak
   - Element: `#quick-status` med `.mobile-only` class

2. **Worthiness (mobile/tablet + desktop)**
   - Mobil: Ny box `Worth: Trustworthy` i Quick Actions-raden
   - Desktop: Förenklad text i stat-adjust-row: `⭐ Worth +5 (Ordinary)`
   - Färgkodad: grön för positiv, röd för negativ

**Förenklade worthiness-beskrivningar:**
| Värde | Text |
|-------|------|
| 10 | Esteemed |
| 9 | Trustworthy |
| 7-8 | Respected |
| 5-6 | Ordinary |
| 3-4 | Watched |
| 1-2 | Stranger |
| 0 | Unremarkable |
| -1 to -2 | Distrusted |
| -3 to -5 | Bad Rep |
| -6 to -8 | Notorious |
| -9 | Hunted |
| -10 | Public Enemy |

**Implementation:**

1. **HTML (character-sheet.html)**
   - `#quick-status` - Status i Quick Actions (mobile-only)
   - `#quick-worthiness` - Worth i Quick Actions (mobile-only)
   - `#quick-worth-desc` - Beskrivning i desktop stat-adjust-row
   - `#status-worthiness-desc` - Beskrivning i status bar (desktop)

2. **CSS (styles.css ~rad 8850-8910)**
   - `.mobile-only` - Gömd på desktop, flex på ≤1024px
   - `.action-status`, `.action-worth` - Styling för Quick Actions
   - `.worth-positive`, `.worth-negative` - Färgkodning
   - `.stat-adjust-desc` - Beskrivning i desktop Worth-rad

3. **JavaScript (dashboard.js)**
   - `getSimpleWorthiness(value)` - Returnerar förenklad text
   - Uppdaterar `#quick-status`, `#quick-worthiness`, `#quick-worth-desc`

---

### Borttaget från Desktop Sidebar

**Quick Actions** och **Resources** borttagna från desktop sidebar:

1. **Quick Actions** - Tog bort hela sektionen (Rest, Half Rest, Potion, Dice)
2. **Resources** - Tog bort HP, Arcana, Willpower, Worthiness bars

**Anledning:** Dubblering - samma info finns i status bar och dashboard.

---

## Session 2026-01-23

### Mobile Tab Toggle (Floating Side Menu)

**Ny flytande sidomeny för mobilnavigation:**

Ersätter den horisontella tab-raden på mobil med en diskret toggle-knapp på höger sida av skärmen.

**Visuell design:**
```
┌─────────────────────────────┐
│     [Karaktärsinnehåll]    ◀│ ← Pil i mitten på höger kant
└─────────────────────────────┘

Efter tryck på ◀:
┌─────────────────────────────┐
│                    ┌────────┤
│                    │Overview│
│                    │  ...  ▶│ ← Panel glider in från höger
│                    │ Tools  │
│                    └────────┤
└─────────────────────────────┘
```

**Implementation:**

1. **HTML (character-sheet.html)**
   - `#mobile-tab-toggle` - Flytande pil-knapp (fixed right, 50% top)
   - `#mobile-tab-panel` - Sidopanel med alla 7 tabs
   - `#mobile-tab-overlay` - Mörk bakgrund när öppen

2. **CSS (styles.css ~rad 8685)**
   - Endast synlig på mobil (`@media max-width: 480px`)
   - Döljer original `.tab-container` på mobil
   - Smooth slide-in animation (0.3s ease)
   - Active state med lila accent

3. **JavaScript (inline i character-sheet.html)**
   - `toggleMobileTabMenu()` - Öppnar/stänger panelen
   - `closeMobileTabMenu()` - Stänger panelen
   - `switchTabMobile()` - Byter tab och stänger panel
   - Wrapper för `switchTab()` som uppdaterar active state

**Fördelar:**
- Sparar vertikal plats på mobil
- Alltid tillgänglig oavsett scroll-position
- Diskret när stängd

---

### Compact Collapsed Sections

**Sektioner tar nu mindre plats när de är ihopfällda:**

Gäller alla `.section.collapsible` och `.attribute-section.collapsible` på mobil/tablet (≤1024px).

**CSS-ändringar (styles.css ~rad 1815 och ~1900):**
```css
.section.collapsible.collapsed {
    padding: var(--space-2);
    margin-bottom: var(--space-2);
}

.section.collapsible.collapsed .section-title {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
}
```

**Undantagna (ej collapsible):**
- Quick Actions (Overview)
- Character Info (Character)

---

## Session 2026-01-22 (fortsättning 3)

### Trash Bin UI

**Visuellt gränssnitt för att hantera borttagna items:**

1. **Character Sheet (character-sheet.html)**
   - Ny knapp "Trash" i Cloud-dropdown (visas när inloggad)
   - Modal `#trash-modal` visar borttagna karaktärer
   - Restore-knapp (grön) och Delete-knapp (röd)

2. **DM Session (dm-session.html)**
   - Ny knapp "Trash" i server-dropdown
   - Modal `#dm-trash-modal` visar borttagna kampanjer OCH sessioner
   - Samma restore/delete funktionalitet

3. **JavaScript-funktioner:**
   - `showTrashModal()`, `hideTrashModal()`, `loadTrashCharacters()`
   - `restoreCharacter()`, `permanentDeleteCharacter()`
   - `showDMTrashModal()`, `hideDMTrashModal()`
   - `loadTrashCampaigns()`, `loadTrashSessions()`
   - `restoreCampaign()`, `permanentDeleteCampaign()`
   - `restoreSession()`, `permanentDeleteSession()`

---

### Borttaget: First Time Welcome Box

Tog bort den gamla "First time here?" välkomstrutan från Overview/Dashboard eftersom den ersatts av den nya onboarding-sidebaren.

**Borttagna filer/kod:**
- HTML: `#first-time-box` element
- JS: `initFirstTimeBox()`, `dismissFirstTimeBox()`, `showFirstTimeGuide()` (dashboard.js)
- CSS: `.first-time-box` och relaterade styles

---

### Fix: Share Modal Visade Inte Spelare

**Problem:** Share-modalen i DM Session visade "No players have joined yet" trots att spelare hade gått med.

**Orsak:** API:n `/api/campaigns/:id/players` returnerar `{ players: [...], isDM: bool }` men frontend förväntade sig en ren array.

**Fix (dm-session.js):**
```javascript
// Före
const players = await res.json();
renderSharePlayersList(players);

// Efter
const data = await res.json();
renderSharePlayersList(data.players || []);
```

---

## Session 2026-01-22 (fortsättning 2)

### Soft Delete / Trash System

**Implementerat mjuk borttagning för återställning:**

1. **Databas (via API)**
   - Nya kolumner: `deleted_at` TIMESTAMP på characters, campaigns, sessions
   - 39 SELECT-queries uppdaterade med `AND deleted_at IS NULL`
   - 5 DELETE-operationer ändrade till UPDATE med `deleted_at = CURRENT_TIMESTAMP`

2. **API Endpoints (server.js)**
   | Endpoint | Metod | Beskrivning |
   |----------|-------|-------------|
   | `/api/trash/characters` | GET | Lista borttagna karaktärer |
   | `/api/trash/characters/:id/restore` | POST | Återställ karaktär |
   | `/api/trash/characters/:id` | DELETE | Permanent borttagning |
   | `/api/trash/campaigns` | GET | Lista borttagna kampanjer |
   | `/api/trash/campaigns/:id/restore` | POST | Återställ kampanj |
   | `/api/trash/campaigns/:id` | DELETE | Permanent borttagning |
   | `/api/trash/sessions` | GET | Lista borttagna sessioner |
   | `/api/trash/sessions/:id/restore` | POST | Återställ session |
   | `/api/trash/sessions/:id` | DELETE | Permanent borttagning |

---

### Item Duplication Fix (DM Session)

**Problem:** Items som var länkade till encounters visades BÅDE under encounter OCH som standalone items.

**Fix (dm-session.js):**
```javascript
// Samla items som visas inuti encounters
const itemsInEncounters = new Set();
linkedEnc.forEach(enc => {
    const encItems = findItemsForEncounter(enc);
    encItems.forEach(item => itemsInEncounters.add(item.name));
});

// Filtrera bort items som redan visas i encounters
const linkedItems = group.items.filter(i =>
    i.plannedLocation === place.name && !itemsInEncounters.has(i.name)
);
```

**Fixade ställen:**
- Planning Day View: `linkedItems` (~rad 2127)
- During Play: `linkedItems` (~rad 2850)

---

### Onboarding Guide

**Ny guide-sidebar för nya användare:**

1. **HTML (character-sheet.html)**
   - Desktop sidebar: `#onboarding-sidebar` (300px, fixed left)
   - Mobile panel: `#onboarding-mobile` (collapsible top)
   - Help button: `.onboarding-help-btn` (? i header)

2. **CSS (styles.css ~rad 8340-8670)**
   - `.onboarding-sidebar` - Desktop sidebar styling
   - `.onboarding-mobile` - Mobil panel styling
   - `.onboarding-step` - Steg med nummer, titel, beskrivning
   - `.onboarding-step.completed` - Grön checkmark
   - `.onboarding-step.current` - Lila highlight
   - `.onboarding-tip` - Tips-sektion med lila accent

3. **JavaScript (main.js ~rad 2225-2395)**
   | Funktion | Beskrivning |
   |----------|-------------|
   | `initOnboarding()` | Initierar guide vid sidladdning |
   | `showOnboarding()` | Visar sidebar/panel |
   | `hideOnboarding()` | Döljer temporärt |
   | `hideOnboardingPermanent()` | Döljer permanent (localStorage) |
   | `updateOnboardingProgress()` | Auto-check alla steg (1 sek intervall) |
   | `checkStepRegister()` | Kontrollerar om inloggad |
   | `checkStepName()` | Kontrollerar om namn ifyllt |
   | `checkStepSave()` | Kontrollerar om sparad till cloud |
   | `checkStepRaceClass()` | Kontrollerar ras/klass val |
   | `checkStepLockRaceClass()` | Kontrollerar R/C lås |
   | `checkStepAttributes()` | Kontrollerar attribut |
   | `checkStepLockAttributes()` | Kontrollerar attr lås |
   | `checkStepCampaign()` | Kontrollerar kampanj-länk |
   | `checkStepOverview()` | Kontrollerar Overview-tab besökt |

**9 Steg:**
1. Register an account (Cloud → Register)
2. Enter your name (Character tab → Character Name)
3. Save to cloud (Cloud → Save to Cloud)
4. Choose race, class, religion
5. Lock race & class
6. Distribute attribute points (Stats tab)
7. Lock attributes
8. Join a campaign (Character tab → Link to Campaign)
9. Go to Overview and enjoy your game!

**Tip:** "Explore the other tabs to discover where everything is!"

**Layout fix:** `body.onboarding-active .app-wrapper { margin-left: 300px; width: calc(100% - 300px); }`

---

## Session 2026-01-22

### Abilities Lock System

**Implementerat komplett lås-system för abilities:**

1. **API (server.js)**
   - Lagt till `abilities_locked` kolumn i databas
   - Nytt endpoint: `POST /api/characters/:id/lock-abilities`
   - Uppdaterat unlock endpoint med `unlock_abilities`
   - Alla queries inkluderar `abilities_locked`

2. **Frontend (main.js)**
   - Ny variabel `abilitiesLocked`
   - Ny funktion `lockAbilities()`
   - Ny funktion `updateAbilitiesBadge()`
   - Ny funktion `updateAttributesProgressionMsg()`
   - Uppdaterat `applyLockState()` för att disable:a spell-dropdowns

3. **HTML (character-sheet.html)**
   - Lagt till `#lock-abil-icon` i progression-bar
   - Lagt till `#abil-locked-badge` vid Abilities-titel
   - Lagt till `#abilities-progression-msg` för stegmeddelanden
   - Lagt till `#attributes-progression-msg` för stegmeddelanden

4. **CSS (styles.css)**
   - Styling för `#abil-locked-badge`
   - Styling för `.progression-message`
   - Responsiv design för mobil

5. **DM Session (dm-session.js)**
   - Uppdaterat unlock modal med 4 val: Race/Class, Attributes, Abilities, All
   - Player cards visar abilities lock status
   - Varningsruta för olåsta saker

### Flow
```
Race/Class locked → Attributes locked → Abilities locked
       ↓                   ↓                  ↓
    Step 1              Step 2             Step 3
    Message:            Message:           Message:
    "Select race..."    "Distribute..."    "Select abilities..."
```

**Purpose:** The lock system is a **campaign tool** to prevent cheating. Once locked, choices are permanent and only the DM can unlock.

**Requirements:**
- Lock system **requires cloud save** - does not work offline
- User must manually click "☁️ Save to Cloud" first time to enable locks
- After first save, autosave keeps character synced automatically

---

### Cloud Autosave Indicator

**Visuell feedback vid autosave:**

1. **HTML (character-sheet.html)**
   - Nytt element `#cloud-save-indicator` med moln-ikon

2. **JavaScript (main.js)**
   - Ny funktion `showCloudSaveIndicator(status)`
   - Integrerat i `debouncedCloudSave()`

3. **CSS (styles.css)**
   - Positionerad fixed i nedre högra hörnet
   - Animerad pulsering vid sparning
   - Responsiv för mobil (högre upp, mindre storlek)

---

### DM Session Förbättringar

1. **Unlock Modal**
   - 5 knappar: Race/Class, Attributes, Abilities, All, Cancel
   - Flex-wrap för mobilkompatibilitet
   - Cancel-knapp på egen rad

2. **Player Card Layout**
   - Varningsruta för olåsta saker (röd)
   - Kompakt lock-status visning
   - Förbättrad mobillayout

---

### Help Section Update

**Tools > Help uppdaterad:**
- Step 7: "Lock Attributes" → nämner att Abilities-tab låses upp
- Step 8: "Choose & Lock Abilities" → beskriver att man ska låsa abilities

---

### Mobilkompatibilitet

**Kontrollerat och fixat:**
- Progression messages har mobil-styling
- Abilities badge responsiv
- Cloud save indicator placerad ovanför bottom nav
- DM unlock modal flex-wrap
- DM player card kompakt layout

---

### Enhetliga Varningsmeddelanden

**Alla varningar använder nu samma stil:**
- ⚠️ ikon för varningar (istället för 🔓)
- Konsekventa meddelanden på alla ställen

| Plats | Format |
|-------|--------|
| Badges | `⚠️ Lock X first` |
| Progression | `📋 Step X: Go to Y tab, do Z, then lock.` |
| DM Session | `⚠️ Not locked: X, Y, Z` |

---

### Autosave Förbättrad

**Ändrat från debounced till intervall-baserad:**

| Före | Efter |
|------|-------|
| Debounced 3 sek | Intervall 5 sek |
| Endast input/change events | Kontrollerar ALL data |
| Kunde missa slider-ändringar | Fångar alla ändringar |

**Nya funktioner (main.js):**
- `checkAndSaveToCloud()` - Kontrollerar och sparar
- `startAutoSave()` - Startar intervall
- `stopAutoSave()` - Stoppar intervall

---

### Startvapen Fixar (races.js)

**Problem funna och fixade:**

| Ras | Före | Efter | Anledning |
|-----|------|-------|-----------|
| Halfling | Staff | Sling | "Staff" fanns inte i vapenlistan, Sling undviker överlapp med Thief/Rogue |
| Moon Elf | Short Sword | Shortsword | Stavningsfix (ett ord) |

**Verifierat:** Inga överlappningar mellan ras- och klassvapen.

---

### Read-Aloud Linking System (dm-session.js)

**Read-Aloud kan nu länkas till:**
- 📍 Places
- ⚔️ Encounters
- 👤 NPCs

**Data-struktur:**
```javascript
sessionData.readAloud[] = {
    title: "...",
    text: "...",
    read: false,
    day: 1,
    time: "evening",
    linkedType: "place",  // "place" | "encounter" | "npc" | null
    linkedTo: "Tavern"    // Namnet på platsen/encounter/npc
}
```

**Rendering:**
- Read-Aloud visas nästlade under sin länkade parent i Planning Day View
- Knappar för att lägga till Read-Aloud direkt på encounters och NPCs

---

### Day/Time Organization (dm-session.js)

**Planning organiserad efter:**
1. Dag (Day 1, Day 2, ...)
2. Tid på dagen (Dawn → Morning → Noon → Afternoon → Dusk → Evening → Night)

**TIME_ORDER konstant:**
```javascript
const TIME_ORDER = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'evening', 'night'];
```

**Clear Planning funktion:**
- Knapp i Planning-toolbar
- Tar bort alla: Places, Encounters, NPCs, Items, Read-Aloud
- Kräver bekräftelse

---

### Encounter Participants System (dm-session.js)

**Utökad enemy/participant-struktur:**

| Fält | Typ | Beskrivning |
|------|-----|-------------|
| `name` | text | "Bandit", "Vince Niel" |
| `disposition` | dropdown | enemy / neutral |
| `role` | dropdown | Warrior/Rogue/Mage/Healer/Ranger/Beast/Civilian/Historian/Other |
| `hp` | text | Nuvarande HP |
| `maxHp` | text | Max HP (sätts automatiskt) |
| `armor` | text | Rustning |
| `weapon` | text | Vapen |
| `atkBonus` | text | Attack bonus |
| `dmg` | text | Skada |

**HP-hantering i During Play:**
- Klickbara **[-]** och **[+]** knappar
- Visuell HP-bar (current/max)
- Färgkodning:
  - Grön (≥50% HP)
  - Gul (1-49% HP)
  - Röd + 💀 (0 HP) - genomstruken text, nedsatt opacity

**Rendering i Planning Day View:**
- Visar "X enemy, Y neutral" istället för bara "X enemies"
- Visar döda deltagare med 💀

---

### AI Assistant Förbättringar (dm-session.js)

**Nya funktioner implementerade:**

1. **Smartare Parser (`parseAIImport`)**
   - Metod 1: Letar efter `---IMPORT_START---` / `---IMPORT_END---` markers
   - Metod 2: Letar efter JSON-kodblock (\`\`\`json ... \`\`\`)
   - Metod 3: Letar efter rå JSON-objekt med kända nycklar
   - Städar bort vanliga JSON-fel (trailing commas, smart quotes)
   - Visar tydliga felmeddelanden vid parse-problem

2. **Quick Actions (~rad 3839)**
   - 👤 Random NPC - genererar prompt för en intressant NPC
   - ⚔️ Random Encounter - genererar prompt för stridsencounter
   - 🏰 Describe Location - genererar prompt för atmosfärisk platsbeskrivning
   - 📜 Session Recap - genererar prompt för session-sammanfattning

3. **Import Validering**
   - Kontrollerar vapen/rustning mot spelets data
   - Visar varningar för okända vapen/rustningar
   - Tillåter fortfarande import med manuell justering

4. **Selektiv Import**
   - Checkboxar för varje item i preview
   - "Select All" / "Select None" knappar
   - Räknar importerade vs överhoppade items
   - Lägger till items (ersätter inte befintliga)

**Bugfix:** Tog bort duplikata `renderReadAloudList`, `addReadAloud`, `removeReadAloud` funktioner som använde gammal `readAloudText` array istället för nya `readAloud` array.

---

## Tekniska Beslut

### Lås-ordning
Beslut: Strikt ordning Race/Class → Attributes → Abilities
- Abilities disabled tills attributes är låsta
- Förhindrar att spelare väljer abilities utan att ha attribut klara

### Progression Messages
Beslut: Samma meddelande visas på BÅDE Attributes OCH Abilities sidan
- Användaren ser alltid var de är i flödet
- Tydlig guidance oavsett vilken tab man är på

### DM Unlock
Beslut: DM kan låsa upp individuella delar ELLER allt
- Flexibilitet för olika situationer
- "All" för snabb unlock av hela karaktären

---

## Planerade Features

### DM Give Item to Player Inventory
**Status:** ✅ Implementerad

När DM väljer "Given to: [Spelare]" i During Play läggs itemet automatiskt till spelarens Quest Items i Gear-fliken.

**Implementation:**

1. **Character Sheet (character-sheet.html)**
   - Ny sektion "🗝️ Quest Items" i Gear-fliken
   - Visar items med namn, beskrivning och datum

2. **Character Sheet JS (main.js)**
   - `renderQuestItems(questItems)` - Renderar quest items från `charData.quest_items[]`
   - Anropas vid `loadCharacterById()`

3. **API (server.js)**
   - `POST /api/dm/characters/:id/give-item`
   - Body: `{ name, description, campaign_id }`
   - Lägger till i `charData.quest_items[]` med `givenAt` datum

4. **DM Session (dm-session.js)**
   - `giveItemToPlayer(itemIndex, playerName)` - Anropar API
   - Alla "Given to" dropdowns anropar `giveItemToPlayer()` när värde väljs

**Data-struktur:**
```javascript
charData.quest_items = [
    { name: "Ancient Key", description: "Opens the crypt door", givenAt: "2026-01-22" }
]
```

---

### During Play Strukturförändring

**During Play matchar nu Planning-strukturen:**

Tidigare (flat):
```
Day 1
  ├── Places (lista)
  ├── Encounters (lista)
  ├── Read-Aloud (lista)
  ├── NPCs (lista)
  └── Items (lista)
```

Nu (nästlad):
```
Day 1
  ├── 🌅 Dawn
  │   └── [Platser med nästlat innehåll]
  ├── ☀️ Morning
  │   └── The Rusty Anchor (Place)
  │       ├── 📖 Entering the Tavern (Read-Aloud)
  │       └── 👤 Old Marta (NPC)
  ├── 🌆 Dusk
  │   └── Forest Road (Place)
  │       └── ⚔️ Bandit Ambush (Encounter)
  │           ├── [Participants med HP-knappar]
  │           ├── 📜 Aldrich's Diary (Item)
  │           └── 📜 Rusty Key (Item)
  └── ⏰ No specific time
      └── [Olänkat innehåll]
```

**Nya funktioner i dm-session.js:**
- `renderPlayTimeGroup(time, group, day)` - Renderar en tidsgrupp
- `renderPlayPlaceWithLinkedContent(place, group, day)` - Renderar en plats med nästlat innehåll
- `renderPlayUnlinkedContent(encounters, readAloud, npcs, items, day)` - Renderar olänkat innehåll
- `renderPlayEncounter(enc, linkedRA, linkedItems)` - Renderar encounter med HP-knappar
- `renderPlayReadAloud(ra)` - Renderar Read-Aloud med checkbox
- `renderPlayNPC(npc, linkedRA)` - Renderar NPC med checkbox
- `renderPlayItem(item)` - Renderar item med found-checkbox och "Given to"
- `renderPlayItemInline(item)` - Renderar item inline (i encounter loot)

**HP-knappar fix:**
- `adjustParticipantHP(encIndex, enemyIndex, delta, refreshModal = false)` har ny parameter
- HP-knappar i timeline använder `event.stopPropagation()` och öppnar inte modal
- HP-knappar i modal skickar `refreshModal = true` för att uppdatera modalen

---

## Kända Begränsningar

1. **Abilities kan inte väljas offline** - Kräver cloud-sparad karaktär
2. **Ingen undo för lock** - Endast DM kan låsa upp
3. **Max 10 spells/abilities** - Hårdkodat i applyLockState loop

---

### Player View Summary Fix (API)

**Problem:** När DM låste en session visades ALLA NPCs, encounters, items, places för spelaren - inte bara de markerade.

**Orsak:** Fallback-logik i `generateSessionSummary()` (server.js) som visade allt om inga items var markerade:
```javascript
// BORTTAGET - visade alla items vid locked session om inga markerade
if (isLocked) {
    if (usedNPCs.length === 0 && (data.npcs || []).length > 0) {
        usedNPCs = (data.npcs || []).filter(npc => npc.name);
    }
    // ...samma för places, encounters, items
}
```

**Fix:** Tog bort fallback-logiken. Nu visas endast markerade items oavsett session-status:
- NPCs med `status === 'used'`
- Places med `visited === true`
- Encounters med `status === 'completed'`
- Items med `found === true`

---

### Session Prolog Feature

**Läsbar introduktion för spelare vid sessionsstart:**

1. **Planning Tab (dm-session.html)**
   - Ny sektion "Session Prolog" efter Hook/Goal
   - Textarea för att skriva prologen
   - Knapp "✨ Generate Prolog with AI" för AI-generering

2. **During Play Tab (dm-session.html)**
   - Read-only visning av prologen (om den finns)
   - Blå gradient-bakgrund med vänster border
   - Visas mellan Session Goal och Session Timeline

3. **Player View (dm-session.js)**
   - Prologen visas i session summary för spelare
   - Samma styling som During Play

4. **AI Quick Action (dm-session.js)**
   - Ny knapp "📖 Session Prolog" i AI Assistant Quick Actions
   - Öppnar modal för att välja vilken session att basera prologen på
   - `showPrologSessionModal()` - visar sessionsväljare
   - `generatePrologFromSelectedSession()` - hämtar vald session och genererar prompt
   - `generatePrologPrompt(sourceData, sourceSessionNumber)` - bygger AI-prompten
   - Inkluderar: events, turning points, NPCs, places, encounters från vald session

5. **API (server.js)**
   - `generateSessionSummary()` inkluderar nu `prolog` field

**Data-struktur:**
```javascript
sessionData.prolog = "Last time, our heroes...";
```

---

### DM Session Help Tab

**Ny flik "Help" i DM Session tool (dm-session.html):**

Placering: Efter "Summary" i tab-navigationen

**Innehåll:**
1. **Quick Overview** - Alla 6 flikar förklarade
2. **Recommended Workflow** - 3-stegs process (före/under/efter session)
3. **Planning Tab** - Hook, Prolog, Day/Time, Places, NPCs, Encounters, Items, Read-Aloud
4. **During Play Tab** - Timeline, HP-tracking, Item-giving, Event Log, Turning Points
5. **AI Assistant** - Quick Actions och Import
6. **Player View & Sharing** - Invite, vad spelare ser, Locking
7. **Tips** - 7 praktiska tips

**Implementation:**
- Ny tab-knapp med frågetecken-ikon
- `switchTab('page-help')` för navigation
- Ny `<div id="page-help">` med komplett guide

---

### Character Sheet Help Rewrite

**Omskriven och utökad hjälpsektion i Tools > Help (character-sheet.html):**

**Innehåll:**
1. **Quick Overview** - PWA, offline, lock system
2. **Getting Started** - Registrering, konto, skapa karaktär
3. **The Lock System** - 3 steg med visuell numrering
4. **Tabs Overview** - Alla 6 flikar (Character, Stats, Combat, Abilities, Gear, Tools)
5. **Saving & Cloud Sync** - Auto-save, local backup, export/import, flera karaktärer
6. **Quick Actions** - Attack, Defend, Potion, Dice
7. **DM Sessions & Campaigns** - Joina campaign, länka karaktär, Player View
8. **Quest Items** - Hur DM ger items
9. **XP & Leveling** - 10 XP = 1 point
10. **Dice Roller** - 4 lägen förklarade
11. **Tips** - 6 praktiska tips
12. **Wiki Link** - Länk till wiki.aedelore.nu

**Förbättringar jämfört med tidigare:**
- Mer kompakt layout
- Tydligare struktur med färgkodade rubriker
- Alla funktioner dokumenterade
- DM Session integration förklarad

---

## Session 2026-01-22 (fortsättning)

### Theme Checkmark Fix
**Problem:** Alla teman visade gröna bockar samtidigt.
**Orsak:** HTML-elementens `<span class="theme-check">` saknade ID:n som JavaScript förväntade sig.
**Fix:** Lade till ID:n: `theme-check-aedelore`, `theme-check-midnight`, `theme-check-dark-glass`, `theme-check-ember`.

---

### Avatar Persistence Fix
**Problem:** Avatarer återställdes till första bokstaven i namnet vid sidladdning.
**Orsak:** `updateDashboard()` i dashboard.js skrev över avataren utan att kontrollera om en custom avatar fanns.
**Fix:** Anropar `applyAvatar()` efter att placeholder satts.

---

### Mobile Menu Collapsible Sections
**Nytt:** Menu/Cloud/Theme-sektioner i hamburgermenyn är nu ihopfällbara på mobil.

**CSS (styles.css):**
- `.dropdown-menu` har `max-height: 0` som default
- `.dropdown.open .dropdown-menu` får `max-height: 500px`
- Smooth transition med opacity och visibility

**JavaScript (main.js):**
- Click handler exkluderar `.dropdown-trigger` från att stänga menyn

---

### GitHub Repository Setup
**Repository:** https://github.com/TubalQ/aedelore-rpg-tools

**Skapade filer:**
- `.gitignore` - Exkluderar Claude/, .claude/, CLAUDE.md, api/data/, .env
- `README.md` - Projektdokumentation med länkar till aedelore.nu, wiki, character-sheet, dm-session
- `LICENSE` - MIT License med Attribution Requirement

**Git config:**
- User: TubalQ
- Email: tubalqayinn@protonmail.com

---

### 403 Forbidden Fix (nginx)
**Problem:** 403-fel vid åtkomst från iPhone.
**Orsak:** `try_files` hittade inte index.html för rot-pathen.
**Fix:** Lade till explicit `location = /` block i nginx.conf:
```nginx
location = / {
    try_files /index.html =404;
}
```

---

### Starting Equipment Fixes

**Potions:**
- Alla karaktärer startar nu med 3 av varje potion (Adrenaline, Antidote, Poison)
- Fixade `value="0"` → `value="3"` i HTML-sliders

**Armor (classes.js):**
| Klass | Före | Efter |
|-------|------|-------|
| Thief/Rogue | Saknade head och shoulders | Lade till Cloth Hood, Cloth Mantle |
| Outcast | Saknade legs | Lade till Cloth Pants |

**Code (character-sheet.html):**
```javascript
// Stöd för head armor i autoFillStartingEquipment()
if (armorData.head) {
    const headField = document.getElementById('armor_1_type');
    if (headField) {
        headField.value = armorData.head;
        headField.dispatchEvent(new Event('change'));
    }
}
```

---

### Other Game Systems - Sidebar Fix
**Problem:** Sidebar fungerade inte för D&D 5e, Pathfinder 2e, Storyteller, Chronicles of Darkness.
**Orsak:** Sidebaren är designad specifikt för Aedelore-systemet.
**Beslut:** Minimal fix - dölj sidebar för andra system istället för full integration.

**Fix (system-selector.js):**
```javascript
// För Aedelore: visa sidebar
if (config.useExistingSheet) {
    if (sidebar) sidebar.style.display = '';
    if (sidebarToggle) sidebarToggle.style.display = '';
    return;
}

// För andra system: dölj sidebar
if (sidebar) sidebar.style.display = 'none';
if (sidebarToggle) sidebarToggle.style.display = 'none';
```

---

## Service Worker Versioner

| Version | Datum | Ändringar |
|---------|-------|-----------|
| v263 | 2026-01-25 | Logout: Spara ändringar + rensa cache + reload |
| v262 | 2026-01-25 | Player Summary: Personlig loot-filtrering (spelare ser bara sin egen loot) |
| v261 | 2026-01-25 | Player Sync: Dubblettprevention via karaktärsnamn-matchning |
| v260 | 2026-01-25 | During Play: Item location locking (actualLocation) + Items-lista filtrering |
| v259 | 2026-01-25 | During Play: Item location locking (initial implementation) |
| v258 | 2026-01-25 | During Play: Completed items rendered only once (first location) |
| v257 | 2026-01-24 | Quest Items Sync: Transaktioner, dublettkontroll, remove-item endpoint, spåra omtilldelning, databasrensning |
| v256 | 2026-01-24 | Quest Items: Initiala bugfixar för tilldelning |
| v255 | 2026-01-24 | Quest Items: Authorization och player matching |
| v254 | 2026-01-24 | Onboarding: Dold för inloggade användare (kan öppnas manuellt via help-knapp) |
| v253 | 2026-01-24 | Weapons Mobile Labels: Rättade CSS-labels för mobilvy (Atk Bonus, Damage, Break istället för Damage, Hands, Special) |
| v252 | 2026-01-24 | Quest Items Server-side Merge: API behåller quest_items från DB vid PUT, klient kan inte skriva över |
| v251 | 2026-01-24 | Quick Stats Synk: Lagt till updateDashboard() i setAllFields() och autoFillAttributes() för att synka direkt |
| v250 | 2026-01-24 | Privacy Banner: Modal-design på mobil istället för bottom bar, större knappar (44px), centrerad popup |
| v249 | 2026-01-24 | Quick Stats Synkroniseringsfix: Lagt till Third Eye, utökat watchFields med alla skills för realtidsuppdatering |
| v248 | 2026-01-24 | Quest Items Buggfix: getAllFields() inkluderar nu quest_items från window._questItems så de inte försvinner vid autosave |
| v247 | 2026-01-24 | Mobile Tab Menu: Swipe-gest tillagd som alternativ till toggle-knappen (swipe från höger kant inåt öppnar, swipe höger stänger) |
| v246 | 2026-01-24 | Frontend Error Logging: Ny error-logger.js för att fånga JS-fel, API endpoint /api/errors, metrics-integration |
| v242 | 2026-01-24 | Onboarding: Anpassning för andra spelsystem - tar bort steg 4-7 från DOM, omnumrerar 8-10 till 4-6, dm-session informativt |
| v235-241 | 2026-01-24 | Iterationer för onboarding system-anpassning |
| v234 | 2026-01-24 | Auto-Refresh: 150ms delay för säkerhet mot dataförlust |
| v233 | 2026-01-24 | Auto-Refresh: Automatisk uppdatering vid tab-byte (Gear, Overview) och visibility change |
| v232 | 2026-01-23 | Password Reset: E-postbaserad lösenordsåterställning, email-fält vid registrering, confirm password, forgot password modal, My Data email management |
| v231 | 2026-01-23 | CSS fix: input[type="email"] styling (bas, :hover, :focus) |
| v230 | 2026-01-23 | Password Reset: Initial implementation (api endpoints, email module, reset-password page) |
| v229 | 2026-01-23 | Success levels: Nya trösklar 1-4 fail, 5-6 barely, 7-9 success, 10 crit (D10). Uppdaterat D12/D20 proportionellt |
| v228 | 2026-01-23 | DM Lock Management: Toggla lås (både låsa och låsa upp) för R/C, Attr, Abil |
| v227 | 2026-01-23 | Fix: Abilities läses från spell_X_type (inte spell_X) |
| v226 | 2026-01-23 | View Player Build: Visar alla attribut med sub-skills grupperat |
| v225 | 2026-01-23 | View Player Build: Förbättrad modifier-visning |
| v224 | 2026-01-23 | DM View Player Build: Ny 📊-knapp för att se spelarens attribut och abilities |
| v223 | 2026-01-23 | Number input spinner fix: Döljer webbläsarens inbyggda upp/ner-pilar på desktop (endast custom +/− knappar visas) |
| v222 | 2026-01-23 | Trafiksäkerhet: Server timeouts, nginx rate limiting, request limits, filrättigheter |
| v221 | 2026-01-23 | Säkerhetsfixar: Input validation, IDOR fix, XSS fixes, eval() ersatt med safeMathEval() |
| v220 | 2026-01-23 | Status bar box sizing: Alla boxar samma storlek på mobil (min-height 52px, dölj Worth-beskrivning) |
| v219 | 2026-01-23 | Quick Actions färger: Half Rest (cyan), Status (grön/röd), Worth (amber/grön/röd) med tema-variabler |
| v218 | 2026-01-23 | Status bar: Dold på desktop (>1024px), synlig på mobil/tablet (≤1024px) |
| v217 | 2026-01-23 | Fler teman: Blood, Necro, Royal, Crimson (totalt 12 teman nu) |
| v216 | 2026-01-23 | Nya teman: Forest, Frost, Void, Pure Darkness |
| v215 | 2026-01-23 | Onboarding: Nytt steg 9 "View campaign details" (Cloud → DM Session), steg 10 är nu "Go to Overview" |
| v214 | 2026-01-23 | Campaign player sync fix: Tar bort spelare som inte längre finns i kampanjen. Manual remove override för alla spelare |
| v202 | 2026-01-23 | Worthiness extremvärden: +10 Esteemed, -10 Public Enemy (separerade från +9/-9) |
| v201 | 2026-01-23 | Quick Worthiness: Desktop Worth-rad visar förenklad text (Trustworthy, Respected, etc.) |
| v200 | 2026-01-23 | Quick Status/Worth: Mobil Quick Actions visar Status och Worth. Borttaget: Resources från sidebar |
| v199 | 2026-01-23 | Quick Status: Status-box i Quick Actions på mobil/tablet (bleed/weak visning) |
| v196-198 | 2026-01-23 | Onboarding fixes, sidebar cleanup |
| v195 | 2026-01-23 | Onboarding steg 6: Fix för attribut-tracking med getFreePointsUsed() |
| v193-194 | 2026-01-23 | Compact collapsed sections: Fixade negativ margin på section-title |
| v191-192 | 2026-01-23 | Compact collapsed sections: CSS fixes med !important |
| v190 | 2026-01-23 | Compact collapsed sections: Mindre padding/margin på ihopfällda sektioner |
| v189 | 2026-01-23 | Revert: Tog bort collapsible hero card |
| v188 | 2026-01-23 | Collapsible Hero Card (reverted) |
| v187 | 2026-01-23 | Mobile Tab Toggle: Flytande sidomeny ersätter horisontell tab-rad på mobil |
| v186 | 2026-01-22 | Fix: Share modal visade inte spelare (API returnerar objekt, inte array) |
| v185 | 2026-01-22 | Borttaget: First Time Welcome Box (ersatt av onboarding sidebar) |
| v184 | 2026-01-22 | Trash Bin UI: Modal för att visa/återställa/permanent-radera borttagna items |
| v183 | 2026-01-22 | Onboarding Guide: Steg 9 (Overview), tip-sektion, auto-check för alla steg |
| v182 | 2026-01-22 | Onboarding Guide: Ändrad subtitle text |
| v181 | 2026-01-22 | Onboarding Guide: Fix för sidebar som tryckte innehåll utanför skärmen (width: calc) |
| v180 | 2026-01-22 | Onboarding Guide: Fix för header-element shift |
| v179 | 2026-01-22 | Onboarding Guide: Ny sidebar (desktop) och panel (mobil) med 8-stegs guide för nya användare |
| v178 | 2026-01-22 | Soft Delete: Trash/restore för characters, campaigns, sessions. Item duplication fix i DM Session |
| v177 | 2026-01-22 | Other Systems: Döljer sidebar för D&D 5e, Pathfinder 2e, Storyteller, Chronicles of Darkness |
| v176 | 2026-01-22 | Thief/Rogue: Startar nu med Cloth Hood (head armor support i autoFillStartingEquipment) |
| v175 | 2026-01-22 | Starting Equipment: Potions default till 3, Thief/Rogue får Cloth Mantle, Outcast får Cloth Pants |
| v174 | 2026-01-22 | Nginx Fix: 403 Forbidden för iPhone - explicit location = / regel |
| v173 | 2026-01-22 | Mobile Menu: Click handler exkluderar dropdown-triggers från att stänga menyn |
| v172 | 2026-01-22 | Mobile Menu: Collapsible sections (Menu/Cloud/Theme) |
| v171 | 2026-01-22 | Avatar Fix: Bevarar custom avatar vid page reload |
| v170 | 2026-01-22 | Theme Checkmark: Lade till ID:n för att visa endast aktiv bock |
| v149 | 2026-01-22 | Character Sheet Help: Omskriven och utökad hjälpsektion i Tools > Help med guide för registrering, locks, tabs, cloud sync, DM sessions, quest items, XP, dice roller och tips |
| v148 | 2026-01-22 | Help-flik: Ny flik "Help" med komplett guide för DM Planning Tool |
| v147 | 2026-01-22 | Session Prolog: Sessionsväljare - kan nu välja vilken session att basera prologen på |
| v146 | 2026-01-22 | Session Prolog: Flyttade AI-knappen till AI Assistant Quick Actions |
| v145 | 2026-01-22 | Session Prolog: Ny sektion i Planning (editable), visas i During Play (read-only) och Player View |
| v144 | 2026-01-22 | Mobilkompatibilitet: HP-knappar (32px, flex-wrap), participant-rader (2-raders layout), dropdowns (större touch-area 8px padding), checkboxar (18x18px) |
| v143 | 2026-01-22 | Quest Items kompakt: flex-wrap grid, klicka för beskrivning |
| v142 | 2026-01-22 | Quest Items: Ny sektion i Gear-fliken. DM kan ge items till spelare via "Given to" → läggs till i spelarens Quest Items |
| v137 | 2026-01-22 | During Play: Matchar nu Planning-struktur med tidsgruppering (dawn→night) och nästlad visning (encounters/NPCs/items under places). HP-knappar öppnar inte längre modal. AI-instruktioner förbättrade med tydlig förklaring av dag/tid/plats-koppling |
| v136 | 2026-01-22 | During Play Session Timeline: Full HP-hantering med -5/-1/+1/+5 knappar för varje participant. Items med "Given to" dropdown när found |
| v135 | 2026-01-22 | During Play: Encounter list visar nu participants med HP-status, färgkoder, död-räkning. Item assignment med spelar-dropdown |
| v134 | 2026-01-22 | Planning: expanderad encounter/item-vy med participants, tactics, loot + item descriptions. During Play: HP-hantering + Found-checkbox för items |
| v133 | 2026-01-22 | AI loot-instruktioner: viktiga loot-items ska ha detaljerade beskrivningar i items-array |
| v132 | 2026-01-22 | Encounter participants: disposition, role, HP-hantering med +/- knappar, färgkodning |
| v131 | 2026-01-22 | AI instruktioner: single quotes för dialog, förbättrad JSON-parser |
| v121-130 | 2026-01-22 | Read-Aloud linking (place/encounter/npc), Day/Time sortering, Clear Planning |
| v109 | 2026-01-22 | AI Assistant: Smart parser, Quick Actions, Validering, Selektiv import |
| v108 | 2026-01-22 | Halfling vapen: Sling |
| v107 | 2026-01-22 | Moon Elf vapen: Shortsword, Halfling: Dagger |
| v106 | 2026-01-22 | Autosave intervall-baserad (5 sek) |
| v105 | 2026-01-22 | Enhetliga varningsmeddelanden |
| v104 | 2026-01-22 | Mobilfix för DM modal och player cards |
| v103 | 2026-01-22 | Cloud autosave indicator |
| v102 | 2026-01-22 | DM session varningar för olåsta |
| v101 | 2026-01-22 | Help section uppdaterad |
| v100 | 2026-01-22 | Progression messages på båda ställen |
| v99 | 2026-01-22 | Abilities lock system komplett |
| v98 | Tidigare | Baseline före denna session |
