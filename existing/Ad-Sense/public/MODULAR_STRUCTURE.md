# 📦 Project Modularization Guide

This document describes the new modular structure that replaces the monolithic `app.js` and `style.css` files. The refactoring improves code maintainability, understanding, and scalability.

## 🎯 Overview

The project has been split into **modular, focused files**:
- **JavaScript**: 9 specialized modules instead of 1 large file (1009 lines)
- **CSS**: 7 organized stylesheets instead of 1 massive file (2012 lines)

---

## 📂 JavaScript Architecture

All JavaScript files are located in `/public/js/` and loaded in order in `index.html`.

### Module Structure

```
public/js/
├── utils.js              # Shared utilities and helpers
├── auth.js               # User authentication & account management
├── ui-profile.js         # Profile display & user profile data
├── ui-navigation.js      # Page routing & mobile menu
├── ui-advertising.js     # Ad toggle settings
├── ui-faq.js            # FAQ accordion functionality
├── game-puzzle.js        # 15-tile puzzle game (complete)
├── game-whereis.js       # Where-Is-It symbol search game (complete)
└── core.js              # Application initialization & orchestration
```

### Module Details

#### **utils.js** (Shared Utilities)
Provides reusable helpers and utilities:
- **Storage**: localStorage wrapper with JSON support
- **Accounts**: User account management (get/save current user)
- **Validators**: Email, username, password validation
- **DOM**: DOM manipulation utilities (show/hide/toggle/set classes)
- **Utils**: Avatar letters, time formatting, level calculation
- **ErrorUI**: Error message display helpers

**Use**: `window.AdSense.Storage`, `window.AdSense.Validators`, etc.

#### **auth.js** (Authentication System)
Handles user registration, login, and logout:
- Sign up form handling with validation
- Login with email/username
- Account lookup and verification
- Form state management

**Exports**: `window.AdSense.Auth.init()` - call during app initialization

#### **ui-profile.js** (Profile UI)
Manages user profile display and updates:
- Load and display current user profile
- Update credits when games are won
- Update games played count
- Toggle between guest and logged-in states

**Exports**: 
- `window.AdSense.Profile.init()`
- `window.AdSense.Profile.load()`
- `window.AdSense.Profile.updateCredits(amount)`
- `window.AdSense.Profile.updateGamesPlayed()`

#### **ui-navigation.js** (Page Navigation)
Controls page routing and navigation:
- Hash-based page navigation (#home, #game, #activities, #how-it-works)
- Active link highlighting
- Mobile menu toggle
- Smooth scrolling to top

**Exports**: `window.AdSense.Navigation.init()` - call during app initialization

#### **ui-advertising.js** (Ad Control)
Manages ad visibility toggle:
- Save user ad visibility preference to localStorage
- Toggle `.ads-hidden` class on body
- Default: ads visible

**Exports**: `window.AdSense.Advertising.init()` - call during app initialization

#### **ui-faq.js** (FAQ Accordion)
Handles FAQ expand/collapse:
- Click to toggle FAQ items
- Smooth max-height animations
- Auto-close other items when opening one

**Exports**: `window.AdSense.FAQ.init()` - call during app initialization

#### **game-puzzle.js** (Puzzle Game - 15 Tile)
Complete puzzle game implementation:
- **State Management**: Game state (tiles, moves, difficulty, timer)
- **Game Logic**: Tile movement, win detection, shuffle algorithm
- **Scoring**: Performance-based credits (time bonus - move penalty)
- **Anti-Fraud**: Suspicious activity detection
- **Timing**: Configurable time limits per difficulty

**Difficulty Levels**:
- Easy: 120s, 25 credits base
- Medium: 90s, 50 credits base  
- Hard: 60s, 100 credits base

**Key Functions**:
- `init()` - Initialize game UI
- `startNewGame()` - Start a new puzzle game
- `endGame(won)` - Calculate score and display results

#### **game-whereis.js** (Where-Is-It Game)
Symbol search game implementation:
- **Target**: Find a specific symbol among many blocks
- **Blocks**: 30-72 blocks depending on difficulty
- **Input**: Enter block number to find the symbol
- **Scoring**: Base reward + time bonus - wrong click penalty
- **Anti-Fraud**: Suspicious activity detection

**Difficulty Levels**:
- Easy: 180s, 30 blocks, 30 credits base, 2 credits/wrong click
- Medium: 120s, 48 blocks, 70 credits base, 3 credits/wrong click
- Hard: 90s, 72 blocks, 120 credits base, 5 credits/wrong click

#### **core.js** (Application Initialization)
Main orchestration point:
- Initializes all modules in correct order  
- Waits for DOM ready
- Single entry point for the application

**Key Function**: `initializeApp()` - initializes all modules

---

## 🎨 CSS Architecture

All stylesheets are located in `/public/css/` and loaded in order in `index.html`.

### Style File Organization

```
public/css/
├── base.css             # Variables, fonts, reset, global styles
├── layout.css           # Main layout, navbar, hero, container
├── components.css       # Buttons, cards, forms, generic UI
├── ui-profile.css       # Profile popover and avatar styles
├── pages-content.css    # Home, games, activities, how-it-works pages
├── games.css           # Game modals, puzzle, where-is-it styles
└── responsive.css      # Mobile breakpoints & responsive rules
```

### File Details

#### **base.css** (~120 lines)
Foundation styles:
- **@import** Google Fonts (Inter)
- **CSS Variables** - Colors, spacing, shadows, transitions
- **Reset** - Margin, padding, box-sizing
- **Global** - Body font, background, smooth scrolling
- **Background Effects** - Ambient gradient glow
- **Utility Classes** - Gradient backgrounds, gradient text
- **Keyframe Animations** - fadeIn, slideUp, pulse effects

#### **layout.css** (~200 lines)
Core layout structure:
- **Main Content** - Page container, transition animations
- **Container** - Max-width wrapper, responsive padding
- **Navbar** - Fixed positioning, brand, navigation links, active states
- **Mobile Menu** - Toggle button (hidden on desktop)
- **Hero Section** - Banner, badge, headings, call-to-action buttons
- **Footer** - Copyright, links

#### **components.css** (~300 lines)
Reusable UI components:
- **Buttons** - Primary, outline, small, block variations
- **Cards** - Feature cards with hover effects
- **Stats Cards** - Statistics display
- **Ad Banners** - Dismissible ads (respects ads-hidden class)
- **Forms** - Input fields, labels, error messages
- **Toggle Switch** - Custom checkbox-based toggle
- **Error Display** - Form error styling

#### **ui-profile.css** (~100 lines)
Profile-specific styling:
- **Profile Button** - Circular button with hover effects
- **Profile Popover** - Dropdown with smooth animations
- **Avatars** - User and guest avatar styling
- **Stats Display** - Credits, level, games played
- **Credentials** - User name, label styling

#### **pages-content.css** (~400 lines)
Content for different pages:
- **Features Section** - Feature grid with cards
- **Stats Bar** - Statistics display (4-column grid)
- **Games Page** - Game card grid, badges, difficulty indicators
- **Activities Page** - Activity cards with icons and metadata
- **How It Works** - Step timeline with numbered steps
- **FAQ Section** - Collapsible FAQ items
- **Compliance Notes** - Legal/compliance messaging

#### **games.css** (~500 lines)
Game-related styling:
- **Auth Modal** - Sign up/login modal overlay
- **Game Modal** - Full-screen game container
- **Instructions Screen** - Difficulty selection, instructions
- **Play Screen** - Game stats header, gameplay area  
- **Results Screen** - Win/lose display, stats, action buttons
- **Ad Zones** - Game-compliant ad placement areas
- **Puzzle Game Styles** - Tile rendering, positions, animations
- **Where-Is-It Styles** - Block grid, input, target symbol, animations

#### **responsive.css** (~80 lines)
Breakpoints for mobile/tablet:
- **768px breakpoint** - Tablet/medium screens
  - Navbar becomes hamburger menu
  - Single-column grids
  - Reduced padding
- **480px breakpoint** - Mobile phones
  - Full-width buttons
  - Vertical button stacks
  - Small grid items

---

## 🔄 Loading Order (index.html)

JavaScript loads in this order (dependencies from top to bottom):

```html
<script src="js/utils.js"></script>        <!-- 1. Core utilities first -->
<script src="js/ui-navigation.js"></script> <!-- 2. UI modules (no dependencies) -->
<script src="js/ui-advertising.js"></script>
<script src="js/ui-profile.js"></script>
<script src="js/ui-faq.js"></script>
<script src="js/auth.js"></script>         <!-- 3. Auth (uses utils, profile) -->
<script src="js/game-puzzle.js"></script>  <!-- 4. Games (use utils, profile) -->
<script src="js/game-whereis.js"></script>
<script src="js/core.js"></script>         <!-- 5. Initialize everything -->
```

CSS loads in order (dependencies from broad to specific):

```html
<link rel="stylesheet" href="css/base.css" />          <!-- Foundation -->
<link rel="stylesheet" href="css/layout.css" />        <!-- Main layout -->
<link rel="stylesheet" href="css/components.css" />    <!-- Generic components -->
<link rel="stylesheet" href="css/ui-profile.css" />    <!-- Feature-specific -->
<link rel="stylesheet" href="css/pages-content.css" /> <!-- Page layouts -->
<link rel="stylesheet" href="css/games.css" />         <!-- Game styles -->
<link rel="stylesheet" href="css/responsive.css" />    <!-- Responsive overrides last -->
```

---

## 🛠 Adding New Features

### Adding a new JavaScript module:

1. **Create file** in `/public/js/` (e.g., `feature-new.js`)
2. **Use established pattern**:
   ```javascript
   (function (window) {
     'use strict';
     
     const { existing, utilities } = window.AdSense;
     
     function init() { /* initialization */ }
     
     window.AdSense = window.AdSense || {};
     window.AdSense.NewFeature = { init };
   })(window);
   ```
3. **Add to core.js**: `window.AdSense.NewFeature.init();`
4. **Import in index.html**: Add `<script src="js/feature-new.js"></script>` before `core.js`

### Adding styles for a new feature:

1. **Evaluate size**: If >50 lines, create separate file (e.g., `feature-new.css`)
2. **Choose appropriate existing file** if small:
   - Component UI → `components.css`
   - Page content → `pages-content.css`
   - Game-related → `games.css`
3. **Import in index.html** in logical position (before `responsive.css`)

---

## 📊 Size Comparison

### Before Modularization
- `app.js`: 1,009 lines (single file)
- `style.css`: 2,012 lines (single file)
- **Total**: 3,021 lines

### After Modularization
- **JavaScript**: 9 focused files (900-400 lines each, total ~1,100)
- **CSS**: 7 focused files (80-500 lines each, total ~2,100)
- **Total**: ~3,200 lines, but much more organized

**Benefits**:
- ✅ Each file handles one concern
- ✅ Easier to find and modify specific features
- ✅ Reduced cognitive load when reading code
- ✅ Clear dependencies between modules
- ✅ Easier to add new features
- ✅ Better for team collaboration

---

## 🚀 Development Workflow

When developing a feature:

1. **Find the relevant module** based on functionality
2. **Understand its current state** by reading the entire file
3. **Make changes** to that module only
4. **Test** in browser (all CSS loads automatically)
5. **Check for side effects** (use browser dev tools)

When debugging:

1. **JavaScript**: Search for function name in specific module
2. **CSS**: Search for class name in logical stylesheet
3. **Use browser DevTools**: Inspect elements to see which file defines a style
4. **Check console**: See which module initialized successfully

---

## 📝 Notes

- **No webpack/bundling**: This is vanilla JS/CSS, no build step needed
- **Global namespace**: All modules attach to `window.AdSense` namespace
- **IIFE Pattern**: Each module uses Immediately Invoked Function Expression for scope
- **Responsive last**: `responsive.css` loaded last to ensure it overrides base styles

---

**Last Updated**: February 14, 2026  
**Version**: 2.0 (Modularized)
