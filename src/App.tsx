import React, { useState, useEffect } from 'react'
import TitleBar from './components/TitleBar'
import Breadcrumbs from './components/Breadcrumbs'
import Dashboard, { type ModuleType } from './components/Dashboard'
import { SpritesModule } from './modules/sprites'
import { SpritesheetsModule } from './modules/spritesheets'
import { TitleBarProvider } from './contexts/TitleBarContext'
import { NavigationProvider } from './contexts/NavigationContext'

function getModuleFromPath(): ModuleType {
    const path = window.location.pathname
    if (path.startsWith('/sprites')) return 'sprites'
    if (path.startsWith('/animations')) return 'animations'
    if (path.startsWith('/spritesheets')) return 'spritesheets'
    return 'dashboard'
}

function getPathFromModule(module: ModuleType): string {
    if (module === 'dashboard') return '/'
    return `/${module}`
}

export default function App() {
    const [currentModule, setCurrentModule] = useState<ModuleType>(getModuleFromPath())

    // Listen to browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            setCurrentModule(getModuleFromPath())
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    const navigateTo = (module: ModuleType) => {
        const path = getPathFromModule(module)
        window.history.pushState({ module }, '', path)
        setCurrentModule(module)
    }

    const renderModule = () => {
        switch (currentModule) {
            case 'sprites':
                return <SpritesModule />
            case 'spritesheets':
                return <SpritesheetsModule />
            case 'dashboard':
            default:
                return <Dashboard onNavigate={navigateTo} />
        }
    }

    return (
        <TitleBarProvider>
            <NavigationProvider navigateTo={navigateTo}>
                <div className="admin-ui">
                    <TitleBar />
                    <Breadcrumbs />
                    <div className="admin-content">
                        {renderModule()}
                    </div>
                </div>
            </NavigationProvider>
        </TitleBarProvider>
    )
}
