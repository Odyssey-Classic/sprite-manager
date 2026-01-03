import React from 'react'
import { useTitleBar } from '../contexts/TitleBarContext'

export default function TitleBar() {
    const { title } = useTitleBar()

    return (
        <div className="title-bar">
            <div className="title-bar-left">
            </div>

            <div className="title-bar-center">
                <h1 className="title-bar-title">
                    {title}
                </h1>
            </div>

            <div className="title-bar-right">
                <button className="icon-button" aria-label="Help">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>
                <button className="icon-button" aria-label="Settings">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m4.22-13.22l-4.25 4.25m0 5.94l4.25 4.25M23 12h-6m-6 0H1m18.22 4.22l-4.25-4.25m-5.94 0l-4.25 4.25" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
