# Aedelore Project Index

> Quick reference for navigating the Aedelore codebase.
> Last updated: 2026-01-21 (Project reorganized, 4 themes: Aedelore, Dark Glass, Midnight Blue, Ember)

---

## Project Overview

**Aedelore** is a fantasy RPG game system with:
- Web-based Character Sheet (aedelore.nu/character-sheet) - PWA, installable
- DM Session Tool for campaign management
- PostgreSQL backend API

---

## Directory Structure

```
/opt/aedelore/
├── api/                    # Node.js Backend API
│   ├── server.js           # Express server
│   ├── db.js               # PostgreSQL connection
│   ├── package.json        # Dependencies
│   └── Dockerfile          # API container
│
├── html/                   # Web Frontend (nginx served)
│   ├── index.html          # Landing page
│   ├── character-sheet.html # Main character sheet (PWA)
│   ├── dm-session.html     # DM Session Tool
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # PWA offline caching
│   ├── robots.txt          # SEO
│   ├── sitemap.xml         # SEO
│   ├── icons/              # PWA icons
│   │   └── icon.svg
│   ├── css/
│   │   └── styles.css      # All styling
│   ├── js/
│   │   ├── main.js         # Character sheet logic
│   │   ├── dashboard.js    # Dashboard, status bar, quick actions
│   │   ├── tabs.js         # Tab switching
│   │   ├── sliders.js      # Slider controls
│   │   ├── dm-session.js   # DM tool logic
│   │   ├── weapons.js      # Weapon calculations
│   │   ├── armor.js        # Armor calculations
│   │   ├── spells.js       # Spell data
│   │   ├── diceroller.js   # Dice rolling
│   │   ├── privacy.js      # Privacy handling
│   │   ├── system-selector.js  # Multi-system selector modal
│   │   └── systems/        # Multi-system support
│   │       ├── system-config.js  # System configurations
│   │       ├── dnd5e.js          # D&D 5e
│   │       ├── pathfinder2e.js   # Pathfinder 2e
│   │       ├── storyteller.js    # Classic WoD
│   │       └── cod.js            # Chronicles of Darkness
│   └── data/               # Game data (JS objects)
│       ├── weapons.js      # 50+ weapons
│       ├── armor.js        # Armor pieces
│       ├── spells.js       # Mage & Druid spells
│       ├── races.js        # 10 races
│       ├── classes.js      # Character classes
│       ├── religions.js    # 12 religions
│       └── npc-names.js    # NPC name generator data
│
├── docs/                   # All Documentation
│   ├── RESTORE-INSTRUCTIONS.md  # Server migration guide
│   ├── rules/              # Game Rules
│   │   ├── AEDELORE-RULES-COMPLETE.md  # Full Swedish rulebook
│   │   └── AEDELORE-RULES-EN.md        # English rulebook
│   ├── security/           # Security Documentation
│   │   ├── SECURITY-AUDIT-2026-01-19.md
│   │   └── SECURITY-RECOMMENDATIONS.md
│   ├── game-data/          # Game Data Reference (TXT)
│   │   ├── weapons.txt
│   │   ├── armor.txt
│   │   ├── abilities.txt
│   │   ├── spells.txt
│   │   └── template.odt
│   └── dev/                # Development Notes
│       ├── RULES-OPTIMIZATION.md
│       ├── multi-system-instructions.txt
│       └── notes.txt
│
├── claude/                 # Claude AI Files (this folder)
│   ├── INDEX.md            # This file
│   ├── INSTRUCTIONS.md     # Work rules
│   ├── MEMORY.md           # Project memory/context
│   └── settings.local.json # Claude permissions
│
├── db/                     # Database Files
│   └── schema.sql          # PostgreSQL schema
│
├── scripts/                # Utility Scripts
│   └── migrate-to-postgres.py  # Migration tool
│
├── backups/                # Backup files (chmod 600)
│   ├── database-backup.sql # PostgreSQL backup
│   └── 2026-01-20-before-redesign/  # Pre-redesign backup
│
├── compose.yml             # Docker Compose config (chmod 600)
├── nginx.conf              # Nginx config (chmod 600)
├── .env                    # Credentials (chmod 600, NEVER commit!)
├── .env.example            # Template for .env
├── .gitignore              # Git ignore rules
└── CLAUDE.md               # Main Claude instructions
```

---

## Quick File Reference

### API Endpoints (server.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create account |
| `/api/login` | POST | Login, get token |
| `/api/logout` | POST | Logout |
| `/api/me` | GET | Get user profile + stats |
| `/api/account/password` | PUT | Change password |
| `/api/characters` | GET/POST | List/create characters |
| `/api/characters/:id` | GET/PUT/DELETE | Single character |
| `/api/campaigns` | GET/POST | List/create campaigns |
| `/api/campaigns/:id` | GET/PUT/DELETE | Single campaign |
| `/api/campaigns/:id/sessions` | GET/POST | Campaign sessions |
| `/api/sessions/:id` | GET/PUT/DELETE | Single session |
| `/api/sessions/:id/lock` | PUT | Lock session |
| `/api/sessions/:id/unlock` | PUT | Unlock session |

### Database Schema

```sql
-- PostgreSQL (via Docker)
users (id, username, password_hash, created_at)
characters (id, user_id, name, data JSONB, system TEXT DEFAULT 'aedelore', updated_at)
campaigns (id, user_id, name, description, created_at, updated_at)
sessions (id, campaign_id, user_id, session_number, date, location, status, data JSONB, created_at, updated_at)
```

### Web Pages

| URL | File | Description |
|-----|------|-------------|
| `/` | index.html | Landing page |
| `/character-sheet` | character-sheet.html | Character sheet tool (multi-system) |
| `/dm-session` | dm-session.html | DM Session tool |

---

## Multi-System Character Sheet

The character sheet supports multiple RPG systems. On first visit, a system selector modal appears.

**Supported Systems:**
| System | Dice | Key Features |
|--------|------|--------------|
| Aedelore | d10 pool | Original system (unchanged) |
| D&D 5th Edition | d20 + mod | 6 attributes, 18 skills, spell slots |
| Pathfinder 2e | d20 + mod | Proficiency ranks, degrees of success |
| Storyteller (Classic WoD) | d10 pool | 9 attributes (3x3), 30 abilities, dot ratings |
| Chronicles of Darkness | d10 pool | 9 attributes, 24 skills, 10-again mechanic |

**localStorage Keys:**
- `aedelore_selected_system` - Currently selected system
- `aedelore_remember_system` - Whether to skip selector on next visit
- `aedelore_character_{systemId}_autosave` - Auto-saved character per system
- `aedelore_sidebar_collapsed` - Sidebar toggle state (desktop)
- `aedelore_theme` - Selected theme (aedelore, dark-glass, midnight, ember)

### Themes
4 themes available via Menu → Theme (character sheet) or Header → Theme (DM tool):
| Theme | Style |
|-------|-------|
| Aedelore | Default - purple/blue, gold accents |
| Dark Glass | Premium dark: black bg, silver frames, gold accents, glass blur, glow effects |
| Midnight Blue | Elegant moonlight, blue/purple/cyan with glow effects |
| Ember | Fiery dark: charcoal bg, orange/red/yellow fire colors, intense triple-glow effects |

**Browser Theme Color:** Updates dynamically via `<meta name="theme-color">` when switching themes.
Colors: Aedelore `#8b5cf6`, Dark Glass `#1a1a1f`, Midnight `#0a1628`, Ember `#1a0c08`

### Sidebar (Desktop ≥1400px, Tablet 768px-1399px)
- **Desktop:** Collapsible sidebar that pushes content
- **Tablet:** Slide-in overlay with backdrop, toggle button visible
- Shows: Name, HP/Arcana/Willpower bars, Bleed/Weakened status
- All 6 core attributes with skills and values
- Quick actions (Rest, Heal, Roll Dice, Use Potion)
- Toggle button to show/hide
- Click backdrop to close (tablet only)

### +/- Buttons
- All attributes and skills have +/- for easy adjustment
- Armor/Shield damage fields have +/- buttons
- Auto-break: Equipment marked Broken when damage ≥ HP

### Avatar Selection
- Click the avatar icon on Dashboard to customize
- 24 predefined emoji avatars (fantasy portraits, combat/class icons)
- Upload custom images (JPG, PNG, WebP, GIF, max 2MB)
- Avatar saved with character data (works with autosave, export/import)
- Clear button resets to default "?" placeholder

---

## DM Session Tool Features

**3 Tabs:**
1. **Planning** - Build the adventure
   - Hook/Goal (session purpose)
   - Players, NPCs, Places, Encounters, Items/Clues, Read-Aloud
2. **During Play** - Live session view
   - Quick access cards for NPCs, Places, Encounters, Items
   - Turning Points (key decisions)
   - Event Log (timestamped notes)
   - Session Notes
3. **Reference** - Rules, Weapons, Armor, Spells (with spell types)
   - **DM Cheat Sheet** - 12 quick cards, defense/attack/spell step-by-step examples
   - Detailed examples for Dodge, Parry, Block, Take Hit
   - Combat flow, status effects, difficulty levels

**Header Dropdown Menus:**
| Menu | Items |
|------|-------|
| Server | Login, Logout, My Data, Password, Save |
| Session | Lock, Unlock, Delete Session |
| AI | AI Assistant |
| File | Export, Print, Help |

**Features:**
- Campaign & session management via dashboard cards
- Interactive sync between Planning and During Play
- Track: NPCs used, Places visited, Items found, Encounter status
- Session locking (active/locked) and deletion
- Import players from previous session
- Markdown export (single session or full campaign)
- Auto-save every 30 seconds
- My Data profile view
- **Help modal** with 7 sections covering all features
- **Player sharing** via 8-character share codes
- **AI Assistant** for session planning (export/import)

---

## Game System Quick Reference

### Dice Mechanics
- Roll D10s based on ability points (1-2pts=1D10, 3-4pts=2D10, 5-6pts=3D10, 7-8pts=4D10, 9-10pts=5D10, 11+=6D10)
- Max 8 dice per action
- Results: 1-5 fail, 6-7 barely, 8-9 success, 10 critical (reroll and add)

### Combat Flow
1. Initiative (D6 or D10 if 6+ players)
2. Attack roll (Core Ability + Weapon Attack Bonus) - NO skill in attack
3. Defense (dodge/parry/block/take hit)
4. Damage (weapon damage dice)

### Defense Options
- **Dodge:** Dexterity + Acrobatics
- **Parry:** Strength + Weapon Attack Bonus
- **Block:** Strength (absorbs up to Block value in damage)
- **Take Hit:** Toughness + Armor Bonus (each success = -1 damage)

### Weapon Damage (D6/D10/2D6 only)
- Simple weapons: 1d6
- Martial one-handed: 1d10
- Martial two-handed: 2d6

### Rules Documentation
- Full rulebook (Swedish): `/opt/aedelore/docs/rules/AEDELORE-RULES-COMPLETE.md`
- Full rulebook (English): `/opt/aedelore/docs/rules/AEDELORE-RULES-EN.md`

### Starting HP
HP = Race base HP + Class HP bonus
- **Race HP:** Human 20, Dwarf 22, Halfling 14, High Elf 16, Moon Elf 18, Orc 24, Troll 20
- **Class Bonus:** Warrior +5, Outcast +4, Hunter +3, Druid +3, Thief +2, Mage +2

### Attribute Points (Balanced)
- **All races:** 10 attribute points (except High Elf = 12)
- **All classes:** 8 attribute points
- **Limit:** No single talent may exceed 5 points at start

### Starting Equipment (Notable)
- **Dwarf:** Warhammer (not shield - avoids conflict with Warrior)
- **Moon Elf:** Short Sword (not bow - avoids conflict with Hunter)
- **Warrior:** Shield (Metal), Chainmail chest, Leather shoulders/legs
- **Classes give gold:** Warrior 2, Thief 7, Outcast 2, Mage 10, Hunter 3, Druid 2

### Arcana
- Mage max: 20, starts at 10
- Druid max: 16, starts at 8
- Regen: +1/round, +2/rest

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# Rebuild API after code changes
docker compose build --no-cache aedelore-proffs-api
docker compose up -d aedelore-proffs-api

# View logs
docker compose logs -f aedelore-proffs-api

# Access database
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore

# BookStack Wiki (in /opt/wiki)
cd /opt/wiki && docker compose up -d       # Start wiki
docker logs bookstack_app                   # View wiki logs
docker exec bookstack_db mysql -u bookstack -p bookstack  # Access wiki DB
```

---

## Progressive Web App (PWA)

The character sheet is a Progressive Web App that can be installed on any device.

### PWA Files
| File | Description |
|------|-------------|
| `/html/manifest.json` | App metadata, icons, display settings |
| `/html/service-worker.js` | Offline caching, background sync |
| `/html/icons/icon.svg` | App icon (purple gradient with "A") |

### Features
- **Installable:** "Install App" button in menu, or browser install prompt
- **Offline:** Service worker caches all static assets
- **Auto-update:** Checks for updates when online
- **Cross-platform:** Works on Android, iOS, and desktop

### Install Instructions
- **Android:** Menu → "Install App" or browser menu → "Add to Home Screen"
- **iOS:** Share button → "Add to Home Screen"
- **Desktop:** Browser address bar install icon or menu → "Install App"

### Service Worker Cache
Caches: HTML, CSS, JS, game data files (weapons, spells, etc.)
Does NOT cache: API calls (always goes to network)

---

## Build Commands

### Update Service Worker Cache
When adding new files, update the `STATIC_ASSETS` array in `/html/service-worker.js`
and increment `CACHE_NAME` version (e.g., 'aedelore-v2').

---

## External Resources

- **Wiki:** https://wiki.aedelore.nu (BookStack, port 6875 lokalt)
- **Website:** https://aedelore.nu
- **Character Sheet:** https://aedelore.nu/character-sheet
- **DM Tool:** https://aedelore.nu/dm-session

---

## Common Tasks

### Add new weapon
1. Edit `/opt/aedelore/html/data/weapons.js`
2. Add to WEAPONS_DATA object (use only D6, D10, or 2D6 for damage)
3. Update `/opt/aedelore/data/weapons.txt` for reference

### Modify class/race starting stats
1. **Classes:** Edit `/opt/aedelore/html/data/classes.js`
   - `hpBonus` - HP added to race HP
   - `worthiness` - Starting worthiness
   - `armor` - Object with `chest`, `shoulders`, `legs` (or string for chest only)
   - `shield` - Starting shield (e.g., "Shield (Metal)")
2. **Races:** Edit `/opt/aedelore/html/data/races.js`
   - `hp` - Base HP
   - `worthiness` - Starting worthiness
3. Auto-fill logic is in `html/character-sheet.html`:
   - `autoFillHP()` - Calculates race HP + class bonus
   - `autoFillStartingEquipment()` - Fills weapons, armor pieces, shield

### Add/Remove spell (IMPORTANT: 4 locations!)
1. **Web:** Edit `/opt/aedelore/html/data/spells.js`
2. **App data:** Edit `/opt/aedelore/apps/kmp/.../data/GameData.kt` (allSpells map)
3. **App dropdowns:** Edit `/opt/aedelore/apps/kmp/.../ui/screens/CombatScreen.kt`
   - `mageSpellOptions` list (line ~660)
   - `druidSpellOptions` list (line ~697)
   - These are SEPARATE from GameData.kt!
4. **Docs:** Update `/opt/aedelore/data/spells.txt`
5. **Rebuild APK:** (clear cache if changes don't appear)
   ```bash
   cd /opt/aedelore/apps/kmp
   rm -rf .gradle/configuration-cache composeApp/build androidApp/build
   ./gradlew :androidApp:assembleDebug --no-build-cache
   cp androidApp/build/outputs/apk/debug/androidApp-debug.apk /opt/aedelore/html/aedelore-app.apk
   ```

### Modify API
1. Edit `/opt/aedelore/api/server.js`
2. Rebuild: `docker compose build --no-cache aedelore-proffs-api`
3. Restart: `docker compose up -d aedelore-proffs-api`

### Update Reference tab in DM Tool
1. Edit `/opt/aedelore/html/dm-session.html`
2. Find `id="page-reference"` section
3. Add/modify accordion sections
