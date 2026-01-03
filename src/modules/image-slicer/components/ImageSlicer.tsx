import React, { useState, useRef, useMemo } from 'react'
import JSZip from 'jszip'

interface SlicedSprite {
    hash: string
    dataUrl: string
    x: number
    y: number
}

interface SpriteGroup {
    id: string
    name: string
    sprites: SlicedSprite[]
}

async function hashImageData(imageData: ImageData): Promise<string> {
    // Convert image data to string for hashing
    const data = new Uint8Array(imageData.data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sliceImage(file: File): Promise<SlicedSprite[]> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = (e) => {
            img.onload = async () => {
                const tileSize = 32
                const sprites: SlicedSprite[] = []

                const cols = Math.floor(img.width / tileSize)
                const rows = Math.floor(img.height / tileSize)

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const canvas = document.createElement('canvas')
                        canvas.width = tileSize
                        canvas.height = tileSize
                        const ctx = canvas.getContext('2d')!

                        // Draw the slice
                        ctx.drawImage(
                            img,
                            col * tileSize, row * tileSize, tileSize, tileSize,
                            0, 0, tileSize, tileSize
                        )

                        // Get image data for hashing
                        const imageData = ctx.getImageData(0, 0, tileSize, tileSize)
                        const hash = await hashImageData(imageData)

                        // Convert to PNG24 (PNG with alpha)
                        const dataUrl = canvas.toDataURL('image/png')

                        sprites.push({
                            hash,
                            dataUrl,
                            x: col * tileSize,
                            y: row * tileSize
                        })
                    }
                }

                resolve(sprites)
            }

            img.onerror = reject
            img.src = e.target?.result as string
        }

        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export default function ImageSlicer() {
    const [sprites, setSprites] = useState<SlicedSprite[]>([])
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState<string>('')
    const [originalImage, setOriginalImage] = useState<string>('')
    const [groups, setGroups] = useState<SpriteGroup[]>([])
    const [newGroupName, setNewGroupName] = useState('')
    const [selectedSprites, setSelectedSprites] = useState<Set<string>>(new Set())
    const [draggedSprite, setDraggedSprite] = useState<SlicedSprite | null>(null)
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        setSprites([])

        try {
            // Store original image as data URL
            const reader = new FileReader()
            reader.onload = (e) => {
                setOriginalImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)

            const slicedSprites = await sliceImage(file)

            // Remove duplicates based on hash, keeping the first occurrence
            const uniqueSprites = slicedSprites.reduce((acc, sprite) => {
                if (!acc.some(s => s.hash === sprite.hash)) {
                    acc.push(sprite)
                }
                return acc
            }, [] as SlicedSprite[])

            setSprites(uniqueSprites)
        } catch (error) {
            console.error('Error slicing image:', error)
            alert('Failed to slice image. Please ensure it is a valid PNG file.')
        } finally {
            setLoading(false)
        }
    }

    const downloadSprite = (sprite: SlicedSprite, index: number) => {
        const link = document.createElement('a')
        link.download = `sprite_${sprite.hash.substring(0, 8)}.png`
        link.href = sprite.dataUrl
        link.click()
    }

    const downloadAll = () => {
        sprites.forEach((sprite, index) => {
            setTimeout(() => {
                downloadSprite(sprite, index)
            }, index * 100) // Stagger downloads slightly
        })
    }

    const downloadZip = async () => {
        const zip = new JSZip()

        // Helper function to convert data URL to blob
        const dataURLtoBlob = (dataUrl: string): Blob => {
            const arr = dataUrl.split(',')
            const mime = arr[0].match(/:(.*?);/)![1]
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], { type: mime })
        }

        // Add original image
        if (originalImage) {
            const blob = dataURLtoBlob(originalImage)
            zip.file('original.png', blob)
        }

        // Add ungrouped sprites to root
        ungroupedSprites.forEach(sprite => {
            const blob = dataURLtoBlob(sprite.dataUrl)
            zip.file(`${sprite.hash}.png`, blob)
        })

        // Add grouped sprites in subfolders
        groups.forEach(group => {
            const folder = zip.folder(group.name)
            if (folder) {
                group.sprites.forEach(sprite => {
                    const blob = dataURLtoBlob(sprite.dataUrl)
                    folder.file(`${sprite.hash}.png`, blob)
                })
            }
        })

        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `sprites_${fileName.replace('.png', '')}.zip`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const createGroup = () => {
        if (!newGroupName.trim()) return

        const newGroup: SpriteGroup = {
            id: Date.now().toString(),
            name: newGroupName.trim(),
            sprites: []
        }

        setGroups([...groups, newGroup])
        setNewGroupName('')
    }

    const toggleSpriteSelection = (hash: string) => {
        const newSelection = new Set(selectedSprites)
        if (newSelection.has(hash)) {
            newSelection.delete(hash)
        } else {
            newSelection.add(hash)
        }
        setSelectedSprites(newSelection)
    }

    const selectAll = () => {
        setSelectedSprites(new Set(ungroupedSprites.map(s => s.hash)))
    }

    const deselectAll = () => {
        setSelectedSprites(new Set())
    }

    const addSelectedToGroup = (groupId: string) => {
        if (selectedSprites.size === 0) return

        const spritesToAdd = sprites.filter(s => selectedSprites.has(s.hash))

        // Add sprites to group
        setGroups(groups.map(group =>
            group.id === groupId
                ? { ...group, sprites: [...group.sprites, ...spritesToAdd] }
                : group
        ))

        // Remove sprites from ungrouped list
        setSprites(sprites.filter(s => !selectedSprites.has(s.hash)))

        // Clear selection
        setSelectedSprites(new Set())
    }

    const handleDragStart = (sprite: SlicedSprite) => {
        // If dragging a selected sprite, drag all selected
        // Otherwise just drag the one sprite
        if (selectedSprites.has(sprite.hash)) {
            setDraggedSprite(sprite) // Use as a marker that we're dragging selection
        } else {
            setDraggedSprite(sprite)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDropOnGroup = (groupId: string) => {
        if (!draggedSprite) return

        // If the dragged sprite is in selection, add all selected sprites
        if (selectedSprites.has(draggedSprite.hash) && selectedSprites.size > 0) {
            addSelectedToGroup(groupId)
        } else {
            // Add single sprite to group
            setGroups(groups.map(group =>
                group.id === groupId
                    ? { ...group, sprites: [...group.sprites, draggedSprite] }
                    : group
            ))

            // Remove sprite from ungrouped list
            setSprites(sprites.filter(s => s.hash !== draggedSprite.hash))
        }

        setDraggedSprite(null)
    }

    const removeSpriteFromGroup = (groupId: string, sprite: SlicedSprite) => {
        // Remove from group
        setGroups(groups.map(group =>
            group.id === groupId
                ? { ...group, sprites: group.sprites.filter(s => s.hash !== sprite.hash) }
                : group
        ))

        // Add back to ungrouped list
        setSprites([...sprites, sprite])
    }

    const deleteGroup = (groupId: string) => {
        const group = groups.find(g => g.id === groupId)
        if (!group) return

        // Return all sprites from group to ungrouped list
        setSprites([...sprites, ...group.sprites])

        // Remove group
        setGroups(groups.filter(g => g.id !== groupId))

        // Remove from collapsed set if it was collapsed
        const newCollapsed = new Set(collapsedGroups)
        newCollapsed.delete(groupId)
        setCollapsedGroups(newCollapsed)
    }

    const toggleGroupCollapse = (groupId: string) => {
        const newCollapsed = new Set(collapsedGroups)
        if (newCollapsed.has(groupId)) {
            newCollapsed.delete(groupId)
        } else {
            newCollapsed.add(groupId)
        }
        setCollapsedGroups(newCollapsed)
    }

    const ungroupedSprites = useMemo(() => {
        const groupedHashes = new Set(
            groups.flatMap(g => g.sprites.map(s => s.hash))
        )
        return sprites
            .filter(s => !groupedHashes.has(s.hash))
            .sort((a, b) => {
                // Sort by Y position first (top to bottom), then X position (left to right)
                if (a.y !== b.y) {
                    return a.y - b.y
                }
                return a.x - b.x
            })
    }, [sprites, groups])

    return (
        <div className="image-slicer">
            <div className="slicer-controls">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Select PNG File
                </button>
                {fileName && <span className="file-name">Selected: {fileName}</span>}
                {sprites.length > 0 && (
                    <>
                        <button
                            className="btn btn-success"
                            onClick={downloadZip}
                        >
                            📦 Download ZIP
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={downloadAll}
                        >
                            Download All ({sprites.length} sprites)
                        </button>
                    </>
                )}
            </div>

            {loading && (
                <div className="loading-message">
                    Slicing image into 32x32 sprites...
                </div>
            )}

            {sprites.length > 0 && (
                <div className="grouping-section-two-column">
                    <div className="left-panel">
                        <div className="sprite-results">
                            <div className="results-header">
                                <h3>Sliced Sprites ({ungroupedSprites.length} ungrouped, {sprites.length} total)</h3>
                                {ungroupedSprites.length > 0 && (
                                    <div className="selection-controls">
                                        {selectedSprites.size > 0 && (
                                            <span className="selection-count">
                                                {selectedSprites.size} selected
                                            </span>
                                        )}
                                        <button
                                            className="btn-small"
                                            onClick={selectAll}
                                        >
                                            Select All
                                        </button>
                                        {selectedSprites.size > 0 && (
                                            <button
                                                className="btn-small"
                                                onClick={deselectAll}
                                            >
                                                Deselect All
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="sprite-grid">
                                {ungroupedSprites.map((sprite, index) => (
                                    <div
                                        key={sprite.hash}
                                        className={`sprite-item draggable ${selectedSprites.has(sprite.hash) ? 'selected' : ''}`}
                                        draggable
                                        onDragStart={() => handleDragStart(sprite)}
                                        onClick={() => toggleSpriteSelection(sprite.hash)}
                                    >
                                        <img src={sprite.dataUrl} alt={`Sprite ${index}`} />
                                        {/* <div className="sprite-info">
                                            <div className="sprite-hash" title={sprite.hash}>
                                                {sprite.hash.substring(0, 8)}...
                                            </div>
                                            <div className="sprite-position">
                                                ({sprite.x}, {sprite.y})
                                            </div>
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-panel">
                        <div className="group-controls">
                            <h3>Create Group</h3>
                            <div className="create-group-form">
                                <input
                                    type="text"
                                    placeholder="Group name..."
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                                    className="group-name-input"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={createGroup}
                                    disabled={!newGroupName.trim()}
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>

                        {groups.length > 0 && (
                            <div className="sprite-groups">
                                <h3>Groups ({groups.length})</h3>
                                {groups.map(group => {
                                    const isCollapsed = collapsedGroups.has(group.id)
                                    return (
                                        <div
                                            key={group.id}
                                            className="sprite-group"
                                            onDragOver={handleDragOver}
                                            onDrop={() => handleDropOnGroup(group.id)}
                                        >
                                            <div className="group-header">
                                                <div className="group-header-left">
                                                    <button
                                                        className="btn-collapse"
                                                        onClick={() => toggleGroupCollapse(group.id)}
                                                        title={isCollapsed ? 'Expand group' : 'Collapse group'}
                                                    >
                                                        {isCollapsed ? '▶' : '▼'}
                                                    </button>
                                                    <h4>{group.name}</h4>
                                                </div>
                                                <div className="group-actions">
                                                    {selectedSprites.size > 0 && (
                                                        <button
                                                            className="btn btn-primary btn-small"
                                                            onClick={() => addSelectedToGroup(group.id)}
                                                            title={`Add ${selectedSprites.size} selected sprite${selectedSprites.size !== 1 ? 's' : ''}`}
                                                        >
                                                            Add Selected ({selectedSprites.size})
                                                        </button>
                                                    )}
                                                    <span className="group-count">
                                                        {group.sprites.length} sprite{group.sprites.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => deleteGroup(group.id)}
                                                        title="Delete group"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                            {!isCollapsed && (
                                                <div className="sprite-grid">
                                                    {group.sprites.length === 0 ? (
                                                        <div className="drop-zone-empty">
                                                            Drag sprites here
                                                        </div>
                                                    ) : (
                                                        group.sprites.map((sprite, index) => (
                                                            <div key={sprite.hash} className="sprite-item">
                                                                <img src={sprite.dataUrl} alt={`Sprite ${index}`} />
                                                                <div className="sprite-info">
                                                                    <div className="sprite-hash" title={sprite.hash}>
                                                                        {sprite.hash.substring(0, 8)}...
                                                                    </div>
                                                                    <button
                                                                        className="btn-remove"
                                                                        onClick={() => removeSpriteFromGroup(group.id, sprite)}
                                                                        title="Remove from group"
                                                                    >
                                                                        ↩
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
