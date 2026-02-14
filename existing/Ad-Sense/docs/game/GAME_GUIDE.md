# Ad "Where Is It" Game Implementation Guide

## Overview

The **Ad "Where Is It"** game is now fully implemented and playable! It's one of three difficulty levels with a full-screen search experience where players spot hidden symbols in a canvas of ad blocks.

---

## Game Mechanics

### How It Works

1. **Symbol Assignment**: Player is shown a target symbol (★, ●, ■, etc.) at the top
2. **Canvas Search**: Full-screen grid of 30-72 ad blocks depending on difficulty
3. **Symbol Hunt**: Player searches the blocks to find the matching symbol
4. **Block Click**: When found, player clicks the block to complete the level
5. **Scoring**: Credits earned from performance (time + accuracy, NOT ad clicks)

### Difficulty Levels

| Level | Time Limit | Block Count | Grid Size | Base Reward | Wrong Click Penalty |
|-------|-----------|-------------|-----------|------------|-------------------|
| **Easy** | 180 sec | 30 blocks | 6×5 | +30 credits | -2 credits/click |
| **Medium** | 120 sec | 48 blocks | 8×6 | +70 credits | -3 credits/click |
| **Hard** | 90 sec | 72 blocks | 9×8 | +120 credits | -5 credits/click |

### Reward Calculation

```javascript
// For successful symbol found:
timeBonus = max(0, timeLimit - timeUsed);
wrongClickPenalty = wrongClicks × penaltyPerClick;
creditsEarned = baseReward + floor(timeBonus / 4) - wrongClickPenalty;

// Example (Medium difficulty):
// Time used: 45 seconds (120 available)
// Wrong clicks: 3
// creditsEarned = 70 + floor(75 / 4) - (3 × 3)
// creditsEarned = 70 + 18 - 9 = 79 credits
```

### Fraud Detection

The game includes anti-cheating validation:

```javascript
// Suspicious if:
averageClickTime < 100ms  // Too fast (likely automated/bot)
wrongClicks > 50          // Too many wrong attempts

// If suspicious:
creditsEarned = 0
console.warn('Suspicious activity detected')
```

---

## UI/UX Structure

### Game Modal Layout

```
┌─ INSTRUCTIONS SCREEN ─────────────────────┐
│ 🔍 Ad "Where Is It"                       │
│ Find the target symbol in the ad canvas   │
│                                           │
│ [Instructions 1-4]                        │
│                                           │
│ ┌─ AD ZONE (Top) ─────────────────────┐  │
│ │ [Advertisement space]                │  │
│ └──────────────────────────────────────┘  │
│                                           │
│ Choose Difficulty:                        │
│ [Easy +30] [Medium +70] [Hard +120]      │
└───────────────────────────────────────────┘

┌─ PLAYING SCREEN ──────────────────────────┐
│ Find Symbol: ★  | Time: 120s | Wrong: 0  │
│                                           │
│ ┌─ FULL-SCREEN CANVAS ──────────────────┐ │
│ │  [📢 ★] [📢 ●] [📢 ■] ... [📢 ★]      │ │
│ │  [1]    [2]    [3]      [30]          │ │
│ │  (Blocks fill entire available space) │ │
│ │  (30/48/72 blocks based on difficulty)│ │
│ └──────────────────────────────────────┘  │
│                                           │
│ [Quit Game]                               │
└───────────────────────────────────────────┘

┌─ RESULTS SCREEN ──────────────────────────┐
│ 🎉 Found It!                              │
│                                           │
│ ┌─ AD ZONE (Top) ─────────────────────┐  │
│ │ [Advertisement space]                │  │
│ └──────────────────────────────────────┘  │
│                                           │
│ Time Taken: 45s | Wrong Clicks: 2        │
│ Credits Earned: +79                      │
│                                           │
│ Credits based on performance only         │
│                                           │
│ [Play Again] [Back to Games]              │
│                                           │
│ ┌─ AD ZONE (Bottom) ───────────────────┐ │
│ │ [Advertisement space]                │  │
│ └──────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### Ad Zone Placement (AdSense Compliance)

- **Top Ad Zone**: Above difficulty selector (instructions) / Above results (results screen)
- **Game Canvas**: PROTECTED - no ads overlay or interfere
- **Bottom Ad Zone**: Below results display

---

## Integrating Google AdSense

### Step 1: Access Ad Zones

Ad zones are identified by these HTML IDs and classes:

```html
<!-- Instructions Screen Top Ad Zone -->
<div class="game-ad-zone" id="whereis-ad-zone-top">
  <div class="ad-zone-label">Advertisement</div>
  <div class="ad-placeholder">
    <!-- REPLACE THIS SECTION WITH YOUR AD CODE -->
  </div>
</div>

<!-- Results Screen Top Ad Zone -->
<div class="game-ad-zone">
  <div class="ad-zone-label">Advertisement</div>
  <div class="ad-placeholder">
    <!-- REPLACE THIS SECTION WITH YOUR AD CODE -->
  </div>
</div>

<!-- Results Screen Bottom Ad Zone -->
<div class="game-ad-zone">
  <div class="ad-zone-label">Advertisement</div>
  <div class="ad-placeholder">
    <!-- REPLACE THIS SECTION WITH YOUR AD CODE -->
  </div>
</div>
```

### Step 2: Replace Placeholders with AdSense Code

From your `Google Adsense Snippets` file, use the provided ad codes:

```html
<!-- Example: Replace ad-placeholder div with this -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5409508349104075"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5409508349104075"
     data-ad-slot="2097155341"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Step 3: Update index.html

For each ad zone, replace:

```html
<!-- Before -->
<div class="ad-placeholder">
  <div class="ad-placeholder-img">AD</div>
  <span class="ad-placeholder-text">Your ad could appear here</span>
</div>

<!-- After -->
<!-- Paste your AdSense code here -->
<script async src="..."></script>
<ins class="adsbygoogle" ...></ins>
<script> (adsbygoogle = window.adsbygoogle || []).push({}); </script>
```

### Step 4: Test Ad Loading

1. Open browser
2. Navigate to Game page
3. Click "Ad Where Is It" button
4. Verify ads load in zones (no errors in console)
5. Play game and verify ads display correctly on results screen

---

## Game State & Data Flow

### Game State Object

```javascript
let whereIsItGameState = {
  isRunning: boolean,           // Currently playing
  symbols: string[],            // Available symbols ['★', '●', '■', ...]
  currentSymbol: string,        // Target symbol player must find
  blocks: Block[],              // Array of {id, symbol}
  correctBlockId: number,       // Which block contains the target
  wrongClicks: number,          // Count of incorrect block clicks
  startTime: timestamp,         // When game started
  gameTime: number,             // Seconds elapsed
  difficulty: 'easy'|'medium'|'hard',
  timerInterval: number,        // setInterval ID for timer
  suspiciousActivity: boolean,  // Fraud detection flag
};

Block object: { id: number, symbol: string }
```

### Configuration

```javascript
const whereIsItConfig = {
  easy: { 
    timeLimit: 180,    // 3 minutes
    blockCount: 30,    // 6×5 grid
    baseReward: 30,
    penalty: 2         // per wrong click
  },
  medium: { 
    timeLimit: 120,    // 2 minutes
    blockCount: 48,    // 8×6 grid
    baseReward: 70,
    penalty: 3
  },
  hard: { 
    timeLimit: 90,     // 1.5 minutes
    blockCount: 72,    // 9×8 grid
    baseReward: 120,
    penalty: 5
  }
};
```

---

## CSS Classes Reference

### Game Container

```css
.whereis-play-screen          /* Main game playing screen */
.whereis-header               /* Header with target symbol & stats */
.whereis-target               /* Target symbol display */
.whereis-target-symbol        /* ★ symbol with gradient background */
.whereis-canvas-container     /* Fullscreen canvas wrapper */
.whereis-canvas               /* Grid of ad blocks */
```

### Ad Blocks

```css
.whereis-ad-block             /* Individual block container */
.whereis-ad-block:hover       /* Hover state (scale + cyan border) */
.whereis-ad-block.correct     /* Correct block found (purple gradient) */
.whereis-ad-block.wrong       /* Incorrect click (red with shake animation) */
.whereis-ad-block-number      /* Block number label (bottom-right) */
.whereis-ad-block-content     /* Inner content (icon + symbol) */
.whereis-ad-img               /* Ad icon (📢) */
```

### Animations

```css
@keyframes pulse-correct      /* Pulse effect when correct block found */
@keyframes pulse-wrong        /* Shake effect for wrong clicks */
```

---

## JavaScript Functions

### Main Game Functions

| Function | Purpose |
|----------|---------|
| `initWhereIsItGame()` | Event listeners, modal management |
| `showWhereIsItScreen(screen)` | Switch between instructions/playing/results |
| `startWhereIsItGame()` | Initialize new game, generate blocks |
| `renderWhereIsItCanvas()` | Draw blocks grid, bind click handlers |
| `handleWhereIsItClick(blockId)` | Process block clicks (right/wrong) |
| `startWhereIsItTimer(timeLimit)` | Begin countdown timer |
| `stopWhereIsItTimer()` | Stop timer, cleanup interval |
| `endWhereIsItGame(found)` | Check fraud, calculate rewards, show results |
| `showWhereIsItResults(found, credits)` | Display final screen |

### Helper Functions

| Function | Purpose |
|----------|---------|
| `generateWhereIsItBlocks(count)` | Create random symbol blocks |
| Inherited from puzzle game | `getCurrentUser()`, `saveCurrentUser()`, `loadUserProfile()` |

---

## Testing Checklist

### Functionality
- [ ] Click "Ad Where Is It" button on Game page
- [ ] Instructions screen displays correctly
- [ ] Choose Easy difficulty
- [ ] Game starts with target symbol displayed
- [ ] Canvas fills with correct number of blocks (30)
- [ ] Click wrong blocks → wrong-click counter increments
- [ ] Click correct block → game ends with results
- [ ] Results show time taken, wrong clicks, credits earned
- [ ] Play Again → new game starts with different blocks
- [ ] Back to Games → returns to game selection

### Difficulty Testing
- [ ] Easy: 180 sec, 30 blocks (6×5), +30 base
- [ ] Medium: 120 sec, 48 blocks (8×6), +70 base
- [ ] Hard: 90 sec, 72 blocks (9×8), +120 base

### Scoring
- [ ] Fast completion (lots of time left) → bonus credits
- [ ] Wrong clicks reduce final credits
- [ ] Time running out without finding symbol → 0 credits

### AdSense Compliance
- [ ] Ad zones visible in all three screens
- [ ] Ads don't overlay game canvas
- [ ] "Advertisement" labels visible
- [ ] Game playable without clicking ads
- [ ] Rewards earned purely from game performance, not ad clicks

### Fraud Detection
- [ ] Impossible solve times detected (<100ms per click)
- [ ] Too many wrong clicks detected (>50)
- [ ] Suspicious activity → creditsEarned = 0
- [ ] Console logs warning with game stats

### Mobile Responsiveness
- [ ] Game playable on mobile devices
- [ ] Blocks responsive to screen size
- [ ] Timer and stats visible on small screens
- [ ] Touch clicks register correctly

### Profile Integration
- [ ] User credits increase after winning
- [ ] User level updates correctly
- [ ] Games played counter increments
- [ ] Profile data persists on page reload

---

## AdSense Compliance Statement

✅ **Compliant with Google AdSense Policies**

- **Performance-Based Rewards**: Credits earned from game time + accuracy only
- **No Ad Interaction Required**: Ads not clickable or interactive within game
- **Clear Separation**: Ads placed in dedicated zones, not overlaying gameplay
- **Transparent Messaging**: Users informed that "Credits earned from performance, not ad clicks"
- **Anti-Fraud Protection**: Invalid activity detected and prevented
- **No Misleading Content**: No false claims about income or earnings

---

## Troubleshooting

### Game won't start
- Check browser console for JavaScript errors
- Verify `whereis-game-modal` exists in HTML
- Confirm event listeners attached: check `initWhereIsItGame()` is called

### Blocks not rendering
- Check canvas element exists with ID `whereis-canvas`
- Verify CSS grid is applied correctly
- Inspect block count matches difficulty config

### Timer not working
- Verify `startWhereIsItTimer()` is called
- Check `whereIsItGameState.timerInterval` is set
- Look for conflicts with puzzle game timer

### Ads not displaying
- Verify Google AdSense client ID is correct in snippet
- Check script src URLs are valid and accessible
- Confirm ad slot IDs match your AdSense account
- Test in incognito window (ad blockers off)

### Credits not awarded
- Check `getCurrentUser()` returns valid user object
- Verify fraud detection thresholds not triggered
- Inspect console for fraud warnings
- Confirm `saveCurrentUser()` completes successfully

---

## Future Enhancements

Potential game improvements:
1. **Difficulty Variants**: Add symbol groups or color matching
2. **Leaderboards**: Track fastest times per difficulty
3. **Achievements**: Unlock badges for perfect games
4. **Daily Challenges**: Specific symbol/time combos each day
5. **Multiplayer**: Race mode with real-time comparison
6. **Custom Symbols**: Player-created symbol sets
7. **Difficulty Scaling**: AI adjusts based on player performance
8. **Ad-Themed Content**: Symbol sets matching advertiser brands

---

## File Structure

```
Ad-Sense/
├── index.html                    (Includes Where Is It modal)
├── css/style.css                (Includes .whereis-* styles)
├── js/app.js                     (Includes Where Is It game logic)
├── Google Adsense Snippets       (Your ad codes)
├── WHERE_IS_IT_GAME_GUIDE.md    (This file)
└── [other docs...]
```

---

## Support

For issues or questions:
1. Check browser console (F12 → Console tab)
2. Review this guide's troubleshooting section
3. Verify all files are loaded correctly
4. Check that users are logged in (required for score tracking)

---

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Status:** ✅ Production Ready
