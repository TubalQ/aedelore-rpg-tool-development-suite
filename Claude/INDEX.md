# Aedelore - Projektindex

Snabbreferens för alla filer och funktioner.

**OBS:** Detta är utvecklingsmiljön (`/opt/aedelore-development`).
Produktion ligger i `/opt/aedelore`.

---

## Dokumentation

| Fil | Beskrivning |
|-----|-------------|
| `Claude/INDEX.md` | Denna fil - projektstruktur |
| `Claude/MEMORY.md` | Projekthistorik och TODO-lista |
| `Claude/INSTRUCTIONS.md` | Arbetsregler och konventioner |
| `Claude/FUNCTIONS.md` | **Komplett funktionsdokumentation** (891 rader) |

**Vid refaktorering:** Se `FUNCTIONS.md` för alla funktioner, API-endpoints och integrationer.

---

## Filstruktur

```
/opt/aedelore-development/
├── api/
│   ├── server.js              # Express API backend (2863 rader, 63 endpoints)
│   ├── db.js                  # Databasanslutning och schema
│   └── email.js               # E-postmodul (nodemailer)
├── html/
│   ├── character-sheet.html   # Karaktärsblad (PWA)
│   ├── dm-session.html        # DM-verktyg
│   ├── reset-password.html    # Lösenordsåterställning
│   ├── service-worker.js      # PWA cache (version: aedelore-v285)
│   ├── manifest.json          # PWA manifest
│   ├── css/
│   │   └── styles.css         # All CSS styling
│   ├── js/
│   │   ├── main.js            # Karaktärsblad logik (3048 rader)
│   │   ├── dashboard.js       # Dashboard/Quick Actions
│   │   ├── dm-session.js      # DM Session logik (9000+ rader)
│   │   ├── spells.js          # Abilities/spells rendering
│   │   ├── weapons.js         # Vapen-hantering
│   │   ├── armor.js           # Rustnings-hantering
│   │   ├── tabs.js            # Tab-navigation
│   │   ├── sliders.js         # HP/Arcana sliders
│   │   ├── diceroller.js      # Tärningsrullning
│   │   ├── system-selector.js # Spelsystem-val
│   │   ├── privacy.js         # GDPR/Privacy
│   │   └── error-logger.js    # Frontend error logging
│   └── data/
│       ├── weapons.js         # 50+ vapen
│       ├── armor.js           # 40+ rustningar
│       ├── spells.js          # 250+ spells/abilities
│       ├── races.js           # 7 raser
│       ├── classes.js         # 6 klasser
│       ├── starting-equipment.js # 42 ras+klass kombinationer
│       ├── religions.js       # 15 religioner
│       └── npc-names.js       # NPC-namngenererare
└── Claude/
    ├── INDEX.md               # Denna fil
    ├── MEMORY.md              # Projekthistorik + TODO
    ├── INSTRUCTIONS.md        # Arbetsregler
    └── FUNCTIONS.md           # Funktionsdokumentation
```

---

## Login History

### Overview
Loggar alla inloggningar med IP-adress och user-agent för säkerhet och analys.

### Databas (login_history-tabell)
- `id SERIAL PRIMARY KEY`
- `user_id INTEGER` - Referens till users (CASCADE delete)
- `ip_address VARCHAR(45)` - IPv4/IPv6-adress
- `user_agent TEXT` - Webbläsare/enhet
- `created_at TIMESTAMP` - Inloggningstidpunkt

### Implementation (server.js)
Loggas automatiskt vid lyckad inloggning i `/api/login` endpoint.

```javascript
const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
const userAgent = req.headers['user-agent'] || null;
await db.query(
    'INSERT INTO login_history (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
    [user.id, ip, userAgent]
);
```

### Kommandon

```bash
# Visa senaste inloggningar
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "SELECT u.username, l.ip_address, l.user_agent, l.created_at
      FROM login_history l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC LIMIT 20;"

# Visa inloggningar per användare
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "SELECT u.username, COUNT(*) AS logins, MAX(l.created_at) AS last_login
      FROM login_history l
      JOIN users u ON l.user_id = u.id
      GROUP BY u.username ORDER BY last_login DESC;"

# Visa unika IP-adresser
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "SELECT DISTINCT ip_address, COUNT(*) AS times FROM login_history GROUP BY ip_address ORDER BY times DESC;"
```

---

## Frontend Error Logging

### Overview
Automatisk fångst och loggning av JavaScript-fel från frontend till databasen.

### API Endpoints (server.js)

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/api/errors` | POST | Logga fel (rate limit: 30/min/IP, auth valfri) |
| `/api/errors` | GET | Hämta senaste fel (kräver auth) |

### Databas (frontend_errors-tabell)
- `id SERIAL PRIMARY KEY`
- `user_id INTEGER` - Referens till users (kan vara NULL)
- `error_type VARCHAR(50)` - unhandled, promise, fetch, manual
- `message TEXT` - Felmeddelande
- `stack TEXT` - Stack trace
- `url TEXT` - Sida där felet inträffade
- `user_agent TEXT` - Webbläsarinfo
- `created_at TIMESTAMP`

### Frontend-modul (html/js/error-logger.js)

| Funktion | Beskrivning |
|----------|-------------|
| `window.onerror` | Fångar uncaught exceptions |
| `unhandledrejection` | Fångar promise rejections |
| `AedeloreErrors.log(msg, type, stack)` | Manuell loggning |
| `AedeloreErrors.logFetch(url, status, msg)` | Logga API-fel |
| `AedeloreErrors.flush()` | Skicka köade fel direkt |

### Metrics
Frontend-fel visas i `metrics.txt`:
- Total logged
- Per typ (unhandled, promise, fetch, manual)

### Kommandon

```bash
# Visa senaste fel
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "SELECT id, user_id, error_type, message, url, created_at FROM frontend_errors ORDER BY created_at DESC LIMIT 10;"

# Visa metrics
cat /opt/aedelore/api/data/metrics.txt

# Rensa alla fel (vid behov)
docker exec aedelore-proffs-db psql -U aedelore -d aedelore \
  -c "DELETE FROM frontend_errors;"
```

---

## Password Reset System

### Overview
E-postbaserad lösenordsåterställning med Proton Mail SMTP.

### API Endpoints (server.js)

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/api/forgot-password` | POST | Begär återställningslänk (3/timme rate limit) |
| `/api/reset-password` | POST | Återställ lösenord med token |
| `/api/reset-password/validate` | GET | Validera token (?token=xxx) |
| `/api/account/email` | PUT | Lägg till/ändra e-post (kräver lösenord) |

### Databas

**users-tabell:**
- `email TEXT UNIQUE` - Användarens e-post

**password_reset_tokens-tabell:**
- `token TEXT PRIMARY KEY` - 32-byte random hex
- `user_id INTEGER` - Referens till users
- `expires_at TIMESTAMP` - 1 timme från skapande
- `used BOOLEAN` - Engångsbruk

### E-postmodul (api/email.js)

| Funktion | Beskrivning |
|----------|-------------|
| `sendPasswordResetEmail(email, token, username)` | Skickar reset-länk via SMTP |
| `isEmailConfigured()` | Kontrollerar om SMTP är konfigurerat |

### Frontend-funktioner

**main.js / dm-session.js:**
| Funktion | Beskrivning |
|----------|-------------|
| `showForgotPasswordModal()` | Öppnar forgot password modal |
| `hideForgotPasswordModal()` | Stänger modal |
| `requestPasswordReset()` | Skickar reset-request till API |

**dm-session.js (email management):**
| Funktion | Beskrivning |
|----------|-------------|
| `showEmailModal(mode)` | Öppnar email-modal ('add' eller 'change') |
| `hideEmailModal()` | Stänger email-modal |
| `saveEmail()` | Sparar e-post via API |

### HTML-element

**Auth Modal (båda sidor):**
- `#auth-email` - E-postfält (visas vid registrering)
- `#auth-email-group` - Container för e-postfält
- `#auth-confirm-password` - Bekräfta lösenord (registrering)
- `#auth-confirm-group` - Container för bekräfta-fält
- `#auth-forgot-text` - "Forgot password?"-länk

**Forgot Password Modal (båda sidor):**
- `#forgot-password-modal` - Modal overlay
- `#forgot-email` - E-postfält
- `#forgot-error` - Felmeddelande
- `#forgot-success` - Bekräftelsemeddelande

**Email Modal (dm-session.html):**
- `#email-modal` - Modal overlay
- `#email-modal-title` - "Add Email" / "Change Email"
- `#new-email` - E-postfält
- `#email-confirm-password` - Lösenordsbekräftelse
- `#email-error` - Felmeddelande

**Reset Password Page (reset-password.html):**
- Fristående sida på `/reset-password`
- Validerar token vid laddning
- Formulär för nytt lösenord + bekräftelse

### Säkerhet

| Åtgärd | Implementation |
|--------|----------------|
| Rate limiting | `passwordResetLimiter`: 3 req/timme/IP |
| Token | 32-byte crypto.randomBytes, 1h expiry |
| Enumeration | Samma svar oavsett om e-post finns |
| Session invalidering | Alla tokens raderas vid reset |
| Lösenord | Min 8 tecken, bokstäver + siffror |

### Miljövariabler (.env)

```
SMTP_HOST=smtp.protonmail.ch
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM=Aedelore <samma-som-SMTP_USER>
APP_URL=https://aedelore.nu
```

**OBS:** Proton Mail kräver att SMTP_FROM matchar SMTP_USER.

---

## Lock System (Character Progression)

### Overview
The lock system is a **campaign tool** designed to prevent cheating during campaigns. Once locked, choices are permanent and can only be unlocked by the DM.

Characters are locked in three steps:
1. **Race/Class** → Locks race and class, enables attribute distribution
2. **Attributes** → Locks 10 distributed points, enables abilities tab
3. **Abilities** → Locks selected abilities, character is complete

**IMPORTANT:**
- The lock system **requires cloud save** - it does not work offline
- User must manually click "☁️ Save to Cloud" the first time to enable lock functions
- After first save, autosave activates and keeps the character synced
- Only the DM can unlock a character (via DM Session tool)

### API Endpoints (server.js)

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/api/characters/:id/lock-race-class` | POST | Låser ras/klass |
| `/api/characters/:id/lock-attributes` | POST | Låser attribut |
| `/api/characters/:id/lock-abilities` | POST | Låser abilities |
| `/api/dm/characters/:id/unlock` | POST | DM låser upp (body: unlock_race_class, unlock_attributes, unlock_abilities) |

### Databas-kolumner (characters)
- `race_class_locked` BOOLEAN
- `attributes_locked` BOOLEAN
- `abilities_locked` BOOLEAN

### Frontend-funktioner (main.js)

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `lockRaceClass()` | ~1800 | Låser ras/klass |
| `lockAttributes()` | ~1850 | Låser attribut |
| `lockAbilities()` | ~1900 | Låser abilities |
| `updateProgressionSection()` | ~1670 | Uppdaterar alla lås-UI |
| `updateAttributeBadge()` | ~1537 | Badge för attribut-status |
| `updateAbilitiesBadge()` | ~1577 | Badge för abilities-status |
| `updateAttributesProgressionMsg()` | ~1640 | Progressionsmeddelande i Attributes |
| `applyLockState()` | ~1745 | Applicerar disabled-state på fält |

### Variabler (main.js ~rad 1338)
```javascript
let raceClassLocked = false;
let attributesLocked = false;
let abilitiesLocked = false;
```

### HTML-element (character-sheet.html)
- `#lock-rc-icon` - Lås-ikon för R/C
- `#lock-attr-icon` - Lås-ikon för Attr
- `#lock-abil-icon` - Lås-ikon för Abil
- `#attr-locked-badge` - Badge vid Attributes-titel
- `#abil-locked-badge` - Badge vid Abilities-titel
- `#attributes-progression-msg` - Stegmeddelande i Attributes
- `#abilities-progression-msg` - Stegmeddelande i Abilities
- `#progression-section` - Kompakt progression-bar i Character-tab

---

## Auto-Refresh (Tab-byte)

Automatisk uppdatering av karaktärsdata när användare byter flik.

### Triggers

| Trigger | Tab | Beskrivning |
|---------|-----|-------------|
| Tab-byte | Gear | Quest items från DM |
| Tab-byte | Overview | Dashboard-data |
| Visibility | Alla | När sidan blir synlig igen |

### Funktioner (main.js)

| Funktion | Beskrivning |
|----------|-------------|
| `refreshCharacterData()` | Sparar → väntar 150ms → hämtar data från server |

### Implementation (tabs.js)

```javascript
if ((tabId === 'page-gear' || tabId === 'page-dashboard') && typeof refreshCharacterData === 'function') {
    refreshCharacterData();
}
```

### Säkerhet

- **150ms delay** innan refresh (låter DOM uppdateras)
- **Sparar först** via `checkAndSaveToCloud()`
- Endast på **read-heavy tabs** (Gear, Overview)

---

## Cloud Autosave

### Funktioner (main.js ~rad 646)

| Funktion | Beskrivning |
|----------|-------------|
| `checkAndSaveToCloud()` | Kontrollerar om data ändrats och sparar |
| `startAutoSave()` | Startar 5-sekunders intervall |
| `stopAutoSave()` | Stoppar intervallet |
| `showCloudSaveIndicator(status)` | Visar/döljer sparindikator |

**Intervall:** Var 5:e sekund kontrolleras om data ändrats.

### HTML-element
- `#cloud-save-indicator` - Indikator i nedre högra hörnet

### CSS-klasser (styles.css ~rad 6726)
- `.cloud-save-indicator` - Basestyle
- `.cloud-save-indicator.show` - Synlig
- `.cloud-save-indicator.saving` - Pulserar vid sparning
- `.cloud-save-indicator.saved` - Visar "Saved ✓"

---

## DM Session

### View Player Build (dm-session.js)

📊-knapp på player card visar spelarens attribut, skills och abilities.

| Funktion | Beskrivning |
|----------|-------------|
| `showPlayerBuild(characterId, name)` | Hämtar och visar build-modal |
| `hidePlayerBuildModal()` | Stänger modal |
| `renderPlayerBuildContent(data)` | Renderar attribut grupperat med skills |

**API:** `GET /api/dm/characters/:id/build`

### Lock Management (dm-session.js)

🔓-knapp öppnar modal där DM kan toggla lås-status (både låsa OCH låsa upp).

| Funktion | Beskrivning |
|----------|-------------|
| `manageLocks(charId, name, rc, attr, abil)` | Öppnar lock-modal med aktuell status |
| `toggleLockState(type)` | Togglar rc/attr/abil |
| `saveLockStates()` | Sparar nya lås-status till API |
| `updateLockModalButtons()` | Uppdaterar modal UI |
| `unlockCharacter(charId, name)` | Legacy wrapper som anropar manageLocks |

**API:** `POST /api/dm/characters/:id/set-locks`
```json
{ "race_class_locked": bool, "attributes_locked": bool, "abilities_locked": bool }
```

### Player Card - Lock Status (dm-session.js ~rad 1682)
Visar:
- Varningsruta om något inte är låst
- XP och tillgängliga poäng
- Lås-ikoner (R/C, Attr, Abil) med färgkodning
- 📊 View Build, ✨ XP och 🔓 Lock-knappar

### Synkronisering
- `abilities_locked` synkas från API vid `syncCampaignPlayers()` (~rad 1807)

### AI Assistant (dm-session.js ~rad 3839-4596)

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `quickAIAction(action)` | ~3839 | Genererar fokuserad prompt för quick actions |
| `generateAIExport()` | ~3970 | Genererar full AI-export med session data |
| `copyAIExport()` | ~4166 | Kopierar export till clipboard |
| `parseAIImport()` | ~4182 | Parsar AI-svar med smart JSON-detection |
| `toggleAllAIImports(checked)` | ~4437 | Select all/none för checkboxar |
| `importSelectedAIItems()` | ~4447 | Importerar valda items till sessionData |

**Quick Actions:**
- `random-npc` - Genererar NPC
- `random-encounter` - Genererar stridsencounter
- `describe-location` - Genererar platsbeskrivning
- `session-recap` - Genererar session-sammanfattning
- `session-prolog` - Genererar prolog (via modal med sessionsväljare)

**Session Prolog (dm-session.js ~rad 5569):**
- `showPrologSessionModal()` - Visar modal med sessionsväljare
- `closePrologSessionModal()` - Stänger modalen
- `generatePrologFromSelectedSession()` - Hämtar vald session och genererar prompt
- `generatePrologPrompt(sourceData, sourceSessionNumber)` - Bygger AI-prompt med session-data

**Data arrays som används:**
- `sessionData.hook` - Session hook/mål
- `sessionData.prolog` - Session prolog (read-aloud intro)
- `sessionData.npcs[]` - NPCs
- `sessionData.places[]` - Platser
- `sessionData.encounters[]` - Encounters
- `sessionData.readAloud[]` - Read-aloud texter
- `sessionData.items[]` - Items/clues

---

## DM Calculator

### Overview
Tärningsräknare för DM i Calculator-fliken (bredvid Reference).

### Funktioner (dm-session.js ~rad 8647)

| Funktion | Beskrivning |
|----------|-------------|
| `interpretD10(value)` | Tolkar D10 resultat: failure/barely/success/critical |
| `rollD10Pool(poolSize)` | Rullar en pool av D10s |
| `countSuccesses(results)` | Räknar successes (7+) i en pool |
| `calculateSuccessProbability(poolSize, target)` | Binomialfördelning för sannolikhet |
| `updateDefenseOdds()` | Uppdaterar sannolikhetsvisning för defense |
| `updateDefenseInfo()` | Placeholder för defense-info |
| `rollDefense()` | Rullar defense och visar resultat |
| `calculateDamage()` | Beräknar skadefördelning |
| `setNpcPool(size)` | Sätter NPC pool-storlek |
| `updateNpcOdds()` | Uppdaterar NPC sannolikhet |
| `rollNpc(type)` | Rullar attack/defense/skill för NPC |
| `initCalculator()` | Initierar calculator vid sidladdning |

### HTML-element (dm-session.html)

**Defense Calculator:**
- `#calc-defense-type` - Select: block/dodge/parry/takeHit
- `#calc-defense-pool` - Input: pool size
- `#odds-0-succ`, `#odds-1-succ`, `#odds-2-succ` - Sannolikhetsvisning
- `#calc-defense-result` - Resultat-container
- `#calc-defense-rolls` - Tärningsresultat
- `#calc-defense-outcome` - Resultat (successes + outcome)
- `#calc-defense-effect` - Effektbeskrivning

**Damage Calculator:**
- `#calc-damage-incoming` - Input: inkommande skada
- `#calc-damage-successes` - Select: 0/1/2+ successes
- `#calc-damage-defense-type` - Select: defense-typ
- `#calc-equipment-hp` - Input: utrustnings HP
- `#calc-damage-result` - Resultat-container
- `#calc-damage-breakdown` - Skadefördelning

**NPC Quick Roll:**
- `.npc-pool-btn` - Pool-storlek knappar (3/5/7/10)
- `#calc-npc-pool` - Custom pool input
- `#npc-odds-text` - Sannolikhetsvisning
- `#calc-npc-result` - Resultat-container
- `#calc-npc-rolls` - Tärningsresultat
- `#calc-npc-outcome` - Resultat (successes + outcome)

### CSS-klasser (dm-session.html inline styles)
- `.npc-pool-btn` - Pool-knappar
- `.npc-pool-btn.active` - Aktiv knapp

### D10 Success Levels
| Värde | Resultat |
|-------|----------|
| 1-4 | Failure |
| 5-6 | Barely |
| 7-9 | Success |
| 10 | Critical |

### Defense Outcomes (successes)
| Defense | 0 | 1 | 2+ |
|---------|---|---|-----|
| Block | Armor HP | Half → Shield | All → Shield |
| Dodge | Armor HP | Half → Armor | No damage |
| Parry | Armor HP | Half → Armor | No damage |
| Take Hit | Full + Stun | Armor absorbs | Minimal |

---

## Encounter Participants

### Data-struktur (dm-session.js)
```javascript
sessionData.encounters[].enemies[] = {
    name: "Bandit Leader",
    disposition: "enemy",      // "enemy" | "neutral"
    role: "Warrior",           // Warrior|Rogue|Mage|Healer|Ranger|Beast|Civilian|Historian|Other
    hp: "15",                  // Nuvarande HP
    maxHp: "15",               // Max HP (sätts automatiskt)
    armor: "Leather",
    weapon: "Sword",
    atkBonus: "+3",
    dmg: "1d8"
}
```

### Funktioner (dm-session.js)

| Funktion | Beskrivning |
|----------|-------------|
| `updateParticipantHP(encIndex, enemyIndex, value)` | Uppdaterar HP och sätter maxHp |
| `adjustParticipantHP(encIndex, enemyIndex, delta)` | +/- knappar i During Play |
| `addEncounterEnemy(encIndex)` | Lägger till ny participant |
| `removeEncounterEnemy(encIndex, enemyIndex)` | Tar bort participant |

### HP-hantering i During Play
- **[-]** och **[+]** knappar justerar HP
- HP-bar visar current/max
- Färgkodning:
  - Grön: HP ≥ 50%
  - Gul: HP 1-49%
  - Röd + 💀: HP = 0

### AI Import Format
```json
"enemies": [
  {"name": "...", "disposition": "enemy", "role": "Warrior", "hp": "15", "armor": "...", "weapon": "...", "atkBonus": "...", "dmg": "..."}
]
```

---

## Progression Messages

### CSS-klass (styles.css ~rad 7126)
```css
.progression-message {
    padding: 12px 16px;
    background: linear-gradient(...green...);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
}
```

### Meddelanden
| Steg | Meddelande |
|------|------------|
| 1 | "Select your race and class in the Character tab, then lock them." |
| 2 | "Distribute your 10 attribute points, then lock." |
| 3 | "Select your abilities, then lock to complete character creation." |
| Klar | "Character Complete! Your abilities are locked." |

---

## Session Prolog

### Data-struktur (dm-session.js)
```javascript
sessionData.prolog = "Last time, our heroes ventured into...";
```

### Funktioner (dm-session.js)

| Funktion | Beskrivning |
|----------|-------------|
| `updatePrologDisplay()` | Uppdaterar During Play och Planning textarea |
| `showPrologSessionModal()` | Visar sessionsväljare för AI-generering |
| `generatePrologFromSelectedSession()` | Hämtar vald session, genererar prompt |
| `generatePrologPrompt(data, num)` | Bygger AI-prompt med events, NPCs, etc. |

### HTML-element (dm-session.html)

**Planning tab:**
- `#session_prolog` - Textarea för redigering

**During Play tab:**
- `#play-prolog-container` - Container (döljs om tom)
- `#play-prolog-text` - Read-only text

**Modal:**
- `#prolog-session-modal` - Sessionsväljare
- `#prolog-session-select` - Dropdown med sessioner

### API (server.js)
- `generateSessionSummary()` inkluderar `prolog` field för Player View

---

## Quest Items

### Data-struktur (main.js)
```javascript
charData.quest_items = [
    { name: "Ancient Key", description: "Opens the crypt door", givenAt: "2026-01-22" }
]
```

### Funktioner (main.js ~rad 1573)

| Funktion | Beskrivning |
|----------|-------------|
| `renderQuestItems(questItems)` | Renderar till både `#quest-items-container` och `#quest-items-container-mobile` |
| `showQuestItemDetails(index)` | Visar item-beskrivning i alert |
| `syncNotesToMobile()` | Synkar notes textareas från desktop till mobil |

### HTML-containers
| Container | Plats |
|-----------|-------|
| `#quest-items-container` | Gear-fliken (desktop) |
| `#quest-items-container-mobile` | Quest & Notes-sidan (mobil) |
| `#inventory_freetext` / `#inventory_freetext_mobile` | Synkade textareas |
| `#notes_freetext` / `#notes_freetext_mobile` | Synkade textareas |

### API Endpoints (server.js)

| Endpoint | Metod | Beskrivning |
|----------|-------|-------------|
| `/api/dm/characters/:id/give-item` | POST | DM ger item till spelare (med dublettkontroll) |
| `/api/dm/characters/:id/remove-item` | POST | DM tar bort item från spelare |
| `/api/characters/:id/archive-item` | POST | Spelare arkiverar quest item |
| `/api/characters/:id/unarchive-item` | POST | Spelare återställer arkiverat item |

**give-item features:**
- Transaktioner med `BEGIN/COMMIT/ROLLBACK`
- Radlåsning med `FOR UPDATE`
- Dublettkontroll (uppdaterar befintlig istället för att lägga till ny)
- Case-insensitive namnmatchning
- Sparar `sessionName` med item

**give-item Request body:**
```json
{ "name": "Item Name", "description": "...", "campaign_id": 123, "sessionName": "Session 1" }
```

**archive-item Request body:**
```json
{ "itemIndex": 0 }
```

**unarchive-item Request body:**
```json
{ "archiveIndex": 0 }
```

### DM Session (dm-session.js)

| Funktion | Beskrivning |
|----------|-------------|
| `giveItemToPlayer(itemIndex, playerName, oldPlayerName)` | Ger item, tar bort från gamla spelaren först |
| `removeItemFromPlayer(itemIndex, playerName)` | Tar bort item från spelare |

**Omtilldelningsflöde:**
1. Spåra `oldPlayer` i dropdown `onchange`
2. Om `oldPlayer !== newPlayer`: anropa `removeItemFromPlayer()`
3. Anropa `giveItemToPlayer()` för nya spelaren

### HTML-element (character-sheet.html)
- `#quest-items-container` - Container i Gear-tab

---

## Content Visibility (Session Summary)

### Översikt
DM kan tilldela innehåll till specifika spelare - dessa ser bara sitt eget innehåll i Summary.

### visibleTo-fält
Alla innehållstyper kan ha ett `visibleTo`-fält:
- `"all"` eller saknas → Synligt för alla spelare
- `"Luna"` → Bara synligt för spelare Luna

### Stödda innehållstyper
| Typ | Compact-funktion (Planning by Day) | DM-kontroll |
|-----|-------------------------------------|-------------|
| Places | Inline i `renderPlanningByDay()` | Dropdown bredvid Day |
| NPCs | `renderNPCCompact()` | Dropdown bredvid Disposition |
| Encounters | `renderEncounterCompact()` | Dropdown bredvid Location |
| Read-Aloud | `renderReadAloudCompact()` | Dropdown bredvid Title |

Dropdowns finns även i dolda listor och "unlinked content"-sektionen.

### Hjälpfunktioner (dm-session.js)
```javascript
// Renderar checkboxar för "All" + varje spelare
function generateVisibilityDropdown(currentValue, dataPath) {
    const players = (sessionData.players || []).filter(p => p.character);
    // Returnerar checkboxar med styling baserat på state
}

// Växla "All Players" - sätter till 'all' eller []
function toggleVisibilityAll(dataPath, isChecked)

// Växla enskild spelare - hanterar array
function toggleVisibilityPlayer(dataPath, playerName, isChecked)
```

### Datastruktur
```javascript
visibleTo: "all"              // Alla spelare (standard)
visibleTo: "Luna"             // En spelare (bakåtkompatibelt)
visibleTo: ["Luna", "Tillo"]  // Flera spelare
```

### API-filtrering (server.js)
I `generateSessionSummary()`:
```javascript
const isVisibleToPlayer = (visibleTo) => {
    if (!playerCharacterName) return true;  // DM ser allt
    if (!visibleTo || visibleTo === 'all') return true;
    const playerNameLower = playerCharacterName.toLowerCase().trim();
    // Hantera array (flera spelare)
    if (Array.isArray(visibleTo)) {
        return visibleTo.some(name => name.toLowerCase().trim() === playerNameLower);
    }
    // Hantera string (en spelare)
    return visibleTo.toLowerCase().trim() === playerNameLower;
};
```

### Bakåtkompatibilitet
Befintliga sessioner utan `visibleTo` fungerar oförändrat (behandlas som "all").

---

## Help Tabs

### DM Session Help (dm-session.html)
**Tab:** "Help" (efter Summary)
**Page ID:** `page-help`

Innehåller:
- Quick Overview (alla flikar)
- Recommended Workflow (3 steg)
- Planning Tab detaljer
- During Play detaljer
- AI Assistant guide
- Player View & Sharing
- Tips

### Character Sheet Help (character-sheet.html)
**Location:** Tools > Help
**Div ID:** `tools-help`

Innehåller:
- Getting Started (registrering)
- The Lock System (3 steg)
- Tabs Overview (alla 6)
- Saving & Cloud Sync
- Quick Actions
- DM Sessions & Campaigns
- Quest Items
- XP & Leveling
- Dice Roller
- Tips

---

## Dice Success Levels

### Thresholds (diceroller.js)

| Die | Failure | Barely | Success | Critical |
|-----|---------|--------|---------|----------|
| D10 | 1-4 (40%) | 5-6 (20%) | 7-9 (30%) | 10 (10%) |
| D12 | 1-4 (33%) | 5-7 (25%) | 8-11 (33%) | 12 (8%) |
| D20 | 1-8 (40%) | 9-12 (20%) | 13-19 (35%) | 20 (5%) |

**Critical (10/12/20):** Count as success, reroll die, add result. Chain on more criticals!

---

## Combat Rules (in Rules tab → Defense Options)

### Defense Options

| Defense | Pool | 2+ Success | 1 Success | 0 Success |
|---------|------|------------|-----------|-----------|
| **Block** | STR + Shield Block | Shield HP (50%) | Shield absorbs → Shield HP | Armor HP |
| **Dodge** | AGI or Acrobatics | No damage | Half → Armor HP | Full → Armor HP |
| **Parry** | Weapon Atk Bonus + STR | No damage | Half → Armor HP | Full → Armor HP |
| **Take Hit** | Toughness + Armor Block | Minimal damage | Absorbs → Armor HP | Full + Stun |

### Special Maneuver
Want to do something beyond the four options? Tell your DM what you want to do.
DM decides: which pool to roll, difficulty, and consequences.

### Equipment Damage
- **DM Recommendation:** Equipment takes **50%** of attack's intended damage
- **When Equipment HP = 0:** Destroyed, remaining damage goes to Character HP
- Body parts for narrative: Hand, Leg, Chest, Shoulders, Head

### Stun/Knockback Effects (on Take Hit fail)
- **Stun:** Lose next action
- **Knockback:** Pushed back 1-2 meters
- **Disarm:** Drop weapon (hit on hand)
- **Prone:** Fall to ground (hit on leg)
- **Dazed:** -1D10 on next roll

### Damage Flow
```
Block 2+ → Shield HP (50%)
Block 1 → Shield absorbs → Shield HP
Block 0 → Armor HP (DM picks body part)
Dodge/Parry 2+ → No damage
Dodge/Parry 1 → Half damage → Armor HP
Dodge/Parry 0 → Full damage → Armor HP (DM picks body part)
Take Hit 2+ → Minimal damage
Take Hit 1 → Armor absorbs → Armor HP
Take Hit 0 → Full damage → Armor HP + Stun/Knockback
Equipment HP = 0 → Remaining damage → Character HP
```

---

## Soft Delete / Trash System

### API Endpoints (server.js)

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

### Databas-kolumner
- `characters.deleted_at` TIMESTAMP
- `campaigns.deleted_at` TIMESTAMP
- `sessions.deleted_at` TIMESTAMP

### Trash Bin UI

**Character Sheet (main.js):**
| Funktion | Beskrivning |
|----------|-------------|
| `showTrashModal()` | Öppnar trash-modal |
| `hideTrashModal()` | Stänger trash-modal |
| `loadTrashCharacters()` | Hämtar borttagna karaktärer |
| `restoreCharacter(id)` | Återställer karaktär |
| `permanentDeleteCharacter(id, name)` | Permanent borttagning |

**DM Session (dm-session.js):**
| Funktion | Beskrivning |
|----------|-------------|
| `showDMTrashModal()` | Öppnar trash-modal |
| `hideDMTrashModal()` | Stänger trash-modal |
| `loadTrashCampaigns()` | Hämtar borttagna kampanjer |
| `loadTrashSessions()` | Hämtar borttagna sessioner |
| `restoreCampaign(id)` | Återställer kampanj |
| `permanentDeleteCampaign(id, name)` | Permanent borttagning |
| `restoreSession(id)` | Återställer session |
| `permanentDeleteSession(id, name)` | Permanent borttagning |

**HTML-element:**
- `#trash-modal` (character-sheet.html) - Modal för karaktärer
- `#dm-trash-modal` (dm-session.html) - Modal för kampanjer/sessioner

---

## Onboarding Guide

### Visningsregler

Onboarding-guiden visas **INTE** automatiskt för:
- Inloggade användare (kan öppna manuellt via help-knapp)
- Användare som klickat "Don't show again" (localStorage: `onboarding_dismissed`)

### System-anpassning

Onboarding-panelen anpassas baserat på valt spelsystem:

| System | Synliga steg | Totalt |
|--------|--------------|--------|
| Aedelore | 1-10 | 10 steg |
| Andra system | 1, 2, 3, 8→4, 9→5, 10→6 | 6 steg |

Steg 4-7 (race/class, lock-rc, attributes, lock-attr) är Aedelore-specifika och döljs för andra system.

### Funktioner (main.js ~rad 2481-2750)

| Funktion | Beskrivning |
|----------|-------------|
| `isAedeloreSystem()` | Returnerar true om nuvarande system är Aedelore |
| `initOnboarding()` | Initierar guide vid sidladdning |
| `adjustOnboardingForSystem()` | Döljer/visar steg baserat på system |
| `adjustOnboardingForSystemInContainer(container)` | Samma för mobil-klon |
| `getStepDataAttr(stepNum)` | Mapper steg-nummer till data-step attribut |
| `cloneOnboardingForMobile()` | Klonar sidebar-innehåll till mobil-panel |
| `showOnboarding()` | Visar sidebar/panel |
| `hideOnboarding()` | Döljer temporärt |
| `hideOnboardingPermanent()` | Döljer permanent (localStorage) |
| `toggleOnboardingMobile()` | Expanderar/kollapsar mobil-panel |
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

### HTML-element (character-sheet.html)
- `#onboarding-sidebar` - Desktop sidebar (300px fixed left)
- `#onboarding-mobile` - Mobil panel (collapsible top)
- `.onboarding-help-btn` - Help-knapp (? i header)
- `#onboard-step-1` till `#onboard-step-9` - Steg-element

### CSS-klasser (styles.css ~rad 8340-8670)
- `.onboarding-sidebar` - Desktop sidebar
- `.onboarding-mobile` - Mobil panel
- `.onboarding-step` - Steg-styling
- `.onboarding-step.completed` - Grön checkmark
- `.onboarding-step.current` - Lila highlight
- `.onboarding-tip` - Tips-sektion

### Layout
```css
body.onboarding-active .app-wrapper {
    margin-left: 300px;
    width: calc(100% - 300px);
}
```

---

## Mobile Tab Toggle

**Flytande sidomeny för mobilnavigation (endast < 480px)**

Ersätter horisontell tab-rad med en diskret toggle-knapp på höger sida.
Kan öppnas via **knapp-tryck** eller **swipe-gest** från höger kant.

### HTML-element (character-sheet.html)
- `#mobile-tab-toggle` - Flytande pil-knapp (fixed right, 50% top)
- `#mobile-tab-panel` - Sidopanel med 8 tabs (inkl. Quest & Notes)
- `#mobile-tab-overlay` - Mörk bakgrund när öppen
- `#page-quest` - Quest Items & Notes sida (mobil)

### CSS-klasser (styles.css ~rad 8685)
- `.mobile-tab-toggle` - Toggle-knapp
- `.mobile-tab-toggle.open` - Öppen state (flyttad till vänster)
- `.mobile-tab-panel` - Sidopanel
- `.mobile-tab-panel.open` - Synlig panel
- `.mobile-tab-panel-item` - Tab-item
- `.mobile-tab-panel-item.active` - Aktiv tab

### JavaScript-funktioner (inline i character-sheet.html)
| Funktion | Beskrivning |
|----------|-------------|
| `toggleMobileTabMenu()` | Öppnar/stänger panelen |
| `closeMobileTabMenu()` | Stänger panelen |
| `switchTabMobile(tabId)` | Byter tab och stänger panel |

### Swipe-gest
| Gest | Effekt |
|------|--------|
| Swipe inåt (←) från höger kant | Öppnar menyn |
| Swipe åt höger (→) när öppen | Stänger menyn |

**Tröskelvärden:**
- `edgeThreshold: 40px` - Swipe måste starta inom 40px från höger kant
- `swipeThreshold: 50px` - Minsta swipe-avstånd för att trigga

---

## Quick Status & Worthiness

### Mobile/Tablet Quick Actions Row

Extra status-boxar visas i Quick Actions-raden på mobil/tablet (≤1024px):

| Element | ID | Beskrivning |
|---------|-------|-------------|
| Status | `#quick-status` | `Status: ✓ OK` eller `Status: 🩸X 😫Y` |
| Worthiness | `#quick-worthiness` | `Worth: Trustworthy` (förenklad text) |

### Desktop Worth Display

I Quick Actions stat-adjust-grid visas förenklad worthiness:
- Element: `#quick-worth-desc` i `.stat-worth` raden
- Format: `⭐ Worth +5 (Ordinary)`

### Förenklade Worthiness-beskrivningar

| Värde | Text |
|-------|------|
| 10 | Esteemed |
| 9 | Trustworthy |
| 7-8 | Respected |
| 5-6 | Ordinary |
| 3-4 | Watched |
| 1-2 | Unknown |
| 0 | Nobody |
| -1 to -2 | Distrusted |
| -3 to -5 | Bad Rep |
| -6 to -8 | Notorious |
| -9 | Hunted |
| -10 | Public Enemy |

### Funktioner (dashboard.js)

| Funktion | Beskrivning |
|----------|-------------|
| `getSimpleWorthiness(value)` | Returnerar förenklad text för worthiness-värde |

CSS-klasser: `.mobile-only`, `.action-status`, `.action-worth`, `.worth-positive`, `.worth-negative`

---

## Service Worker

**Fil:** `html/service-worker.js`

### Versionshantering
```javascript
const CACHE_NAME = 'aedelore-v280';
```

**Öka version efter varje ändring i frontend-filer!**

### Cachade filer
Definerade i `STATIC_ASSETS` array (~rad 5-30)

---

## Nginx Säkerhet

**Fil:** `nginx.conf`

### Real IP från Reverse Proxy
```nginx
set_real_ip_from [PROXY_IP];  # Ändra till din proxy-IP (ej i git)
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

**OBS:** Proxy-IP:n är INTE commitad till git - endast placeholder finns i repo.

### Rate Limiting
| Zone | Rate | Användning |
|------|------|------------|
| `general` | 10r/s | Statiska filer |
| `api` | 30r/s | API-anrop |
| `conn_limit` | 20 conn/IP | Max samtidiga |

### Säkerhetsdirektiv
- `server_tokens off` - Dölj nginx-version
- `client_max_body_size 10m` - Max request-storlek
- `client_body_timeout 30s` - Timeout för body
- `client_header_timeout 30s` - Timeout för headers

### Efter config-ändring
```bash
# Endast reload räcker INTE för volume-mountade config
docker compose restart aedelore-proffs-web
```

---

## Gitignore - Känsliga Filer

Följande filer/mappar är **inte** versionshanterade i git:

| Fil/Mapp | Beskrivning |
|----------|-------------|
| `.env` | Miljövariabler (databas, SMTP) |
| `Claude/` | Claude AI dokumentation |
| `CLAUDE.md` | Claude instruktioner |
| `api/data/` | Användardata (metrics) |
| `backups/` | Databasbackuper |
| `AEDELORE-RULES-COMPLETE.md` | Fullständiga spelregler |
| `docs/rules/AEDELORE-RULES-COMPLETE.md` | Fullständiga spelregler |
| `docs/security/` | Säkerhetsaudit och rekommendationer |

**Viktigt:** Om en fil är tracked i git och läggs till i .gitignore måste den tas bort från tracking:
```bash
git rm --cached <fil>
git rm --cached -r <mapp>/
```

---

## Snabbkommandon

```bash
# Starta tjänster
docker compose up -d

# Visa API-loggar
docker compose logs -f aedelore-proffs-api

# Bygg om API efter ändringar i server.js
docker compose build --no-cache aedelore-proffs-api && docker compose up -d aedelore-proffs-api

# Databas-access
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore
```
