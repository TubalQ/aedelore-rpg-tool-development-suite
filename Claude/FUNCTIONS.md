# Aedelore - Funktionsdokumentation

Komplett översikt över alla funktioner, API-anrop och integrationer.

---

## Innehåll

1. [Spelarfunktioner (Character Sheet)](#1-spelarfunktioner-character-sheet)
2. [DM-funktioner (DM Session)](#2-dm-funktioner-dm-session)
3. [API-endpoints](#3-api-endpoints)
4. [Integration DM ↔ Spelare](#4-integration-dm--spelare)
5. [Speldata](#5-speldata)
6. [Hjälpfiler och utilities](#6-hjälpfiler-och-utilities)

---

## 1. Spelarfunktioner (Character Sheet)

**Filer:** `html/js/main.js`, `html/js/dashboard.js`, `html/character-sheet.html`

### 1.1 Karaktärsskapande

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| Race selection | HTML | 873 | Välj bland 7 raser |
| Class selection | HTML | 886 | Välj bland 6 klasser |
| Religion selection | HTML | 898 | Välj bland 15 religioner |
| `autoFillStartingEquipment()` | HTML | inline | Auto-fyller utrustning baserat på ras+klass |
| `autoFillAttributes()` | HTML | inline | Auto-fyller attributbonusar från ras/klass/religion |

### 1.2 Lock-systemet (Karaktärsprogression)

**VIKTIGT:** Lock-systemet är ett kampanjverktyg för att förhindra fusk. Kräver cloud save.

| Funktion | Fil | Rad | API-anrop | Beskrivning |
|----------|-----|-----|-----------|-------------|
| `lockRaceClass()` | main.js | 2442 | `POST /api/characters/:id/lock-race-class` | Låser ras/klass - aktiverar attributfördelning |
| `lockAttributes()` | main.js | 2487 | `POST /api/characters/:id/lock-attributes` | Låser attribut efter 10 poäng - aktiverar abilities |
| `lockAbilities()` | main.js | 2588 | `POST /api/characters/:id/lock-abilities` | Låser abilities - karaktären är klar |
| `spendAttributePoint()` | main.js | 2637 | - | Går in i XP-spenderingsläge |

**Låsordning:** Race/Class → Attributes → Abilities (måste låsas i denna ordning)

**Variabler:**
```javascript
let raceClassLocked = false;
let attributesLocked = false;
let abilitiesLocked = false;
let xpSpendingMode = false;
```

### 1.3 Attributfördelning

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| `calculateBaseAttributeValues()` | main.js | 1849 | Beräknar basattribut från ras/klass/religion |
| `getCurrentAttributeTotal()` | main.js | 1898 | Summa av alla 6 attribut |
| `getFreePointsUsed()` | main.js | 1919 | Räknar använda fria poäng (av 10) |
| `canAddAttributePoint()` | main.js | 1926 | Validerar om attribut kan ökas |
| `updatePointsDisplay()` | main.js | 1976 | Uppdaterar UI för tillgängliga poäng |

**Attribut:** Strength, Dexterity, Intelligence, Wisdom, Force of Will, Toughness, Third Eye

### 1.4 Cloud Save & Autosave

| Funktion | Fil | Rad | API-anrop | Beskrivning |
|----------|-----|-----|-----------|-------------|
| `saveToServer()` | main.js | 1191 | `POST /api/characters` eller `PUT /api/characters/:id` | Sparar till molnet |
| `loadFromServer()` | main.js | 1263 | `GET /api/characters` | Listar sparade karaktärer |
| `loadCharacterById()` | main.js | 1456 | `GET /api/characters/:id` | Laddar specifik karaktär |
| `deleteCharacterById()` | main.js | 1537 | `DELETE /api/characters/:id` | Soft-delete (till papperskorgen) |
| `startAutoSave()` | main.js | 772 | - | Startar 3-sekunders autosave |
| `stopAutoSave()` | main.js | 804 | - | Stoppar autosave |
| `showCloudSaveIndicator()` | main.js | 710 | - | Visar "Saving..." indikator |

### 1.5 Lokal lagring

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| `saveCharacter()` | main.js | 626 | Sparar till localStorage |
| `loadCharacter()` | main.js | 633 | Laddar från localStorage |
| `exportCharacter()` | main.js | 645 | Exporterar som JSON-fil |
| `importCharacter()` | main.js | 659 | Importerar från JSON-fil |
| `clearCharacter()` | main.js | 681 | Rensar formuläret |

### 1.6 Papperskorg (Trash)

| Funktion | Fil | Rad | API-anrop | Beskrivning |
|----------|-----|-----|-----------|-------------|
| `showTrashModal()` | main.js | 1341 | - | Öppnar papperskorgen |
| `loadTrashCharacters()` | main.js | 1351 | `GET /api/trash/characters` | Hämtar borttagna karaktärer |
| `restoreCharacter()` | main.js | 1412 | `POST /api/trash/characters/:id/restore` | Återställer karaktär |
| `permanentDeleteCharacter()` | main.js | 1429 | `DELETE /api/trash/characters/:id` | Permanent borttagning |

### 1.7 Quest Items

| Funktion | Fil | Rad | API-anrop | Beskrivning |
|----------|-----|-----|-----------|-------------|
| `renderQuestItems()` | main.js | 1981 | - | Renderar quest items |
| `showQuestItemDetails()` | main.js | 2009 | - | Visar item-detaljer |
| `showQuestArchive()` | main.js | 2073 | - | Öppnar arkivet |
| `archiveCurrentQuestItem()` | main.js | - | `POST /api/characters/:id/archive-item` | Arkiverar item |
| `unarchiveQuestItem()` | main.js | - | `POST /api/characters/:id/unarchive-item` | Återställer item |

**Datastruktur:**
```javascript
charData.quest_items = [
    { name: "Ancient Key", description: "Opens the crypt", givenAt: "2026-01-22", sessionName: "Session 3" }
]
charData.quest_items_archived = [...]
```

### 1.8 Kampanjkoppling

| Funktion | Fil | Rad | API-anrop | Beskrivning |
|----------|-----|-----|-----------|-------------|
| `showLinkCampaignModal()` | main.js | 1620 | - | Öppnar modal för delkod |
| `linkCharacterToCampaign()` | main.js | 1630 | `POST /api/characters/:id/link-campaign` | Länkar med delkod |
| `unlinkCharacterFromCampaign()` | main.js | 1667 | `DELETE /api/characters/:id/link-campaign` | Avlänkar från kampanj |
| `loadPartyMembers()` | main.js | - | `GET /api/characters/:id/party` | Hämtar party members |

### 1.9 Quick Actions (Dashboard)

**Fil:** `html/js/dashboard.js`

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `quickRest()` | 842 | +2 HP, +2 Arcana |
| `quickHalfRest()` | 883 | +1 HP, +1 Arcana |
| `quickHeal()` | 924 | +1 HP |
| `usePotion()` | 944 | Öppnar potion-väljare |
| `consumePotion()` | 1011 | Använder vald potion |
| `spendHP()` | 1048 | -1 HP |
| `spendArcana()` | 1063 | -1 Arcana |
| `spendWillpower()` | 1080 | -1 Willpower |
| `gainHP()` | 1095 | +1 HP |
| `gainArcana()` | 1111 | +1 Arcana |
| `gainWillpower()` | 1129 | +1 Willpower |
| `addBleed()` | 1175 | +1 Bleed (max 6) |
| `removeBleed()` | 1145 | -1 Bleed |
| `addWeakened()` | 1191 | +1 Weakened (max 6) |
| `removeWeakened()` | 1160 | -1 Weakened |
| `adjustWorthiness()` | 1207 | ±1 Worthiness (-10 till +10) |
| `quickArmorDmg()` | 1265 | ±1 skada på rustning/sköld |

### 1.10 Utrustningshantering

**Fil:** `html/js/weapons.js`, `html/js/armor.js`

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| `setupWeaponAutofill()` | weapons.js | 3 | Auto-fyller vapenstats från WEAPONS_DATA |
| `setupArmorAutofill()` | armor.js | 3 | Auto-fyller rustningsstats för 5 kroppsdelar |
| `checkEquipmentBroken()` | main.js | - | Markerar trasig utrustning (HP ≤ 0) |

### 1.11 Abilities/Spells

**Fil:** `html/js/spells.js`

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `updateSpellsList()` | 7 | Uppdaterar spell-dropdown baserat på klass |
| `autoFillSpellData()` | 109 | Auto-fyller spell-data vid val |

**Kapacitet:** Mage = 10 spells, övriga klasser = 5 abilities

### 1.12 Onboarding Guide

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| `initOnboarding()` | main.js | 2675 | Initierar guide (döljs för inloggade) |
| `showOnboarding()` | main.js | 2822 | Visar sidebar |
| `hideOnboarding()` | main.js | 2836 | Döljer temporärt |
| `hideOnboardingPermanent()` | main.js | 2845 | Döljer permanent (localStorage) |
| `updateOnboardingProgress()` | main.js | 2855 | Uppdaterar checkmarks |

**Steg:** Register → Name → Save → Race/Class → Lock R/C → Attributes → Lock Attr → Campaign → Overview

### 1.13 Avatar & Tema

| Funktion | Fil | Rad | Beskrivning |
|----------|-----|-----|-------------|
| `showAvatarModal()` | main.js | 273 | Öppnar avatar-modal |
| `selectAvatar()` | main.js | 284 | Väljer emoji-avatar |
| `handleAvatarUpload()` | main.js | 291 | Laddar upp bild |
| `setTheme()` | main.js | 436 | Sätter tema (12 val) |

**Teman:** Aedelore, Midnight, Dark Glass, Ember, Forest, Frost, Void, Pure Darkness, Blood, Necro, Royal, Crimson

---

## 2. DM-funktioner (DM Session)

**Filer:** `html/js/dm-session.js`, `html/dm-session.html`

### 2.1 Kampanjhantering

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `createCampaign()` | 1633 | `POST /api/campaigns` | Skapar kampanj |
| `deleteCampaign()` | 1637 | `DELETE /api/campaigns/:id` | Tar bort kampanj |
| `editCampaignFromDashboard()` | 1471 | - | Öppnar redigering |
| `syncCampaignPlayers()` | 3804 | `GET /api/campaigns/:id/players` | Synkar spelarlista |

**Share-funktioner:**

| Funktion | API-anrop | Beskrivning |
|----------|-----------|-------------|
| Share campaign | `POST /api/campaigns/:id/share` | Genererar 8-teckens delkod |
| Revoke share | `DELETE /api/campaigns/:id/share` | Tar bort delkod och alla spelare |

### 2.2 Sessionshantering

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `createNewSession()` | 1775 | `POST /api/campaigns/:id/sessions` | Skapar session |
| `loadSession()` | 1830 | `GET /api/sessions/:id` | Laddar session |
| `saveSession()` | 1893 | `PUT /api/sessions/:id` | Sparar manuellt |
| `autoSaveToServer()` | 5921 | `PUT /api/sessions/:id` | Automatisk sparning |
| `deleteSession()` | 1995 | `DELETE /api/sessions/:id` | Tar bort session |
| `lockCurrentSession()` | 1940 | `PUT /api/sessions/:id/lock` | Låser (readonly) |
| `unlockCurrentSession()` | 1964 | `PUT /api/sessions/:id/unlock` | Låser upp |

### 2.3 NPCs

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `addNPC()` | 4118 | Lägger till tom NPC |
| `generateAndAddNPC()` | 4127 | Genererar NPC med namn |
| `removeNPC()` | 4160 | Tar bort NPC |
| `addNPCWithDay()` | 2325 | Lägger till med dag/tid/plats |
| `addNPCToPlace()` | 3090 | Lägger till NPC på specifik plats |
| `renderNPCsList()` | 4072 | Renderar planning-vy |
| `renderPlayNPCsList()` | 4169 | Renderar during-play-vy |
| `renderNPCCompact()` | 2872 | Kompakt NPC-kort |

**NPC-datastruktur:**
```javascript
{
    name: "Bartender Grim",
    role: "Innkeeper",
    disposition: "friendly",  // friendly, neutral, hostile
    description: "...",
    plannedLocation: "The Rusty Anchor",
    plannedDay: "1",
    usedInPlay: false,
    visibleTo: "all"  // eller ["Luna", "Tillo"]
}
```

### 2.4 Places

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `addPlace()` | 4251 | Lägger till plats |
| `removePlace()` | 4261 | Tar bort plats |
| `addPlaceWithDay()` | 2282 | Lägger till med dag/tid |
| `renderPlacesList()` | 4217 | Renderar planning-vy |
| `renderPlaceWithLinkedContent()` | 2637 | Plats med länkat innehåll |

### 2.5 Encounters

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `addEncounter()` | 4379 | Lägger till encounter |
| `removeEncounter()` | 4389 | Tar bort encounter |
| `addEncounterEnemy()` | 4397 | Lägger till fiende/deltagare |
| `removeEncounterEnemy()` | 4445 | Tar bort deltagare |
| `updateParticipantHP()` | 4419 | Sätter HP (och maxHp) |
| `adjustParticipantHP()` | 4430 | ±HP med knappar |
| `showEncounterDetail()` | 6333 | Öppnar encounter-modal |

**Encounter participant:**
```javascript
{
    name: "Bandit Leader",
    disposition: "enemy",      // enemy, neutral
    role: "Warrior",           // Warrior, Rogue, Mage, Healer, Ranger, Beast, Civilian
    hp: "15",
    maxHp: "15",
    armor: "Leather",
    weapon: "Sword",
    atkBonus: "+3",
    dmg: "1d8"
}
```

### 2.6 Read-Aloud Texts

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `addReadAloud()` | 4758 | Lägger till read-aloud |
| `removeReadAloud()` | 4769 | Tar bort |
| `addReadAloudWithDay()` | 2305 | Lägger till med kontext |
| `addReadAloudToPlace()` | 3082 | Länkar till plats |
| `addReadAloudToEncounter()` | 3105 | Länkar till encounter |
| `addReadAloudToNPC()` | 3113 | Länkar till NPC |
| `markReadAloudAsRead()` | 4816 | Markerar som läst |

### 2.7 Items/Loot

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `addItem()` | 4577 | Lägger till item |
| `removeItem()` | 4587 | Tar bort item |
| `toggleItemFound()` | 4595 | Markerar som hittad |
| `addItemWithDay()` | 2336 | Lägger till med kontext |
| `addItemToPlace()` | 3097 | Länkar till plats |

### 2.8 Visibility-systemet (Tilldela innehåll)

**Syfte:** DM kan tilldela innehåll till specifika spelare - andra ser det inte i Summary.

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `generateVisibilityDropdown()` | 1057 | Renderar checkboxar för synlighet |
| `toggleVisibilityAll()` | 1107 | Växlar "All Players" |
| `toggleVisibilityPlayer()` | 1122 | Växlar enskild spelare |
| `handleVisibilityPlayerChange()` | 1099 | Handler för checkbox |

**Datastruktur:**
```javascript
visibleTo: "all"              // Alla spelare (standard)
visibleTo: "Luna"             // En spelare (bakåtkompatibelt)
visibleTo: ["Luna", "Tillo"]  // Flera spelare
```

**Stödda innehållstyper:** NPCs, Places, Encounters, Read-Aloud, Items

### 2.9 Spelarhantering

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `addPlayer()` | 3785 | - | Lägger till spelare |
| `removeSessionPlayer()` | 3792 | - | Tar bort spelare |
| `importPlayersFromPrevious()` | 3910 | `GET /api/sessions/:id` | Importerar från föregående session |
| `renderPlayersList()` | 3676 | - | Renderar spelarlista |

### 2.10 XP-hantering

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `showGiveXPModal()` | 5587 | - | Öppnar XP-modal |
| `confirmGiveXP()` | 5599 | `POST /api/dm/characters/:id/give-xp` | Ger XP till spelare |

### 2.11 Item-distribution (Dela ut)

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `giveItemToPlayer()` | 5637 | `POST /api/dm/characters/:id/give-item` | Ger item till spelare |
| `removeItemFromPlayer()` | 5709 | `POST /api/dm/characters/:id/remove-item` | Tar bort item från spelare |

**Flöde vid omtilldelning:**
1. Spårar `oldPlayer` i dropdown
2. Om ny spelare: anropar `removeItemFromPlayer()` först
3. Anropar `giveItemToPlayer()` för nya spelaren

### 2.12 Lock Management (Lås upp karaktärer)

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `manageLocks()` | 5773 | - | Öppnar lock-modal |
| `toggleLockState()` | 5829 | - | Växlar lås (rc/attr/abil) |
| `saveLockStates()` | 5836 | `POST /api/dm/characters/:id/set-locks` | Sparar låsstatus |
| `unlockCharacter()` | 5872 | - | Legacy wrapper |

**DM kan:**
- Låsa upp race/class för ändring
- Låsa upp attributes för omfördelning
- Låsa upp abilities för byte

### 2.13 View Player Build

| Funktion | Rad | API-anrop | Beskrivning |
|----------|-----|-----------|-------------|
| `showPlayerBuild()` | 5401 | `GET /api/dm/characters/:id/build` | Visar spelarens build |
| `renderPlayerBuildContent()` | 5436 | - | Renderar build-data |

### 2.14 AI Assistant

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `generateAIExport()` | 7222 | Genererar AI-kontext |
| `quickAIAction()` | 7003 | Quick actions (NPC, encounter, etc) |
| `copyAIExport()` | 7501 | Kopierar till clipboard |
| `parseAIImport()` | 7517 | Parsar AI-svar |
| `importSelectedAIItems()` | 7922 | Importerar valda items |

**Quick Actions:**
- `random-npc` - Genererar NPC
- `random-encounter` - Genererar encounter
- `describe-location` - Platsbeskrivning
- `session-recap` - Session-sammanfattning
- `session-prolog` - Genererar prolog

### 2.15 Calculator

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `rollD10Pool()` | 9040 | Rullar N st D10 |
| `countSuccesses()` | 9049 | Räknar successes (7+) |
| `calculateSuccessProbability()` | 9054 | Binomialfördelning |
| `rollDefense()` | 9102 | Rullar defense |
| `calculateDamage()` | 9170 | Beräknar skadefördelning |
| `rollNpc()` | 9320 | Rullar NPC-test |

**D10 Success Levels:**
| Värde | Resultat |
|-------|----------|
| 1-4 | Failure |
| 5-6 | Barely |
| 7-9 | Success |
| 10 | Critical |

### 2.16 Session Prolog

| Funktion | Rad | Beskrivning |
|----------|-----|-------------|
| `showPrologSessionModal()` | 5569 | Visar sessionsväljare |
| `generatePrologFromSelectedSession()` | - | Hämtar session och genererar prompt |
| `generatePrologPrompt()` | - | Bygger AI-prompt |

### 2.17 Turning Points & Event Log

| Funktion | Beskrivning |
|----------|-------------|
| `renderTurningPointsList()` | Renderar viktiga beslut |
| Event log | Manuell loggning av händelser |
| Session notes | What went well, What to improve, Follow up |

---

## 3. API-endpoints

**Fil:** `api/server.js` (2863 rader)

### 3.1 Autentisering

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/register` | Nej | Registrera konto |
| POST | `/api/login` | Nej | Logga in (5 försök = 15 min lockout) |
| POST | `/api/logout` | Ja | Logga ut |
| POST | `/api/forgot-password` | Nej | Begär återställning (3/timme) |
| POST | `/api/reset-password` | Nej | Återställ lösenord |
| GET | `/api/reset-password/validate` | Nej | Validera token |

### 3.2 Konto

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/me` | Ja | Hämta profil + stats |
| PUT | `/api/account/password` | Ja | Ändra lösenord |
| PUT | `/api/account/email` | Ja | Ändra e-post |
| DELETE | `/api/account` | Ja | Ta bort konto |

### 3.3 Karaktärer

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/characters` | Ja | Lista karaktärer |
| GET | `/api/characters/:id` | Ja | Hämta karaktär |
| POST | `/api/characters` | Ja | Skapa karaktär |
| PUT | `/api/characters/:id` | Ja | Uppdatera karaktär |
| DELETE | `/api/characters/:id` | Ja | Soft-delete |

### 3.4 Karaktärslås (Spelare)

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/characters/:id/lock-race-class` | Ja | Lås ras/klass |
| POST | `/api/characters/:id/lock-attributes` | Ja | Lås attribut |
| POST | `/api/characters/:id/lock-abilities` | Ja | Lås abilities |
| POST | `/api/characters/:id/spend-attribute-points` | Ja | Spendera XP på attribut |

### 3.5 Quest Items (Spelare)

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/characters/:id/archive-item` | Ja | Arkivera quest item |
| POST | `/api/characters/:id/unarchive-item` | Ja | Återställ från arkiv |

### 3.6 Kampanjkoppling (Spelare)

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/characters/:id/link-campaign` | Ja | Länka med delkod |
| DELETE | `/api/characters/:id/link-campaign` | Ja | Avlänka |
| GET | `/api/characters/:id/party` | Ja | Hämta party members |

### 3.7 DM - Karaktärer

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/dm/characters/:id/give-xp` | Ja | Ge XP (1-10000) |
| GET | `/api/dm/characters/:id/build` | Ja | Visa spelarens build |
| POST | `/api/dm/characters/:id/set-locks` | Ja | Sätt låsstatus |
| POST | `/api/dm/characters/:id/unlock` | Ja | Lås upp (legacy) |
| POST | `/api/dm/characters/:id/give-item` | Ja | Ge quest item |
| POST | `/api/dm/characters/:id/remove-item` | Ja | Ta bort quest item |
| GET | `/api/dm/campaigns/:id/characters` | Ja | Lista kampanjkaraktärer |

### 3.8 Kampanjer (DM)

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/campaigns` | Ja | Lista kampanjer |
| GET | `/api/campaigns/:id` | Ja | Hämta kampanj |
| POST | `/api/campaigns` | Ja | Skapa kampanj |
| PUT | `/api/campaigns/:id` | Ja | Uppdatera kampanj |
| DELETE | `/api/campaigns/:id` | Ja | Soft-delete |
| POST | `/api/campaigns/:id/share` | Ja | Generera delkod |
| DELETE | `/api/campaigns/:id/share` | Ja | Ta bort delkod |
| POST | `/api/campaigns/join` | Ja | Gå med i kampanj |
| DELETE | `/api/campaigns/:id/leave` | Ja | Lämna kampanj |
| GET | `/api/campaigns/:id/players` | Ja | Lista spelare |
| DELETE | `/api/campaigns/:id/players/:playerId` | Ja | Ta bort spelare |

### 3.9 Spelarvy (Kampanjer)

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/player/campaigns` | Ja | Lista kampanjer jag är med i |
| GET | `/api/player/campaigns/:id` | Ja | Hämta kampanj + summary |

### 3.10 Sessioner

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/campaigns/:id/sessions` | Ja | Lista sessioner |
| GET | `/api/sessions/:id` | Ja | Hämta session |
| POST | `/api/campaigns/:id/sessions` | Ja | Skapa session |
| PUT | `/api/sessions/:id` | Ja | Uppdatera session |
| DELETE | `/api/sessions/:id` | Ja | Soft-delete |
| PUT | `/api/sessions/:id/lock` | Ja | Lås session |
| PUT | `/api/sessions/:id/unlock` | Ja | Lås upp session |

### 3.11 Papperskorg

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| GET | `/api/trash/characters` | Ja | Lista borttagna karaktärer |
| GET | `/api/trash/campaigns` | Ja | Lista borttagna kampanjer |
| GET | `/api/trash/campaigns/:id/sessions` | Ja | Lista borttagna sessioner |
| POST | `/api/trash/characters/:id/restore` | Ja | Återställ karaktär |
| POST | `/api/trash/campaigns/:id/restore` | Ja | Återställ kampanj |
| POST | `/api/trash/sessions/:id/restore` | Ja | Återställ session |
| DELETE | `/api/trash/characters/:id` | Ja | Permanent delete |
| DELETE | `/api/trash/campaigns/:id` | Ja | Permanent delete |
| DELETE | `/api/trash/sessions/:id` | Ja | Permanent delete |

### 3.12 Felhantering & Health

| Metod | Endpoint | Auth | Beskrivning |
|-------|----------|------|-------------|
| POST | `/api/errors` | Nej | Logga frontend-fel (30/min) |
| GET | `/api/errors` | Ja | Hämta loggade fel |
| GET | `/api/health` | Nej | Health check |

---

## 4. Integration DM ↔ Spelare

### 4.1 Kampanjkoppling

```
┌─────────────┐     Share Code      ┌─────────────┐
│     DM      │ ──────────────────► │   Spelare   │
│  Campaign   │                     │  Character  │
└─────────────┘                     └─────────────┘
      │                                    │
      │ POST /api/campaigns/:id/share      │ POST /api/characters/:id/link-campaign
      │ → Genererar 8-teckens kod          │ → Länkar karaktär till kampanj
      │                                    │
      └────────────────────────────────────┘
```

### 4.2 Quest Item-flöde

```
┌─────────────┐                     ┌─────────────┐
│     DM      │                     │   Spelare   │
│  Session    │                     │  Character  │
└─────────────┘                     └─────────────┘
      │                                    │
      │ POST /api/dm/characters/:id/give-item
      │ ──────────────────────────────────►│
      │                                    │ quest_items array uppdateras
      │                                    │
      │ POST /api/dm/characters/:id/remove-item
      │ ──────────────────────────────────►│
      │                                    │ item tas bort
      │                                    │
      │                                    │ POST /api/characters/:id/archive-item
      │                              ◄─────│ Spelare arkiverar
```

### 4.3 XP-flöde

```
DM: POST /api/dm/characters/:id/give-xp { amount: 50 }
    ↓
Character.xp += 50
    ↓
Spelare kan spendera: POST /api/characters/:id/spend-attribute-points
    ↓
10 XP = 1 attributpoäng
```

### 4.4 Lock-flöde

```
Spelare:                              DM:
1. lockRaceClass()                    manageLocks() → kan låsa upp
2. lockAttributes()                   ↓
3. lockAbilities()                    POST /api/dm/characters/:id/set-locks
                                      { race_class_locked: false }
                                      ↓
                                      Spelare kan ändra igen
```

### 4.5 Session Summary (Visibility)

```
DM markerar innehåll med visibleTo:

NPCs, Places, Encounters, Read-Aloud, Items
    ↓
visibleTo: "all"           → Alla ser
visibleTo: "Luna"          → Bara Luna ser
visibleTo: ["Luna","Tillo"] → Luna och Tillo ser

Spelare öppnar Summary:
    ↓
API filtrerar baserat på spelarens karaktärsnamn
    ↓
generateSessionSummary() → isVisibleToPlayer()
```

### 4.6 Player View

```
Spelare: GET /api/player/campaigns/:id
    ↓
Returnerar:
- Kampanjinfo
- Låsta sessioner med summary
- Senaste session
- Filtrerat innehåll baserat på visibility
```

---

## 5. Speldata

**Mapp:** `html/data/`

### 5.1 weapons.js

| Export | Beskrivning |
|--------|-------------|
| `WEAPONS_DATA` | Object med alla vapen |
| `WEAPONS` | Array med vapennamn |
| `AMMUNITION` | Object med ammunition |

**Vapenstruktur:**
```javascript
"Longsword": {
    type: "Martial Melee",
    ability: "Strength",
    bonus: "+2",
    damage: "1d10",
    range: "2",
    break: "2"
}
```

**Antal vapen:** 50+

### 5.2 armor.js

| Export | Beskrivning |
|--------|-------------|
| `ARMOR_DATA` | Object med all rustning |
| `ARMOR_BY_BODYPART` | Filtrerad per kroppsdel |
| `ARMOR` | Array med rustningsnamn |
| `SHIELD_DATA` | Object med sköldar |
| `SHIELDS` | Array med sköldnamn |

**Kroppsdelar:** head, shoulders, chest, hands, legs

**Typer:** Light, Medium, Heavy, Cloth

### 5.3 races.js

| Export | Beskrivning |
|--------|-------------|
| `RACES` | Object med alla raser |

**Raser (7):** Human, Dwarf, Halfling, High Elf, Moon Elf, Orc, Troll

**Struktur:**
```javascript
"Human": {
    bonuses: ["+1 Strength", "+1 Dexterity", ...],
    startingEquipment: {
        weapon: "Longsword",
        food: "1D6",
        gold: 15,
        worthiness: 7,
        hp: 20
    }
}
```

### 5.4 classes.js

| Export | Beskrivning |
|--------|-------------|
| `CLASSES` | Object med alla klasser |

**Klasser (6):** Warrior, Thief/Rogue, Outcast, Mage, Hunter, Druid

**Struktur:**
```javascript
"Warrior": {
    bonuses: ["+1 Strength", "+1 Toughness", ...],
    startingEquipment: {
        armor: { head: "Leather Cap", ... },
        weapon: "Longsword",
        gold: 10,
        abilitiesCount: 5,
        hpBonus: 5
    },
    abilityType: "weakened"  // eller "arcana"
}
```

### 5.5 starting-equipment.js

| Export | Beskrivning |
|--------|-------------|
| `STARTING_EQUIPMENT` | 42 ras+klass kombinationer |

**Struktur:**
```javascript
"Human_Warrior": {
    weapon: "Longsword",
    armor: {
        head: null,
        shoulders: "Leather Pauldrons",
        chest: "Breastplate",
        hands: null,
        legs: "Leather Greaves"
    },
    shield: "Shield (Metal)"
}
```

### 5.6 spells.js

| Export | Beskrivning |
|--------|-------------|
| `SPELLS_BY_CLASS` | Object med spells per klass |
| `getSpellsForClass()` | Funktion för att hämta |

**Spell-struktur:**
```javascript
{
    name: "Fireball",
    check: "INT",
    damage: "3d6",
    arcana: 3,       // Mage/Druid
    weakened: 2,     // Övriga klasser
    desc: "...",
    gain: 5          // XP-vinst
}
```

**Antal:** 250+ spells/abilities totalt

### 5.7 religions.js

| Export | Beskrivning |
|--------|-------------|
| `RELIGIONS` | Object med 15 religioner |

**Struktur:**
```javascript
"Creed of Shadows": {
    deity: "Noctara",
    description: "...",
    bonuses: ["+1 Stealth", "+1 Deception"]
}
```

### 5.8 npc-names.js

| Export | Beskrivning |
|--------|-------------|
| `NPC_NAMES` | Namn per ras och kön |
| `generateNPCName(race, gender)` | Genererar namn |
| `getAvailableRaces()` | Lista alla raser |

**Antal namn:** 100+ per ras/kön

---

## 6. Hjälpfiler och utilities

### 6.1 tabs.js

| Funktion | Beskrivning |
|----------|-------------|
| `switchTab(tabId)` | Byter aktiv tab |

**Tabs:** Overview, Character, Stats, Combat, Abilities, Gear, Tools

### 6.2 sliders.js

| Funktion | Beskrivning |
|----------|-------------|
| `initializeSliders()` | Initierar alla sliders |

**Sliders:** Arcana, Willpower, HP, Worthiness, Bleed, Weakened, Potions

### 6.3 diceroller.js

| Funktion | Beskrivning |
|----------|-------------|
| `adjustDice(diceType, delta)` | ±1 tärning |
| `rollAllDice()` | Rullar alla tärningar |
| `rerollAllCriticals()` | Omrullar criticals |

**Lägen:** Successes, Initiative, Food-Water, Arrows

### 6.4 system-selector.js

| Funktion | Beskrivning |
|----------|-------------|
| `SystemSelector.getSelected()` | Hämta valt system |
| `SystemSelector.setSelected()` | Sätt system |
| `SystemSelector.changeSystem()` | Visa byt-dialog |

**System:** Aedelore, D&D 5e, Pathfinder 2e, Storyteller/WoD, Chronicles of Darkness

### 6.5 privacy.js

| Funktion | Beskrivning |
|----------|-------------|
| `AedelorePrivacy.getConsent()` | Hämta samtycke |
| `AedelorePrivacy.setConsent()` | Sätt samtycke |
| `AedelorePrivacy.acceptAnalytics()` | Acceptera |
| `AedelorePrivacy.declineAnalytics()` | Neka |

### 6.6 error-logger.js

| Funktion | Beskrivning |
|----------|-------------|
| `AedeloreErrors.log(msg, type, stack)` | Logga fel manuellt |
| `AedeloreErrors.logFetch(url, status, msg)` | Logga API-fel |
| `AedeloreErrors.flush()` | Skicka direkt |

**Features:** Batching (5s), deduplicering (60s), max 20 köade

### 6.7 service-worker.js

**Cache:** `aedelore-v285`

**Strategi:** Cache-first med network update

**Cachade filer:** 32 st (HTML, CSS, JS, data)

---

## Sammanfattning

| Kategori | Antal |
|----------|-------|
| Spelarfunktioner | 86+ |
| DM-funktioner | 100+ |
| API-endpoints | 63 |
| Spells/Abilities | 250+ |
| Vapen | 50+ |
| Rustningar | 40+ |
| Raser | 7 |
| Klasser | 6 |
| Religioner | 15 |

**Databastabeller:** users, auth_tokens, password_reset_tokens, characters, campaigns, sessions, campaign_players, login_history, frontend_errors
