import React from 'react'

interface SpriteCardProps {
    sprite: {
        hash: string
        dataUrl: string
        x: number
        y: number
    }
    isSelected: boolean
    onSelect: (hash: string) => void
    onDragStart: (hash: string) => void
}

export const SpriteCard: React.FC<SpriteCardProps> = ({
    sprite,
    isSelected,
    onSelect,
    onDragStart
}) => {
    return (
        <div
            className={`sprite-item ${isSelected ? 'selected' : ''}`}
            draggable
            onDragStart={() => onDragStart(sprite.hash)}
            onClick={() => onSelect(sprite.hash)}
        >
            <img src={sprite.dataUrl} alt={`Sprite ${sprite.hash.substring(0, 8)}`} />
        </div>
    )
}
