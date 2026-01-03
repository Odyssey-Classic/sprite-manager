import React, { useEffect } from 'react'
import { useTitleBar } from '../../contexts/TitleBarContext'
import { useNavigation } from '../../contexts/NavigationContext'
import ImageSlicer from './components/ImageSlicer'

export default function ImageSlicerModule() {
    const { setTitle, setBreadcrumbs } = useTitleBar()
    const { navigateTo } = useNavigation()

    useEffect(() => {
        setTitle('Image Slicer')
        setBreadcrumbs([
            { label: 'Home', onClick: () => navigateTo('dashboard') },
            { label: 'Image Slicer' }
        ])
    }, [setTitle, setBreadcrumbs, navigateTo])

    return (
        <div className="module-container">
            <div className="module-header">
                <h1>Image Slicer</h1>
            </div>
            <div className="module-content">
                <ImageSlicer />
            </div>
        </div>
    )
}
