# Packed Sprite Sheet Export

## Overview
The application exports selected sprites as a packed sprite sheet - a single PNG image containing all selected sprites arranged in a user-defined grid layout, along with PixiJS-compatible JSON metadata describing the layout.

## Export Format

### ZIP Package Structure
```
spritesheet_filename.zip
├── spritesheet.png    # Packed sprite sheet image
├── spritesheet.json   # PixiJS-compatible spritesheet metadata
└── original.png       # Original source image (for reference)
```

### Sprite Sheet Layout

**Grid Organization:**
- Sprites are organized in rows and columns as arranged in the Selected Sprites panel
- Rows can have different lengths (uneven rows supported)
- Blank spaces within the grid are filled with transparent pixels
- Canvas dimensions = (longest_row × 32px) × (total_rows × 32px)
- Each sprite cell is 32×32 pixels

**Example Layouts:**

*Even Grid (3×3):*
```
[S] [S] [S]
[S] [S] [S]
[S] [S] [S]
```
→ 96px × 96px (9 sprites)

*Uneven Rows:*
```
[S] [S] [S] [S] [S]
[S] [S]
[S] [S] [S]
```
→ 160px × 96px (10 sprites, longest row = 5)

*With Gaps:*
```
[S] [S] [ ] [S]
[S] [ ] [S]
```
→ 128px × 64px (5 sprites, 2 gaps filled with transparency)

**Sprite Arrangement:**
- Sprites placed according to their row/column position in the organization grid
- Order is defined by row index and column index
- Empty grid cells are rendered as transparent pixels
- Transparent backgrounds of sprites preserved

### JSON Metadata (PixiJS Format)

The exported `spritesheet.json` follows the standard PixiJS spritesheet format for seamless integration with PixiJS applications.

**Structure:**
```json
{
  "frames": {
    "abc123def456789...": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "source": {
        "x": 64,
        "y": 32
      },
      "grid": {
        "row": 0,
        "col": 0
      }
    },
    "789ghi012jkl345...": {
      "frame": { "x": 32, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 },
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "source": {
        "x": 96,
        "y": 32
      },
      "grid": {
        "row": 0,
        "col": 1
      }
    }
  },
  "meta": {
    "app": "Odyssey Sprite Manager",
    "version": "1.0",
    "image": "spritesheet.png",
    "format": "RGBA8888",
    "size": { "w": 160, "h": 96 },
    "scale": 1
  }
}
```

**Field Descriptions:**

**frames (Object):**
- Key: Frame name (full SHA-256 hash of sprite)
- Value: Frame data object

**Frame Data:**
- `frame`: Position and size in the sprite sheet
  - `x`: X coordinate in sprite sheet (pixels)
  - `y`: Y coordinate in sprite sheet (pixels)
  - `w`: Width (always 32)
  - `h`: Height (always 32)
- `sourceSize`: Original sprite dimensions
  - `w`: Width (always 32)
  - `h`: Height (always 32)
- `spriteSourceSize`: Trimming information (unused, always full size)
  - `x`: X offset (always 0)
  - `y`: Y offset (always 0)
  - `w`: Width (always 32)
  - `h`: Height (always 32)
- `source`: Original position in source image (custom field)
  - `x`: X coordinate in original image
  - `y`: Y coordinate in original image
- `grid`: Grid position in organization (custom field)
  - `row`: Row index in user's grid layout
  - `col`: Column index in user's grid layout

**meta (Object):**
- `app`: Application name ("Odyssey Sprite Manager")
- `version`: Export format version ("1.0")
- `image`: Filename of sprite sheet image ("spritesheet.png")
- `format`: Pixel format ("RGBA8888")
- `size`: Total sprite sheet dimensions
  - `w`: Width in pixels
  - `h`: Height in pixels
- `scale`: Scale factor (always 1)

**Custom Fields:**
The `source` and `grid` fields are custom additions to the standard PixiJS format, providing additional reference information without breaking PixiJS compatibility.

## Usage Scenarios

### PixiJS Integration

**Loading the Spritesheet:**
```javascript
import { Assets } from 'pixi.js'

// Load the spritesheet
const spritesheet = await Assets.load('spritesheet.json')

// Access individual sprites by hash
const sprite1 = spritesheet.textures['abc123def456789...']
const sprite2 = spritesheet.textures['789ghi012jkl345...']

// Create sprite from texture
const gameSprite = new Sprite(sprite1)
```

**Advanced Usage with Custom Fields:**
```javascript
// Load spritesheet JSON directly for custom processing
const data = await fetch('spritesheet.json').then(r => r.json())

// Find sprite by original source position
const findBySourcePos = (x, y) => {
  return Object.entries(data.frames).find(([hash, frame]) => 
    frame.source.x === x && frame.source.y === y
  )
}

// Find sprites in a specific grid row
const getRow = (rowIdx) => {
  return Object.entries(data.frames)
    .filter(([hash, frame]) => frame.grid.row === rowIdx)
    .sort((a, b) => a[1].grid.col - b[1].grid.col)
}

// Load spritesheet normally in PixiJS
const spritesheet = await Assets.load('spritesheet.json')
```

### Game Engine Integration
The metadata enables runtime sprite lookup:

```javascript
// Load sprite sheet and metadata  
const sheet = await loadImage('spritesheet.png')
const metadata = await loadJSON('spritesheet.json')

// Find sprite by hash
const hash = 'abc123def456789...'
const frame = metadata.frames[hash]

// Draw sprite from sheet
ctx.drawImage(
    sheet,
    frame.frame.x, frame.frame.y,
    frame.frame.w, frame.frame.h,
    destX, destY,
    frame.frame.w, frame.frame.h
)
```

### Animation Sequences
Grid organization allows creating animation frames:

```javascript
// Get all sprites from a specific row (animation sequence)
const animFrames = Object.entries(metadata.frames)
    .filter(([name, frame]) => frame.grid.row === 0)
    .sort((a, b) => a[1].grid.col - b[1].grid.col)

// Animate by iterating through frame sequence
function animate(frames, fps) {
    const frameIndex = Math.floor(Date.now() / (1000 / fps)) % frames.length
    return frames[frameIndex][1] // Get frame data
}
```

### Texture Atlas
Use metadata for GPU texture atlas:

```javascript
// Generate UV coordinates for shaders
const uvs = Object.values(metadata.frames).map(frame => ({
    u0: frame.frame.x / metadata.meta.size.w,
    v0: frame.frame.y / metadata.meta.size.h,
    u1: (frame.frame.x + frame.frame.w) / metadata.meta.size.w,
    v1: (frame.frame.y + frame.frame.h) / metadata.meta.size.h
}))
```

## Export Implementation

### Process Flow

1. **Validate Selection**
   - Check that at least one sprite is selected
   - Display error if no sprites selected

2. **Calculate Grid Dimensions**
   ```typescript
   const cols = Math.ceil(Math.sqrt(selectedSprites.length))
   const rows = Math.ceil(selectedSprites.length / cols)
   const width = cols * 32
   const height = rows * 32
   ```

3. **Create Canvas**
   - Create HTMLCanvasElement with calculated dimensions
   - Get 2D rendering context

4. **Draw Sprites**
   - Iterate through selected sprites in order
   - Calculate grid position: `(index % cols, floor(index / cols))`
   - Load sprite image from data URL
   - Draw sprite at calculated position on canvas

5. **Build Metadata**
   - Create metadata object with grid dimensions
   - For each sprite, record:
     - Selection index
     - Hash value
     - Original position in source image
     - Position in packed sheet
     - Dimensions

6. **Generate Files**
   - Convert canvas to PNG blob
   - Serialize metadata to JSON
   - Convert original image to blob
   - Add all files to ZIP archive

7. **Download**
   - Generate ZIP blob
   - Create download link with descriptive filename
   - Trigger download
   - Clean up object URL

### Error Handling

**No Sprites Selected:**
```typescript
if (selectedSprites.length === 0) {
    alert('Please select at least one sprite to export')
    return
}
```

**Canvas Creation Failure:**
```typescript
if (!ctx) {
    alert('Failed to create canvas context')
    return
}
```

**Image Load Failure:**
```typescript
img.onerror = () => {
    console.error(`Failed to load sprite: ${sprite.hash}`)
    reject(new Error('Sprite load failed'))
}
```

## Benefits

1. **Reduced HTTP Requests**: Single image file vs. dozens of individual sprites
2. **GPU Efficiency**: Single texture binding vs. multiple texture switches
3. **Memory Efficiency**: One loaded image vs. many small images
4. **Bandwidth Savings**: Better compression in single PNG
5. **Runtime Flexibility**: Metadata enables dynamic sprite lookup
6. **Deduplication**: Hash-based sprite identification
7. **Animation Support**: Order preservation for frame sequences
8. **Source Tracing**: Original positions preserved for debugging

## Future Enhancements

Potential improvements to the export system:

1. **Custom Grid Layouts**: Allow manual grid dimensions
2. **Padding/Spacing**: Add optional gaps between sprites
3. **Multiple Sheets**: Auto-split large collections
4. **Format Options**: Support WebP, basis universal
5. **Compression Settings**: Configurable PNG compression
6. **Power-of-2 Dimensions**: Optional GPU-friendly sizing
7. **Atlas Preview**: Visual preview before export
8. **Batch Export**: Export multiple sheets at once
9. **Custom Metadata**: Add user-defined sprite properties
10. **CSS Sprite Sheet**: Generate CSS for web use
