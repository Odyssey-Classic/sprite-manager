# Feature: Image Slicing

## User Story

As a user, I want to be able to open a PNG file and slice it into individual sprite tiles, then export selected sprites as a packed sprite sheet with metadata.

## Requirements

### Input
- Accept PNG image files via file picker
- Support any PNG dimensions

### Processing
- Slice the input image into 32×32 pixel tiles
- Process tiles from left-to-right, top-to-bottom
- Only process complete 32×32 tiles (ignore partial tiles at edges)

### Hashing
- Generate a content-based hash for each sprite tile
- Hash algorithm: SHA-256
- Hash is computed from the raw pixel data (RGBA values)
- Purpose: Identify unique sprites and detect duplicates

### Output Format
- Format: PNG24 (PNG with alpha channel)
- Encoding: Standard PNG with full alpha transparency support
- Each sprite tile remains 32×32 pixels

### Export
- Export selected sprites as a packed sprite sheet (single PNG image)
- Include JSON metadata with sprite positions and information
- Package as ZIP file containing:
  - `spritesheet.png` - Packed sprite sheet with selected sprites
  - `metadata.json` - JSON file with sprite layout and references
  - `original.png` - Original source image for reference

## User Interface

### Controls
- "Select PNG File" button to open file picker
- Display selected filename
- "Export Sprite Sheet" button (shown when sprites are selected)

### Display
- Show all sliced sprites in a responsive grid
- Each sprite tile displays:
  - Visual preview at actual size (32×32)
  - Checkerboard background to show transparency
  - Hash value (first 8 chars visible)
  - Original position coordinates (x, y)

### Selection & Ordering
- Select sprites to include in export
- Reorder selected sprites by dragging
- Order is preserved in the packed sprite sheet

### Visual Treatment
- Use `image-rendering: pixelated` to maintain pixel-perfect rendering
- Prevent image smoothing/interpolation

## Technical Implementation

- Use HTML5 Canvas API for image manipulation
- Use Web Crypto API for SHA-256 hashing
- Use FileReader API for loading images
- Use Canvas.toDataURL('image/png') for PNG24 output
- Download via dynamically created anchor elements
