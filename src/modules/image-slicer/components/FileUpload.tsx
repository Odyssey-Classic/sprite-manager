import React from 'react'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    hasFile: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, hasFile }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'image/png') {
            onFileSelect(file)
        }
    }

    return (
        <div className="file-upload-section">
            <label htmlFor="file-input" className="file-label">
                {hasFile ? 'Change Image' : 'Select PNG Image'}
            </label>
            <input
                id="file-input"
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}
