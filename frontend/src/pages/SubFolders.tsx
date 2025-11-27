import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { folderService } from '../services/api'
import './SubFolders.css'

interface Folder {
  _id: string
  name: string
  createdAt: string
  parentId?: string
}

interface ParentFolder {
  _id: string
  name: string
}

const SubFolders = () => {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const [subFolders, setSubFolders] = useState<Folder[]>([])
  const [parentFolder, setParentFolder] = useState<ParentFolder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [deleteButtonPosition, setDeleteButtonPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (folderId) {
      fetchSubFolders()
    }
  }, [folderId])

  const fetchSubFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const subFoldersData = await folderService.getSubFolders(folderId!)
      setSubFolders(subFoldersData)
      
      // Get parent folder info
      const folderContents = await folderService.getFolderContents(folderId!)
      if (folderContents.currentFolder) {
        setParentFolder({
          _id: folderContents.currentFolder._id,
          name: folderContents.currentFolder.name
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch sub-folders:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load sub-folders'
      setError(errorMessage)
      setSubFolders([])
      setParentFolder(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await folderService.createFolder(newFolderName.trim(), folderId)
      setNewFolderName('')
      setShowCreateModal(false)
      fetchSubFolders()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create folder')
    }
  }

  const handleRenameFolder = async () => {
    if (!renameFolderName.trim() || !renameFolderId) return

    try {
      await folderService.renameFolder(renameFolderId, renameFolderName.trim())
      setRenameFolderName('')
      setRenameFolderId(null)
      setShowRenameModal(false)
      fetchSubFolders()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to rename folder')
    }
  }

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return

    try {
      await folderService.deleteFolder(deleteFolderId)
      setDeleteFolderId(null)
      // Refresh the sub-folders list
      await fetchSubFolders()
      // Show success message
      alert('Folder deleted successfully')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete folder'
      alert(errorMessage)
      console.error('Delete error:', error)
    }
  }

  const openRenameModal = (folder: Folder) => {
    setRenameFolderId(folder._id)
    setRenameFolderName(folder.name)
    setShowRenameModal(true)
  }

  const handleNavigateUp = () => {
    if (folderId) {
      // Navigate to parent folder's sub-folders view, or to folder view if no parent
      navigate(`/folder/${folderId}`)
    } else {
      navigate('/folder')
    }
  }

  if (!folderId) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">Invalid folder ID provided.</div>
          <Link to="/folders" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Go to All Folders
          </Link>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Loading sub-folders...</h2>
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
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={fetchSubFolders}>
              Retry
            </button>
            <Link to="/folders" className="btn btn-secondary">
              Go to All Folders
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Sub-Folders</h1>
            {parentFolder && (
              <div className="parent-folder-info">
                <span className="parent-label">Parent Folder:</span>
                <Link to={`/folder/${parentFolder._id}`} className="parent-link">
                  📁 {parentFolder.name}
                </Link>
              </div>
            )}
          </div>
          <div className="header-actions">
            {parentFolder && (
              <button
                className="btn btn-secondary"
                onClick={handleNavigateUp}
              >
                ↑ Go Up
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create New Sub-Folder
            </button>
          </div>
        </div>

        <div className="navigation-links">
          <Link to="/folders" className="nav-link">← All Folders</Link>
          {parentFolder && (
            <Link to={`/folder/${parentFolder._id}`} className="nav-link">
              View Full Folder Contents →
            </Link>
          )}
        </div>

        <div className="card">
          {isLoading ? (
            <div>Loading sub-folders...</div>
          ) : subFolders.length === 0 ? (
            <div className="empty-state">
              <p>📭 No sub-folders found in this folder.</p>
              <p>Create a new sub-folder to get started!</p>
            </div>
          ) : (
            <>
              <div className="subfolders-header">
                <h2>Sub-Folders ({subFolders.length})</h2>
              </div>
              <ul className="folder-list">
                {subFolders.map((folder) => (
                  <li key={folder._id} className="folder-item">
                    <div className="folder-item-name">
                      <span>📁</span>
                      <Link to={`/folder/${folder._id}`}>{folder.name}</Link>
                      <Link
                        to={`/subfolders/${folder._id}`}
                        className="view-subfolders-btn"
                        title="View sub-folders"
                      >
                        View Sub-Folders →
                      </Link>
                    </div>
                    <div className="folder-info">
                      <span className="folder-date">
                        Created: {new Date(folder.createdAt).toLocaleDateString()}
                      </span>
                      <div className="folder-actions">
                        <button
                          className="icon-btn"
                          onClick={() => openRenameModal(folder)}
                          title="Rename"
                        >
                          ✏️
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
            </>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Sub-Folder</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="folder-name">Sub-Folder Name</label>
                <input
                  id="folder-name"
                  type="text"
                  className="input"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter sub-folder name"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
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

        {/* Rename Modal */}
        {showRenameModal && (
          <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Rename Sub-Folder</h2>
                <button className="close-btn" onClick={() => setShowRenameModal(false)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="rename-folder-name">Sub-Folder Name</label>
                <input
                  id="rename-folder-name"
                  type="text"
                  className="input"
                  value={renameFolderName}
                  onChange={(e) => setRenameFolderName(e.target.value)}
                  placeholder="Enter sub-folder name"
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRenameModal(false)}
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

        {/* Delete Confirmation */}
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
                <h2>Delete Sub-Folder</h2>
                <button className="close-btn" onClick={() => setDeleteFolderId(null)}>
                  ×
                </button>
              </div>
              <p>Are you sure you want to delete this sub-folder? This action cannot be undone.</p>
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
      </div>
    </Layout>
  )
}

export default SubFolders

