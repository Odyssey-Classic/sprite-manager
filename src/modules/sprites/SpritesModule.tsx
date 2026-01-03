import React, { useEffect, useState } from 'react'
import { useTitleBar } from '../../contexts/TitleBarContext'
import { useNavigation } from '../../contexts/NavigationContext'
import ImageSlicer from './components/ImageSlicer'

export default function SpritesModule() {
    const { setTitle, setBreadcrumbs } = useTitleBar()
    const { navigateTo } = useNavigation()

    useEffect(() => {
        setTitle('Sprites')
        setBreadcrumbs([
            { label: 'Home', onClick: () => navigateTo('dashboard') },
            { label: 'Sprites' }
        ])
    }, [setTitle, setBreadcrumbs, navigateTo])

    return (
        <div className="module-container">
            <div className="module-header">
                <h1>Sprites</h1>
            </div>
            <div className="module-content">
                <ImageSlicer />
            </div>
        </div>
    )
}
