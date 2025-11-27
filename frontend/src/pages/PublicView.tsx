import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shareService } from '../services/api'
import './PublicView.css'

interface Folder {
  _id: string
  name: string
  parentId?: string
}

interface File {
  _id: string
  name: string
  fileUrl: string
  createdAt?: string
}

interface PublicResource {
  type: 'folder' | 'file'
  folder?: Folder
  file?: File
  subFolders?: Folder[]
  files?: File[]
  parentFolder?: Folder | null
  rootShareId?: string
  rootFolderId?: string
}

const PublicView = () => {
  const { shareId, folderId } = useParams<{ shareId: string; folderId?: string }>()
  const navigate = useNavigate()
  const [resource, setResource] = useState<PublicResource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; folderId: string | null }>>([])

  useEffect(() => {
    if (shareId) {
      fetchPublicResource()
    }
  }, [shareId, folderId])

  const fetchPublicResource = async () => {
    try {
      setIsLoading(true)
      let data
      
      if (folderId) {
        // Fetch nested folder
        data = await shareService.getPublicFolder(shareId!, folderId)
      } else {
        // Fetch root shared resource
        data = await shareService.getPublicResource(shareId!)
      }
      
      setResource(data)
      buildBreadcrumbs(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shared resource')
    } finally {
      setIsLoading(false)
    }
  }

  const buildBreadcrumbs = (data: PublicResource) => {
    const crumbs: Array<{ name: string; folderId: string | null }> = []
    
    if (data.type === 'folder' && data.folder) {
      // Always start with root
      crumbs.push({ name: 'Root', folderId: null })
      
      // If we're in a nested folder (not at root), add current folder
      if (folderId && data.rootFolderId && data.folder._id !== data.rootFolderId) {
        crumbs.push({ name: data.folder.name, folderId: data.folder._id })
      }
    }
    
    setBreadcrumbs(crumbs)
  }

  const handleFolderClick = (folder: Folder) => {
    if (shareId) {
      navigate(`/public/${shareId}/folder/${folder._id}`)
    }
  }

  const handleBreadcrumbClick = (folderId: string | null) => {
    if (folderId === null) {
      // Navigate to root
      navigate(`/public/${shareId}`)
    } else {
      navigate(`/public/${shareId}/folder/${folderId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="public-container">
        <div className="container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if the shareId looks like a filename instead of a proper shareId
    const looksLikeFilename = shareId && (
      shareId.includes('.') || 
      shareId.length < 20 || 
      !/^[a-f0-9]+$/i.test(shareId)
    )

    return (
      <div className="public-container">
        <div className="container">
          <div className="error-message">
            {error}
            {looksLikeFilename && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <strong>💡 Help:</strong> It looks like you're using a filename instead of a share link.
                <br />
                <br />
                <strong>To get a share link:</strong>
                <ol style={{ marginTop: '8px', paddingLeft: '20px', textAlign: 'left' }}>
                  <li>Log in to your account</li>
                  <li>Navigate to the folder or file you want to share</li>
                  <li>Click the share icon (🔗) on the folder or file</li>
                  <li>Click "Generate Share Link"</li>
                  <li>Copy the generated URL (it will look like: <code>/public/abc123def456...</code>)</li>
                </ol>
                <br />
                Share links are long random strings (like: <code>a1b2c3d4e5f6789012345678901234</code>), not filenames.
              </div>
            )}
          </div>
          {shareId && !looksLikeFilename && (
            <button 
              onClick={() => navigate(`/public/${shareId}`)} 
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="public-container">
        <div className="container">Resource not found</div>
      </div>
    )
  }

  return (
    <div className="public-container">
      <div className="container">
        <div className="public-header">
          <div className="public-badge">🔓 Public View</div>
          <h1>Shared {resource.type === 'folder' ? 'Folder' : 'File'}</h1>
          <p className="public-note">This is a read-only view. You can browse but cannot modify content.</p>
        </div>

        {/* Breadcrumb Navigation */}
        {resource.type === 'folder' && breadcrumbs.length > 0 && (
          <div className="breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {index > 0 && <span className="breadcrumb-separator"> / </span>}
                <button
                  onClick={() => handleBreadcrumbClick(crumb.folderId)}
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                  disabled={index === breadcrumbs.length - 1}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {resource.type === 'folder' && resource.folder && (
          <>
            {/* Parent Folder Link */}
            {resource.parentFolder && (
              <div className="card">
                <button
                  onClick={() => {
                    if (resource.parentFolder?._id) {
                      navigate(`/public/${shareId}/folder/${resource.parentFolder._id}`)
                    } else {
                      navigate(`/public/${shareId}`)
                    }
                  }}
                  className="folder-item folder-item-clickable"
                >
                  <div className="folder-item-name">
                    <span>📁</span>
                    <span>.. (Parent Folder)</span>
                  </div>
                </button>
              </div>
            )}

            {/* Current Folder Info */}
            <div className="card">
              <h2>📁 {resource.folder.name}</h2>
            </div>

            {/* Sub-folders */}
            {resource.subFolders && resource.subFolders.length > 0 && (
              <div className="card">
                <h2>Folders ({resource.subFolders.length})</h2>
                <ul className="folder-list">
                  {resource.subFolders.map((folder) => (
                    <li key={folder._id} className="folder-item folder-item-clickable">
                      <button
                        onClick={() => handleFolderClick(folder)}
                        className="folder-item-button"
                      >
                        <div className="folder-item-name">
                          <span>📁</span>
                          <span>{folder.name}</span>
                        </div>
                        <span className="folder-arrow">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Files */}
            {resource.files && resource.files.length > 0 && (
              <div className="card">
                <h2>Files ({resource.files.length})</h2>
                <ul className="file-list">
                  {resource.files.map((file) => (
                    <li key={file._id} className="file-item">
                      <div className="file-item-name">
                        <span>📄</span>
                        <span>{file.name}</span>
                        {file.fileUrl && (
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            Open
                          </a>
                        )}
                      </div>
                      {file.createdAt && (
                        <span className="file-date">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {(!resource.subFolders || resource.subFolders.length === 0) &&
              (!resource.files || resource.files.length === 0) && (
                <div className="card">
                  <div className="empty-state">
                    <p>📭 This folder is empty</p>
                  </div>
                </div>
              )}
          </>
        )}

        {resource.type === 'file' && resource.file && (
          <div className="card">
            <h2>📄 {resource.file.name}</h2>
            {resource.file.fileUrl ? (
              <div style={{ marginTop: '20px' }}>
                <a
                  href={resource.file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-block' }}
                >
                  Open File
                </a>
              </div>
            ) : (
              <p style={{ marginTop: '20px', color: '#666' }}>
                No file URL available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicView
