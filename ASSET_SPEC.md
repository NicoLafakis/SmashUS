# SmashUS Asset Specification

This document outlines all sprite assets needed for the game. All sprites should be PNG format with transparency.

## Art Style Guidelines

- **Style:** Pixel art (similar to Smash TV, Enter the Gungeon)
- **Perspective:** Top-down with slight pseudo-isometric feel
- **Color Palette:** Government blues, reds, whites, wood tones, marble textures
- **Resolution:** Design at 1x, game renders at 1280x720

---

## Directory Structure

```
src/assets/
├── sprites/
│   ├── player/
│   │   ├── player.png          # Sprite sheet
│   │   └── player.json         # Atlas data
│   ├── enemies/
│   │   ├── intern.png
│   │   ├── intern.json
│   │   ├── bureaucrat.png
│   │   ├── bureaucrat.json
│   │   ├── irs_agent.png
│   │   ├── irs_agent.json
│   │   ├── secret_service.png
│   │   ├── secret_service.json
│   │   ├── lobbyist.png
│   │   └── lobbyist.json
│   ├── bosses/
│   │   ├── irs_commissioner.png
│   │   ├── senator.png
│   │   ├── speaker.png
│   │   ├── vice_president.png
│   │   └── president.png
│   ├── weapons/
│   │   └── projectiles.png     # All projectiles in one sheet
│   ├── pickups/
│   │   └── pickups.png         # All pickups in one sheet
│   ├── environment/
│   │   ├── tiles/
│   │   │   ├── irs_building.png
│   │   │   ├── capitol.png
│   │   │   ├── house_chamber.png
│   │   │   ├── senate_chamber.png
│   │   │   └── white_house.png
│   │   └── props/
│   │       └── props.png       # All props in one sheet
│   └── ui/
│       ├── hud.png
│       └── font.png            # Bitmap font (optional)
```

---

## 1. PLAYER CHARACTER

### John Q. Public
**File:** `player/player.png`
**Sprite Size:** 48x48 pixels
**Description:** Average American man with brown hair, red flannel shirt (with darker red plaid pattern), white undershirt visible at collar, blue jeans, brown work boots.

#### Animation Frames Required:

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle_down | 2 | Facing down (toward camera), subtle breathing |
| idle_up | 2 | Facing up (away from camera) |
| idle_left | 2 | Facing left |
| idle_right | 2 | Facing right |
| walk_down | 4 | Walking toward camera |
| walk_up | 4 | Walking away |
| walk_left | 4 | Walking left |
| walk_right | 4 | Walking right |
| hurt | 2 | Flinch animation (can be single direction) |
| death | 4 | Death animation |

**Total Frames:** ~30 frames
**Sheet Layout:** 10 columns x 3 rows recommended (480x144)

---

## 2. ENEMIES

### 2.1 Intern
**File:** `enemies/intern.png`
**Sprite Size:** 40x48 pixels
**Description:** Young office worker in gray/black suit with red tie. Eager, running pose. Short brown/black hair.

| Animation | Frames | Notes |
|-----------|--------|-------|
| run_down | 4 | Running toward player |
| run_up | 4 | Running away |
| run_left | 4 | Running left |
| run_right | 4 | Running right |
| death | 3 | Collapse animation |

**Total Frames:** ~19 frames

---

### 2.2 Bureaucrat
**File:** `enemies/bureaucrat.png`
**Sprite Size:** 56x56 pixels (larger enemy)
**Description:** Older, heavy-set man in navy blue suit. Gray hair, glasses. Carries stacks of paperwork. Slow-moving, imposing.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | Standing, shuffling papers |
| walk_down | 4 | Slow waddle |
| walk_up | 4 | |
| walk_left | 4 | |
| walk_right | 4 | |
| attack | 3 | Throwing paperwork |
| death | 4 | Dramatic collapse |

**Total Frames:** ~25 frames

---

### 2.3 IRS Agent
**File:** `enemies/irs_agent.png`
**Sprite Size:** 48x48 pixels
**Description:** Man in dark suit (black or charcoal) with glasses. Professional look. Carries clipboard or calculator. Fires "audit beam."

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | Standing ready |
| walk_down | 4 | |
| walk_up | 4 | |
| walk_left | 4 | |
| walk_right | 4 | |
| attack | 3 | Firing audit beam |
| death | 3 | |

**Total Frames:** ~24 frames

---

### 2.4 Secret Service
**File:** `enemies/secret_service.png`
**Sprite Size:** 48x48 pixels
**Description:** Agent in black suit with sunglasses and earpiece. Professional, dangerous. Holds pistol.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | Alert stance |
| walk_down | 4 | |
| walk_up | 4 | |
| walk_left | 4 | |
| walk_right | 4 | |
| shoot | 2 | Firing pistol |
| death | 3 | |

**Total Frames:** ~23 frames

---

### 2.5 Lobbyist
**File:** `enemies/lobbyist.png`
**Sprite Size:** 48x52 pixels
**Description:** Older man in expensive brown/tan suit. Balding or slicked-back hair. Smug expression. Throws money.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | Counting money |
| walk_down | 4 | |
| walk_up | 4 | |
| walk_left | 4 | |
| walk_right | 4 | |
| attack | 3 | Throwing money/dropping traps |
| death | 3 | |

**Total Frames:** ~24 frames

---

## 3. BOSSES

### 3.1 IRS Commissioner
**File:** `bosses/irs_commissioner.png`
**Sprite Size:** 80x80 pixels
**Description:** Very large, heavy-set man in white dress shirt (sleeves rolled up), loose tie. Intimidating. Sweating.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | |
| walk | 4 | Slow, heavy steps |
| attack_beam | 4 | Audit beam sweep |
| attack_summon | 3 | Summoning agents |
| attack_storm | 4 | Paper storm |
| hurt | 2 | Flinch |
| death | 6 | Extended death |

**Total Frames:** ~25 frames

---

### 3.2 Senator (Generic - used for pairs)
**File:** `bosses/senator.png`
**Sprite Size:** 64x64 pixels
**Description:** Two variants needed (or color swaps) - one representing each side. Expensive suits, American flag pins.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | |
| walk | 4 | |
| attack | 3 | Coordinated attack |
| filibuster | 4 | Invincibility pose |
| death | 4 | |

**Total Frames:** ~17 frames x 2 variants

---

### 3.3 Speaker of the House
**File:** `bosses/speaker.png`
**Sprite Size:** 72x72 pixels
**Description:** Figure at podium (podium is part of sprite or separate prop). Gavel in hand. Professional attire.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | At podium |
| gavel_slam | 4 | Shockwave attack |
| call_vote | 3 | Summoning enemies |
| shield | 2 | Behind podium shield |
| death | 5 | |

**Total Frames:** ~16 frames

---

### 3.4 Vice President
**File:** `bosses/vice_president.png`
**Sprite Size:** 64x64 pixels
**Description:** Professional appearance, could be at a smaller podium or standing.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | |
| walk | 4 | |
| tiebreaker | 4 | Beam attack |
| summon | 3 | Secret Service summon |
| debate | 3 | Confusion attack |
| death | 4 | |

**Total Frames:** ~20 frames

---

### 3.5 The President
**File:** `bosses/president.png`
**Sprite Size:** 80x80 pixels
**Description:** At podium/desk (like Oval Office desk or press podium). Gray hair, dark suit, red tie. Final boss gravitas.

| Animation | Frames | Notes |
|-----------|--------|-------|
| idle | 2 | |
| executive_order | 4 | Screen-wide attack |
| veto | 3 | Reflect projectiles |
| press_conference | 3 | Spawn drones |
| air_strike | 4 | Call in explosions |
| hurt | 2 | |
| death | 8 | Epic final death |

**Total Frames:** ~26 frames

---

## 4. PROJECTILES

**File:** `weapons/projectiles.png`
**Layout:** Single sprite sheet with all projectiles

| Projectile | Size | Frames | Description |
|------------|------|--------|-------------|
| wrench | 24x24 | 4 | Spinning wrench (rotation frames) |
| pistol_bullet | 8x8 | 1 | Yellow bullet |
| shotgun_pellet | 6x6 | 1 | Orange pellet |
| rapidfire_bullet | 8x8 | 1 | Cyan bullet |
| laser_beam | 32x8 | 2 | Magenta/white laser, slight pulse |
| spread_bullet | 10x10 | 1 | Green energy bullet |
| paperwork | 16x16 | 2 | Flying papers |
| audit_beam | 32x8 | 2 | Red/yellow beam |
| enemy_bullet | 8x8 | 1 | Red bullet |
| money_coin | 12x12 | 4 | Spinning gold coin |

**Recommended Sheet:** 128x64 pixels

---

## 5. PICKUPS

**File:** `pickups/pickups.png`
**Sprite Size:** 24x24 pixels each
**Layout:** Single row or grid

| Pickup | Description |
|--------|-------------|
| tax_refund_small | Single dollar bill, green |
| tax_refund_large | Stack of bills with $ symbol |
| health | Red cross / first aid |
| damage_boost | Orange explosion/star |
| spread_boost | Blue triple arrow |
| shield | Blue shield shape |
| extra_life | Red heart (rare!) |
| weapon_crate | Brown wooden crate with "W" |

**Animation:** Each should have 2 frames for subtle bob/glow effect

**Recommended Sheet:** 192x48 pixels (8 items x 2 frames)

---

## 6. ENVIRONMENT TILES

### Tile Size: 40x40 pixels

Each level needs a tileset for floor and walls.

### 6.1 IRS Building (Level 1)
**File:** `environment/tiles/irs_building.png`

| Tile | Description |
|------|-------------|
| floor_1 | Gray office carpet |
| floor_2 | Gray carpet variant |
| floor_3 | Gray carpet variant (worn) |
| wall_top | Office wall (beige/white) |
| wall_side | Wall side view |
| wall_corner_tl | Top-left corner |
| wall_corner_tr | Top-right corner |
| wall_corner_bl | Bottom-left corner |
| wall_corner_br | Bottom-right corner |
| door_closed | Office door |
| door_open | Open doorway |
| door_exit | Exit door (green sign) |

---

### 6.2 Capitol Hallways (Level 2)
**File:** `environment/tiles/capitol.png`

| Tile | Description |
|------|-------------|
| floor_marble_1 | White/gray marble tile |
| floor_marble_2 | Marble variant |
| floor_marble_3 | Marble variant |
| floor_carpet | Red carpet runner |
| wall_marble | Marble wall |
| column_top | Column (top portion) |
| column_mid | Column (middle) |
| column_base | Column (base) |
| wall_* | Same pattern as above |

---

### 6.3 House Chamber (Level 3)
**File:** `environment/tiles/house_chamber.png`

| Tile | Description |
|------|-------------|
| floor_wood_1 | Wooden floor |
| floor_wood_2 | Wood variant |
| carpet_blue | Blue carpeted areas |
| wall_wood | Wood paneling |
| podium_area | Raised platform tiles |

---

### 6.4 Senate Chamber (Level 4)
**File:** `environment/tiles/senate_chamber.png`

| Tile | Description |
|------|-------------|
| floor_ornate_1 | Ornate marble |
| floor_ornate_2 | Ornate variant |
| carpet_center | Senate floor carpet |
| wall_ornate | Decorated walls |

---

### 6.5 White House (Level 5)
**File:** `environment/tiles/white_house.png`

| Tile | Description |
|------|-------------|
| floor_oval | Oval office carpet |
| floor_marble | White house marble |
| floor_garden | Rose garden grass/stone |
| wall_white | White painted walls |
| wall_window | Windows |
| curtain | Curtains |

---

## 7. PROPS (Obstacles/Destructibles)

**File:** `environment/props/props.png`
**Various sizes**

| Prop | Size | Destructible | Description |
|------|------|--------------|-------------|
| desk_office | 64x48 | Yes | Office desk with papers |
| desk_fancy | 72x48 | Yes | Ornate wooden desk |
| chair_office | 32x32 | Yes | Rolling office chair |
| chair_fancy | 32x40 | Yes | Leather chair |
| filing_cabinet | 32x48 | Yes | Metal filing cabinet |
| water_cooler | 24x48 | Yes | Water cooler |
| velvet_rope_h | 80x24 | No | Horizontal rope barrier |
| velvet_rope_v | 24x80 | No | Vertical rope barrier |
| rope_post | 24x40 | No | Gold post for ropes |
| metal_detector | 48x64 | No | Security checkpoint |
| potted_plant | 32x48 | Yes | Decorative plant |
| american_flag | 24x64 | No | Flag on pole |
| podium | 48x56 | No | Speaking podium |
| computer | 32x24 | Yes | Desktop computer |
| papers_stack | 24x16 | Yes | Stack of papers |
| security_camera | 24x24 | No | Ceiling camera |
| trash_can | 24x32 | Yes | Office trash can |

---

## 8. UI ELEMENTS

**File:** `ui/hud.png`

| Element | Size | Description |
|---------|------|-------------|
| health_bar_bg | 204x28 | Health bar background |
| health_bar_fill | 200x24 | Health fill (can be colored via tint) |
| health_bar_border | 204x28 | Border overlay |
| shield_pip_full | 24x14 | Active shield pip |
| shield_pip_empty | 24x14 | Empty shield pip |
| score_bg | 200x40 | Score display background |
| lives_bg | 150x40 | Lives display background |
| weapon_frame | 64x64 | Current weapon frame |
| powerup_bar_bg | 104x16 | Powerup timer background |
| button_normal | 160x48 | Menu button |
| button_hover | 160x48 | Button hover state |
| button_pressed | 160x48 | Button pressed state |

---

## 9. EFFECTS (Optional)

**File:** `effects/particles.png`
**Size:** 8x8 pixels each

| Effect | Frames | Description |
|--------|--------|-------------|
| hit_spark | 3 | White/yellow impact |
| blood_particle | 2 | Red (or paper for T rating) |
| dust_puff | 3 | Gray dust |
| money_particle | 2 | Green money bits |
| explosion | 6 | Orange/red explosion |
| muzzle_flash | 2 | Yellow gun flash |

---

## JSON Atlas Format

Each sprite sheet needs a corresponding JSON atlas file. Format:

```json
{
  "frames": {
    "idle_down_0": {
      "frame": { "x": 0, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 }
    },
    "idle_down_1": {
      "frame": { "x": 48, "y": 0, "w": 48, "h": 48 },
      "sourceSize": { "w": 48, "h": 48 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 48, "h": 48 }
    }
  },
  "meta": {
    "image": "player.png",
    "size": { "w": 480, "h": 144 },
    "scale": 1
  },
  "animations": {
    "idle_down": ["idle_down_0", "idle_down_1"],
    "walk_down": ["walk_down_0", "walk_down_1", "walk_down_2", "walk_down_3"]
  }
}
```

Tools like **TexturePacker**, **Aseprite**, or **ShoeBox** can generate these automatically.

---

## Summary Checklist

- [ ] Player sprite sheet (30 frames)
- [ ] Intern sprite sheet (19 frames)
- [ ] Bureaucrat sprite sheet (25 frames)
- [ ] IRS Agent sprite sheet (24 frames)
- [ ] Secret Service sprite sheet (23 frames)
- [ ] Lobbyist sprite sheet (24 frames)
- [ ] IRS Commissioner boss (25 frames)
- [ ] Senator boss x2 variants (17 frames each)
- [ ] Speaker boss (16 frames)
- [ ] Vice President boss (20 frames)
- [ ] President boss (26 frames)
- [ ] Projectiles sheet
- [ ] Pickups sheet
- [ ] IRS Building tileset
- [ ] Capitol tileset
- [ ] House Chamber tileset
- [ ] Senate Chamber tileset
- [ ] White House tileset
- [ ] Props sheet
- [ ] UI elements
- [ ] Particle effects (optional)

---

## Notes for Artist

1. **Consistent lighting** - Light source from top-left
2. **Outlines** - 1px dark outline on characters helps them pop
3. **Animation** - Even 2-frame idle adds life; 4-frame walks are smooth enough
4. **Color coding** - Enemies should read as "threats" (darker suits, etc.)
5. **Player visibility** - John Q. Public's red flannel should always stand out
6. **Scalability** - Sprites will be rendered at 1x, ensure readability

Good luck! Feel free to reach out with questions about specific sprites.
