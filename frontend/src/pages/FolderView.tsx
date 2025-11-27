import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { folderService, fileService, shareService } from '../services/api'
import './FolderView.css'

interface Folder {
  _id: string
  name: string
  parentId?: string
  path?: string
  createdAt?: string
}

interface File {
  _id: string
  name: string
  fileUrl: string
  createdAt: string
}

interface FolderContents {
  folders: Folder[]
  files: File[]
  currentFolder: Folder | null
  parentFolder: Folder | null
}

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const [contents, setContents] = useState<FolderContents | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateFileModal, setShowCreateFileModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareResourceType, setShareResourceType] = useState<'folder' | 'file' | null>(null)
  const [shareResourceId, setShareResourceId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [shareId, setShareId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newFileUrl, setNewFileUrl] = useState('')
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const [renameFileId, setRenameFileId] = useState<string | null>(null)
  const [renameFileName, setRenameFileName] = useState('')
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [deleteButtonPosition, setDeleteButtonPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    fetchContents()
  }, [folderId])

  const fetchContents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Use 'root' if folderId is undefined, otherwise use the folderId
      const folderIdParam = folderId || 'root'
      const data = await folderService.getFolderContents(folderIdParam)
      setContents(data)
    } catch (error: any) {
      console.error('Failed to fetch folder contents:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load folder contents'
      setError(errorMessage)
      setContents(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      // Use null for root, otherwise use folderId
      const parentId = folderId && folderId !== 'root' ? folderId : undefined
      await folderService.createFolder(newFolderName.trim(), parentId)
      setNewFolderName('')
      setShowCreateFolderModal(false)
      fetchContents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create folder')
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return

    try {
      // Use null for root, otherwise use folderId
      const parentId = folderId && folderId !== 'root' ? folderId : undefined
      await fileService.createFile(
        newFileName.trim(),
        parentId,
        newFileUrl || undefined
      )
      setNewFileName('')
      setNewFileUrl('')
      setShowCreateFileModal(false)
      fetchContents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create file')
    }
  }

  const handleRenameFolder = async () => {
    if (!renameFolderName.trim() || !renameFolderId) return

    try {
      await folderService.renameFolder(renameFolderId, renameFolderName.trim())
      setRenameFolderName('')
      setRenameFolderId(null)
      fetchContents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to rename folder')
    }
  }

  const handleRenameFile = async () => {
    if (!renameFileName.trim() || !renameFileId) return

    try {
      await fileService.renameFile(renameFileId, renameFileName.trim())
      setRenameFileName('')
      setRenameFileId(null)
      fetchContents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to rename file')
    }
  }

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return

    try {
      await folderService.deleteFolder(deleteFolderId)
      setDeleteFolderId(null)
      // Refresh the folder contents
      await fetchContents()
      // Show success message
      alert('Folder deleted successfully')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete folder'
      alert(errorMessage)
      console.error('Delete error:', error)
    }
  }

  const handleDeleteFile = async () => {
    if (!deleteFileId) return

    try {
      await fileService.deleteFile(deleteFileId)
      setDeleteFileId(null)
      fetchContents()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete file')
    }
  }

  const handleGenerateShareLink = async () => {
    if (!shareResourceType || !shareResourceId) return

    try {
      const response = await shareService.generateShareLink(shareResourceType, shareResourceId)
      setShareUrl(response.shareUrl)
      setShareId(response.shareId)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate share link')
    }
  }

  const handleRevokeShareLink = async () => {
    if (!shareId) return

    try {
      await shareService.revokeShareLink(shareId)
      setShareUrl('')
      setShareId(null)
      alert('Share link revoked successfully')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to revoke share link')
    }
  }

  const openShareModal = async (type: 'folder' | 'file', id: string) => {
    setShareResourceType(type)
    setShareResourceId(id)
    setShareUrl('')
    setShareId(null)
    setShowShareModal(true)
    
    // Try to get existing share link
    try {
      const response = await shareService.generateShareLink(type, id)
      setShareUrl(response.shareUrl)
      setShareId(response.shareId)
    } catch (error: any) {
      // If no share link exists, that's fine - user can generate one
      console.log('No existing share link found')
    }
  }

  const buildBreadcrumb = () => {
    const breadcrumbs: Array<{ name: string; path: string }> = []
    breadcrumbs.push({ name: 'Root', path: '/folder' })

    // Build breadcrumb by traversing up the folder hierarchy
    if (contents?.currentFolder) {
      const pathParts = contents.currentFolder.path?.split('/').filter(Boolean) || []
      
      // If we have a path, we can show the full hierarchy
      // For now, show current folder
      if (folderId) {
        breadcrumbs.push({
          name: contents.currentFolder.name,
          path: `/folder/${contents.currentFolder._id}`,
        })
      }
    }

    return breadcrumbs
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading folder contents...</h2>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={fetchContents} style={{ marginTop: '20px' }}>
            Retry
          </button>
        </div>
      </Layout>
    )
  }

  if (!contents) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">Folder not found or could not be loaded.</div>
          <button className="btn btn-primary" onClick={fetchContents} style={{ marginTop: '20px' }}>
            Retry
          </button>
        </div>
      </Layout>
    )
  }

  const breadcrumbs = buildBreadcrumb()

  return (
    <Layout>
      <div className="container">
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="breadcrumb-separator"> / </span>}
              <Link to={crumb.path} className="breadcrumb-item">
                {crumb.name}
              </Link>
            </span>
          ))}
        </div>

        <div className="page-header">
          <h1>{contents.currentFolder?.name || 'Root'}</h1>
          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateFolderModal(true)}
            >
              Create Folder
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateFileModal(true)}
            >
              Add File
            </button>
          </div>
        </div>

        {contents.parentFolder && (
          <div className="card">
            <Link
              to={contents.parentFolder._id ? `/folder/${contents.parentFolder._id}` : '/folder'}
              className="folder-item"
            >
              <span>📁</span>
              <span>.. (Parent Folder)</span>
            </Link>
          </div>
        )}

        {contents.folders.length > 0 && (
          <div className="card">
            <h2>Folders</h2>
            <ul className="folder-list">
              {contents.folders.map((folder) => (
                <li key={folder._id} className="folder-item">
                  <div className="folder-item-name">
                    <Link to={`/folder/${folder._id}`}>
                      <span>📁</span>
                      <span>{folder.name}</span>
                    </Link>
                    <Link
                      to={`/subfolders/${folder._id}`}
                      className="view-subfolders-link"
                      title="View sub-folders"
                    >
                      View Sub-Folders →
                    </Link>
                  </div>
                  <div className="folder-info">
                    {folder.createdAt && (
                      <span className="folder-date">
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <div className="folder-actions">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setRenameFolderId(folder._id)
                        setRenameFolderName(folder.name)
                      }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => openShareModal('folder', folder._id)}
                      title="Share"
                    >
                      🔗
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setDeleteButtonPosition({
                          top: rect.top,
                          left: rect.left
                        })
                        setDeleteFolderId(folder._id)
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {contents.files.length > 0 && (
          <div className="card">
            <h2>Files</h2>
            <ul className="file-list">
              {contents.files.map((file) => (
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
                  <div className="file-info">
                    {file.createdAt && (
                      <span className="file-date">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <div className="file-actions">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setRenameFileId(file._id)
                        setRenameFileName(file.name)
                      }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => openShareModal('file', file._id)}
                      title="Share"
                    >
                      🔗
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setDeleteButtonPosition({
                          top: rect.top,
                          left: rect.left
                        })
                        setDeleteFileId(file._id)
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {contents.folders.length === 0 && contents.files.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <p>This folder is empty</p>
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="modal-overlay" onClick={() => setShowCreateFolderModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Folder</h2>
                <button className="close-btn" onClick={() => setShowCreateFolderModal(false)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="new-folder-name">Folder Name</label>
                <input
                  id="new-folder-name"
                  type="text"
                  className="input"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateFolderModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateFolder}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create File Modal */}
        {showCreateFileModal && (
          <div className="modal-overlay" onClick={() => setShowCreateFileModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add File</h2>
                <button className="close-btn" onClick={() => setShowCreateFileModal(false)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="new-file-name">File Name</label>
                <input
                  id="new-file-name"
                  type="text"
                  className="input"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name"
                  autoFocus
                />
                <label htmlFor="new-file-url" style={{ marginTop: '15px', display: 'block' }}>
                  File URL (optional)
                </label>
                <input
                  id="new-file-url"
                  type="url"
                  className="input"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateFileModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateFile}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Folder Modal */}
        {renameFolderId && (
          <div className="modal-overlay" onClick={() => setRenameFolderId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Rename Folder</h2>
                <button className="close-btn" onClick={() => setRenameFolderId(null)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="rename-folder-name">Folder Name</label>
                <input
                  id="rename-folder-name"
                  type="text"
                  className="input"
                  value={renameFolderName}
                  onChange={(e) => setRenameFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setRenameFolderId(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleRenameFolder}>
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename File Modal */}
        {renameFileId && (
          <div className="modal-overlay" onClick={() => setRenameFileId(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Rename File</h2>
                <button className="close-btn" onClick={() => setRenameFileId(null)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="rename-file-name">File Name</label>
                <input
                  id="rename-file-name"
                  type="text"
                  className="input"
                  value={renameFileName}
                  onChange={(e) => setRenameFileName(e.target.value)}
                  placeholder="Enter file name"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setRenameFileId(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleRenameFile}>
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && shareResourceType && shareResourceId && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Share {shareResourceType === 'folder' ? 'Folder' : 'File'}</h2>
                <button className="close-btn" onClick={() => setShowShareModal(false)}>
                  ×
                </button>
              </div>
              <div>
                {shareUrl ? (
                  <div>
                    <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <strong>✅ Share link generated!</strong>
                      <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                        Copy this URL and share it with anyone. They can view this {shareResourceType} without logging in.
                      </p>
                    </div>
                    <label htmlFor="share-url-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Share URL:
                    </label>
                    <input
                      id="share-url-input"
                      type="text"
                      className="input"
                      value={shareUrl}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl)
                          alert('✅ Link copied to clipboard!')
                        }}
                      >
                        📋 Copy Link
                      </button>
                      {shareId && (
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                          onClick={handleRevokeShareLink}
                        >
                          🚫 Revoke
                        </button>
                      )}
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                      💡 Tip: Open this link in an incognito window to test public access
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '16px' }}>
                      Generate a shareable link for this {shareResourceType}. Anyone with the link can view it (read-only).
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerateShareLink}
                      style={{ width: '100%' }}
                    >
                      🔗 Generate Share Link
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowShareModal(false)
                    setShareUrl('')
                    setShareId(null)
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Folder Confirmation */}
        {deleteFolderId && (
          <div 
            className="modal-overlay" 
            onClick={() => {
              setDeleteFolderId(null)
              setDeleteButtonPosition(null)
            }}
          >
            <div 
              className="modal" 
              onClick={(e) => e.stopPropagation()}
              style={deleteButtonPosition ? {
                position: 'fixed',
                top: `${Math.max(20, Math.min(deleteButtonPosition.top - 100, window.innerHeight - 300))}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0
              } : {}}
            >
              <div className="modal-header">
                <h2>Delete Folder</h2>
                <button className="close-btn" onClick={() => setDeleteFolderId(null)}>
                  ×
                </button>
              </div>
              <p>Are you sure you want to delete this folder? This action cannot be undone.</p>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteFolderId(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteFolder}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete File Confirmation */}
        {deleteFileId && (
          <div 
            className="modal-overlay" 
            onClick={() => {
              setDeleteFileId(null)
              setDeleteButtonPosition(null)
            }}
          >
            <div 
              className="modal" 
              onClick={(e) => e.stopPropagation()}
              style={deleteButtonPosition ? {
                position: 'fixed',
                top: `${Math.max(20, Math.min(deleteButtonPosition.top - 100, window.innerHeight - 300))}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0
              } : {}}
            >
              <div className="modal-header">
                <h2>Delete File</h2>
                <button className="close-btn" onClick={() => setDeleteFileId(null)}>
                  ×
                </button>
              </div>
              <p>Are you sure you want to delete this file? This action cannot be undone.</p>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteFileId(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteFile}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default FolderView

