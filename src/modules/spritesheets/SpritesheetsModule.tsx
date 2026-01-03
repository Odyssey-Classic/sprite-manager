import React, { useEffect } from 'react'
import { useTitleBar } from '../../contexts/TitleBarContext'
import { useNavigation } from '../../contexts/NavigationContext'

export default function SpritesheetsModule() {
    const { setTitle, setBreadcrumbs } = useTitleBar()
    const { navigateTo } = useNavigation()

    useEffect(() => {
        setTitle('Spritesheets')
        setBreadcrumbs([
            { label: 'Home', onClick: () => navigateTo('dashboard') },
            { label: 'Spritesheets' }
        ])
    }, [setTitle, setBreadcrumbs, navigateTo])

    return (
        <div className="module-container">
            <div className="module-header">
                <h1>Spritesheets</h1>
            </div>
            <div className="module-content">
                <p>Spritesheet management interface coming soon...</p>
            </div>
        </div>
    )
}
