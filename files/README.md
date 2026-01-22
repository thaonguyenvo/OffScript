# Off Script - Updated Version

## Changes Made

### 1. Typography - DM Mono Font
- **Added Google Fonts import** for DM Mono font family
- **Applied throughout the entire application** - all text now uses `"DM Mono", monospace`
- This includes: body text, headings, buttons, inputs, and all UI elements

### 2. Text Colors - Solid Highlighting
- **Removed opacity** from highlighted text backgrounds
- **Changed text colors** to contrast with solid backgrounds:
  - **Blue (#007aff)** → White text (#ffffff)
  - **Green (#34c759)** → White text (#ffffff)
  - **Yellow (#ffcc00)** → Dark text (#1a1a1a)
  - **Orange (#ff9500)** → White text (#ffffff)
  - **Red (#ff3b30)** → White text (#ffffff)

### 3. Shadows Removed
- **All box-shadow properties removed** from:
  - Buttons
  - Cards and containers
  - Input fields
  - Popup overlays
  - Stats boxes
  - Text display areas
  - Legend
  - Terrain container
  - Controls info

## File Structure

```
/
├── index.html          - Main landing page
├── results.html        - Analysis results page
├── css/
│   └── style.css      - Updated styles with DM Mono and no shadows
└── js/
    ├── analyze.js     - Text analysis logic
    ├── terrain.js     - 3D terrain generation
    └── controls.js    - Camera controls
```

## Implementation Notes

### Font Loading
The DM Mono font is loaded via Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" rel="stylesheet">
```

### Color Mapping
The solid color scheme maintains the same visual hierarchy:
- **Very Diverse** (Blue) = High linguistic complexity
- **Diverse** (Green) = Good variety
- **Neutral** (Yellow) = Balanced
- **Flat** (Orange) = Repetitive patterns
- **Very Flat** (Red) = AI-like patterns

### Dark Mode
The dark mode functionality remains intact, with the font and color changes applied to both themes.

## Usage

Simply open `index.html` in a web browser to use the updated Off Script application with:
- Clean, monospace DM Mono typography
- High-contrast solid color highlighting
- Minimalist design without shadows
