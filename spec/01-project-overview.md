# Project Overview

## Odyssey Sprite Manager

A web-based tool for managing sprites for the Odyssey game.

### Key Objectives

- Provide a browser-based sprite management interface
- No backend server required - fully client-side operation
- Consistent UI/UX with the Odyssey Server Admin tool
- Enable local image file editing and manipulation

### Architecture Decisions

**Frontend Stack:**
- React 18.3.1
- TypeScript 5.9.3
- Vite 6.0.7 (build tool)
- PixiJS 8.14.3 (for sprite rendering and manipulation)
- SASS for styling

**Structure:**
- Follows the same modular architecture as the server admin UI
- Module-based navigation with Dashboard, TitleBar, and Breadcrumbs
- Context providers for shared state (TitleBarContext, NavigationContext)

**Data Storage:**
- Client-side only (no backend)
- Uses browser APIs (File API, Canvas API)
- Future: LocalStorage or IndexedDB for project state

### Modules

1. **Sprites** - Manage individual sprite graphics
2. **Animations** - Create and edit sprite animations
3. **Spritesheets** - Organize sprites into spritesheets

### Development

- Port: 5174 (Vite dev server)
- Node.js requirement: 22.12.0+ (for Vite 7.3.0 compatibility)
