# Technical Decisions

## Dependency Versions

**Decision Date:** 2026-01-02

### Core Dependencies (Latest Stable Versions)
- `@vitejs/plugin-react`: ^5.1.2
- `pixi.js`: ^8.14.3
- `react`: ^19.2.3
- `react-dom`: ^19.2.3

### Dev Dependencies
- `@types/react`: ^19.2.7
- `@types/react-dom`: ^19.2.3
- `sass`: ^1.97.1
- `typescript`: ^5.9.3
- `vite`: ^7.3.0

**Rationale:** Using latest versions ensures access to newest features and security patches.

**Note:** Vite 7.3.0 requires Node.js 20.19+ or 22.12+

## Code Structure

**Decision:** Mirror the structure of the server admin UI (`ui` folder)

**Structure:**
```
src/
├── components/          # Shared UI components
│   ├── TitleBar.tsx
│   ├── Breadcrumbs.tsx
│   └── Dashboard.tsx
├── contexts/           # React context providers
│   ├── TitleBarContext.tsx
│   └── NavigationContext.tsx
├── modules/            # Feature modules
│   ├── sprites/
│   ├── animations/
│   └── spritesheets/
└── api/               # API utilities (future)
```

**Rationale:** Consistent structure with server admin UI makes it easier for developers to work across both projects.

## Image Processing

**Decision:** Use Canvas API instead of PixiJS for slicing

**Rationale:** 
- Canvas API is sufficient for basic image slicing
- Simpler, more direct approach
- PixiJS reserved for more complex rendering/animation features

## File Handling

**Decision:** Client-side only, no server uploads

**Approach:**
- Use File API with `<input type="file">`
- Process files entirely in browser
- Use download links for output

**Rationale:**
- Tool works offline
- No server infrastructure needed
- No privacy concerns with uploading game assets
- Faster iteration for users

## Hash Algorithm

**Decision:** SHA-256 for sprite content hashing

**Rationale:**
- Built into Web Crypto API (no dependencies)
- Sufficient collision resistance for sprite assets
- Industry standard, well-understood
- Fast enough for real-time use

## Output Format

**Decision:** PNG24 (PNG with alpha)

**Approach:** Use Canvas `toDataURL('image/png')`

**Rationale:**
- Preserves transparency
- Lossless compression
- Native browser support
- Standard format for game assets
