# Component Architecture

## Overview
The ImageSlicer module has been refactored from a single monolithic component into a composable architecture with smaller, focused components. This improves code maintainability, reusability, and testability.

## Component Breakdown

### Main Container: ImageSlicer
**Path:** `/src/modules/image-slicer/components/ImageSlicer.tsx`

**Responsibilities:**
- State management (sprites, groups, selections, loading)
- Business logic (slicing, hashing, grouping)
- Data transformations and coordination between sub-components

**State:**
- `sprites`: Array of all sliced sprites
- `groups`: Array of sprite groups with metadata
- `selectedSprites`: Set of selected sprite hashes
- `draggedSprite`: Currently dragged sprite reference
- `collapsedGroups`: Set of collapsed group IDs
- `loading`: Loading state during image processing
- `fileName`: Name of uploaded file
- `originalImage`: Data URL of original image

### Sub-Components

#### 1. FileUpload
**Path:** `/src/modules/image-slicer/components/FileUpload.tsx`

**Purpose:** Handles file selection UI

**Props:**
- `onFileSelect`: Callback when file is selected
- `hasFile`: Boolean indicating if a file has been loaded

**Features:**
- Hidden file input with custom button
- Accepts only PNG files
- Changes label text based on file state

#### 2. SpriteCard
**Path:** `/src/modules/image-slicer/components/SpriteCard.tsx`

**Purpose:** Displays a single sprite with interaction capabilities

**Props:**
- `sprite`: Sprite data (hash, dataUrl, x, y)
- `isSelected`: Selection state
- `onSelect`: Selection toggle handler
- `onDragStart`: Drag start handler
- `onDownload`: Download handler

**Features:**
- Visual selection indicator
- Draggable
- Shows sprite position and hash preview
- Individual download button
- Click to select/deselect

#### 3. SpriteGrid
**Path:** `/src/modules/image-slicer/components/SpriteGrid.tsx`

**Purpose:** Displays a grid of sprites with multi-select controls

**Props:**
- `title`: Section title with count
- `sprites`: Array of sprites to display
- `selectedHashes`: Set of selected sprite hashes
- `onToggleSelection`: Toggle selection handler
- `onSelectAll`: Select all handler
- `onDeselectAll`: Deselect all handler
- `onDragStart`: Drag start handler
- `onDownload`: Download handler
- `showMultiSelectControls`: Show/hide multi-select buttons

**Features:**
- Responsive grid layout
- Select All / Deselect All buttons
- Delegates rendering to SpriteCard components
- Displays total sprite count in header

#### 4. GroupItem
**Path:** `/src/modules/image-slicer/components/GroupItem.tsx`

**Purpose:** Displays a single group with its sprites

**Props:**
- `group`: Group data (name, sprites, collapsed state)
- `sprites`: All available sprites (for lookups)
- `selectedHashes`: Set of selected sprite hashes
- `onToggleSelection`: Selection toggle handler
- `onDragStart`: Drag start handler
- `onDownload`: Download handler
- `onDrop`: Drop handler
- `onAddSelected`: Add selected sprites handler
- `onRemoveSprite`: Remove sprite from group handler
- `onToggleCollapse`: Collapse/expand handler
- `onDeleteGroup`: Delete group handler

**Features:**
- Collapsible groups with expand/collapse toggle
- Drop zone for drag-and-drop
- "Add Selected" button (shows count)
- Individual sprite removal buttons
- Delete group button
- Shows sprite count in header

#### 5. GroupPanel
**Path:** `/src/modules/image-slicer/components/GroupPanel.tsx`

**Purpose:** Manages the groups section with create group functionality

**Props:**
- `groups`: Array of all groups
- `sprites`: All available sprites
- `selectedHashes`: Set of selected sprite hashes
- (Plus all handlers passed through to GroupItem)

**Features:**
- Group creation input with validation
- Enter key support for creation
- Displays list of all groups
- Manages local state for new group name input
- Delegates group rendering to GroupItem components

#### 6. ActionButtons
**Path:** `/src/modules/image-slicer/components/ActionButtons.tsx`

**Purpose:** Displays download action buttons

**Props:**
- `hasSprites`: Boolean indicating if sprites exist
- `onDownloadAll`: Download all individually handler
- `onDownloadZip`: Download as ZIP handler

**Features:**
- Conditionally renders based on sprite existence
- Two download modes: individual files or ZIP archive
- Clear action labels

## Data Flow

```
ImageSlicer (state & logic)
├── FileUpload → triggers file processing
├── ActionButtons → triggers download operations
├── SpriteGrid (left panel)
│   └── SpriteCard[] → individual sprite interactions
└── GroupPanel (right panel)
    ├── Create group form
    └── GroupItem[]
        └── SpriteCard[] → sprites within groups
```

## Benefits of Refactoring

1. **Separation of Concerns:** Each component has a single, clear responsibility
2. **Reusability:** SpriteCard can be used in both ungrouped and grouped contexts
3. **Testability:** Smaller components are easier to unit test
4. **Maintainability:** Changes to UI or behavior are localized
5. **Readability:** Main component focuses on logic, not rendering details
6. **Composability:** Components can be combined in different ways

## Type Safety

All components use TypeScript with explicit prop interfaces, ensuring:
- Compile-time type checking
- Better IDE autocomplete
- Self-documenting APIs
- Reduced runtime errors

## State Management Pattern

- **State ownership:** All state lives in ImageSlicer
- **Props drilling:** State and handlers passed down as props
- **Unidirectional flow:** Data flows down, events flow up
- **Immutable updates:** All state updates use immutable patterns

## Future Improvements

Potential enhancements to the architecture:

1. **Context API:** Reduce props drilling for deeply nested state
2. **Custom Hooks:** Extract common logic (e.g., `useSprites`, `useGroups`)
3. **Component Library:** Extract generic components (Button, Input) for reuse
4. **State Management Library:** Consider Redux/Zustand for complex state
5. **Memoization:** Add React.memo to prevent unnecessary re-renders
