# Selection and Ordering Feature

## Overview
The application has been refactored from a grouping-based system to a selection and grid organization system. Users can select sprites and arrange them in custom row/column layouts for export.

## Core Concept

### Two-Panel Layout

**Left Panel: Unselected Sprites**
- Displays all sliced sprites that haven't been selected for output
- Supports multi-select via clicking individual sprites
- Provides "Select All" and "Deselect All" buttons
- Shows "Add to Selected" button when sprites are selected
- Sprites remain sorted by their original position (Y, then X)

**Right Panel: Selected Sprites Grid**
- Displays sprites organized in rows and columns
- Supports uneven row lengths (not restricted to rectangles)
- Drag-and-drop to reorder within grid
- Drag to end of row to extend it
- Drag to special zone to create new row
- Each sprite has a remove button (✕) to unselect it
- Grid layout is preserved during export

## User Workflow

1. **Load Image**: User selects a PNG file for slicing
2. **Review Sprites**: All sliced 32x32 sprites appear in the left panel
3. **Select Sprites**: User clicks sprites to mark them (multi-select supported)
4. **Add to Selected**: Click "Add to Selected" button to move sprites to right panel (adds to first row)
5. **Organize Grid**: Drag sprites between rows and columns to create desired layout
6. **Extend Rows**: Drag sprite to the extend zone at the end of a row
7. **Create New Rows**: Drag sprite to the "Drop here to create new row" zone
8. **Remove**: Click ✕ button to remove sprites from selection
9. **Export**: Export as packed sprite sheet with custom grid layout

## State Management

### Primary State Variables

```typescript
// All sliced sprites from the original image
allSprites: SlicedSprite[]

// 2D grid of selected sprites (rows × columns)
// null represents empty grid cells (gaps)
selectedSprites: (SlicedSprite | null)[][]

// Temporary selection in left panel (for multi-select)
tempSelection: Set<string>
```

### Computed Values

```typescript
// Unselected sprites (memoized)
unselectedSprites = allSprites.filter(not in selectedSprites.flat())
                               .sort(by Y, then X)

// Has any selected sprites
hasSelectedSprites = selectedSprites.flat().some(s => s !== null)
```

## Key Features

### Multi-Select in Left Panel
- Click individual sprites to toggle selection
- Selected sprites show visual highlight
- "Select All" selects all unselected sprites
- "Deselect All" clears temporary selection
- Selection count shown in "Add to Selected" button

### Grid Organization in Right Panel
**Visual Layout:**
- Sprites arranged in horizontal rows
- Rows can have different lengths (uneven supported)
- Gaps (null cells) shown as dashed boxes
- Extend zones at end of each row for adding sprites
- "Create new row" zone at bottom

**Drag Behaviors:**
1. **Drag onto sprite**: Replaces that sprite (swaps positions)
2. **Drag onto gap**: Fills the gap with dragged sprite
3. **Drag to extend zone**: Adds sprite to end of that row
4. **Drag to new row zone**: Creates new row with that sprite

**Grid Cleanup:**
- Trailing nulls automatically removed from rows
- Empty rows automatically removed
- Always maintains at least one row (can be empty)

### Export with Grid Preservation

**Packed Sprite Sheet Export**
- Creates PNG sized to longest row × total rows
- Canvas dimensions = (max_row_length × 32px) × (row_count × 32px)
- Each sprite maintains 32×32 pixel dimensions
- Gaps filled with transparent pixels
- Grid layout exactly matches visual organization

**JSON Metadata**
```json
{
  "tileSize": 32,
  "width": 160,
  "height": 96,
  "cols": 5,
  "rows": 3,
  "sprites": [
    {
      "index": 0,
      "hash": "abc123...",
      "sourceX": 64,
      "sourceY": 32,
      "sheetX": 0,
      "sheetY": 0,
      "width": 32,
      "height": 32,
      "gridRow": 0,
      "gridCol": 0
    }
  ]
}
```

**Important:** Only actual sprites included in JSON (gaps omitted)

**ZIP Package**
- `spritesheet.png` - Packed sprite sheet with grid layout
- `metadata.json` - Sprite positions including grid coordinates
- `original.png` - Original source image

## Component Architecture

### SelectedSpritesPanel
**Purpose:** Right panel displaying selected sprites in grid layout with organization controls

**Props:**
- `selectedSprites`: 2D array of sprites (rows × columns, nulls for gaps)
- `onReorderSprites`: Callback when grid is reorganized
- `onRemoveSprite`: Callback to remove sprite from selection

**Features:**
- Row-based display with flex layout
- Sprite cells draggable between positions
- Gap cells (dashed boxes) as drop targets
- Row extend zones for adding to end of row
- "Create new row" zone at bottom
- Remove button on each sprite (visible on hover)
- Empty state message when no sprites selected

**Drag Logic:**
1. Track `draggedFrom: { rowIdx, colIdx }` on drag start
2. **Drag over sprite/gap:** Move sprite to that position, original becomes null
3. **Drag over extend zone:** Add sprite to end of that row
4. **Drag over new row zone:** Create new row with sprite
5. Clean up trailing nulls and empty rows after each move
6. Reset drag state on drag end

### ImageSlicer (Updated)
**State Changes:**
- Renamed `sprites` → `allSprites` (all sliced sprites)
- Changed `selectedSprites` from `SlicedSprite[]` → `(SlicedSprite | null)[][]`
- Added `tempSelection: Set<string>` for left panel multi-select
- Removed all group-related state

**New Methods:**
- `toggleTempSelection(hash)`: Toggle sprite in left panel selection
- `addToSelected()`: Add temp-selected sprites to first row
- `removeFromSelected(hash)`: Remove sprite from grid, clean up empty rows
- `reorderSelectedSprites(newGrid)`: Update entire grid layout

**Export Method:**
- `exportSpriteSheet()`: Creates packed PNG based on grid dimensions
  - Width = longest row × 32px
  - Height = total rows × 32px
  - Fills gaps with transparent pixels
  - JSON includes only actual sprites with gridRow/gridCol

### SpriteGrid (Unchanged)
- Used for left panel unselected sprites
- Multi-select controls remain functional
- No changes needed to component

## Export Behavior

### Download All Individually
- Iterates through `selectedSprites` array in order
- Downloads each as `{hash}.png`
- Staggers downloads by 100ms to prevent browser blocking

### Download as ZIP
```typescript
ZIP Structure:
├── original.png           // Original source image
├── 1_{hash}.png          // First selected sprite
├── 2_{hash}.png          // Second selected sprite
├── 3_{hash}.png          // Third selected sprite
└── ...
```

**Numbering Strategy:**
- Uses 1-based index: `${index + 1}_${hash}.png`
- Ensures files sort correctly in file explorers
- Hash included for uniqueness and reference

## Benefits of New Approach

1. **Simpler Mental Model**: Two states (unselected/selected) vs. multiple groups
2. **Direct Ordering**: Visual drag-and-drop vs. managing multiple groups
3. **Clear Export Intent**: Only selected sprites are exported
4. **Better Performance**: Single array vs. multiple group arrays
5. **Cleaner State**: Fewer state variables and computed values
6. **Predictable Output**: Order is always visible and explicit

## Migration from Grouping System

### What Changed
- **Removed**: Groups, group names, group collapse state
- **Removed**: Drag-to-group functionality
- **Changed**: Selection from Set to ordered array
- **Added**: Drag-to-reorder in selected panel
- **Added**: Temporary selection for unselected panel

### What Stayed the Same
- File upload and slicing logic
- SHA-256 hashing and deduplication
- Black-to-transparent conversion
- Multi-select in sprite grid
- Individual sprite download
- ZIP export structure (modified for ordering)

## Future Enhancements

Potential improvements to the selection/ordering system:

1. **Keyboard Shortcuts**: Arrow keys to reorder, Delete to remove
2. **Batch Reordering**: Move multiple sprites at once
3. **Order Presets**: Save and load sprite orders
4. **Visual Preview**: Show how sprites will look assembled
5. **Undo/Redo**: Revert selection and ordering changes
6. **Search/Filter**: Find sprites by hash or position
7. **Auto-Arrange**: Sort selected sprites by various criteria
