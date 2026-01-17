import React, { useState, useMemo } from 'react'
import JSZip from 'jszip'
import { FileUpload } from './FileUpload'
import { SpriteGrid } from './SpriteGrid'
import { SelectedSpritesPanel } from './SelectedSpritesPanel'
import { ActionButtons } from './ActionButtons'

interface SlicedSprite {
    hash: string
    dataUrl: string
    x: number
    y: number
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
                        const ctx = canvas.getContext('2d')

                        if (!ctx) continue

                        // Draw the slice
                        ctx.drawImage(
                            img,
                            col * tileSize, row * tileSize, tileSize, tileSize,
                            0, 0, tileSize, tileSize
                        )

                        // Get image data and convert black pixels to transparent
                        const imageData = ctx.getImageData(0, 0, tileSize, tileSize)
                        const data = imageData.data

                        // Convert black (#000000) pixels to fully transparent
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i]
                            const g = data[i + 1]
                            const b = data[i + 2]

                            // If pixel is black, make it transparent
                            if (r === 0 && g === 0 && b === 0) {
                                data[i + 3] = 0 // Set alpha to 0
                            }
                        }

                        // Put the modified image data back
                        ctx.putImageData(imageData, 0, 0)

                        // Hash the processed image
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
    const [allSprites, setAllSprites] = useState<SlicedSprite[]>([])
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState<string>('')
    const [originalImage, setOriginalImage] = useState<string>('')
    const [selectedSprites, setSelectedSprites] = useState<(SlicedSprite | null)[][]>([[]])
    const [tempSelection, setTempSelection] = useState<Set<string>>(new Set())

    const handleFileSelect = async (file: File) => {
        setFileName(file.name)
        setLoading(true)
        setAllSprites([])

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

            setAllSprites(uniqueSprites)
            setSelectedSprites([[]])
            setTempSelection(new Set())
        } catch (error) {
            console.error('Error slicing image:', error)
            alert('Failed to slice image. Please ensure it is a valid PNG file.')
        } finally {
            setLoading(false)
        }
    }

    const exportSpriteSheet = async () => {
        // Count actual sprites (non-null entries)
        const spriteCount = selectedSprites.flat().filter(s => s !== null).length
        if (spriteCount === 0) {
            alert('Please select at least one sprite to export')
            return
        }

        const zip = new JSZip()
        const tileSize = 32

        // Calculate dimensions based on grid
        const rows = selectedSprites.length
        const cols = Math.max(...selectedSprites.map(row => row.length))

        const canvas = document.createElement('canvas')
        canvas.width = cols * tileSize
        canvas.height = rows * tileSize
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            alert('Failed to create canvas context')
            return
        }

        // Fill with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // PixiJS spritesheet format
        const frames: Record<string, any> = {}

        // Draw sprites onto packed sheet and build metadata
        let spriteIndex = 0
        for (let rowIdx = 0; rowIdx < selectedSprites.length; rowIdx++) {
            const row = selectedSprites[rowIdx]
            for (let colIdx = 0; colIdx < row.length; colIdx++) {
                const sprite = row[colIdx]
                if (!sprite) continue // Skip null entries

                const x = colIdx * tileSize
                const y = rowIdx * tileSize

                // Load sprite image and draw it
                const img = new Image()
                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = reject
                    img.src = sprite.dataUrl
                })

                ctx.drawImage(img, x, y)

                // Add frame in PixiJS format
                // Use full hash as frame name
                frames[sprite.hash] = {
                    frame: { x, y, w: tileSize, h: tileSize },
                    sourceSize: { w: tileSize, h: tileSize },
                    spriteSourceSize: { x: 0, y: 0, w: tileSize, h: tileSize },
                    // Include original position for reference
                    source: {
                        x: sprite.x,
                        y: sprite.y
                    },
                    // Include grid position for reference
                    grid: {
                        row: rowIdx,
                        col: colIdx
                    }
                }
                spriteIndex++
            }
        }

        // Create PixiJS spritesheet JSON
        const pixiJSON = {
            frames,
            meta: {
                app: "Odyssey Sprite Manager",
                version: "1.0",
                image: "spritesheet.png",
                format: "RGBA8888",
                size: { w: canvas.width, h: canvas.height },
                scale: 1
            }
        }

        // Convert canvas to blob
        const spriteSheetBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png')
        })

        // Add files to ZIP
        zip.file('spritesheet.png', spriteSheetBlob)
        zip.file('spritesheet.json', JSON.stringify(pixiJSON, null, 2))

        if (originalImage) {
            const arr = originalImage.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || ''
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            const blob = new Blob([u8arr], { type: mime })
            zip.file('original.png', blob)
        }

        // Generate and download
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `spritesheet_${fileName.replace('.png', '')}.zip`
        link.click()
        URL.revokeObjectURL(link.href)
    }

    const toggleTempSelection = (hash: string) => {
        const newSelection = new Set(tempSelection)
        if (newSelection.has(hash)) {
            newSelection.delete(hash)
        } else {
            newSelection.add(hash)
        }
        setTempSelection(newSelection)
    }

    const selectAll = () => {
        setTempSelection(new Set(unselectedSprites.map(s => s.hash)))
    }

    const deselectAll = () => {
        setTempSelection(new Set())
    }

    const addToSelected = () => {
        if (tempSelection.size === 0) return

        const spritesToAdd = allSprites.filter(s => tempSelection.has(s.hash))

        const newGrid = [...selectedSprites]

        // Calculate the maximum row width (widest existing row)
        const maxRowWidth = Math.max(
            ...newGrid.map(row => row.length),
            0 // Default to 0 if no rows exist
        )

        // If grid is empty, start with a reasonable max width
        const targetRowWidth = maxRowWidth > 0 ? maxRowWidth : 10

        // Split sprites into new rows, respecting the max width
        const spritesRemaining = [...spritesToAdd]
        while (spritesRemaining.length > 0) {
            const rowSprites = spritesRemaining.splice(0, targetRowWidth)
            newGrid.push(rowSprites)
        }

        setSelectedSprites(newGrid)

        // Clear temp selection
        setTempSelection(new Set())
    }

    const removeFromSelected = (hash: string) => {
        const newGrid = selectedSprites.map(row =>
            row.filter(s => s === null || s.hash !== hash)
        ).filter(row => row.length > 0) // Remove empty rows

        // Ensure at least one empty row exists
        if (newGrid.length === 0) {
            newGrid.push([])
        }
        setSelectedSprites(newGrid)
    }

    const removeMultipleFromSelected = (hashes: string[]) => {
        const hashSet = new Set(hashes)
        const newGrid = selectedSprites.map(row =>
            row.filter(s => s === null || !hashSet.has(s.hash))
        ).filter(row => row.length > 0) // Remove empty rows

        // Ensure at least one empty row exists
        if (newGrid.length === 0) {
            newGrid.push([])
        }
        setSelectedSprites(newGrid)
    }

    const reorderSelectedSprites = (newGrid: (SlicedSprite | null)[][]) => {
        setSelectedSprites(newGrid)
    }

    const handleDragStart = (hash: string) => {
        // Not used for unselected sprites anymore
    }

    // Calculate unselected sprites
    const unselectedSprites = useMemo(() => {
        const selectedHashes = new Set(
            selectedSprites.flat().filter(s => s !== null).map(s => s!.hash)
        )
        return allSprites
            .filter(s => !selectedHashes.has(s.hash))
            .sort((a, b) => {
                // Sort by Y position first (top to bottom), then X position (left to right)
                if (a.y !== b.y) {
                    return a.y - b.y
                }
                return a.x - b.x
            })
    }, [allSprites, selectedSprites])

    const hasSelectedSprites = useMemo(() => {
        return selectedSprites.flat().some(s => s !== null)
    }, [selectedSprites])

    return (
        <div className="image-slicer">
            {loading && (
                <div className="loading-message">
                    Slicing image into 32x32 sprites...
                </div>
            )}

            {allSprites.length === 0 ? (
                <div className="file-upload-container">
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        hasFile={!!fileName}
                    />
                </div>
            ) : (
                <div className="grouping-section-two-column">
                    <div className="left-panel">
                        <SpriteGrid
                            title={`Unselected Sprites`}
                            sprites={unselectedSprites}
                            selectedHashes={tempSelection}
                            onToggleSelection={toggleTempSelection}
                            onSelectAll={selectAll}
                            onDeselectAll={deselectAll}
                            onDragStart={handleDragStart}
                        />
                        {tempSelection.size > 0 && (
                            <div className="add-selected-section">
                                <button
                                    className="btn btn-primary"
                                    onClick={addToSelected}
                                >
                                    Add to Selected ({tempSelection.size})
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="right-panel">
                        <SelectedSpritesPanel
                            selectedSprites={selectedSprites}
                            onReorderSprites={reorderSelectedSprites}
                            onRemoveSprite={removeFromSelected}
                            onRemoveMultiple={removeMultipleFromSelected}
                        />
                        {hasSelectedSprites && (
                            <div className="export-section">
                                <ActionButtons
                                    hasSprites={hasSelectedSprites}
                                    onExport={exportSpriteSheet}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
