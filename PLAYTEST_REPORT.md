# SmashUS Playtester Feedback Report

**Game:** SmashUS - "John Q. Public vs. the Government"
**Build:** Pre-release (procedural sprites, no final assets)
**Date:** 2026-02-08
**Test Format:** 5 independent testers, each given 45-60 minutes of unguided play
**Target Reference:** Smash TV (1990, Williams/Midway)

---

## Tester Profiles

| ID | Background | Play Style |
|----|-----------|------------|
| T1 | Arcade veteran, played original Smash TV cabinets | Aggressive, rushes enemies |
| T2 | Casual PC gamer, mostly plays puzzle/strategy games | Cautious, explores menus |
| T3 | QA analyst, 6 years in game testing | Systematic, tests edge cases |
| T4 | Game design student, studies action game balance | Analytical, compares to references |
| T5 | Speedrunner, plays twin-stick shooters competitively | Optimizes, exploits systems |

---

## Tester 1 (T1) - Arcade Veteran

### First Impressions
> "Title screen looks good. The pixel art is charming and the chiptune music
> kicked in right away - felt nostalgic. Clicked to start and I'm in. Good."

### Moment-to-Moment Gameplay
> "First thing I notice: my weapon is a wrench. Why am I throwing wrenches?
> It's incredibly slow. In Smash TV you start with a machine gun that feels
> powerful from second one. Here I'm lobbing wrenches at 3 frames per second
> at... 3 interns? Where are all the enemies?"

> "Room 1 had 3 enemies. I killed them in about 4 seconds. Then nothing
> happened for 2 full seconds. Then 4 more spawned. That dead air between
> waves completely kills the momentum. In Smash TV, enemies are POURING
> through doors before you've finished the last group. There's never a
> moment to breathe. Here I'm standing around waiting."

> "By Room 3 there are maybe 7-8 enemies total across the waves. That's
> still nothing. Smash TV throws 30-40 at you in a single wave. The screen
> should be FULL of things trying to kill me. Instead I'm picking off
> stragglers."

### Boss Fight (IRS Commissioner)
> "Boss spawns, health bar appears - that's fine. Then it starts its attack
> and... what? There are suddenly a WALL of projectiles. Like, 30+ per
> frame. I went from fighting 3 interns to dodging a bullet hell curtain
> with zero ramp-up. The difficulty spike is insane."

> "Also the 'beam sweep' attack is just... a line of stationary projectiles
> that rotates? It doesn't look or feel like a beam. It looks like someone
> spilled a bag of marbles in a circle."

> "I can't tell when the boss changes phases. It flashes white briefly and
> then... does basically the same stuff? Maybe slightly faster? There's no
> 'oh crap new attack pattern' moment. Phases feel meaningless."

### Loot and Pickups
> "Not enough loot on the ground. In Smash TV, killing enemies showers the
> floor with cash and prizes. Here I kill an enemy and MAYBE something
> drops. The floor should be carpeted with money. That's the dopamine loop -
> wade through cash while dodging bullets."

### Overall Verdict
> "This doesn't feel like Smash TV. It feels like a roguelike with Smash TV
> window dressing. The pacing is wrong - too much downtime, not enough chaos.
> Enemy counts need to be 5-10x higher. Waves need to overlap. The floor
> needs to be covered in loot. And please, give me a real gun to start with,
> not a wrench."

**Rating: 4/10 as a Smash TV homage**

---

## Tester 2 (T2) - Casual Gamer

### First Impressions
> "The title screen is pretty. I can see controls listed - WASD to move,
> mouse to aim and shoot. That's straightforward."

### Onboarding Experience
> "I clicked start and I'm in a room. No tutorial, no tooltip, nothing
> telling me what my weapon does or what the enemies are. I figured out
> movement quickly but it took me a few seconds to realize I was throwing
> wrenches with left click."

> "The wrench feels really bad. Slow, weak. I died to the first group of
> enemies because I couldn't kill them fast enough and they just walked
> into me. Contact damage plus a slow weapon is punishing for new players."

> "I had no idea what the pickups were when they dropped. Some green thing,
> some yellow thing. No labels, no tooltips. I grabbed everything and hoped
> for the best. I think one gave me money? Hard to tell."

### Shop Scene
> "Oh wait, this is actually nice. The shop has a shopkeeper, there are
> categories, I can see prices. This is the most polished part of the game
> so far. But I had barely any money after Level 1 because so few enemies
> dropped loot."

> "I bought a fire rate upgrade because my wrench felt so slow. Went back
> to gameplay and... it still felt exactly the same speed? I couldn't tell
> if it did anything. Was that a waste of money?"

### Pain Points
> "When I died, the game respawned me in the same room but all the enemies
> respawned too. That's frustrating - I lose a life AND have to redo
> everything."

> "I never found a weapon pickup in my entire first run. I was stuck with
> the wrench until I died. That's way too long with a bad weapon."

### Overall Verdict
> "I can see there's a game here, but the first 5 minutes are rough. The
> wrench start is punishing, there's no guidance, and I couldn't tell if
> my upgrades were working. The shop was the highlight - I actually enjoyed
> browsing upgrades. If the combat felt as good as the shop looks, this
> would be fun."

**Rating: 5/10 for casual accessibility**

---

## Tester 3 (T3) - QA Analyst

### Bugs Found

#### BUG-001: Fire Rate Upgrade Has No Effect [CRITICAL]
> **Steps to reproduce:**
> 1. Start new game, note wrench fire rate
> 2. Earn money, go to shop
> 3. Purchase fire rate upgrade
> 4. Return to gameplay
> 5. Fire weapon - observe same fire rate as before
>
> **Expected:** Weapon fires faster after upgrade purchase
> **Actual:** Fire rate is unchanged. The `fireRateMultiplier` on Player
> is set correctly but is never passed to the Weapon's cooldown
> calculation. `Weapon.ts` calculates cooldown as `1 / this.stats.fireRate`
> with no multiplier applied.
>
> **Severity:** Critical - players are spending currency on a broken upgrade

#### BUG-002: Boss Hazard System is Completely Disconnected [CRITICAL]
> **Steps to reproduce:**
> 1. Examine boss attack code (any boss)
> 2. Note that attacks reference hazard types like 'gavel_shockwave',
>    'audit_beam', etc.
> 3. Observe that these are pushed as `projectileRequests`
> 4. Observe that GameScene processes them via `spawnBossProjectile()`
>    which creates standard `Projectile` objects
> 5. Note that 6 hazard classes exist (BeamSweep, Shockwave, LingeringZone,
>    TargetReticle, Explosion, ReflectiveBarrier) but are NEVER
>    instantiated by any boss
>
> **Expected:** Boss attacks use the specialized hazard classes
> **Actual:** All boss attacks are converted to generic projectiles. The
> entire hazard system (`/bosses/attacks/`) is dead code.
>
> **Impact:** Boss attacks that should be beam sweeps, shockwaves, and
> lingering zones are all rendered as plain projectile bullets.
>
> **Severity:** Critical - core boss mechanic architecture is broken

#### BUG-003: SenatorPair Invincibility Logic is Inverted [HIGH]
> **Steps to reproduce:**
> 1. Reach the SenatorPair boss fight
> 2. Observe the "Filibuster" attack pattern
> 3. When navy senator filibusters, the charcoal senator should become
>    the attackable target
> 4. Instead, invincibility flags are applied backwards
>
> **Code location:** `SenatorPair.ts` lines ~109-114
> ```
> if (state.filibusteringSenator === 'navy') {
>   senatorBoss.secondSenator.isInvincible = false  // Should be true
> } else {
>   senatorBoss.secondSenator.isInvincible = true   // Should be false
> }
> ```
>
> **Severity:** High - boss mechanic doesn't work as designed

#### BUG-004: President's "Veto" Attack Doesn't Reflect Projectiles [MEDIUM]
> **Steps to reproduce:**
> 1. Reach the President boss fight
> 2. Observe the "Veto Power" attack
> 3. Attack spawns stationary damage projectiles with `speed: 0`
> 4. Player projectiles are NOT reflected - they just collide normally
>
> **Expected:** ReflectiveBarrier class should be instantiated, reflecting
> player shots back at them
> **Actual:** Attack creates plain projectiles. ReflectiveBarrier class
> exists but is never used.
>
> **Severity:** Medium - feature works differently than described

#### BUG-005: VP's "Debate" Attack Doesn't Reverse Controls [MEDIUM]
> **Steps to reproduce:**
> 1. Reach VicePresident boss fight
> 2. Get hit by "Debate" pulse attack
> 3. Controls remain normal
>
> **Expected:** Player controls should be temporarily reversed
> **Actual:** Attack just deals damage like any other projectile. No
> control reversal mechanic exists in the codebase.
>
> **Severity:** Medium - advertised mechanic missing entirely

#### BUG-006: Boss Projectile Spam Creates Performance Risk [MEDIUM]
> **Analysis:** Multiple boss attacks spawn 15-30 projectile requests PER
> FRAME during their attack phase. A 3-second attack at 60fps generates
> 2700-5400 projectile objects.
>
> | Boss | Attack | Projectiles/Frame | Total Over Attack |
> |------|--------|-------------------|-------------------|
> | IRS Commissioner | Audit Beam Sweep | 15-30 | ~2700-5400 |
> | Speaker | Gavel Slam | 8-24 | ~5000+ |
> | President | Final Authority | 30+ | ~5400+ |
>
> **Risk:** PIXI.js sprite creation, AABB collision checks (O(n) per
> projectile), and array cleanup at these volumes will cause frame drops
> on mid-range hardware. Object pool exists but is unused.
>
> **Severity:** Medium-High - likely performance degradation during bosses

#### BUG-007: Shield Display Hardcoded to 3 Pips [LOW]
> **Steps to reproduce:**
> 1. Upgrade maxShield beyond 3 in shop
> 2. Observe HUD still only draws 3 shield pips
>
> **Code location:** `HUD.ts` line 132: `for (let i = 0; i < 3; i++)`
> should be `for (let i = 0; i < player.maxShield; i++)`
>
> **Severity:** Low - visual only, shield system works correctly internally

#### BUG-008: ObjectPool Defined But Never Used [LOW]
> **Observation:** `ObjectPool.ts` implements a generic object pool with
> acquire/release. It is never imported or used anywhere. Projectiles and
> particles are created with `new` every time.
>
> **Impact:** Memory allocation churn during heavy combat. Not a bug per
> se, but the system was built and never integrated.

### QA Summary
> "There are 2 critical bugs that break core systems (fire rate upgrades
> and boss hazards), 1 high-severity logic inversion, and several medium
> issues around missing features that the code claims to support. The game
> compiles and runs without crashes, but fundamental gameplay systems are
> silently broken."

**Rating: 3/10 for production readiness**

---

## Tester 4 (T4) - Game Design Student

### Design Analysis

#### Pacing Curve
> "The pacing is fundamentally wrong for a Smash TV-style game. Let me
> chart what happens in a typical room:"
>
> ```
> TIME (seconds)  EVENT
> 0.0             Room starts
> 0.5             Wave 1 spawns (3-5 enemies)
> 2-4             Wave 1 cleared
> 4-6             DEAD TIME (waiting for wave 2 delay)
> 6.0             Wave 2 spawns (3-4 enemies)
> 8-10            Wave 2 cleared
> 10-12           DEAD TIME
> 12.0            Wave 3 (if exists)
> 14-16           Room cleared, 2-3 second transition
> ```
>
> "That's ~40% dead time. Smash TV is 0% dead time. Enemies should
> already be flooding in before the current group is dead. The wave system
> needs to be timer-based, not kill-based."

#### Weapon Progression
> "The DPS curve across weapons is broken:"
>
> ```
> Wrench:     30 DPS  (starting)
> Laser:      50 DPS  (+67%)
> Pistol:     75 DPS  (+150%)
> Shotgun:    80 DPS  (+167%)
> RapidFire:  96 DPS  (+220%)
> SpreadShot: 144 DPS (+380%)
> ```
>
> "The spread between worst and best weapon is 4.8x. That's insane.
> SpreadShot deals nearly 5 times the DPS of the starting weapon. In
> Smash TV, weapon pickups are meaningful upgrades but not 5x
> multipliers. A 1.5-2x range is appropriate."
>
> "Worse: weapon drops are random. Getting SpreadShot in Room 1 trivializes
> the entire level. Not getting it until Level 3 makes the game tedious.
> This is luck-driven difficulty, not skill-driven."

#### Boss Phase Design
> "I analyzed all 5 boss phase transitions. Here's what actually changes
> between phases:"
>
> | Boss | Phase Change | What Player Notices |
> |------|-------------|---------------------|
> | IRS Commissioner | Beam rotates slightly faster | Almost nothing |
> | SenatorPair | 2 projectiles instead of 1 | Marginal |
> | Speaker | Slightly larger shockwave radius | Hard to perceive |
> | VicePresident | Minor spread angle increase | Invisible |
> | President | 4 danger zones instead of 3 | Barely noticeable |
>
> "Phases are stat tweaks, not mechanical changes. Good boss design
> introduces NEW attacks or mechanics per phase. Cuphead does this -
> each phase fundamentally changes how you approach the fight. Here,
> every phase is 'same thing but slightly more.'"

#### Enemy Role Design
> "The enemy types have good variety ON PAPER - rush melee, ranged,
> flanker, flee-and-trap. But the enemy counts are so low that you never
> experience the intended dynamics. A flanking Secret Service agent is
> interesting when there are 8 interns distracting you. It's trivial when
> there are 2 enemies total."
>
> "Smash TV's design works because enemy ROLES emerge from enemy VOLUME.
> Mr. Shrapnel is dangerous because you're already dodging 20 grunts.
> Remove the grunts and Mr. Shrapnel is just a slow target."

#### Scoring System
> "Score display is tiny text in the corner. In Smash TV, score is
> CELEBRATED. Points explode off enemies, multiplier chains build, bonus
> rooms shower you with prizes. Here, score is an afterthought. There's
> no score multiplier, no combo system, no visible point popups when you
> kill something."

### Overall Verdict
> "The game has roguelike bones (shop, upgrades, progression) wearing
> arcade skin. If you want Smash TV, you need to strip the roguelike
> systems and double down on arcade chaos. If you want a roguelike, the
> combat pacing needs serious tuning. Right now it's stuck in an identity
> crisis between the two genres."

**Rating: 4/10 for design cohesion**

---

## Tester 5 (T5) - Speedrunner / Optimizer

### Optimization Findings

#### SpreadShot Dominance
> "SpreadShot is the only weapon that matters. At 144 DPS it's 50% higher
> than RapidFire and nearly 5x the starting Wrench. My optimal strategy
> is: survive with Wrench until SpreadShot drops, then the game becomes
> trivial."
>
> "With damage upgrades stacking multiplicatively on top of SpreadShot's
> base 144 DPS, late-game DPS is absurd. By Level 3-4 you're one-shotting
> everything except bosses."

#### Fire Rate Upgrades are Worthless
> "Tested this multiple times. Bought fire rate upgrades, timed my shots
> before and after. Zero difference. The upgrade takes your money and does
> nothing. Never buy fire rate."

#### Boss Pattern Exploitation
> "Bosses don't track or chase you. Their movement patterns are
> predetermined. I found safe spots for every boss by just circling the
> arena edges. The bosses aim at your current position but the projectiles
> are slow enough to sidestep."
>
> "The 'wind-up' state before each attack is generous enough that I can
> get in 3-4 free hits every cycle. Combined with SpreadShot, boss fights
> are just: circle edge → dump damage during wind-up → dodge the spray →
> repeat."

#### Shop Meta
> "Optimal shop strategy: damage upgrades first (they actually work),
> then max HP. Never buy fire rate (broken). Shield is decent but
> expensive. Speed upgrades are unnecessary because you can already outrun
> everything."
>
> "The upgrade cost scaling (exponential) means later tiers are never
> worth it. Better to spread purchases across cheap tier-1 upgrades than
> invest in one expensive tier-3."

#### Money Starvation
> "Early game money income is terrible. Level 1 gives maybe 300-500 total
> from enemy drops plus room clear bonuses. Upgrades start at 100-200 and
> scale up fast. You can afford 1-2 cheap upgrades after Level 1. This
> means the shop is underwhelming for the first 2 visits."

#### Run Variance
> "Runs are almost entirely decided by weapon drops. Good SpreadShot luck
> in Level 1 = easy clear. No weapon drops until Level 3 = tedious slog
> with Wrench. The skill ceiling is low because the determining factor is
> RNG, not player ability."

### Overall Verdict
> "One viable weapon, one broken upgrade, zero mechanical depth in boss
> fights. The optimal strategy emerges in 10 minutes and never changes:
> get SpreadShot, buy damage upgrades, circle bosses. There's nothing to
> master."

**Rating: 3/10 for replayability and depth**

---

## Consolidated Findings

### Critical Issues (Must Fix)

| # | Issue | Testers | Severity |
|---|-------|---------|----------|
| 1 | **Fire rate upgrade does nothing** - `fireRateMultiplier` is never applied to weapon cooldown | T2, T3, T5 | CRITICAL |
| 2 | **Boss hazard system is dead code** - 6 hazard classes (BeamSweep, Shockwave, LingeringZone, TargetReticle, Explosion, ReflectiveBarrier) are never instantiated; all boss attacks become generic projectiles | T3 | CRITICAL |
| 3 | **Enemy counts far too low** - 3-8 enemies per wave vs. Smash TV's 20-40; rooms feel empty | T1, T4 | CRITICAL |
| 4 | **Waves don't overlap** - next wave waits for previous to die + 2s delay; 40% dead time per room | T1, T4 | CRITICAL |
| 5 | **Starting weapon (Wrench) is terrible** - 30 DPS, slowest fire rate, no upside; punishes new players | T1, T2, T5 | HIGH |
| 6 | **SpreadShot is absurdly overpowered** - 144 DPS vs. next best 96; trivializes game once obtained | T4, T5 | HIGH |
| 7 | **Boss phases are cosmetic** - stat tweaks only, no new attacks or mechanics per phase | T1, T4 | HIGH |
| 8 | **SenatorPair invincibility logic is inverted** - filibuster mechanic applies to wrong senator | T3 | HIGH |

### Medium Issues (Should Fix)

| # | Issue | Testers |
|---|-------|---------|
| 9 | President "Veto" doesn't reflect projectiles (ReflectiveBarrier unused) | T3 |
| 10 | VP "Debate" doesn't reverse controls (mechanic not implemented) | T3 |
| 11 | Boss projectile spam (15-30/frame) risks performance degradation | T3 |
| 12 | Insufficient loot drops (35% chance, should be much higher for Smash TV feel) | T1 |
| 13 | No score popups, no combo system, no multiplier | T4 |
| 14 | No onboarding or tutorial; new players confused on first play | T2 |
| 15 | Weapon balance spread is 4.8x between worst and best | T4, T5 |
| 16 | Money income too low early; shop feels unrewarding on first visit | T2, T5 |

### Low Issues (Nice to Fix)

| # | Issue | Testers |
|---|-------|---------|
| 17 | Shield HUD hardcoded to 3 pips (ignores maxShield upgrades) | T3 |
| 18 | ObjectPool built but never used (wasted optimization opportunity) | T3 |
| 19 | No room exit choice (linear progression vs. Smash TV's room grid) | T1 |
| 20 | No announcer/spectacle layer (game show presentation missing) | T1 |
| 21 | Enemies spawn at random edges, not through visible doors | T1 |
| 22 | Bosses don't chase or evade; exploitable by circling arena edge | T5 |

---

## Tester Consensus

### What Works
- **Pixel art** is charming and each enemy type is visually distinct
- **Procedural audio** is surprisingly good; chiptune music fits the vibe
- **Shop scene** is the most polished part of the game; good UI, fun shopkeeper
- **Level backgrounds** have personality (Oval Office, Senate Chamber, etc.)
- **Controls** (WASD + mouse) are responsive and feel correct for the genre
- **Theme** is clever and has potential

### What Doesn't Work
- **Combat pacing** has too much downtime; not enough enemies, waves don't overlap
- **Weapon balance** is broken; SpreadShot dominates, Wrench is punishment
- **Boss fights** are projectile spam with meaningless phases and dead-code mechanics
- **Upgrade system** has a non-functional fire rate upgrade (takes money, does nothing)
- **Loot scarcity** kills the Smash TV dopamine loop
- **No skill ceiling** - optimal strategy is obvious and RNG-dependent

### Average Rating: 3.8 / 10

The game has solid technical foundations, good presentation, and a fun theme. But
the core gameplay loop - the combat, the pacing, the chaos - is fundamentally
undercooked. It doesn't deliver on the Smash TV promise of overwhelming, rewarding
carnage.
