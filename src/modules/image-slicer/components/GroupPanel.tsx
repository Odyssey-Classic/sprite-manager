import React, { useState } from 'react'
import { GroupItem } from './GroupItem'

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

interface GroupPanelProps {
    groups: Group[]
    sprites: Sprite[]
    selectedHashes: Set<string>
    onToggleSelection: (hash: string) => void
    onDragStart: (hash: string) => void
    onCreateGroup: (name: string) => void
    onDrop: (groupName: string) => void
    onAddSelected: (groupName: string) => void
    onRemoveSprite: (groupName: string, hash: string) => void
    onToggleCollapse: (groupName: string) => void
    onDeleteGroup: (groupName: string) => void
}

export const GroupPanel: React.FC<GroupPanelProps> = ({
    groups,
    sprites,
    selectedHashes,
    onToggleSelection,
    onDragStart,
    onCreateGroup,
    onDrop,
    onAddSelected,
    onRemoveSprite,
    onToggleCollapse,
    onDeleteGroup
}) => {
    const [newGroupName, setNewGroupName] = useState('')

    const handleCreateGroup = () => {
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName.trim())
            setNewGroupName('')
        }
    }

    return (
        <div className="groups-section">
            <h3>Groups ({groups.length})</h3>
            <div className="create-group">
                <input
                    type="text"
                    placeholder="New group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                />
                <button onClick={handleCreateGroup}>Create Group</button>
            </div>
            <div className="groups-list">
                {groups.map((group) => (
                    <GroupItem
                        key={group.name}
                        group={group}
                        sprites={sprites}
                        selectedHashes={selectedHashes}
                        onToggleSelection={onToggleSelection}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                        onAddSelected={onAddSelected}
                        onRemoveSprite={onRemoveSprite}
                        onToggleCollapse={onToggleCollapse}
                        onDeleteGroup={onDeleteGroup}
                    />
                ))}
            </div>
        </div>
    )
}
