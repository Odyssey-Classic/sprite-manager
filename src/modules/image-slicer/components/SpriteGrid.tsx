import React from 'react'
import { SpriteCard } from './SpriteCard'

interface Sprite {
    hash: string
    dataUrl: string
    x: number
    y: number
}

interface SpriteGridProps {
    title: string
    sprites: Sprite[]
    selectedHashes: Set<string>
    onToggleSelection: (hash: string) => void
    onSelectAll: () => void
    onDeselectAll: () => void
    onDragStart: (hash: string) => void
    showMultiSelectControls?: boolean
}

export const SpriteGrid: React.FC<SpriteGridProps> = ({
    title,
    sprites,
    selectedHashes,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    onDragStart,
    showMultiSelectControls = true
}) => {
    return (
        <div className="sprite-section">
            <div className="section-header">
                <h3>{title} ({sprites.length})</h3>
                {showMultiSelectControls && sprites.length > 0 && (
                    <div className="multi-select-controls">
                        <button onClick={onSelectAll}>Select All</button>
                        <button onClick={onDeselectAll}>Deselect All</button>
                    </div>
                )}
            </div>
            <div className="sprite-grid">
                {sprites.map((sprite) => (
                    <SpriteCard
                        key={sprite.hash}
                        sprite={sprite}
                        isSelected={selectedHashes.has(sprite.hash)}
                        onSelect={onToggleSelection}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    )
}
