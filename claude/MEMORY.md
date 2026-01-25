# Aedelore Project Memory

> Persistent context and history for Claude sessions.
> Last updated: 2026-01-21 (Character locking & XP system)

---

## Project Summary

**Aedelore** is a fantasy tabletop RPG system created by the user. The project includes:
- A complete character sheet web application
- A DM (Dungeon Master) session management tool
- Mobile apps for Android and iOS
- A backend API with PostgreSQL database

**Primary URL:** aedelore.nu

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Web Frontend | Vanilla HTML/CSS/JS |
| Backend API | Node.js + Express 5 |
| Database | PostgreSQL 16 (Docker) |
| Web Server | nginx (Docker) |
| Mobile | PWA (Progressive Web App) |
| Containerization | Docker Compose |

---

## Key Decisions Made

### 2026-01-21: Project Reorganization & Cleanup

1. **Removed obsolete directories** - Freed ~740MB disk space:
   - `android-sdk/` (599MB) - No longer needed, PWA replaces native apps
   - `gradle-8.5/` (141MB) - Build tools not needed
   - `backups/2026-01-21-kmp-app/` - Old KMP mobile app backup

2. **Reorganized documentation structure:**
   - `docs/rules/` - Game rules (AEDELORE-RULES-COMPLETE.md, EN.md)
   - `docs/security/` - Security audits and recommendations
   - `docs/game-data/` - TXT reference files (weapons, armor, spells, abilities)
   - `docs/dev/` - Development notes and instructions
   - Moved `RESTORE-INSTRUCTIONS.md` to `docs/`

3. **Cleaned up root directory:**
   - Removed `data/` folder (merged into docs/game-data/)
   - Removed `systems/` folder (merged into docs/dev/)
   - Created `db/` folder for database schema
   - Renamed `Claude/` to `claude/` (lowercase consistency)

4. **Updated documentation:**
   - Updated `CLAUDE.md` with new project structure
   - Updated `claude/INDEX.md` with new directory layout
   - Project reduced from ~1GB to ~2MB

### 2026-01-21: Rules Optimization & Documentation

1. **Rules Playtested** - Claude simulated player to identify unclear rules
2. **Attack Pool Corrected** - Changed from "Ability + Skill + Weapon" to "Core Ability + Weapon Attack Bonus"
3. **Block Mechanic Fixed** - Higher Block value now = more damage absorbed (was backwards)
4. **Points to Dice Fixed** - Corrected table values in dm-session.html
5. **Documentation Created:**
   - `/opt/aedelore/docs/rules/AEDELORE-RULES-COMPLETE.md` - Full Swedish rulebook
   - `/opt/aedelore/docs/rules/AEDELORE-RULES-EN.md` - English translation
   - `/opt/aedelore/docs/dev/RULES-OPTIMIZATION.md` - Playtest notes and questions
6. **Website Updated:**
   - `dm-session.html` Reference tab - corrected all rule info
   - `character-sheet.html` Tools → Rules - expanded to 12 detailed sections
   - Updated wiki rules link to: `https://wiki.aedelore.nu/books/miscs-of-aedelore/chapter/rules`

### 2026-01-21: Mobile App → PWA Migration

1. **Replaced Kotlin Multiplatform App with PWA:**
   - Removed `apps/` folder (KMP Android/iOS app)
   - Removed APK files from html/
   - Created Progressive Web App instead

2. **PWA Files Created:**
   - `/html/manifest.json` - PWA manifest with app metadata
   - `/html/service-worker.js` - Offline caching and background sync
   - `/html/icons/icon.svg` - App icon (purple gradient with "A")

3. **PWA Features:**
   - Installable on home screen (Android, iOS, desktop)
   - Works offline (service worker caches all static assets)
   - Auto-updates when online
   - Same codebase as web - no sync needed

4. **character-sheet.html Updates:**
   - Added PWA meta tags (mobile-web-app-capable, theme-color, etc.)
   - Added manifest link
   - Added service worker registration
   - "Download Android App" → "Install App" button with PWA prompt
   - Shows platform-specific install instructions as fallback

5. **Benefits:**
   - One codebase instead of two (no more GameData.kt syncing)
   - Instant updates - no APK building/downloading
   - Works on all platforms
   - Easier maintenance

6. **Backup Location:** `/opt/aedelore/backups/2026-01-21-kmp-app/`

### 2026-01-21: Character Creation & Equipment System Overhaul

1. **Class HP Bonuses** - Each class now gives bonus HP added to race HP:
   | Klass | HP Bonus |
   |-------|----------|
   | Warrior | +5 |
   | Outcast | +4 |
   | Hunter | +3 |
   | Druid | +3 |
   | Thief/Rogue | +2 |
   | Mage | +2 |

   - `autoFillHP()` updated to calculate race HP + class bonus
   - `autoFillHP()` now called on both race AND class change

2. **Worthiness Rebalanced** - Updated starting worthiness for all races and classes:

   **Raser:**
   | Ras | Worthiness |
   |-----|------------|
   | Halfling | 8 |
   | High Elf | 7 |
   | Human | 6 |
   | Dwarf | 5 |
   | Moon Elf | 4 |
   | Troll | -4 |
   | Orc | -6 |

   **Klasser:**
   | Klass | Worthiness |
   |-------|------------|
   | Mage | 6 |
   | Hunter | 4 |
   | Warrior | 3 |
   | Druid | 3 |
   | Outcast | -2 |
   | Thief/Rogue | -4 |

3. **Starting Armor Expanded** - Classes now give multiple armor pieces:
   | Klass | Bröst | Axlar | Ben |
   |-------|-------|-------|-----|
   | Warrior | Chainmail | Leather Pauldrons | Leather Greaves |
   | Thief/Rogue | Leather | - | Leather Greaves |
   | Outcast | Leather | - | - |
   | Mage | Cloth | Cloth Mantle | Cloth Pants |
   | Hunter | Leather | Leather Pauldrons | Leather Greaves |
   | Druid | Leather | Cloth Mantle | Cloth Pants |

   - Armor data changed from string to object: `{ chest, shoulders, legs }`
   - `autoFillStartingEquipment()` updated to handle new structure

4. **Warrior Starting Shield** - Warriors now start with Shield (Metal)

5. **Shield UI Enhanced** - Added two new fields to shield table:
   - "Dmg on Shield" column - tracks damage taken by shield
   - "Broken" checkbox - red background when checked (like armor)
   - Added `toggleShieldBroken()` function

6. **Weapon Damage Standardized** - All weapons now use only D6, D10, or 2D6:
   - d4 → 1d6 (Club, Dagger, Light Hammer, Sickle, Whip, Dart, Sling)
   - d8 → 1d10 (Battleaxe, Longsword, Rapier, etc.) or 1d6 (Crossbow Light)
   - d12 → 2d6 (Greataxe, Lance)
   - 2d4 → 1d10 (Scythe)

7. **Pending: Weapon Rebalancing** - Proposed tier system (in todo list):
   - Enkel (2-3 poäng): Club, Sling
   - Standard (4 poäng): Longsword, Shortbow
   - Martial (5 poäng): Greatsword, Longbow
   - Legendarisk (6+ poäng): Katana (+3/1d10), Claymore (+2/2d10), Flamberge (+2/3d6)

8. **Files Modified:**
   - `html/data/classes.js` - hpBonus, worthiness, armor object structure, shield
   - `html/data/races.js` - worthiness values
   - `html/data/weapons.js` - damage dice standardization
   - `html/character-sheet.html` - autoFillHP(), autoFillStartingEquipment(), shield UI, toggleShieldBroken()

### 2026-01-21: DM Session Tool UI Overhaul & Bug Fixes

1. **Header Dropdown Menus** - Replaced flat button groups with dropdown menus:
   - **Server dropdown:** Login, Logout, My Data, Password, Save
   - **Session dropdown:** Lock, Unlock, Delete Session (NEW)
   - **AI dropdown:** AI Assistant
   - **File dropdown:** Export, Print, Help
   - Click outside or Escape key closes dropdowns
   - Chevron icon indicates expandable menu

2. **Delete Session Feature** - Added ability to delete sessions:
   - Delete button in Session dropdown menu
   - Confirmation modal before deletion
   - Returns to dashboard after deletion

3. **Help Modal** - Comprehensive help system added:
   - 7 sections: Getting Started, Planning, During Play, Reference, Sharing, AI Assistant, Export
   - Tabbed navigation within modal
   - Covers all DM Session Tool features
   - Help button added to File dropdown

4. **Character Sheet - Player Help Section:**
   - Added "For Players: Joining a Campaign" guide in Tools → Help
   - Step-by-step instructions for joining campaigns via share code
   - Explains what players can/cannot see
   - Instructions for linking characters to campaigns

5. **Bug Fixes:**
   - **Mobile spell labels:** Fixed CSS where "Weakened Cost" showed instead of "Spelldamage" for Mage/Druid on mobile
     - Added `.conjurer-mode` class toggle in spells.js
     - CSS uses class-based labels for mobile view
   - **Confirm modal callback:** Fixed bug where confirmCallback was set to null before being called
     - Callback now saved to local variable before hideConfirmModal()
   - **Cloud menu alignment:** Fixed DM Sessions link being left-aligned while buttons were centered
     - Added explicit `justify-content: flex-start` for all dropdown-items
   - **Mobile menu close button:** Added `display: none` outside media query
     - Previously showed on desktop with broken styling
   - **Null element references:** Added null checks for removed UI elements
     - campaign-select, session-select, edit-campaign-btn, delete-campaign-btn, new-session-btn

6. **Files Modified:**
   - `html/dm-session.html` - Dropdown menus, Help modal, CSS
   - `html/js/dm-session.js` - Dropdown functions, delete session, null checks, callback fix
   - `html/character-sheet.html` - Player help section in Tools/Help
   - `html/js/spells.js` - Added conjurer-mode class toggle
   - `html/css/styles.css` - Mobile spell labels, dropdown-item alignment

### 2026-01-20: Spell System Cleanup & Arcane Elixir

1. **D&D Spells Removed** - Removed 9 spells with D&D wizard names:
   - Mordenkainen's Sword, Mordenkainen's Magnificent Mansion
   - Tenser's Floating Disk, Tasha's Hideous Laughter, Galder's Tower
   - Leomund's Tiny Hut, Leomund's Secret Chest
   - Drawmij's Instant Summons, Abi-Dalzim's Horrid Wilting

2. **Spells Renamed** (Hadar → Aedelore-friendly):
   - Arms of Hadar → Arms of Despair
   - Hunger of Hadar → Hunger of the Fallen

3. **Mage Spells Removed** (11 teleportation/planar spells):
   - Planar Ally, Gate, Misty Step, Dimension Door, Teleportation Circle
   - Scatter, Word of Recall, Etherealness, Plane Shift
   - Demiplane, Mighty Fortress

4. **Druid Spells Removed** (5 summoning/utility spells):
   - Find Steed, Find Greater Steed, Tame a Beast (Druid)
   - Conjure Celestial, Transport via Plants

5. **Arcane Elixir Feature** - New consumable for Mage/Druid:
   - 1 pot = 10 arcana restored, slider 0-4
   - Starting values: Mage = 2, Druid = 1, others = 0
   - Added to web (character-sheet.html, sliders.js, init.js)
   - Added to app (Character.kt, InventoryScreen.kt, GameData.kt)

6. **New Druid Spells Added** (26 new spells):
   - Offensive: Produce Flame, Infestation, Hail of Thorns, etc.
   - Control: Sleet Storm, Stinking Cloud, Grasping Vine, Watery Sphere
   - Summoning: Summon Beast, Summon Fey, Giant Insect, etc.
   - Utility: Air Bubble, Create Food and Water, Heroes' Feast, Temple of the Gods

7. **Final Spell Counts:** Mage 79, Druid 60

8. **IMPORTANT - Spell Data Locations (must sync all!):**
   - **Web:** `/opt/aedelore/html/data/spells.js`
   - **App data:** `/opt/aedelore/apps/kmp/.../data/GameData.kt` (allSpells map)
   - **App dropdowns:** `/opt/aedelore/apps/kmp/.../ui/screens/CombatScreen.kt` (hardcoded lists!)
   - **Docs:** `/opt/aedelore/data/spells.txt`

9. **Build Notes - Gradle Cache Issue:**
   ```bash
   # If changes don't appear in APK, clear cache:
   rm -rf .gradle/configuration-cache composeApp/build androidApp/build
   ./gradlew :androidApp:assembleDebug --no-build-cache
   cp androidApp/build/outputs/apk/debug/androidApp-debug.apk /opt/aedelore/html/aedelore-app.apk
   ```

### 2026-01-20: UI Improvements & DM Tool Redesign

1. **Character Sheet Dropdown Menus** - Replaced cluttered header buttons with clean dropdown menus:
   - **Menu dropdown** (purple): Local save/load, Export/Import JSON, Print, Clear, Android APK download
   - **Cloud dropdown** (green): Login/Register (logged out), Save/Load to Cloud, DM Sessions, Logout, Delete Account (logged in)
   - Animated open/close with smooth transitions
   - Mobile responsive (stacks vertically on small screens)
   - Click outside or Escape key closes menus
   - DM Sessions only visible when logged in

2. **DM Session Tool Dashboard** - Replaced dropdown selectors with visual campaign cards:
   - Campaign cards showing: name, description, session count, last session date
   - **Continue** button - opens last active (unlocked) session
   - **+ Session** button - creates new session directly
   - Session chips showing recent sessions (click to open)
   - Edit/Delete via three-dot menu on each card
   - "New Campaign" card with dashed border
   - Back to Campaigns button when viewing a session

3. **My Data** - New profile view showing user statistics:
   - New `/api/me` endpoint returning user profile data
   - Stats: campaigns count, sessions count, characters count
   - Lists all campaigns with session counts
   - Lists all characters with last updated date
   - Accessible via "My Data" button in header

4. **DM Session Tool - New Adventure Flow** - Complete redesign of session structure:
   - **3 tabs:** Planning, During Play, Reference (replaced old 5-tab structure)
   - **Planning tab:** Build the adventure
     - Hook/Goal (constant purpose of session)
     - Players, NPCs, Places, Encounters, Items/Clues, Read-Aloud
   - **During Play tab:** Live session view with same data
     - Quick access cards for NPCs, Places, Encounters, Items
     - Checkboxes to mark: NPCs used, Places visited, Items found
     - Encounter status: Planned → In Progress → Completed
     - Turning Points (key decisions/moments)
     - Event Log (timestamped notes)
     - Session Notes (summary, what went well, improve, follow-up)
   - **Interactive sync:** Changes in During Play update Planning automatically
   - **Backwards compatible:** Old sessions with scenes, decisionPoints, keyItems still work

5. **Reference Tab - Spell Types** - Added "Type" column to Mage and Druid spell tables:
   - **Mage types:** Fire, Arcane, Frost, Lightning, Shadow, Psychic, Transmutation, Black Magic, Divination, Protection, Enchantment, Abjuration, Illusion, Conjuration, Transformation, Necromancy, Manipulation
   - **Druid types:** Fire, Arcana, Nature

6. **Files changed:**
   - `html/css/styles.css` - Dropdown CSS classes
   - `html/character-sheet.html` - Dropdown structure
   - `html/js/main.js` - Dropdown functions
   - `html/dm-session.html` - New tab structure, Planning/Play content, spell type columns
   - `html/js/dm-session.js` - New data structure, render functions, sync logic
   - `api/server.js` - Added /api/me endpoint

### 2026-01-19: Major Updates
1. **PostgreSQL Migration** - Moved from SQLite to PostgreSQL for better reliability
2. **DM Session Tool** - Built complete campaign/session management system
3. **UI Consolidation** - Reduced from 10 tabs to 5 tabs for better UX
4. **Markdown Export** - Added export for sessions and full campaigns
5. **Reference Tab** - Added rules, weapons, armor, spells from wiki
6. **Project Cleanup** - Reorganized folder structure
7. **Mobile App Login** - Added optional login/sync to mobile app:
   - Ktor HTTP client for API communication
   - AuthManager with platform-specific token storage (EncryptedSharedPreferences on Android, NSUserDefaults on iOS)
   - LoginScreen with login/register toggle
   - CharacterListScreen for viewing server characters
   - Offline mode still works without login
   - CloudOff icon in header when offline (tap to login)
   - CloudUpload icon when online (tap to sync)

### 2026-01-16: KMP Migration
- Converted Android app to Kotlin Multiplatform for iOS support
- Replaced Gson with kotlinx.serialization
- Implemented expect/actual for platform-specific storage

---

## Folder Structure (After Cleanup)

```
/opt/aedelore/
├── api/          # Backend (Docker mounted)
├── html/         # Web frontend (Docker mounted)
├── apps/         # Mobile apps (android/, kmp/)
├── data/         # Game data documentation
├── docs/         # Project documentation
├── scripts/      # Utility scripts
├── Claude/       # Claude AI files
├── compose.yml   # Docker config
├── nginx.conf    # Web server config
└── .env          # Secrets (DB credentials)

/opt/wiki/        # BookStack Wiki (separate Docker project)
├── compose.yml   # Wiki Docker config
├── .env          # Wiki secrets
├── bookstack_app_data/  # Application volume
└── bookstack_db_data/   # MariaDB volume
```

---

## Database Credentials

Stored in `/opt/aedelore/.env`:
- Database: `aedelore`
- User: `aedelore`
- Password: (see .env file)
- Container: `aedelore-proffs-db`

---

## API Authentication

- Token-based authentication (persistent in PostgreSQL `auth_tokens` table)
- Tokens expire after 24 hours, automatic cleanup via scheduled task
- **Web frontend:** stores token in localStorage as `aedelore_auth_token`
- **Android app:** stores token in EncryptedSharedPreferences (AES256)
- **iOS app:** stores token in iOS Keychain (secure)
- Password hashing with bcrypt (10 rounds)

---

## DM Session Tool Data Structure

### New Structure (2026-01-20)
```javascript
sessionData = {
    // Adventure goal - the constant
    hook: 'string',

    // Players
    players: [{ player, character, race, class, religion, notes }],

    // NPCs with planning + live tracking
    npcs: [{ name, role, description, plannedLocation, actualLocation, disposition, status: 'unused'|'used', notes }],

    // Places/Locations
    places: [{ name, description, visited: false, notes }],

    // Combat Encounters with status
    encounters: [{ name, location, enemies: [{ name, hp, armor, weapon, atkBonus, dmg }], tactics, loot, status: 'planned'|'started'|'completed', notes }],

    // Items/Clues with tracking
    items: [{ name, description, plannedLocation, actualLocation, found: false, givenTo, notes }],

    // Read-aloud text with read tracking
    readAloud: [{ title, text, read: false }],

    // Event log - chronological events during play
    eventLog: [{ timestamp, text }],

    // Turning points - key decisions/moments
    turningPoints: [{ description, consequence }],

    // Session notes (post-session)
    sessionNotes: { summary, wentWell, improve, followUp },

    // Legacy fields (for backwards compatibility with old sessions)
    scenes: [], decisionPoints: [], keyItems: [], combatEncounters: [], readAloudText: [], lootRewards: []
}
```

### Legacy Structure (pre-2026-01-20)
Old sessions still load correctly with: scenes, decisionPoints, keyItems, combatEncounters, readAloudText, lootRewards

---

## Game System Rules

### Core Mechanic
- D10 dice pool system
- Points convert to dice: 1-2pts=1D10, 3-4pts=2D10, 5-6pts=3D10, 7-8pts=4D10, 9-10pts=5D10, 11+=6D10
- Maximum 8 dice per action

### Success Thresholds
| Roll | Result |
|------|--------|
| 1-5 | Failure |
| 6-7 | Barely succeeds |
| 8-9 | Full success |
| 10 | Critical (reroll, add result) |

### Attack
- **Attack Pool:** Core Ability + Weapon Attack Bonus (NO skill)
- Weapon determines which ability: Strength (most melee), Dexterity (daggers, bows), Str/Dex (Katana)

### Attack Results
| Successes | Effect |
|-----------|--------|
| 0 | Miss |
| 1 | Glancing blow (50% damage) |
| 2+ | Full damage |

### Defense Options
- **Dodge:** Dexterity + Acrobatics → Success avoids, Barely halves, Fail full damage
- **Parry:** Strength + Weapon Attack Bonus → Success blocks, Barely reduces by weapon bonus
- **Block:** Strength → Success absorbs up to Block value (shield takes blocked damage to HP)
- **Take Hit:** Toughness + Armor Bonus → Each success reduces damage by 1

### Rules Documentation
- Full Swedish rulebook: `/opt/aedelore/docs/rules/AEDELORE-RULES-COMPLETE.md`
- English translation: `/opt/aedelore/docs/rules/AEDELORE-RULES-EN.md`
- Playtest notes: `/opt/aedelore/docs/dev/RULES-OPTIMIZATION.md`

---

## Religions (12 total)

Each religion gives +1 or +2 to specific abilities:
- Ethereal Flame, Verdant Circle, Iron Covenant, etc.
- The Abyssal Veil: +2 Deception, -5 Worthiness

---

## Bug Fixes

### 2026-01-19 (kväll): Android app kraschade vid inloggning
- **Problem:** Appen kraschade när användare försökte logga in
- **Orsak:** INTERNET-permission saknades i AndroidManifest.xml
- **Fix:** Lade till `<uses-permission android:name="android.permission.INTERNET" />` i `apps/kmp/androidApp/src/androidMain/AndroidManifest.xml`
- **Status:** Fixad, ny APK byggd och kopierad till webbservern

### 2026-01-19 (sen kväll): JSON-parsningsfel och autosave
- **Problem 1:** "Illegal input: unexpected JSON token" vid laddning av karaktär
- **Orsak:** API returnerade `data` som JSONB-objekt, appen förväntade sig sträng
- **Fix:** Ändrade `server.js` rad 427 till `JSON.stringify(character.data)`

- **Problem 2:** "field id is required" vid sparning
- **Orsak:** PUT endpoint returnerade inte `id` i svaret
- **Fix:** Ändrade `server.js` rad 484 till `res.json({ success: true, id: parseInt(req.params.id) })`

- **Ny funktion:** Autosave till server
- **Implementering:** LaunchedEffect i App.kt som sparar till server var 5:e sekund när inloggad

- **Problem 3:** Karaktärer sparade i appen synkade inte till webben
- **Orsak:** Appen använde `toJson()` (Kotlin-format) men webben förväntar sig `toWebJson()` (web-format)
- **Fix:** Ändrade App.kt rad 85 och 112 från `character.toJson()` till `character.toWebJson()`

- **Problem 4:** Karaktärer laddades inte in på webben från appen
- **Orsak:** API returnerade data som JSON-sträng men webben försökte använda det som objekt
- **Fix:** Ändrade main.js loadCharacterById() att parsa JSON-strängen

- **Problem 5:** Rustningsslot 5 saknades på webben + fel ordning
- **Fix webb:** Lade till armor_5 (Hands→Legs ordning för att matcha appen)
- **Fix app:** Lade till handArmorOptions, fixade armorOptionsBySlot att använda rätt options
- **Ordning:** Head → Shoulders → Chest → Hands → Legs (slot 1-5)
- **Status:** Fixad, ny APK byggd och kopierad till webbservern

---

## Known Issues

1. **iOS build requires Mac** - Cannot build iOS from Linux
2. **Gradle warnings** - compileSdk 35 warning (cosmetic)

---

## Security Audit & Fixes (2026-01-19)

Full report: `/opt/aedelore/docs/SECURITY-AUDIT-2026-01-19.md`

**Fixed Issues:**
- XSS vulnerability in main.js character list modal (CRITICAL)
- Added Content-Security-Policy header
- Added HSTS header (Strict-Transport-Security)
- Migrated to persistent token storage (PostgreSQL auth_tokens)
- iOS: Migrated from NSUserDefaults to Keychain
- Set explicit CORS origin (https://aedelore.nu)
- Added Referrer-Policy and Permissions-Policy headers

---

## Future Improvements

- [x] ~~Add persistent token storage~~ (completed 2026-01-19)
- [ ] Add WebSocket for real-time session updates
- [ ] Build iOS app on Mac
- [x] ~~Add player invitation system for campaigns~~ (completed 2026-01-20)
- [ ] Add dice roller to DM tool
- [x] ~~Add login to mobile app~~ (completed 2026-01-19)
- [ ] Centralize game data in database (see detailed plan below)

---

## Planned Feature: Centralized Game Data

> Analyzed 2026-01-20. Decision: Postponed for now.

### Current State
Game data (weapons, armor, spells, abilities) is duplicated:
- **Webb:** `html/data/weapons.js`, `html/data/armor.js`, `html/data/spells.js`
- **App:** `apps/kmp/.../data/GameData.kt`
- **Docs:** `data/weapons.txt`, `data/abilities.txt`, etc.

Data must be manually synced between platforms.

### Proposed Solution
Store all game data in PostgreSQL, fetch via API with local caching.

### Pros
| Fördel | Beskrivning |
|--------|-------------|
| En källa | Ingen manuell synkning mellan webb och app |
| Dynamiska uppdateringar | Lägg till vapen/spells utan app-uppdatering |
| Adminpanel möjlig | Redigera speldata via webb-UI |
| DM-verktyget | Reference-tabben kan hämta live-data |

### Cons
| Nackdel | Beskrivning |
|---------|-------------|
| Offline-stöd bryts | Kräver cachning-strategi |
| Laddningstid | API-anrop tar längre än lokal data |
| Komplexitet | Mer kod för caching, felhantering |
| Databas-beroende | Om DB är nere → ingenting fungerar |

### Recommended Approach: Cache-First Hybrid
```
1. App/Webb startar
2. Ladda från lokal cache (snabbt!)
3. Hämta från API i bakgrunden
4. Jämför version
5. Om ny version → uppdatera cache
```

### Database Schema (Draft)
```sql
-- Versionshantering
game_data_versions (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50),        -- 'weapons', 'spells', 'armor'
    version INT,
    updated_at TIMESTAMP
)

-- Vapen
weapons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    weapon_type VARCHAR(50),
    ability VARCHAR(50),
    attack_bonus INT,
    damage VARCHAR(20),
    range VARCHAR(20),
    break_value VARCHAR(10),
    price VARCHAR(20)
)

-- Rustningar
armor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    bodypart VARCHAR(20),
    armor_type VARCHAR(20),
    hp INT,
    block INT,
    disadvantage TEXT
)

-- Spells/Abilities
spells (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    class VARCHAR(50),            -- 'Warrior', 'Mage', etc.
    arcana_cost VARCHAR(20),
    gain VARCHAR(10),
    damage VARCHAR(20),
    check_requirement TEXT,
    description TEXT,
    is_arcane BOOLEAN
)
```

### API Endpoints (Draft)
```
GET /api/game-data/version          -- Senaste versionsnummer
GET /api/game-data/weapons          -- Alla vapen
GET /api/game-data/armor            -- All rustning
GET /api/game-data/spells           -- Alla spells/abilities
GET /api/game-data/spells/:class    -- Spells för specifik klass
GET /api/game-data/all              -- Allt i ett anrop (för caching)
```

### Implementation Levels
1. **Enkel:** Behåll nuvarande system (fungerar, är synkat)
2. **Medium:** API-endpoints + hårdkodad fallback
3. **Full:** Databas-driven med adminpanel och versionshantering

### Questions to Answer Before Implementation
1. Hur viktig är offline-funktionalitet?
2. Vill du ha en adminpanel för att redigera speldata?
3. Hur ofta ändras datan?

---

## Useful Commands

```bash
# Quick API rebuild
cd /opt/aedelore && docker compose build --no-cache aedelore-proffs-api && docker compose up -d

# Check API logs
docker compose logs -f aedelore-proffs-api

# Database access
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore

# List all tables
\dt

# View sessions
SELECT id, session_number, status FROM sessions;
```

---

### 2026-01-20: BookStack Wiki Import

1. **Wiki Installed** - BookStack wiki moved from /mnt/usb to /opt/wiki
   - MariaDB 11.4.4 + BookStack v25.02 (Docker containers)
   - Port: 6875 (http://localhost:6875)
   - URL: https://wiki.aedelore.nu
   - UFW regel tillagd för port 6875

2. **Config Fix** - Cached config i volymen hade fel värden:
   - Uppdaterade APP_URL, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, APP_KEY
   - Filplacering: `/opt/wiki/bookstack_app_data/www/.env`

3. **Databas intakt** - 6 böcker, 140 sidor, 5 användare migrerade korrekt

### 2026-01-20: Character System Field & Fixes

1. **Databas: system-fält för karaktärer**
   - Ny kolumn: `system TEXT DEFAULT 'aedelore'` i characters-tabellen
   - Migration för befintliga databaser (DO $$ IF NOT EXISTS...)
   - API GET/POST/PUT hanterar system-parameter
   - Mobilappen påverkas ej (ignoreUnknownKeys = true)

2. **UI: System badge i karaktärslistan**
   - Färgkodade badges per system (Aedelore=guld, D&D=röd, PF2e=blå, WoD=lila, CoD=grå)
   - Varning vid laddning av karaktär från annat system
   - Automatisk systemväxling vid laddning

3. **Buggfixar:**
   - **Dot ratings (WoD/CoD):** initializeST() scopades till #system-content
   - **Textrutor halverade siffror:** min-height: 38px, line-height: 1.4 på inputs
   - **D&D spell slots:** width: 50px, height: 36px
   - **PF2e proficiency selects:** explicit height

4. **Regler-layout:** Aedelore fick samma accordion-layout som andra system

### 2026-01-20: Multi-System Character Sheet Support

1. **New Feature:** Character sheet now supports multiple RPG systems
   - System selector modal appears on first visit
   - User can choose to remember their system choice
   - "Change System" option added to menu

2. **Supported Systems:**
   | System | Features |
   |--------|----------|
   | Aedelore | Original system - 100% unchanged when selected |
   | D&D 5th Edition | Full character sheet with d20 mechanics, skills, spells, conditions |
   | Pathfinder 2e | Character sheet with proficiency ranks, degrees of success |
   | Storyteller (Classic WoD) | 9 attributes (3x3 matrix), 30 abilities, dot ratings, dice pools |
   | Chronicles of Darkness | 9 attributes, 24 skills, derived stats, 10-again dice mechanic |

3. **Files Created:**
   - `html/js/systems/system-config.js` - Configuration data for all systems
   - `html/js/systems/dnd5e.js` - D&D 5e character sheet renderer
   - `html/js/systems/pathfinder2e.js` - PF2e character sheet renderer
   - `html/js/systems/storyteller.js` - Classic WoD character sheet renderer
   - `html/js/systems/cod.js` - Chronicles of Darkness character sheet renderer
   - `html/js/system-selector.js` - System selector modal and loading logic

4. **Files Modified:**
   - `html/character-sheet.html` - Added script references for multi-system support
   - `html/css/styles.css` - Added 1000+ lines of CSS for new components

5. **Architecture:**
   - When Aedelore is selected: page loads exactly as before (no code changes)
   - When other system selected: page content dynamically replaced with system-specific sheet
   - Each system has its own dice roller adapted to its mechanics
   - Auto-save works per system (`aedelore_character_{systemId}_autosave`)
   - localStorage key: `aedelore_selected_system`, `aedelore_remember_system`

6. **Key Design Decisions:**
   - Aedelore code remains 100% untouched when Aedelore is selected
   - Same visual styling (CSS) across all systems
   - Rules reference tab included for each system
   - Dot rating UI for WoD-style systems
   - Proficiency rank selectors for PF2e

### 2026-01-20: Character Sheet Dashboard Redesign

1. **New Dashboard/Overview Tab** - Complete UI redesign with dashboard approach:
   - **Status Bar** - Persistent HP/Arcana/Willpower display under header (visible on all tabs)
   - **Dashboard** - New default tab with character overview
     - Hero card (name, race, class, religion)
     - Quick Actions (Rest, Heal, Roll Dice, Use Potion)
     - Spend Actions (HP, Arcana, Willpower, Bleed, Weakened)
     - Navigation cards to all sections
     - Quick stats grid (6 core attributes)

2. **Reduced Tab Count:** 9 tabs → 7 tabs
   | Old | New |
   |-----|-----|
   | Info | Character |
   | Attributes | Stats |
   | Combat | Combat |
   | Spells | Magic |
   | Potions | Gear (combined) |
   | Inventory | Gear (combined) |
   | Dices | Tools (combined) |
   | Rules | Tools (combined) |
   | Help | Tools (combined) |

3. **Combined Pages:**
   - **Gear** - Consolidated: Money, Consumables (potions, food/water), Inventory, Notes
   - **Tools** - Sub-tabs for: Dice Roller, Rules Reference, Help

4. **Quick Actions Added:**
   - **Gain:** Rest (+2 Arcana), Heal (+1 HP), Roll Dice, Use Potion
   - **Spend:** -1 HP, -1 Arcana, -1 Willpower, +1 Bleed, +1 Weakened

5. **Files Created:**
   - `html/js/dashboard.js` - Status bar sync, dashboard updates, quick actions

6. **Files Modified:**
   - `html/character-sheet.html` - New structure with status bar, dashboard tab, combined pages
   - `html/css/styles.css` - Added 300+ lines for status bar, dashboard, action buttons
   - `html/js/tabs.js` - Updated tab switching logic

7. **Backup Location:** `/opt/aedelore/backups/2026-01-20-before-redesign/`

8. **Potion Selector Popup** (added later):
   - Click "Use Potion" → shows popup with all available potions
   - Shows icon, name, count, and effect for each
   - Click to consume, Cancel to close

9. **Expandable Attribute Cards** (added later):
   - Click attribute to expand and show related skills
   - Only one card expanded at a time
   - Shows current skill values from character sheet

### 2026-01-20: Mobile App Dashboard Implementation (v2.3.0)

1. **New Dashboard Tab** - Mobile app now matches web layout:
   - Home icon as first tab (default view)
   - Hero card with character avatar, name, class, race
   - Quick Actions: Rest (+2 Arcana), Potion (uses inventory potions)
   - Stat adjustment rows with +1/-1 buttons
   - Navigation cards to all sections
   - Quick stats preview (6 core attributes)
   - Version number at bottom

2. **Potion System** - Full inventory integration:
   - Potion button shows dialog with available potions
   - Supports: Adrenaline, Antidote, Poison, Arcane Elixir
   - Shows count and effect for each potion
   - Consumes from character.adrenaline/antidote/poison/arcaneElixir

3. **Stat Adjust Rows** - Enhanced feedback:
   - Shows current value as fraction (e.g., "HP 5/10")
   - Buttons visually disabled when at min/max
   - Gray color and non-clickable at limits
   - Stats: HP, Arcana, Willpower, Bleed, Weakened, Worthiness

4. **Status Bar** - Persistent display under header:
   - Shows on all tabs except Dashboard
   - HP, Arcana (if arcane class), Willpower, Bleed, Weakened, Worthiness
   - Color-coded with icons

5. **UI Color Improvements:**
   - QuickActionButton: stronger borders, white text labels
   - StatAdjustRow: colored borders, value display
   - AttributeSection: cyan header, gold values, white skill text
   - ResourceSlider: white label, colored value

6. **Files Modified:**
   - `apps/kmp/.../ui/screens/DashboardScreen.kt` - New Dashboard with all features
   - `apps/kmp/.../ui/components/CommonComponents.kt` - StatusBar, QuickActionButton, StatAdjustRow
   - `apps/kmp/.../App.kt` - Added DASHBOARD tab, StatusBar integration

7. **Build Note - APK Filename:**
   - Website links to `aedelore-character-sheet.apk` (not `aedelore-app.apk`)
   - Must copy to BOTH filenames when deploying:
   ```bash
   cp androidApp/build/outputs/apk/debug/androidApp-debug.apk /opt/aedelore/html/aedelore-app.apk
   cp androidApp/build/outputs/apk/debug/androidApp-debug.apk /opt/aedelore/html/aedelore-character-sheet.apk
   ```

8. **Nginx APK Caching Fix:**
   - Added no-cache headers for .apk files in nginx.conf
   - Prevents browser caching issues when updating app

### 2026-01-20: Mobile App v2.4.0 - Spells Tab & UI Fixes

1. **New Spells Tab** - Dedicated tab for spells/abilities:
   - Separated from Combat screen into its own tab
   - Shows class-appropriate header (Mage Spells / Druid Spells / Class Abilities)
   - Full spell details with arcana cost, damage, description
   - Quick reference section for arcana usage or ability mechanics
   - Same spell options as CombatScreen (shared via package imports)

2. **StatusBar Fix** - Text was same color as background:
   - Changed StatusItem text color from `color` to `TextBase` (white)
   - Now visible on dark background

3. **Religion in Header** - Added religion display:
   - Shows "Race • Class • Religion" under character name
   - Only shows if values are selected (not placeholder text)

4. **Tab Structure Updated:**
   | Tab | Icon | Screen |
   |-----|------|--------|
   | Home | Home | DashboardScreen |
   | Info | Person | InfoScreen |
   | Stats | Analytics | AttributesScreen |
   | Combat | Shield | CombatScreen |
   | Spells | Star | SpellsScreen (NEW) |
   | Items | Inventory | InventoryScreen |

5. **Note:** Dice roller NOT included in app (user explicitly declined)

6. **Files Created:**
   - `apps/kmp/.../ui/screens/SpellsScreen.kt` - New dedicated spells screen

7. **Files Modified:**
   - `apps/kmp/.../App.kt` - Added SPELLS tab, updated navigation indices, added religion to header
   - `apps/kmp/.../ui/screens/DashboardScreen.kt` - Added Spells nav card
   - `apps/kmp/.../ui/screens/CombatScreen.kt` - Removed spell section (kept spell options for imports)
   - `apps/kmp/.../ui/components/CommonComponents.kt` - Fixed StatusBar text color

8. **Version:** 2.4.0

### 2026-01-20: DM Tool - AI Assistant Export/Import

1. **AI Assistant Button** - New button in header toolbar:
   - Purple gradient button opens AI modal
   - Located in action bar next to Export/Print

2. **Export to AI** - Generates prompt for external AI:
   - Task types: Plan session, Create NPCs, Create encounters, Write read-aloud, Summarize, Custom
   - Includes wiki links for world reference (races, classes, religions, folk lore, rivermount library, characters)
   - Exports campaign context, previous session summaries, current session data
   - Player characters, NPCs, places, events, turning points
   - Instructions tell AI to give suggestions first, then export in parseable format on request

3. **Import from AI** - Parses AI responses:
   - Looks for `---IMPORT_START---` and `---IMPORT_END---` markers
   - Parses JSON containing: hook, npcs, places, encounters, readAloud, items
   - Shows preview of found items
   - "Import All" adds items to current session

4. **Two-step Flow:**
   - User exports prompt → pastes to AI
   - AI gives suggestions in prose
   - User approves → asks AI to "export in import format"
   - AI outputs marked JSON
   - User pastes back → imports to session

5. **Wiki Links Used:**
   - wiki.aedelore.nu/books/aedelore/chapter/races
   - wiki.aedelore.nu/books/aedelore/chapter/classes
   - wiki.aedelore.nu/books/aedelore/chapter/religions
   - wiki.aedelore.nu/books/aedelore/chapter/folk-lore
   - wiki.aedelore.nu/books/aedelore/chapter/rivermount-library
   - wiki.aedelore.nu/books/characters-of-aedelore

6. **Files Modified:**
   - `html/dm-session.html` - Added AI button, modal HTML, CSS
   - `html/js/dm-session.js` - Added AI export/import functions

### 2026-01-20: DM Tool - Summary Tab

1. **Summary Tab** - New tab showing session recap based on marked items:
   - Shows: NPCs used, Places visited, Encounters completed, Items found
   - Turning points and Event log included
   - "Copy Summary" button for clipboard
   - "Send to AI for Notes" button generates prompt

2. **Files Modified:**
   - `html/dm-session.html` - Added Summary tab
   - `html/js/dm-session.js` - renderSessionSummary(), generateSummaryText()

### 2026-01-20: DM Tool - Player Sharing Feature

1. **Database Schema:**
   - `campaigns.share_code` - 8-character hex code for sharing
   - `campaign_players` table - Links players to campaigns they've joined
   - Columns: id, campaign_id, user_id, joined_at
   - Unique constraint on (campaign_id, user_id)

2. **API Endpoints (8 new):**
   - `POST /api/campaigns/:id/share` - Generate share code for DM's campaign
   - `DELETE /api/campaigns/:id/share` - Revoke share code and remove all players
   - `POST /api/campaigns/join` - Join campaign using share code
   - `DELETE /api/campaigns/:id/leave` - Leave a campaign as player
   - `GET /api/player/campaigns` - Get campaigns user has joined
   - `GET /api/player/campaigns/:id` - Get campaign summary for player (live updates)
   - `GET /api/campaigns/:id/players` - Get players in a campaign (for DM)
   - `DELETE /api/campaigns/:id/players/:playerId` - Remove player (for DM)

3. **DM Share UI:**
   - Share button in campaign dropdown menu
   - Share modal with code display
   - Copy code button
   - Players list with remove buttons
   - Revoke access button

4. **Player View:**
   - "Joined Campaigns" section on dashboard
   - "Join Campaign" button with code input modal
   - Player campaign view showing:
     - Session list (locked = completed, active = in progress)
     - Latest session summary (live, refreshes every 10 seconds)
   - Summary shows: NPCs met, places visited, encounters, items found, turning points
   - Leave campaign button

5. **Player Access Rules:**
   - Can see locked sessions (metadata only: number, date, location)
   - Can see latest session summary (live updates)
   - Cannot see session details (planning data, full NPCs, etc.)
   - Read-only access

6. **Files Modified:**
   - `api/server.js` - Added 8 API endpoints, generateSessionSummary() helper
   - `html/dm-session.html` - Share modal, Join modal, Player view container
   - `html/js/dm-session.js` - Share functions, join functions, player view rendering

### 2026-01-20: Character-Campaign Linking Feature

1. **User Request:** Players wanted to link their characters to campaigns using the DM's share code, see campaign info on the character sheet, and view party members.

2. **Database Changes:**
   - Added `campaign_id` column to `characters` table (nullable FK to campaigns)
   - Migration added to `db.js` using same pattern as `system` column
   - Index created on `campaign_id` for performance

3. **API Endpoints (3 new):**
   - `POST /api/characters/:id/link-campaign` - Link character to campaign via share code
     - Also auto-joins user as campaign player if not already joined
   - `DELETE /api/characters/:id/link-campaign` - Unlink character from campaign
   - `GET /api/characters/:id/party` - Get other characters in same campaign

4. **Character Load Updated:**
   - `GET /api/characters/:id` now includes `campaign` object with name, dm_name, description

5. **Character Sheet UI:**
   - Campaign section moved to "Character" tab (alongside name, race, class, religion)
   - Shows "Save your character to cloud first" if not saved
   - Shows "Link to Campaign" button if saved but not linked
   - Shows campaign name, DM name, and "View Campaign Sessions" shortcut when linked
   - Party Members section shows other characters in same campaign
   - Link Campaign modal for entering share code
   - Unlink button to remove character from campaign

6. **Auto-Reload Behavior:**
   - Page reloads automatically on: login, register, logout, save, link campaign, unlink campaign
   - Character ID stored in `localStorage` (`aedelore_current_character_id`) for persistence
   - Character auto-loads on page load if ID is stored and user is logged in
   - Character ID cleared on logout and character deletion

7. **Files Modified:**
   - `api/db.js` - Added campaign_id migration
   - `api/server.js` - Updated character GET, added 3 new endpoints
   - `html/character-sheet.html` - Added campaign section in Character tab, link modal
   - `html/js/main.js` - Campaign linking functions, auto-reload logic, character persistence
   - `html/css/styles.css` - Campaign section styling, campaign link button

---

### 2026-01-21: Comprehensive Security Audit & Fixes

1. **Security Audit Performed** - Full audit with 5 parallel agents covering:
   - API security (authentication, authorization, SQL injection)
   - Frontend security (XSS, CSRF, token storage)
   - Infrastructure (Docker, nginx, file permissions)
   - PWA/Service Worker security
   - Secrets and credential exposure

2. **Critical Vulnerabilities Fixed:**

   | Vulnerability | File | Fix Applied |
   |---------------|------|-------------|
   | XSS in AI import preview | `dm-session.js:3680-3760` | Added `escapeHtml()` to all user data |
   | CORS allows all origins | `server.js:34` | Removed `\|\| true` fallback |
   | Authorization bypass | `server.js:1155-1177` | Added membership verification |
   | World-readable .env | `.env` | `chmod 600` applied |
   | Exposed credentials | `.env` | All passwords rotated |

3. **File Permission Changes:**
   ```bash
   chmod 600 .env compose.yml nginx.conf
   ```

4. **Credential Rotation:**
   - PostgreSQL password rotated
   - Umami DB password rotated
   - Umami APP_SECRET rotated
   - Database passwords updated via `ALTER ROLE`

5. **New Files Created:**
   - `.gitignore` - Prevents committing secrets
   - `.env.example` - Template with placeholders

6. **Database Backup Secured:**
   - Moved from `/opt/aedelore/database-backup.sql` to `/opt/aedelore/backups/`
   - Permissions set to 600

7. **Documentation Updated:**
   - `RESTORE-INSTRUCTIONS.md` - Removed hardcoded passwords, updated paths
   - `Claude/MEMORY.md` - Added this security section

8. **Known Issues Documented (Not Fixed - Would Break Functionality):**

   | Issue | Reason Not Fixed |
   |-------|------------------|
   | `eval()` in system-selector.js | Requires mathjs library, may break formulas |
   | Auth token in localStorage | Requires major refactor to HttpOnly cookies |
   | CSP `unsafe-inline` | Would break all onclick handlers |
   | Short token expiry | Requires refresh token implementation first |

9. **Audit Reports Generated:**
   - API: 2 critical, 3 high, 3 medium issues
   - Frontend: 3 critical, 6 high issues
   - Infrastructure: 4 critical, 3 high issues
   - PWA: 3 critical, 4 high issues
   - Total: 8 critical issues (5 fixed), 16 high issues

10. **Security Recommendations for Future:**
    - Implement refresh tokens with shorter access token expiry
    - Replace `eval()` with safe expression parser (mathjs)
    - Migrate auth tokens to HttpOnly cookies
    - Remove CSP `unsafe-inline` by refactoring event handlers
    - Add CSRF token protection
    - Implement audit logging for sensitive operations

---

### 2026-01-21: Character Sheet UI Enhancements & Race/Class Balancing

1. **Desktop Sidebar Layout** (≥1400px screens):
   - Added collapsible sidebar showing character overview
   - Displays: Name, HP/Arcana/Willpower bars, status (Bleed/Weakened)
   - Shows all 6 core attributes with their skills and values
   - Quick actions: Rest, Heal, Roll Dice, Use Potion
   - Toggle button to show/hide sidebar
   - Preference saved to localStorage (`aedelore_sidebar_collapsed`)

2. **DM Session Sidebar** (≥1400px screens):
   - Shows session info, quick stats, turning points, recent events
   - Quick actions for adding events and turning points

3. **+/- Buttons for Values**:
   - All attributes and skills now have +/- buttons for easy adjustment
   - Armor damage (Dmg on Armour) has +/- buttons
   - Shield damage (Dmg on Shield) has +/- buttons
   - Prevents values from going below 0

4. **Auto-Break Equipment**:
   - When armor damage >= armor HP → automatically marks as Broken
   - When shield damage >= shield HP → automatically marks as Broken
   - Works with +/- buttons and manual input
   - Updates when HP field changes too

5. **Race/Class Attribute Balancing**:
   - All races now have exactly **10 attribute points** (except High Elf = 12)
   - All classes now have exactly **8 attribute points**
   - Removed "Luck" skill usage (changed to Investigation/Perception)
   - Thief: Nature → Deception (better thematic fit)
   - Hunter: Intimidation → Insight (better thematic fit)

6. **Equipment Conflict Fixes**:
   - Dwarf: Small Shield → Warhammer (no shield conflict with Warrior)
   - Moon Elf: Shortbow → Short Sword (no bow conflict with Hunter)
   - Moon Elf: Removed "Starting Gold: 1D100" (only classes give gold)
   - Troll: Added Club as starting weapon
   - Updated worthiness: Halfling = 8, Dwarf = 7

7. **Autofill Bugfixes**:
   - Equipment fields now reset before applying new values
   - Fixed shield not clearing when switching from Warrior to other class
   - Fixed arrows not clearing when switching from Hunter
   - Fixed food not clearing when switching classes
   - Fixed "Force of Will" case sensitivity in attributeMapping

8. **Character Creation Note**:
   - Added "No single talent may exceed 5 points at the start" to stats section

9. **Files Modified**:
   - `html/character-sheet.html` - Sidebar HTML, +/- buttons, auto-break logic, autofill fixes
   - `html/css/styles.css` - Sidebar CSS, +/- button styles, responsive adjustments
   - `html/js/dashboard.js` - Sidebar sync functions, toggle functionality
   - `html/dm-session.html` - DM sidebar HTML
   - `html/js/dm-session.js` - DM sidebar sync functions
   - `html/data/races.js` - Balanced attributes, fixed equipment
   - `html/data/classes.js` - Balanced attributes

### 2026-01-21: DM Cheat Sheet Major Expansion

1. **New Quick Cards** (12 total):
   - Initiative (D6/D10 rules)
   - Difficulty levels (1-6+ successes)
   - Rest & Healing (short/long rest)
   - HP at 0 (Dying) outcomes
   - Stop Bleeding methods
   - Assistance rules
   - Potions quick reference

2. **New Tables**:
   - Defense Options - Full table with dice pools and all outcomes
   - Status Effects - Poisoned, Stunned, Blinded, Deafened, Frightened, Prone
   - Combat Flow overview

3. **Detailed Step-by-Step Examples**:
   - **Defense**: Dodge, Parry, Block (with shield), Take Hit (with armor)
   - **Attack**: Melee, Ranged, Glancing hit (with damage halving)
   - **Spellcasting**: Mage spell, Druid spell
   - **Class Abilities**: Warrior (Last Stand), Thief (Sneaking)
   - **Skill Checks**: Simple, Contested, Critical 10 mechanic

4. **Key Clarifications**:
   - Attack roll and damage roll are clearly shown as separate steps
   - Which ability to use for which weapon type
   - When to use each defense option

5. **Files Modified**:
   - `html/dm-session.html` - Expanded Reference tab DM Cheat Sheet section

### 2026-01-21: Avatar Selection Feature

1. **Avatar Selection Modal** - Users can now customize their character avatar:
   - Click the circular icon above character name on Dashboard
   - Opens modal with avatar options

2. **Predefined Avatars** (24 total):
   - Fantasy Portraits: Wizard, Elf, Vampire, Fairy, Genie, Zombie, Hero, Ninja, Princess, Prince, Angel, Demon
   - Combat & Class: Warrior, Shield, Archer, Rogue, Sorcerer, Magic, Druid, Beast, Eagle, Dragon, Skull, Moon

3. **Custom Image Upload**:
   - Supports JPG, PNG, WebP, GIF formats
   - Max file size: 2MB
   - Images stored as base64 in character data
   - Preview shown before confirming selection

4. **Technical Implementation**:
   - `currentAvatar` object with `type` (emoji/image) and `value`
   - `getAvatarData()` / `setAvatarData()` for save/load
   - Avatar data stored in character JSON as `_avatar` field
   - Works with autosave, manual save, export/import
   - Multiple fallback selectors for robust element finding

5. **UI Features**:
   - Hover effect on hero-avatar shows edit icon
   - "Clear" button resets to default "?" placeholder
   - Current avatar preview shown in modal
   - Mobile-responsive grid (6 columns → 4 columns on mobile)

6. **Files Modified**:
   - `html/character-sheet.html` - Avatar modal HTML, clickable hero-avatar
   - `html/css/styles.css` - Avatar modal styling, clickable avatar CSS
   - `html/js/main.js` - Avatar functions, updated getAllFields/setAllFields

### 2026-01-21: Tablet Sidebar Support

1. **Sidebar now available on tablets** (768px - 1399px):
   - Slide-in overlay from left side
   - Toggle button visible on left edge
   - Backdrop overlay when open (click to close)
   - Smooth slide animation

2. **Behavior by screen size**:
   - **Mobile (<768px):** Sidebar hidden, no toggle button
   - **Tablet (768px-1399px):** Sidebar as overlay, toggle button visible
   - **Desktop (≥1400px):** Sidebar pushes content, collapsible

3. **Technical Implementation**:
   - `isTabletView()` / `isDesktopView()` helper functions
   - Tablet uses `.open` class, desktop uses `.collapsed` class
   - `handleSidebarResize()` handles switching between modes
   - Backdrop element with click-to-close

4. **Files Modified**:
   - `html/css/styles.css` - Tablet media query for sidebar overlay
   - `html/js/dashboard.js` - Updated toggleSidebar for tablet support
   - `html/js/dm-session.js` - Same updates for DM tool
   - `html/character-sheet.html` - Added sidebar-backdrop element
   - `html/dm-session.html` - Added sidebar-backdrop element

### 2026-01-21: Armor & Shield HP Rebalancing

1. **Shield HP Increased** (~50% boost):
   | Shield | Old HP | New HP | Damage |
   |--------|--------|--------|--------|
   | Small Shield | 3 | 5 | 1d6 (was 1d4) |
   | Shield (Wooden) | 10 | 15 | 1d6 (was 1d4) |
   | Spiked Shield | 12 | 18 | 1d10 (was 1d8) |
   | Shield (Metal) | 15 | 22 | 1d6 |
   | Shield (Tower) | 30 | 45 | 1d6 (was 1d4) |

2. **Chest Armor HP Increased** (Medium/Heavy):
   | Armor | Old HP | New HP |
   |-------|--------|--------|
   | Hide | 8 | 10 |
   | Chain Shirt | 9 | 15 |
   | Scale Mail | 10 | 18 |
   | Breastplate | 11 | 20 |
   | Half Plate | 13 | 25 |
   | Ring Mail | 10 | 16 |
   | Chainmail | 13 | 22 |
   | Splint | 14 | 28 |
   | Plate | 15 | 35 |

3. **Head Armor HP Increased**:
   - Chain Coif: 4 → 8
   - Light Helmet: 5 → 10
   - Heavy Helmet: 6 → 12
   - Great Helm: 7 → 14

4. **Shoulder Armor HP Increased**:
   - Chain Pauldrons: 5 → 10
   - Plate Pauldrons: 7 → 14

5. **Hand Armor HP Increased**:
   - Chain Gloves: 4 → 8
   - Plate Gauntlets: 6 → 12

6. **Leg Armor HP Increased**:
   - Chain Greaves: 5 → 10
   - Plate Greaves: 7 → 14

7. **Files Modified**:
   - `html/data/armor.js` - All HP values updated
   - `docs/game-data/armor.txt` - Documentation updated

### 2026-01-21: UI Polish & Mobile Fixes

1. **Landing Page Navigation Labels**:
   - Added text labels below each navigation icon
   - Labels: World, History, Races, Sheet, DM, Wiki
   - Responsive sizing for mobile (smaller icons and text)

2. **Attribute Input Field Widths Increased**:
   - Main inputs: 50px → 60px
   - Table inputs: 40px → 50px
   - Mobile table inputs: 35px → 45px
   - Numbers now fit properly in input fields

3. **Quick Action Values Display** (Mobile Dashboard):
   - HP, Arcana, Willpower now show "5/10" format
   - Bleed, Weakened show current value
   - Worth shows "+6" or "-2" format
   - Values update live when +/- buttons clicked
   - Color-coded per stat type (red HP, purple Arcana, etc.)

4. **Rest Button Enhanced**:
   - Now restores +2 HP AND +2 Arcana per click
   - Shows combined message: "Rested! HP +2 (5/10), Arcana +2 (8/16)"
   - Only restores if not already at max

5. **Potion Popup Fix**:
   - Fixed poison potion missing frame/border
   - Removed incorrect `:last-child` CSS rule that made last potion transparent

6. **Mobile Menu Fix**:
   - Fixed header menu (Menu, Cloud, Theme) showing expanded by default on mobile
   - Issue: `display: flex !important` on base rule overrode mobile `display: none`
   - Fix: Removed `!important` from base rule, added to mobile rule instead
   - Mobile menu now properly hidden until hamburger button clicked

7. **Files Modified**:
   - `html/index.html` - Navigation labels HTML and CSS
   - `html/character-sheet.html` - Quick action value spans
   - `html/css/styles.css` - Input widths, value colors, mobile menu fix, potion fix
   - `html/js/dashboard.js` - quickRest() enhanced, updateStatusBar() syncs quick values

### 2026-01-21: Character Locking & XP System

1. **Feature Purpose**: Players must lock their character's race/class and attributes before playing, preventing changes during gameplay. DM can award XP which allows players to earn additional attribute points.

2. **Database Schema** (new columns in `characters` table):
   - `xp` INTEGER DEFAULT 0 - Total XP earned
   - `xp_spent` INTEGER DEFAULT 0 - XP spent on attribute points
   - `race_class_locked` BOOLEAN DEFAULT FALSE - Whether race/class is locked
   - `attributes_locked` BOOLEAN DEFAULT FALSE - Whether attributes are locked

3. **Locking Flow**:
   - Player creates character, chooses race/class
   - Player clicks "Lock Race & Class" → `race_class_locked = true`
   - Player distributes 10 starting attribute points
   - Player clicks "Lock Attributes" → `attributes_locked = true`
   - Character is now ready for play

4. **XP System**:
   - 10 XP = 1 attribute point
   - DM awards XP via DM Sessions tool
   - When player has 10+ available XP (earned - spent), they can spend it
   - Spending unlocks attributes temporarily to add 1 point
   - Player then re-locks attributes

5. **DM Controls** (in DM Sessions, Players section):
   - "Give XP" button - Modal with quick amounts (+5, +10, +20, +50)
   - "Unlock" button - Unlocks race/class, attributes, or both
   - Shows current XP and lock status for each player

6. **API Endpoints** (6 new):
   - `POST /api/characters/:id/lock-race-class` - Player locks race/class
   - `POST /api/characters/:id/lock-attributes` - Player locks attributes
   - `POST /api/characters/:id/spend-attribute-point` - Player spends 10 XP
   - `POST /api/dm/characters/:id/give-xp` - DM gives XP (requires campaign ownership)
   - `POST /api/dm/characters/:id/unlock` - DM unlocks character
   - `GET /api/dm/campaigns/:id/characters` - Get characters with XP info

7. **UI Elements**:
   - **Character Sheet**: Progression section with XP display, lock buttons
   - **DM Sessions**: XP and lock status in player list, Give XP modal

8. **Files Modified**:
   - `api/db.js` - Added migration for new columns
   - `api/server.js` - Added 6 API endpoints, updated player list endpoint
   - `html/character-sheet.html` - Progression section HTML
   - `html/css/styles.css` - Progression styling, locked field styling, btn-small classes
   - `html/js/main.js` - Lock functions, XP display, field disabling logic
   - `html/dm-session.html` - Give XP modal HTML
   - `html/js/dm-session.js` - Give XP, unlock functions, player list with XP

### 2026-01-21: Theme System

1. **4 Themes Available**:
   | Theme | Description |
   |-------|-------------|
   | Aedelore | Default - purple/blue gradients, gold accents |
   | Dark Glass | Premium dark: black backgrounds, silver frames, gold accents, glass blur effects |
   | Midnight Blue | Elegant moonlight, blue/purple/cyan accents with glow |
   | Ember | Fiery dark: charcoal background, orange/red/yellow fire colors, intense glow effects |

2. **Dark Glass Theme Details**:
   - Near-black backgrounds (`#050508`, `#0a0a0c`)
   - Gold accents (`#ffc942`) with glow effects
   - Silver borders and frames (`rgba(192,192,192,...)`)
   - Vibrant stat colors with text-shadow glow:
     - HP: `#ff5252` (bright red)
     - Arcana: `#b388ff` (vibrant purple)
     - Willpower: `#40c4ff` (electric blue)
     - Worthiness: `#ffc942` (gold)
   - Glassmorphism with `backdrop-filter: blur()`
   - z-index fix: header has `z-index: 10` to keep dropdowns above content

3. **Midnight Blue Theme Details**:
   - Dark blue backgrounds (`#0a1628`)
   - Blue/purple/cyan color scheme
   - Glow effects on status values and stat rows (added 2026-01-21)
   - Slider fills with matching gradients and glow

3. **Ember Theme Details**:
   - Charcoal background (`#0c0806`) with subtle fire gradient shimmer
   - Fire colors: HP `#ff2a2a` (red), Arcana `#ff8c00` (orange), Willpower `#ffcc00` (yellow)
   - Triple text-shadow glow (10px + 20px + 30px) on status values
   - Intense box-shadow glow on buttons and tabs at hover
   - Fire gradient sliders (red → orange → yellow)
   - Glassmorphism with `backdrop-filter: blur(16px)`

4. **Browser Theme Color**:
   - Dynamic `<meta name="theme-color">` updates when switching themes
   - Inline script in `<head>` sets color immediately on page load
   - Colors: Aedelore `#8b5cf6`, Dark Glass `#1a1a1f`, Midnight `#0a1628`, Ember `#1a0c08`

5. **Technical Implementation**:
   - CSS variables in `:root` (default) and `[data-theme="..."]` selectors
   - Theme stored in `localStorage.setItem('aedelore_theme', themeName)`
   - `THEME_COLORS` object maps theme names to browser chrome colors
   - Shared between character sheet and DM tool

6. **Files Modified**:
   - `html/css/styles.css` - Theme CSS variables, glow effects, z-index fixes
   - `html/js/main.js` - Theme functions, THEME_COLORS mapping
   - `html/js/dm-session.js` - Theme functions, THEME_COLORS mapping
   - `html/character-sheet.html` - Theme dropdown, inline theme-color script
   - `html/dm-session.html` - Theme dropdown, inline theme-color script, theme-color meta tag
   - `html/service-worker.js` - Cache version `aedelore-v16`

---

## Contact Points

- **Wiki:** wiki.aedelore.nu
- **Main site:** aedelore.nu
- **Game data source:** /books/miscs-of-aedelore

---

*This file should be updated whenever significant changes are made to the project.*
