# Feature: Image Slicing

## User Story

As a user, I want to be able to open a PNG file and slice it into individual sprite tiles.

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

### Output Files
- Each sprite saved as individual PNG file
- Filename format: `sprite_{hash_prefix}.png` where hash_prefix is first 8 characters of SHA-256 hash
- Support downloading individual sprites
- Support bulk download of all sprites

## User Interface

### Controls
- "Select PNG File" button to open file picker
- Display selected filename
- "Download All" button (shown after slicing) to download all sprites

### Display
- Show all sliced sprites in a responsive grid
- Each sprite tile displays:
  - Visual preview at actual size (32×32)
  - Checkerboard background to show transparency
  - Hash value (first 8 chars visible, full hash on hover)
  - Original position coordinates (x, y)
  - Individual download button

### Visual Treatment
- Use `image-rendering: pixelated` to maintain pixel-perfect rendering
- Prevent image smoothing/interpolation

## Technical Implementation

- Use HTML5 Canvas API for image manipulation
- Use Web Crypto API for SHA-256 hashing
- Use FileReader API for loading images
- Use Canvas.toDataURL('image/png') for PNG24 output
- Download via dynamically created anchor elements
