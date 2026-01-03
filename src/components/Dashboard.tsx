import React, { useEffect } from 'react'
import { useTitleBar } from '../contexts/TitleBarContext'

export type ModuleType = 'dashboard' | 'sprites' | 'animations' | 'spritesheets'

interface ModuleTileProps {
    title: string
    description: string
    icon: string
    onClick: () => void
}

function ModuleTile({ title, description, icon, onClick }: ModuleTileProps) {
    return (
        <div className="module-tile" onClick={onClick}>
            <div className="module-tile-icon">{icon}</div>
            <h2 className="module-tile-title">{title}</h2>
            <p className="module-tile-description">{description}</p>
        </div>
    )
}

interface DashboardProps {
    onNavigate: (module: ModuleType) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
    const { setTitle, setMenuItems, setBreadcrumbs } = useTitleBar()

    useEffect(() => {
        setTitle('Sprite Manager')
        setMenuItems([])
        setBreadcrumbs([
            { label: 'Home' }
        ])
    }, [setTitle, setMenuItems, setBreadcrumbs])

    const modules = [
        {
            id: 'sprites' as ModuleType,
            title: 'Sprites',
            description: 'Manage individual sprite graphics',
            icon: '🎨'
        },
        {
            id: 'spritesheets' as ModuleType,
            title: 'Spritesheets',
            description: 'Organize sprites into spritesheets',
            icon: '🗂️'
        }
    ]

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Odyssey Sprite Manager</h1>
                <p>Select a module to manage your game sprites</p>
            </div>
            <div className="module-grid">
                {modules.map(module => (
                    <ModuleTile
                        key={module.id}
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                        onClick={() => onNavigate(module.id)}
                    />
                ))}
            </div>
        </div>
    )
}
