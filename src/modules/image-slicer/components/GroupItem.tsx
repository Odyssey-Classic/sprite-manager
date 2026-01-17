import React from 'react'
import { SpriteCard } from './SpriteCard'

interface Sprite {
    hash: string
    dataUrl: string
    x: number
    y: number
}

interface Group {
    name: string
    sprites: string[]
    collapsed: boolean
}

interface GroupItemProps {
    group: Group
    sprites: Sprite[]
    selectedHashes: Set<string>
    onToggleSelection: (hash: string) => void
    onDragStart: (hash: string) => void
    onDrop: (groupName: string) => void
    onAddSelected: (groupName: string) => void
    onRemoveSprite: (groupName: string, hash: string) => void
    onToggleCollapse: (groupName: string) => void
    onDeleteGroup: (groupName: string) => void
}

export const GroupItem: React.FC<GroupItemProps> = ({
    group,
    sprites,
    selectedHashes,
    onToggleSelection,
    onDragStart,
    onDrop,
    onAddSelected,
    onRemoveSprite,
    onToggleCollapse,
    onDeleteGroup
}) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        onDrop(group.name)
    }

    const groupSprites = sprites.filter(s => group.sprites.includes(s.hash))
    const hasSelectedSprites = selectedHashes.size > 0

    return (
        <div
            className="sprite-group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="group-header">
                <h4 onClick={() => onToggleCollapse(group.name)}>
                    {group.collapsed ? '▶' : '▼'} {group.name} ({group.sprites.length})
                </h4>
                <div className="group-actions">
                    {hasSelectedSprites && (
                        <button onClick={() => onAddSelected(group.name)}>
                            Add Selected
                        </button>
                    )}
                    <button
                        className="delete-group-btn"
                        onClick={() => onDeleteGroup(group.name)}
                    >
                        Delete Group
                    </button>
                </div>
            </div>
            {!group.collapsed && (
                <div className="sprite-grid">
                    {groupSprites.map((sprite) => (
                        <div key={sprite.hash} className="group-sprite-wrapper">
                            <SpriteCard
                                sprite={sprite}
                                isSelected={selectedHashes.has(sprite.hash)}
                                onSelect={onToggleSelection}
                                onDragStart={onDragStart}
                            />
                            <button
                                className="remove-from-group-btn"
                                onClick={() => onRemoveSprite(group.name, sprite.hash)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
