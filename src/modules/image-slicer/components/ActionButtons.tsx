import React from 'react'

interface ActionButtonsProps {
    hasSprites: boolean
    onExport: () => void
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    hasSprites,
    onExport
}) => {
    if (!hasSprites) return null

    return (
        <div className="actions-section">
            <button onClick={onExport}>Export Sprite Sheet</button>
        </div>
    )
}
