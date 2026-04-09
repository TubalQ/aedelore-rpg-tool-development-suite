// Spell and ability data for each class from lookhere folder

const SPELLS_BY_CLASS = {
    "Warrior": [
        { name: "Last Stand", check: "Check: Armor, min 1 success", damage: "Take focus from enemy", arcana: "-", weakened: "2", desc: "Take focus from enemy", gain: 2 },
        { name: "Hero", check: "Passive", damage: "Hero of the people", arcana: "-", weakened: "Worthiness", desc: "Worthiness, Passive", gain: 0 },
        { name: "Me First", check: "Check: Athletics, min 2 success", damage: "Ignore turns of initiative", arcana: "-", weakened: "3", desc: "Ignore turns of initiative, +1 Initiative, 1 round", gain: 3 },
        { name: "Ultimate Sacrifice", check: "Check: Strength, min 1 success", damage: "You get full of adrenaline", arcana: "-", weakened: "2", desc: "You get full of adrenaline, you take 2 dmg", gain: 3 },
        { name: "Paladin's Sacrifice", check: "Check: Strength, min 1 success", damage: "Ignore Pain", arcana: "-", weakened: "4", desc: "Ignore Pain, you faint after", gain: 3 },
        { name: "Crusader", check: "Check: Armor, min 1 success", damage: "Use armor", arcana: "-", weakened: "2", desc: "Use armor, 1 round", gain: 3 },
        { name: "Give In", check: "Check: Strength, min 2 success", damage: "Massive Adrenaline", arcana: "-", weakened: "4", desc: "Massive Adrenaline, you lose control", gain: 4 },
        { name: "Shield Wall", check: "Check: Toughness, min 2 success", damage: "Protect allies behind you", arcana: "-", weakened: "3", desc: "Protect allies behind you, Requires shield, 2 rounds", gain: 3 },
        { name: "Battle Cry", check: "Check: Intimidation, min 1 success", damage: "Inspire nearby allies", arcana: "-", weakened: "2", desc: "Inspire nearby allies, 1 round", gain: 2 },
        { name: "Second Wind", check: "Check: Endurance, min 1 success", damage: "Push through exhaustion", arcana: "-", weakened: "3", desc: "Push through exhaustion", gain: 3 },
        { name: "Disarm", check: "Check: Athletics, min 2 success", damage: "Remove enemy weapon", arcana: "-", weakened: "3", desc: "Remove enemy weapon", gain: 2 },
        { name: "Whirlwind", check: "Check: Strength, min 2 success", damage: "Strike multiple nearby foes", arcana: "-", weakened: "4", desc: "Strike multiple nearby foes, 1 round", gain: 4 },
        { name: "Intercept", check: "Check: Toughness, min 1 success", damage: "Take hit meant for ally", arcana: "-", weakened: "2", desc: "Take hit meant for ally", gain: 3 },
        { name: "Unbreakable", check: "Check: Toughness, min 1 success", damage: "Resist being knocked down", arcana: "-", weakened: "3", desc: "Resist being knocked down, 2 rounds", gain: 3 }
    ],

    "Thief/Rogue": [
        { name: "Lockpicking", check: "Check: Sleight of Hand, min 1 success", damage: "Open normal locks and chests", arcana: "-", weakened: "4", desc: "Open normal locks and chests, not in battle", gain: 1 },
        { name: "Sneaking", check: "Check: Stealth, min 1 success", damage: "Extra quiet when sneaking", arcana: "-", weakened: "3", desc: "Extra quiet when sneaking", gain: 2 },
        { name: "Awareness", check: "Check: Perception, min 2 success", damage: "You are granted third eye", arcana: "-", weakened: "4", desc: "You are granted third eye, not in battle", gain: 4 },
        { name: "Vanish", check: "Check: Stealth, min 2 success", damage: "You vanish into thin air", arcana: "-", weakened: "4", desc: "You vanish into thin air", gain: 4 },
        { name: "Footloose", check: "Check: Dexterity, min 2 success", damage: "You move fast as lightning", arcana: "-", weakened: "3", desc: "You move fast as lightning", gain: 5 },
        { name: "Fixed Mind", check: "Check: Deception, min 1 success", damage: "You deceive someone", arcana: "-", weakened: "4", desc: "You deceive someone", gain: 2 },
        { name: "Backstab", check: "Check: Dexterity, min 2 success", damage: "Strike from behind for extra damage", arcana: "-", weakened: "3", desc: "Strike from behind for extra damage", gain: 3 },
        { name: "Pickpocket", check: "Check: Sleight of Hand, min 1 success", damage: "Steal from someone unnoticed", arcana: "-", weakened: "4", desc: "Steal from someone unnoticed, not in battle", gain: 2 },
        { name: "Evasion", check: "Check: Acrobatics, min 2 success", damage: "Dodge incoming attack", arcana: "-", weakened: "3", desc: "Dodge incoming attack, 1 round", gain: 4 },
        { name: "Shadow Cloak", check: "Check: Stealth, min 1 success", damage: "Blend into shadows", arcana: "-", weakened: "3", desc: "Blend into shadows, 2 rounds", gain: 3 },
        { name: "Disengage", check: "Check: Acrobatics, min 1 success", damage: "Escape without provoking attack", arcana: "-", weakened: "2", desc: "Escape without provoking attack", gain: 2 },
        { name: "Poison Blade", check: "Check: Sleight of Hand, min 1 success", damage: "Coat weapon with poison", arcana: "-", weakened: "3", desc: "Coat weapon with poison, not in battle", gain: 3 },
        { name: "Silent Step", check: "Check: Stealth, min 1 success", damage: "Move without making sound", arcana: "-", weakened: "2", desc: "Move without making sound, not in battle", gain: 2 }
    ],

    "Hunter": [
        { name: "Steady Shot", check: "Check: Dexterity, min 1 success", damage: "Your arrow hits exactly where you aim", arcana: "-", weakened: "3", desc: "Your arrow hits exactly where you aim", gain: 2 },
        { name: "Tame a Beast", check: "Check: Animal Handling, min 2 success", damage: "Tame a normal non-magical beast", arcana: "-", weakened: "5", desc: "Tame a normal non-magical beast, not in battle", gain: 5 },
        { name: "Unveil Path", check: "Check: Survival, min 1 success", damage: "You notice tracks no one else notices", arcana: "-", weakened: "2", desc: "You notice tracks no one else notices, not in battle", gain: 2 },
        { name: "Set Trap", check: "Check: Nature, min 1 success", damage: "You build natural traps", arcana: "-", weakened: "3", desc: "You build natural traps, not in battle", gain: 3 },
        { name: "Shadow Meld", check: "Check: Stealth, min 2 success", damage: "You melt into the shadows", arcana: "-", weakened: "4", desc: "You melt into the shadows, not in battle", gain: 4 },
        { name: "Spider Senses", check: "Check: Perception, min 1 success", damage: "Take notice of surroundings", arcana: "-", weakened: "2", desc: "Take notice of surroundings, not in battle", gain: 2 },
        { name: "Rain of Death", check: "Check: Dexterity, min 2 success", damage: "Shoot multiple arrows at targets", arcana: "-", weakened: "4", desc: "Shoot multiple arrows at targets", gain: 3 },
        { name: "Hunter's Mark", check: "Check: Survival, min 1 success", damage: "Mark target for tracking", arcana: "-", weakened: "2", desc: "Mark target for tracking, 4 rounds", gain: 2 },
        { name: "Camouflage", check: "Check: Stealth, min 1 success", damage: "Blend into natural surroundings", arcana: "-", weakened: "3", desc: "Blend into natural surroundings, not in battle", gain: 3 },
        { name: "Precision Strike", check: "Check: Dexterity, min 2 success", damage: "Strike a vital point", arcana: "-", weakened: "4", desc: "Strike a vital point", gain: 4 },
        { name: "Call Companion", check: "Check: Animal Handling, min 1 success", damage: "Summon your animal companion", arcana: "-", weakened: "3", desc: "Summon your animal companion, not in battle", gain: 3 },
        { name: "Quick Draw", check: "Check: Dexterity, min 1 success", damage: "Draw and attack in one motion", arcana: "-", weakened: "2", desc: "Draw and attack in one motion", gain: 3 },
        { name: "Foraging", check: "Check: Nature, min 1 success", damage: "Find food and supplies in nature", arcana: "-", weakened: "2", desc: "Find food and supplies in nature, not in battle", gain: 1 },
        { name: "Sniper Shot", check: "Check: Dexterity, min 2 success", damage: "Shoot from extreme distance", arcana: "-", weakened: "4", desc: "Shoot from extreme distance", gain: 4 }
    ],

    "Outcast": [
        { name: "Shadow Step", check: "Check: Stealth, min 1 success", damage: "Blend into shadows, move silently", arcana: "-", weakened: "3", desc: "Blend into shadows, move silently, not in battle", gain: 3 },
        { name: "Wilderness Survival", check: "Check: Nature, min 1 success", damage: "Proficiency in tracking & navigation", arcana: "-", weakened: "3", desc: "Proficiency in tracking & navigation, not in battle", gain: 2 },
        { name: "Street Smarts", check: "Check: Investigation, min 1 success", damage: "Read people and intentions", arcana: "-", weakened: "2", desc: "Read people and intentions, not in battle", gain: 2 },
        { name: "Unseen Ally", check: "Check: Nature, min 1 success", damage: "Communicate with small creatures", arcana: "-", weakened: "3", desc: "Communicate with small creatures, not in battle", gain: 2 },
        { name: "Improvised Weaponry", check: "Check: Strength, min 1 success", damage: "Use anything as a weapon, no disadvantage", arcana: "-", weakened: "3", desc: "Use anything as a weapon, no disadvantage", gain: 3 },
        { name: "Resilient Spirit", check: "Check: Toughness, min 1 success", damage: "Resist mental & emotional manipulation", arcana: "-", weakened: "3", desc: "Resist mental & emotional manipulation", gain: 3 },
        { name: "Counterculture", check: "Check: Investigation, min 1 success", damage: "Familiarity with forbidden knowledge", arcana: "-", weakened: "2", desc: "Familiarity with forbidden knowledge", gain: 2 },
        { name: "Scavenge", check: "Check: Investigation, min 1 success", damage: "Find useful items in ruins", arcana: "-", weakened: "2", desc: "Find useful items in ruins, not in battle", gain: 2 },
        { name: "Blend In", check: "Check: Stealth, min 1 success", damage: "Disappear in crowds", arcana: "-", weakened: "2", desc: "Disappear in crowds, not in battle", gain: 2 },
        { name: "Iron Will", check: "Check: Toughness, min 1 success", damage: "Resist fear and intimidation", arcana: "-", weakened: "3", desc: "Resist fear and intimidation", gain: 3 },
        { name: "Dirty Fighting", check: "Check: Strength, min 2 success", damage: "Fight without honor for advantage", arcana: "-", weakened: "3", desc: "Fight without honor for advantage", gain: 3 },
        { name: "Underground Network", check: "Check: Investigation, min 1 success", damage: "Contact hidden allies", arcana: "-", weakened: "3", desc: "Contact hidden allies, not in battle", gain: 3 },
        { name: "Endure Elements", check: "Check: Toughness, min 1 success", damage: "Resist harsh weather conditions", arcana: "-", weakened: "2", desc: "Resist harsh weather conditions, 4 rounds", gain: 2 },
        { name: "Adapt", check: "Check: Investigation, min 1 success", damage: "Quickly learn new skill or trade", arcana: "-", weakened: "3", desc: "Quickly learn new skill or trade, not in battle", gain: 3 }
    ],

    "Mage": [
        // Offensive - Arcana 1
        { name: "Scorch", damage: "2/D10", arcana: "1", weakened: "-", desc: "Offensive, Scorch an enemy" },
        { name: "Fireball", damage: "2/D6", arcana: "1", weakened: "-", desc: "Offensive, Shoot a fireball" },
        { name: "Arcane Bolt", damage: "1/D10", arcana: "1", weakened: "-", desc: "Offensive, Shoot arcane bolt" },
        { name: "Icebolt", damage: "1/D10", arcana: "1", weakened: "-", desc: "Offensive, Cast bolt of frost" },
        { name: "Thunderclap", damage: "1/D6", arcana: "1", weakened: "-", desc: "Offensive, Summon lightning" },
        { name: "Frostbite", damage: "1/D6", arcana: "1", weakened: "-", desc: "Offensive, Freeze target with cold" },
        { name: "Magic Missile", damage: "1/D6", arcana: "1", weakened: "-", desc: "Offensive, Never-miss magic projectile" },
        { name: "Acid Splash", damage: "1/D6", arcana: "1", weakened: "-", desc: "Offensive, Hurl acid at 1-2 targets" },
        { name: "Sword Burst", damage: "1/D6", arcana: "1", weakened: "-", desc: "Offensive, Spectral blades cut all around you" },

        // Offensive - Arcana 2
        { name: "Icelance", damage: "2/D6", arcana: "2", weakened: "-", desc: "Offensive, Slice with sharp icelance" },
        { name: "Mage Blade", damage: "2/D10", arcana: "2", weakened: "-", desc: "Offensive, Control a magical sword, 1 round" },
        { name: "Shadow Bolt", damage: "2/D6", arcana: "2", weakened: "-", desc: "Offensive, Cast bolt of shadow" },
        { name: "Ice Knife", damage: "2/D10", arcana: "2", weakened: "-", desc: "Offensive, Throw ice knife that explodes on impact" },
        { name: "Cloud of Daggers", damage: "2/D6", arcana: "2", weakened: "-", desc: "Offensive, Cloud of spinning daggers, 2 rounds" },
        { name: "Arms of Despair", damage: "2/D6", arcana: "2", weakened: "-", desc: "Offensive, Dark tentacles strike all around you" },

        // Offensive - Arcana 3
        { name: "Ray of Frost", damage: "3/D6", arcana: "3", weakened: "-", desc: "Offensive, Pierce with frost" },
        { name: "Arcane Blast", damage: "2/D10", arcana: "3", weakened: "-", desc: "Offensive, Blast with arcane" },
        { name: "Mind Blast", damage: "2/D10", arcana: "3", weakened: "-", desc: "Offensive, Psychic damage to mind" },
        { name: "Spray of Cards", damage: "2/D10", arcana: "3", weakened: "-", desc: "Offensive, Throw magical cutting cards" },
        { name: "Conjure Barrage", damage: "2/D10", arcana: "3", weakened: "-", desc: "Offensive, Rain of projectiles" },
        { name: "Thunder Step", damage: "2/D10", arcana: "3", weakened: "-", desc: "Offensive, Teleport with thunderclap AoE" },

        // Offensive - Arcana 4
        { name: "Fireblast", damage: "3/D6", arcana: "4", weakened: "-", desc: "Offensive, Blast with fire" },
        { name: "Spirit Guardians", damage: "3/D6", arcana: "4", weakened: "-", desc: "Offensive, Spirits damage enemies around you, 4 rounds" },
        { name: "Black Tentacles", damage: "3/D6", arcana: "4", weakened: "-", desc: "Offensive, Dark tentacles grasp everything, 2 rounds" },

        // Offensive - Arcana 5
        { name: "Chain Lightning", damage: "3/D6", arcana: "5", weakened: "-", desc: "Offensive, Lightning jumps between targets" },
        { name: "Banishing Smite", damage: "3/D6", arcana: "5", weakened: "-", desc: "Offensive, Next attack banishes target" },
        { name: "Conjure Volley", damage: "3/D6", arcana: "5", weakened: "-", desc: "Offensive, Massive rain of arrows" },
        { name: "Steel Wind Strike", damage: "3/D6", arcana: "5", weakened: "-", desc: "Offensive, Teleport and slash multiple targets" },

        // Offensive - Arcana 6-7
        { name: "Arcane Missiles", damage: "4/D6", arcana: "6", weakened: "-", desc: "Offensive, Multiple arcane missiles" },
        { name: "Incendiary Cloud", damage: "4/D6", arcana: "6", weakened: "-", desc: "Offensive, Moving cloud of fire, 4 rounds" },
        { name: "Disintegrate", damage: "4/D10", arcana: "7", weakened: "-", desc: "Offensive, Disintegrate target" },
        { name: "Blade of Disaster", damage: "4/D10", arcana: "7", weakened: "-", desc: "Offensive, Create blade of pure destruction, 4 rounds" },

        // Black Magic / Summoning
        { name: "Summon Imp", damage: "1/D10", arcana: "3", weakened: "-", desc: "Black Magic, Summon small imp-like creature, 1 round" },
        { name: "Summon Shadowspawn", damage: "1/D10", arcana: "3", weakened: "-", desc: "Black Magic, Summon shadow creature, 1 round" },
        { name: "Summon Lesser Demons", damage: "1/D10", arcana: "3", weakened: "-", desc: "Black Magic, Summon multiple lesser demons, 1 round" },
        { name: "Summon Void", damage: "2/D6", arcana: "4", weakened: "-", desc: "Black Magic, Summon creature from void, 1 round" },
        { name: "Summon Aberration", damage: "2/D6", arcana: "4", weakened: "-", desc: "Black Magic, Summon an aberration, 1 round" },
        { name: "Hunger of the Fallen", damage: "2/D6", arcana: "4", weakened: "-", desc: "Black Magic, Sphere of darkness and cold, 2 rounds" },
        { name: "Summon Greater Demon", damage: "2/D6", arcana: "4", weakened: "-", desc: "Black Magic, Summon greater demon, 2 rounds" },
        { name: "Summon Infernal", damage: "2/D10", arcana: "5", weakened: "-", desc: "Black Magic, Summon infernal demon, 2 rounds" },
        { name: "Infernal Calling", damage: "2/D10", arcana: "5", weakened: "-", desc: "Black Magic, Summon a devil, 2 rounds" },
        { name: "Summon Fiend", damage: "3/D6", arcana: "6", weakened: "-", desc: "Black Magic, Summon a fiend, 4 rounds" },
        { name: "Maze", damage: "0", arcana: "7", weakened: "-", desc: "Black Magic, Trap target in labyrinth, Special" },

        // Conjuration
        { name: "Mage Hand", damage: "0", arcana: "3", weakened: "-", desc: "Conjuration, Control a magical hand, 1 round" },
        { name: "Unseen Servant", damage: "0", arcana: "3", weakened: "-", desc: "Conjuration, Summon invisible helper, 10 rounds" },
        { name: "Find Familiar", damage: "0", arcana: "3", weakened: "-", desc: "Conjuration, Summon magic companion, Permanent" },
        { name: "Flock of Familiars", damage: "0", arcana: "3", weakened: "-", desc: "Conjuration, Summon multiple familiars, 4 rounds" },
        { name: "Flaming Sphere", damage: "2/D6", arcana: "3", weakened: "-", desc: "Conjuration, Rolling ball of fire, 2 rounds" },
        { name: "Summon Construct", damage: "2/D6", arcana: "4", weakened: "-", desc: "Conjuration, Summon a construct, 2 rounds" },
        { name: "Guardian of Faith", damage: "2/D6", arcana: "4", weakened: "-", desc: "Conjuration, Summon protective spirit, 4 rounds" },
        { name: "Teleport", damage: "0", arcana: "5", weakened: "-", desc: "Conjuration, Teleport short distance, Instant" },
        { name: "Conjure Minor Elementals", damage: "2/D10", arcana: "5", weakened: "-", desc: "Conjuration, Summon small elementals, 2 rounds" },
        { name: "Summon Elemental", damage: "2/D10", arcana: "5", weakened: "-", desc: "Conjuration, Summon an elemental, 2 rounds" },
        { name: "Conjure Elemental", damage: "3/D6", arcana: "6", weakened: "-", desc: "Conjuration, Summon powerful elemental, 4 rounds" },

        // Protection
        { name: "Prismatic Barrier", damage: "0", arcana: "2", weakened: "-", desc: "Protection, Shield a party member, 1 round" },
        { name: "Ice Armor", damage: "0", arcana: "2", weakened: "-", desc: "Protection, Shroud yourself in ice, 4 rounds" },

        // Transmutation / Transformation
        { name: "Water Breathing", damage: "0", arcana: "1", weakened: "-", desc: "Transmutation, Breathe under water, 10 rounds" },
        { name: "Flickering Tongue", damage: "0", arcana: "2", weakened: "-", desc: "Transmutation, Understand creature, 1 round" },
        { name: "Levitate", damage: "0", arcana: "2", weakened: "-", desc: "Transmutation, Float in the air, 4 rounds" },
        { name: "Polymorph", damage: "0", arcana: "3", weakened: "-", desc: "Transmutation, Transform a character, 2 rounds" },
        { name: "Control Flames", damage: "0", arcana: "3", weakened: "-", desc: "Transmutation, Control nearby flames, 1 round" },
        { name: "Vortex Warp", damage: "0", arcana: "3", weakened: "-", desc: "Transmutation, Teleport another creature, Instant" },
        { name: "Invisibility", damage: "0", arcana: "4", weakened: "-", desc: "Transformation, Make someone invisible, 4 rounds" },
        { name: "Far Step", damage: "0", arcana: "5", weakened: "-", desc: "Transmutation, Teleport each round, 4 rounds" },
        { name: "Arcane Gate", damage: "0", arcana: "6", weakened: "-", desc: "Transmutation, Create portal between points, 4 rounds" },

        // Enchantment
        { name: "Sleep", damage: "0", arcana: "2", weakened: "-", desc: "Enchantment, Put creatures to sleep, 3 rounds" },
        { name: "Charm Person", damage: "0", arcana: "3", weakened: "-", desc: "Enchantment, Charm a humanoid, 2 rounds" },

        // Divination
        { name: "Detect Magic", damage: "0", arcana: "1", weakened: "-", desc: "Divination, Sense magical auras, 2 rounds" },
        { name: "Arcane Eye", damage: "0", arcana: "3", weakened: "-", desc: "Divination, See through magical eye, 4 rounds" },

        // Abjuration
        { name: "Arcane Lock", damage: "0", arcana: "2", weakened: "-", desc: "Abjuration, Lock a door magically, Permanent" },
        { name: "Counterspell", damage: "0", arcana: "4", weakened: "-", desc: "Abjuration, Counter enemy spell, Instant" },
        { name: "Dispel Magic", damage: "0", arcana: "4", weakened: "-", desc: "Abjuration, Remove magical effects, 1 round" },

        // Illusion
        { name: "Mirror Image", damage: "0", arcana: "3", weakened: "-", desc: "Illusion, Create duplicate images, 3 rounds" },

        // Necromancy / Manipulation
        { name: "Animate Dead", damage: "0", arcana: "6", weakened: "-", desc: "Necromancy, Animate life in something dead, 1 round" },
        { name: "Time Warp", damage: "0", arcana: "6", weakened: "-", desc: "Manipulation, Slow or rewind time, 1 round" },

        // Utility
        { name: "Light", damage: "0", arcana: "2", weakened: "-", desc: "Fire, Summon a source of light, 1 round" },
        { name: "Create Bonfire", damage: "1/D10", arcana: "2", weakened: "-", desc: "Fire, Create magic fire on ground, 1 round" },
        { name: "Web", damage: "0", arcana: "3", weakened: "-", desc: "Utility, Create sticky webs, 2 rounds" },
        { name: "Grease", damage: "0", arcana: "3", weakened: "-", desc: "Utility, Make area slippery, 2 rounds" },
        { name: "Wish", damage: "Special", arcana: "8", weakened: "-", desc: "Utility, Grant a wish, Instant" }
    ],

    "Druid": [
        { name: "Rebirth", damage: "0", arcana: "8", weakened: "-", desc: "Nature, Revive someone, Not in battle" },
        { name: "Whips", damage: "2/D10", arcana: "4", weakened: "-", desc: "Nature, Roots attack target, 1 round" },
        { name: "Mending", damage: "1/D10", arcana: "3", weakened: "-", desc: "Nature, Mend a target" },
        { name: "Innervate", damage: "0", arcana: "3", weakened: "-", desc: "Arcana, Give someone initiative" },
        { name: "Prowler's Eyes", damage: "0", arcana: "4", weakened: "-", desc: "Nature, See in the dark, 1 round" },
        { name: "Packleader", damage: "0", arcana: "3", weakened: "-", desc: "Nature, Summon friends, Same region only" },
        { name: "Warrior of Tohu", damage: "8", arcana: "6", weakened: "-", desc: "Arcana, Channel raw arcana" },
        { name: "Tunes of Healing", damage: "2/D6", arcana: "4", weakened: "-", desc: "Nature, Heal a target" },
        { name: "Animal Handling", damage: "0", arcana: "3", weakened: "-", desc: "Nature, Communicate with animals, 2 rounds" },
        { name: "Earthshaping", damage: "2/D6", arcana: "3", weakened: "-", desc: "Nature, Earth moves at will, 1 round" },
        { name: "Thunderclap", damage: "3/D6", arcana: "4", weakened: "-", desc: "Arcana, Summon thunder, 1 round" },
        { name: "Plant Growth", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Plant grows quickly, Permanent" },
        { name: "Insect Plague", damage: "1/D6", arcana: "3", weakened: "-", desc: "Nature, Summon insects, 1 round" },
        { name: "Storm", damage: "2/D6", arcana: "4", weakened: "-", desc: "Nature, Summon the winds" },
        { name: "Sunfire", damage: "1/D10", arcana: "1", weakened: "-", desc: "Fire, Channel sun energy, Only daytime" },
        { name: "Moonfall", damage: "1/D10", arcana: "1", weakened: "-", desc: "Arcana, Channel moon energy, Only nighttime" },

        // Additional Nature & Healing
        { name: "Barkskin", damage: "0", arcana: "2", weakened: "-", desc: "Nature, Harden skin like bark, 4 rounds" },
        { name: "Entangle", damage: "0", arcana: "2", weakened: "-", desc: "Nature, Roots hold targets, 2 rounds" },
        { name: "Wildshape", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Transform into animal, 4 rounds" },
        { name: "Poison Spray", damage: "1/D6", arcana: "1", weakened: "-", desc: "Nature, Spray poison at target" },
        { name: "Vine Lash", damage: "1/D10", arcana: "2", weakened: "-", desc: "Nature, Vines strike target" },
        { name: "Purify Water", damage: "0", arcana: "1", weakened: "-", desc: "Nature, Cleanse water, Permanent" },
        { name: "Speak with Plants", damage: "0", arcana: "2", weakened: "-", desc: "Nature, Communicate with plants, 2 rounds" },
        { name: "Call Lightning", damage: "3/D6", arcana: "5", weakened: "-", desc: "Arcana, Strike with lightning" },
        { name: "Moonbeam", damage: "2/D6", arcana: "3", weakened: "-", desc: "Arcana, Beam of moonlight, 2 rounds" },
        { name: "Cure Poison", damage: "0", arcana: "3", weakened: "-", desc: "Nature, Remove poison from target" },
        { name: "Starfall", damage: "2/D10", arcana: "4", weakened: "-", desc: "Arcana, Stars fall on target, Only nighttime" },
        { name: "Thorns", damage: "1/D10", arcana: "2", weakened: "-", desc: "Nature, Thorns pierce target" },
        { name: "Fog Cloud", damage: "0", arcana: "2", weakened: "-", desc: "Nature, Create thick fog, 3 rounds" },
        { name: "Earthquake", damage: "3/D6", arcana: "6", weakened: "-", desc: "Nature, Shake the earth violently" },
        { name: "Healing Circle", damage: "2/D10", arcana: "5", weakened: "-", desc: "Nature, Heal multiple targets" },
        { name: "Blight", damage: "2/D6", arcana: "3", weakened: "-", desc: "Nature, Drain life from target" },
        { name: "Tree Stride", damage: "0", arcana: "3", weakened: "-", desc: "Nature, Teleport between trees, 1 round" },

        // Nature Offensive (new)
        { name: "Produce Flame", damage: "1/D10", arcana: "1", weakened: "-", desc: "Nature, Create flame to throw" },
        { name: "Infestation", damage: "1/D6", arcana: "1", weakened: "-", desc: "Nature, Insects plague target" },
        { name: "Hail of Thorns", damage: "2/D6", arcana: "2", weakened: "-", desc: "Nature, Thorns explode on hit" },
        { name: "Ensnaring Strike", damage: "1/D10", arcana: "2", weakened: "-", desc: "Nature, Thorns snare target on hit, 1 round" },
        { name: "Dust Devil", damage: "2/D6", arcana: "3", weakened: "-", desc: "Nature, Summon small whirlwind, 2 rounds" },
        { name: "Tidal Wave", damage: "3/D6", arcana: "4", weakened: "-", desc: "Nature, Summon massive wave" },
        { name: "Cloudkill", damage: "3/D6", arcana: "5", weakened: "-", desc: "Nature, Deadly poison cloud, 4 rounds" },
        { name: "Wall of Thorns", damage: "4/D6", arcana: "6", weakened: "-", desc: "Nature, Create wall of thorns, 4 rounds" },
        { name: "Tsunami", damage: "4/D6", arcana: "6", weakened: "-", desc: "Nature, Summon devastating tsunami" },
        { name: "Storm of Vengeance", damage: "4/D10", arcana: "7", weakened: "-", desc: "Nature, Summon apocalyptic storm, 4 rounds" },

        // Nature Control (new)
        { name: "Sleet Storm", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Sleet storm hinders movement, 2 rounds" },
        { name: "Stinking Cloud", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Nauseating gas cloud, 2 rounds" },
        { name: "Grasping Vine", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Vine grasps and pulls target, 2 rounds" },
        { name: "Watery Sphere", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Trap target in water sphere, 2 rounds" },

        // Nature Summoning (new)
        { name: "Summon Beast", damage: "1/D10", arcana: "3", weakened: "-", desc: "Nature, Summon beast companion, 2 rounds" },
        { name: "Summon Fey", damage: "2/D6", arcana: "4", weakened: "-", desc: "Nature, Summon fey creature, 2 rounds" },
        { name: "Giant Insect", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Transform insects to giants, 4 rounds" },
        { name: "Conjure Woodland Beings", damage: "2/D10", arcana: "5", weakened: "-", desc: "Nature, Summon forest creatures, 2 rounds" },
        { name: "Conjure Animals", damage: "2/D10", arcana: "5", weakened: "-", desc: "Nature, Summon animal spirits, 2 rounds" },
        { name: "Summon Celestial", damage: "2/D10", arcana: "5", weakened: "-", desc: "Nature, Summon celestial being, 4 rounds" },
        { name: "Summon Draconic Spirit", damage: "2/D10", arcana: "5", weakened: "-", desc: "Nature, Summon dragon spirit, 4 rounds" },
        { name: "Conjure Fey", damage: "3/D6", arcana: "6", weakened: "-", desc: "Nature, Summon powerful fey, 4 rounds" },

        // Nature Transmutation (new)
        { name: "Air Bubble", damage: "0", arcana: "2", weakened: "-", desc: "Nature, Create air bubble for breathing, 24 hours" },

        // Nature Utility (new)
        { name: "Create Food and Water", damage: "0", arcana: "4", weakened: "-", desc: "Nature, Conjure sustenance, Instant" },
        { name: "Heroes' Feast", damage: "0", arcana: "6", weakened: "-", desc: "Nature, Summon magical feast, Permanent" },
        { name: "Temple of the Gods", damage: "0", arcana: "7", weakened: "-", desc: "Nature, Create holy temple, 24 hours" }
    ],

    "Priest": [
        // Divine Healing - Faith 1
        { name: "Healing Word", damage: "1/D6", faith: "1", weakened: "-", desc: "Divine, Speak healing into wounded ally" },
        { name: "Sacred Flame", damage: "1/D10", faith: "1", weakened: "-", desc: "Divine, Holy fire descends on target" },
        { name: "Guidance", damage: "0", faith: "1", weakened: "-", desc: "Divine, Grant divine guidance, 1 round" },
        { name: "Light of Faith", damage: "0", faith: "1", weakened: "-", desc: "Divine, Create holy light, 4 rounds" },
        { name: "Sanctuary", damage: "0", faith: "1", weakened: "-", desc: "Divine, Protect target from attacks, 2 rounds" },

        // Divine Healing - Faith 2
        { name: "Cure Wounds", damage: "2/D6", faith: "2", weakened: "-", desc: "Divine, Touch to heal wounds" },
        { name: "Lesser Restoration", damage: "0", faith: "2", weakened: "-", desc: "Divine, Cure disease or condition" },
        { name: "Shield of Faith", damage: "0", faith: "2", weakened: "-", desc: "Divine, Protective aura, 4 rounds" },
        { name: "Bless", damage: "0", faith: "2", weakened: "-", desc: "Divine, Bless up to 3 allies, 2 rounds" },
        { name: "Prayer of Healing", damage: "2/D6", faith: "2", weakened: "-", desc: "Divine, Heal multiple allies, Not in battle" },

        // Divine Offensive - Faith 2-3
        { name: "Guiding Bolt", damage: "2/D6", faith: "2", weakened: "-", desc: "Divine, Bolt of radiant light" },
        { name: "Spiritual Weapon", damage: "2/D6", faith: "2", weakened: "-", desc: "Divine, Summon holy weapon, 2 rounds" },
        { name: "Holy Smite", damage: "2/D10", faith: "3", weakened: "-", desc: "Divine, Smite with holy power" },
        { name: "Flame Strike", damage: "3/D6", faith: "3", weakened: "-", desc: "Divine, Pillar of divine fire" },

        // Divine Protection - Faith 3-4
        { name: "Dispel Evil", damage: "0", faith: "3", weakened: "-", desc: "Divine, Ward against evil, 4 rounds" },
        { name: "Protection from Evil", damage: "0", faith: "3", weakened: "-", desc: "Divine, Shield from evil creatures, 4 rounds" },
        { name: "Beacon of Hope", damage: "0", faith: "3", weakened: "-", desc: "Divine, Inspire hope, allies heal more, 2 rounds" },
        { name: "Death Ward", damage: "0", faith: "4", weakened: "-", desc: "Divine, Protect from death, once, 8 hours" },
        { name: "Guardian of Faith", damage: "2/D10", faith: "4", weakened: "-", desc: "Divine, Summon guardian spirit, 4 rounds" },

        // Divine High Power - Faith 4-6
        { name: "Greater Restoration", damage: "0", faith: "4", weakened: "-", desc: "Divine, Cure any ailment" },
        { name: "Mass Cure Wounds", damage: "3/D6", faith: "4", weakened: "-", desc: "Divine, Heal all nearby allies" },
        { name: "Holy Aura", damage: "0", faith: "5", weakened: "-", desc: "Divine, Protective aura for all allies, 4 rounds" },
        { name: "Divine Intervention", damage: "Special", faith: "5", weakened: "-", desc: "Divine, Call upon your deity, Special" },
        { name: "Resurrection", damage: "0", faith: "6", weakened: "-", desc: "Divine, Bring back the dead, Not in battle" },

        // Religion-specific (examples)
        { name: "Wrath of Taninsam", damage: "3/D10", faith: "4", weakened: "-", desc: "Taninsam, Righteous flame, Only Taninsam followers" },
        { name: "Mercy of Tanala", damage: "3/D6", faith: "4", weakened: "-", desc: "Tanala, Great healing wave, Only Tanala followers" },
        { name: "Judgment of Tanaru", damage: "3/D6", faith: "4", weakened: "-", desc: "Tanaru, Divine judgment, Only Tanaru followers" },
        { name: "Turn Undead", damage: "0", faith: "2", weakened: "-", desc: "Divine, Force undead to flee, 2 rounds" },
        { name: "Banishment", damage: "0", faith: "4", weakened: "-", desc: "Divine, Banish creature to another plane, 2 rounds" }
    ],

    "Bard": [
        // Performance - Inspiration 1
        { name: "Bardic Inspiration", check: "Passive", damage: "Grant ally bonus die", inspiration: "1", weakened: "-", desc: "Performance, Grant ally bonus die, 1 round", gain: 0 },
        { name: "Vicious Mockery", damage: "1/D6", inspiration: "1", weakened: "-", desc: "Performance, Insult deals psychic damage" },
        { name: "Healing Word", damage: "1/D6", inspiration: "1", weakened: "-", desc: "Song, Speak healing melody" },
        { name: "Prestidigitation", damage: "0", inspiration: "1", weakened: "-", desc: "Performance, Minor magical tricks" },
        { name: "Minor Illusion", damage: "0", inspiration: "1", weakened: "-", desc: "Illusion, Create small illusion, 2 rounds" },

        // Songs - Inspiration 1-2
        { name: "Song of Rest", damage: "1/D6", inspiration: "1", weakened: "-", desc: "Song, Allies heal during rest, Not in battle" },
        { name: "Song of Courage", damage: "0", inspiration: "1", weakened: "-", desc: "Song, Allies resist fear, 3 rounds" },
        { name: "Dissonant Whispers", damage: "2/D6", inspiration: "2", weakened: "-", desc: "Song, Painful sound in target's mind" },
        { name: "Shatter", damage: "2/D6", inspiration: "2", weakened: "-", desc: "Song, Loud noise damages targets" },
        { name: "Enthralling Performance", damage: "0", inspiration: "2", weakened: "-", desc: "Performance, Captivate audience, Not in battle" },

        // Enchantment - Inspiration 2-3
        { name: "Charm Person", damage: "0", inspiration: "2", weakened: "-", desc: "Enchantment, Charm a humanoid, 4 rounds" },
        { name: "Suggestion", damage: "0", inspiration: "2", weakened: "-", desc: "Enchantment, Suggest a course of action" },
        { name: "Hypnotic Pattern", damage: "0", inspiration: "3", weakened: "-", desc: "Enchantment, Hypnotize multiple targets, 2 rounds" },
        { name: "Compulsion", damage: "0", inspiration: "3", weakened: "-", desc: "Enchantment, Force targets to move, 2 rounds" },
        { name: "Hold Person", damage: "0", inspiration: "3", weakened: "-", desc: "Enchantment, Paralyze humanoid, 2 rounds" },

        // Utility & Support
        { name: "Detect Thoughts", damage: "0", inspiration: "2", weakened: "-", desc: "Divination, Read surface thoughts, 2 rounds" },
        { name: "Speak with Dead", damage: "0", inspiration: "3", weakened: "-", desc: "Necromancy, Question a corpse, Not in battle" },
        { name: "Tongues", damage: "0", inspiration: "2", weakened: "-", desc: "Divination, Understand all languages, 4 rounds" },
        { name: "Invisibility", damage: "0", inspiration: "2", weakened: "-", desc: "Illusion, Turn invisible, 4 rounds" },
        { name: "Dimension Door", damage: "0", inspiration: "3", weakened: "-", desc: "Conjuration, Teleport short distance, Instant" },

        // Advanced Performance
        { name: "Countercharm", damage: "0", inspiration: "2", weakened: "-", desc: "Performance, Allies resist charms, 2 rounds" },
        { name: "Mass Suggestion", damage: "0", inspiration: "3", weakened: "-", desc: "Enchantment, Suggest to multiple targets" },
        { name: "Greater Invisibility", damage: "0", inspiration: "3", weakened: "-", desc: "Illusion, Invisible even while attacking, 4 rounds" },
        { name: "Otto's Dance", damage: "0", inspiration: "3", weakened: "-", desc: "Enchantment, Force target to dance, 2 rounds" },

        // Knowledge & Lore
        { name: "Identify", damage: "0", inspiration: "1", weakened: "-", desc: "Divination, Identify magic item, Not in battle" },
        { name: "Legend Lore", damage: "0", inspiration: "3", weakened: "-", desc: "Divination, Learn about legendary item/place, Not in battle" },
        { name: "Cutting Words", check: "Reaction", damage: "Reduce enemy roll", inspiration: "1", weakened: "-", desc: "Performance, Distract enemy, reduce their roll", gain: 0 }
    ],

    "Shadowblade": [
        // Void Strike - Void 1
        { name: "Shadow Strike", damage: "1/D10", void: "1", corruption: "+1", desc: "Void, Strike with shadow-infused blade" },
        { name: "Umbral Dagger", damage: "1/D6", void: "1", corruption: "0", desc: "Void, Throw a dagger of pure shadow" },
        { name: "Dark Vision", damage: "0", void: "1", corruption: "0", desc: "Void, See in complete darkness, 4 rounds" },
        { name: "Whisper Step", damage: "0", void: "1", corruption: "0", desc: "Void, Move silently through shadows" },

        // Void Control - Void 2
        { name: "Shadow Cloak", damage: "0", void: "2", corruption: "0", desc: "Void, Become one with shadows, 3 rounds" },
        { name: "Void Slash", damage: "2/D6", void: "2", corruption: "+1", desc: "Void, Slash that ignores armor" },
        { name: "Fade", damage: "0", void: "2", corruption: "0", desc: "Void, Briefly become ethereal, 1 round" },
        { name: "Shadow Bind", damage: "0", void: "2", corruption: "+1", desc: "Void, Bind target with their own shadow, 2 rounds" },
        { name: "Absorb Shadow", damage: "0", void: "2", corruption: "+1", desc: "Void, Absorb nearby shadows for power, +1 Void" },

        // Void Assault - Void 3
        { name: "Nightblade", damage: "2/D10", void: "3", corruption: "+1", desc: "Void, Blade of pure darkness" },
        { name: "Shadow Step", damage: "0", void: "3", corruption: "0", desc: "Void, Teleport between shadows, Instant" },
        { name: "Void Grasp", damage: "2/D6", void: "3", corruption: "+2", desc: "Void, Tendril of void grabs target" },
        { name: "Silence of the Void", damage: "0", void: "3", corruption: "+1", desc: "Void, Create zone of silence, 2 rounds" },
        { name: "Shadow Duplicate", damage: "0", void: "3", corruption: "+1", desc: "Void, Create shadow copy of self, 2 rounds" },

        // Void Mastery - Void 4-5
        { name: "Consume Light", damage: "3/D6", void: "4", corruption: "+2", desc: "Void, Absorb all light, damage all in area" },
        { name: "Void Walk", damage: "0", void: "4", corruption: "+1", desc: "Void, Travel through void to distant point" },
        { name: "Shadow Army", damage: "2/D6", void: "4", corruption: "+2", desc: "Void, Summon shadow warriors, 2 rounds" },
        { name: "Embrace the Void", damage: "3/D10", void: "5", corruption: "+3", desc: "Void, Channel pure void energy" },
        { name: "Ebon Blade", damage: "3/D10", void: "5", corruption: "+2", desc: "Void, Summon ultimate shadow weapon, 4 rounds" },

        // Corruption Abilities (unlock at corruption thresholds)
        { name: "Dark Pact", damage: "Special", void: "0", corruption: "-2", desc: "Corruption, Sacrifice HP to reduce corruption" },
        { name: "Feed on Fear", damage: "1/D6", void: "1", corruption: "+1", desc: "Corruption, Heal from enemy's fear" },
        { name: "Shadow Possession", damage: "0", void: "4", corruption: "+3", desc: "Corruption, Possess target through their shadow, 2 rounds" },
        { name: "Void Explosion", damage: "4/D6", void: "5", corruption: "+4", desc: "Corruption, Unleash void in massive explosion" },
        { name: "One with Shadow", damage: "0", void: "3", corruption: "+2", desc: "Corruption, Become living shadow, 4 rounds" },

        // Stealth & Utility
        { name: "Shadow Meld", damage: "0", void: "1", corruption: "0", desc: "Stealth, Blend perfectly into shadows, Not in battle" },
        { name: "Umbral Sight", damage: "0", void: "2", corruption: "0", desc: "Void, See invisible and hidden, 2 rounds" },
        { name: "Void Sense", damage: "0", void: "2", corruption: "0", desc: "Void, Sense creatures in darkness, 4 rounds" }
    ]
};

// Function to get spells for a specific class
function getSpellsForClass(className) {
    return SPELLS_BY_CLASS[className] || [];
}
