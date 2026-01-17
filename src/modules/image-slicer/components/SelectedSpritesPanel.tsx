import React, { useState } from 'react'
import { SpriteCard } from './SpriteCard'

interface Sprite {
    hash: string
    dataUrl: string
    x: number
    y: number
}

interface SelectedSpritesPanelProps {
    selectedSprites: (Sprite | null)[][]
    onReorderSprites: (reorderedSprites: (Sprite | null)[][]) => void
    onRemoveSprite: (hash: string) => void
    onRemoveMultiple: (hashes: string[]) => void
}

interface DragPosition {
    rowIdx: number
    colIdx: number
}

export const SelectedSpritesPanel: React.FC<SelectedSpritesPanelProps> = ({
    selectedSprites,
    onReorderSprites,
    onRemoveSprite,
    onRemoveMultiple
}) => {
    const [draggedFrom, setDraggedFrom] = useState<DragPosition | null>(null)
    const [markedForRemoval, setMarkedForRemoval] = useState<Set<string>>(new Set())

    const toggleRemovalSelection = (hash: string) => {
        const newSelection = new Set(markedForRemoval)
        if (newSelection.has(hash)) {
            newSelection.delete(hash)
        } else {
            newSelection.add(hash)
        }
        setMarkedForRemoval(newSelection)
    }

    const handleRemoveSelected = () => {
        if (markedForRemoval.size === 0) return
        onRemoveMultiple(Array.from(markedForRemoval))
        setMarkedForRemoval(new Set())
    }

    const selectAllForRemoval = () => {
        const allHashes = new Set<string>()
        selectedSprites.flat().forEach(sprite => {
            if (sprite) allHashes.add(sprite.hash)
        })
        setMarkedForRemoval(allHashes)
    }

    const deselectAllForRemoval = () => {
        setMarkedForRemoval(new Set())
    }

    const handleDragStart = (rowIdx: number, colIdx: number) => {
        setDraggedFrom({ rowIdx, colIdx })
    }

    const handleDragOver = (e: React.DragEvent, targetRowIdx: number, targetColIdx: number) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetRowIdx: number, targetColIdx: number) => {
        e.preventDefault()

        if (!draggedFrom) return
        if (draggedFrom.rowIdx === targetRowIdx && draggedFrom.colIdx === targetColIdx) {
            setDraggedFrom(null)
            return
        }

        const newGrid = selectedSprites.map(row => [...row])

        // Extend target row if necessary to accommodate the target column
        while (newGrid[targetRowIdx].length <= targetColIdx) {
            newGrid[targetRowIdx].push(null)
        }

        // Check if target position is occupied
        const targetSprite = newGrid[targetRowIdx][targetColIdx]
        if (targetSprite !== null) {
            // Target position has a sprite - cancel the operation
            setDraggedFrom(null)
            return
        }

        // Target is empty (null) - proceed with move
        const draggedSprite = newGrid[draggedFrom.rowIdx][draggedFrom.colIdx]

        // Remove from old position
        newGrid[draggedFrom.rowIdx][draggedFrom.colIdx] = null

        // Insert at new position
        newGrid[targetRowIdx][targetColIdx] = draggedSprite

        // Clean up: remove trailing nulls from rows
        const cleanedGrid = newGrid.map(row => {
            // Find last non-null index
            let lastNonNull = -1
            for (let i = row.length - 1; i >= 0; i--) {
                if (row[i] !== null) {
                    lastNonNull = i
                    break
                }
            }
            return lastNonNull === -1 ? [] : row.slice(0, lastNonNull + 1)
        }).filter(row => row.length > 0)

        // Ensure at least one empty row if completely empty
        if (cleanedGrid.length === 0 || cleanedGrid.every(row => row.length === 0)) {
            cleanedGrid.push([])
        }

        onReorderSprites(cleanedGrid)
        setDraggedFrom(null)
    }

    const handleDragOverEndOfRow = (e: React.DragEvent, rowIdx: number) => {
        e.preventDefault()
    }

    const handleDropEndOfRow = (e: React.DragEvent, rowIdx: number) => {
        e.preventDefault()

        if (!draggedFrom) return

        const newGrid = selectedSprites.map(row => [...row])
        const draggedSprite = newGrid[draggedFrom.rowIdx][draggedFrom.colIdx]

        // Remove from old position
        newGrid[draggedFrom.rowIdx][draggedFrom.colIdx] = null

        // Add to end of target row
        const newColIdx = newGrid[rowIdx].length
        newGrid[rowIdx][newColIdx] = draggedSprite

        // Clean up
        const cleanedGrid = newGrid.map(row => {
            let lastNonNull = -1
            for (let i = row.length - 1; i >= 0; i--) {
                if (row[i] !== null) {
                    lastNonNull = i
                    break
                }
            }
            return lastNonNull === -1 ? [] : row.slice(0, lastNonNull + 1)
        }).filter(row => row.length > 0)

        if (cleanedGrid.length === 0) {
            cleanedGrid.push([])
        }

        onReorderSprites(cleanedGrid)
        setDraggedFrom(null)
    }

    const handleDragOverNewRow = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDropNewRow = (e: React.DragEvent) => {
        e.preventDefault()

        if (!draggedFrom) return

        const newGrid = selectedSprites.map(row => [...row])
        const draggedSprite = newGrid[draggedFrom.rowIdx][draggedFrom.colIdx]

        // Remove from old position
        newGrid[draggedFrom.rowIdx][draggedFrom.colIdx] = null

        // Create new row with the sprite
        newGrid.push([draggedSprite])

        // Clean up
        const cleanedGrid = newGrid.map(row => {
            let lastNonNull = -1
            for (let i = row.length - 1; i >= 0; i--) {
                if (row[i] !== null) {
                    lastNonNull = i
                    break
                }
            }
            return lastNonNull === -1 ? [] : row.slice(0, lastNonNull + 1)
        }).filter(row => row.length > 0)

        if (cleanedGrid.length === 0) {
            cleanedGrid.push([])
        }

        onReorderSprites(cleanedGrid)
        setDraggedFrom(null)
    }

    const handleDragEnd = () => {
        setDraggedFrom(null)
    }

    const spriteCount = selectedSprites.flat().filter(s => s !== null).length

    // Calculate max column width for padding rows
    const maxCols = Math.max(...selectedSprites.map(row => row.length), 0)

    return (
        <div className="selected-sprites-panel">
            <div className="section-header">
                <h3>Selected Sprites ({spriteCount})</h3>
                <div className="multi-select-controls">
                    <button onClick={selectAllForRemoval}>Select All</button>
                    <button onClick={deselectAllForRemoval}>Deselect All</button>
                </div>
            </div>
            <div className="sprite-grid-rows">
                {selectedSprites.length === 0 || spriteCount === 0 ? (
                    <div className="empty-state">
                        <p>No sprites selected</p>
                        <small>Click "Add to Selected" to move sprites here</small>
                    </div>
                ) : (
                    <>
                        {selectedSprites.map((row, rowIdx) => {
                            // Pad row to maxCols to create drop zones
                            const paddedRow = [...row]
                            while (paddedRow.length < maxCols) {
                                paddedRow.push(null)
                            }

                            return (
                                <div key={rowIdx} className="sprite-row">
                                    {paddedRow.map((sprite, colIdx) => (
                                        sprite ? (
                                            <div
                                                key={`${sprite.hash}-${rowIdx}-${colIdx}`}
                                                className="selected-sprite-wrapper"
                                                draggable
                                                onDragStart={() => handleDragStart(rowIdx, colIdx)}
                                                onDragOver={(e) => handleDragOver(e, rowIdx, colIdx)}
                                                onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SpriteCard
                                                    sprite={sprite}
                                                    isSelected={markedForRemoval.has(sprite.hash)}
                                                    onSelect={() => toggleRemovalSelection(sprite.hash)}
                                                    onDragStart={() => handleDragStart(rowIdx, colIdx)}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                key={`null-${rowIdx}-${colIdx}`}
                                                className="sprite-gap"
                                                onDragOver={(e) => handleDragOver(e, rowIdx, colIdx)}
                                                onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                                            />
                                        )
                                    ))}
                                    <div
                                        className="row-extend-zone"
                                        onDragOver={(e) => handleDragOverEndOfRow(e, rowIdx)}
                                        onDrop={(e) => handleDropEndOfRow(e, rowIdx)}
                                    />
                                </div>
                            )
                        })}
                        <div
                            className="new-row-zone"
                            onDragOver={handleDragOverNewRow}
                            onDrop={handleDropNewRow}
                        >
                            Drop here to create new row
                        </div>
                    </>
                )}
            </div>
            {markedForRemoval.size > 0 && (
                <div className="remove-selected-section">
                    <button
                        className="btn btn-secondary"
                        onClick={handleRemoveSelected}
                    >
                        Remove Selected ({markedForRemoval.size})
                    </button>
                </div>
            )}
        </div>
    )
}
