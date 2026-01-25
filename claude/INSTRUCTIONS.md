# Claude Instructions for Aedelore Project

> IMPORTANT: Read this file at the start of every session.
> These are standing instructions for maintaining the Aedelore codebase.

---

## General Rules

### 1. Always Update Documentation
When making changes, update ALL relevant files:

| Change Type | Files to Update |
|-------------|-----------------|
| New weapon | `html/data/weapons.js`, `data/weapons.txt`, `html/dm-session.html` (Reference tab) |
| New armor | `html/data/armor.js`, `data/armor.txt`, `html/dm-session.html` (Reference tab) |
| New spell | `html/data/spells.js`, `data/spells.txt`, `html/dm-session.html` (Reference tab) |
| New race | `html/data/races.js`, update any race-dependent logic |
| New religion | `html/data/religions.js`, verify bonus calculations |
| API change | `api/server.js`, `Claude/INDEX.md` (API endpoints section) |
| DB schema change | `api/db.js`, `Claude/INDEX.md` (Database Schema section) |
| New feature | `Claude/MEMORY.md`, `Claude/INDEX.md` |
| Folder restructure | `Claude/INDEX.md` (Directory Structure section) |

### 2. Sync Game Data Across Platforms
Game data exists in multiple places - keep them synchronized:

```
Source of truth: html/data/*.js (web version)
                    ↓
    Sync to: apps/kmp/composeApp/src/commonMain/.../data/GameData.kt
    Sync to: data/*.txt (documentation reference)
    Sync to: html/dm-session.html (Reference tab)
```

### 3. After Code Changes
Always rebuild and restart affected services:

```bash
# After API changes
docker compose build --no-cache aedelore-proffs-api && docker compose up -d aedelore-proffs-api

# After HTML/JS changes (nginx serves static files)
# No rebuild needed, changes are immediate

# After KMP/mobile app changes
cd /opt/aedelore/apps/kmp
export ANDROID_HOME=/opt/aedelore/android-sdk
./gradlew :androidApp:assembleDebug
# IMPORTANT: Copy APK to web server for download
cp androidApp/build/outputs/apk/debug/androidApp-debug.apk /opt/aedelore/html/aedelore-character-sheet.apk
```

### 4. Update Memory Files
After significant sessions, update:
- `Claude/MEMORY.md` - Add decisions, changes, new features
- `Claude/INDEX.md` - Update file references, endpoints, structure

---

## File Location Reference

### Where to find things:

| Looking for... | Location |
|----------------|----------|
| Weapon stats | `html/data/weapons.js` |
| Armor stats | `html/data/armor.js` |
| Spells | `html/data/spells.js` |
| Races | `html/data/races.js` |
| Religions | `html/data/religions.js` |
| Character sheet UI | `html/character-sheet.html` |
| Character sheet JS | `html/js/main.js` |
| DM tool UI | `html/dm-session.html` |
| DM tool JS | `html/js/dm-session.js` |
| API endpoints | `api/server.js` |
| Database schema | `api/db.js` (initializeDatabase function) |
| Docker config | `compose.yml` |
| Nginx config | `nginx.conf` |
| DB credentials | `.env` |
| Mobile app (shared) | `apps/kmp/composeApp/src/commonMain/` |
| Mobile app (Android) | `apps/kmp/composeApp/src/androidMain/` |
| Mobile app (iOS) | `apps/kmp/composeApp/src/iosMain/` |
| Mobile API client | `apps/kmp/.../network/ApiClient.kt` |
| Mobile auth | `apps/kmp/.../network/AuthManager.kt` |
| APK download | `html/aedelore-character-sheet.apk` |

### Where to add things:

| Adding... | Primary File | Also Update |
|-----------|--------------|-------------|
| New API endpoint | `api/server.js` | `Claude/INDEX.md`, `apps/kmp/.../ApiClient.kt` if mobile needs it |
| New character field | `html/js/main.js` + `character-sheet.html` | `apps/kmp/.../Character.kt` |
| New DM tool feature | `html/js/dm-session.js` + `dm-session.html` | `Claude/MEMORY.md` |
| New game data | `html/data/*.js` | `data/*.txt`, `dm-session.html` Reference tab |
| Mobile app UI change | `apps/kmp/.../ui/screens/*.kt` | Rebuild APK & copy to `html/` |
| Mobile app API change | `apps/kmp/.../network/ApiClient.kt` | Rebuild APK & copy to `html/` |

---

## Data Consistency Checklist

When user asks to add/modify game data, verify:

- [ ] Web data file updated (`html/data/*.js`)
- [ ] Documentation updated (`data/*.txt`)
- [ ] DM tool Reference tab updated (if applicable)
- [ ] KMP app data updated (if game-critical)
- [ ] INDEX.md updated (if structure changed)

---

## Common Patterns

### Adding a weapon:
```javascript
// 1. Add to html/data/weapons.js
"New Weapon": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d8", range: "1", break: "2" },

// 2. Add to data/weapons.txt (for reference)

// 3. Add to dm-session.html Reference tab (Weapons accordion)
<tr><td>New Weapon</td><td>Str</td><td class="num">+2</td><td>1d8</td><td class="num">1</td><td>15 gp</td></tr>
```

### Adding an API endpoint:
```javascript
// 1. Add to api/server.js
app.get('/api/new-endpoint', authenticate, async (req, res) => { ... });

// 2. Add to Claude/INDEX.md API Endpoints table
| `/api/new-endpoint` | GET | Description |

// 3. Rebuild API
docker compose build --no-cache aedelore-proffs-api && docker compose up -d
```

---

## Reminders

1. **Test after changes** - Verify functionality works
2. **Commit message style** - Use descriptive messages
3. **Security** - Never expose .env contents, DB passwords
4. **Backup** - SQLite backup exists at `api/data/aedelore.db`
5. **Wiki is source** - https://wiki.aedelore.nu is the canonical game data source

---

## Quick Commands

```bash
# Project root
cd /opt/aedelore

# Check services
docker compose ps

# Rebuild everything
docker compose down && docker compose up -d --build

# API logs
docker compose logs -f aedelore-proffs-api

# Database shell
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore

# Count lines in key files
wc -l api/server.js html/dm-session.html html/js/dm-session.js

# Find files
find . -name "*.js" -path "*/data/*"
```

---

*Always keep this file updated with new patterns and locations.*
