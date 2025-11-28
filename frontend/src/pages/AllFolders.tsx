import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { folderService } from '../services/api'
import './AllFolders.css'

interface Folder {
  _id: string
  name: string
  createdAt: string
  parentId?: string
}

const AllFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [deleteFolderName, setDeleteFolderName] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchFolders()
  }, [])

  // Handle ESC key to close delete modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteFolderId && !isDeleting) {
        setDeleteFolderId(null)
        setDeleteFolderName('')
      }
    }
    
    if (deleteFolderId) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [deleteFolderId, isDeleting])

  const fetchFolders = async () => {
    try {
      const data = await folderService.getAllFolders()
      setFolders(data)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      await folderService.createFolder(newFolderName.trim())
      setNewFolderName('')
      setShowCreateModal(false)
      fetchFolders()
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
      fetchFolders()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to rename folder')
    }
  }

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return

    setIsDeleting(true)
    try {
      await folderService.deleteFolder(deleteFolderId)
      setDeleteFolderId(null)
      setDeleteFolderName('')
      // Refresh the folder list
      await fetchFolders()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete folder'
      alert(errorMessage)
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (folder: Folder) => {
    setDeleteFolderId(folder._id)
    setDeleteFolderName(folder.name)
  }

  const openRenameModal = (folder: Folder) => {
    setRenameFolderId(folder._id)
    setRenameFolderName(folder.name)
    setShowRenameModal(true)
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1>All Folders</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Folder
          </button>
        </div>

        <div className="card">
          {isLoading ? (
            <div>Loading...</div>
          ) : folders.length === 0 ? (
            <div className="empty-state">
              <p>No folders found. Create your first folder!</p>
            </div>
          ) : (
            <ul className="folder-list">
              {folders.map((folder) => (
                <li key={folder._id} className="folder-item">
                  <div className="folder-item-name">
                    <span>📁</span>
                    <Link to={`/folder/${folder._id}`}>{folder.name}</Link>
                    <Link
                      to={`/subfolders/${folder._id}`}
                      className="view-subfolders-link"
                      title="View sub-folders"
                    >
                      View Sub-Folders →
                    </Link>
                  </div>
                  <div className="folder-info">
                    <span className="folder-date">
                      {new Date(folder.createdAt).toLocaleDateString()}
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
                        onClick={() => openDeleteModal(folder)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Folder</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                  ×
                </button>
              </div>
              <div>
                <label htmlFor="folder-name">Folder Name</label>
                <input
                  id="folder-name"
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
                <h2>Rename Folder</h2>
                <button className="close-btn" onClick={() => setShowRenameModal(false)}>
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

        {/* Delete Confirmation Modal */}
        {deleteFolderId && (
          <div 
            className="modal-overlay delete-modal-overlay" 
            onClick={() => {
              if (!isDeleting) {
                setDeleteFolderId(null)
                setDeleteFolderName('')
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <div 
              className="modal delete-confirmation-modal" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2"/>
                  <path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 8L16 16M16 8L8 16" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              
              <div className="modal-header delete-modal-header">
                <h2 id="delete-modal-title">Delete Folder</h2>
              </div>
              
              <div className="delete-modal-content" id="delete-modal-description">
                <p className="delete-warning-text">
                  Are you sure you want to delete <strong>"{deleteFolderName}"</strong>?
                </p>
                <p className="delete-warning-subtext">
                  This action cannot be undone. All files and sub-folders in this folder will be permanently deleted.
                </p>
              </div>
              
              <div className="modal-footer delete-modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setDeleteFolderId(null)
                    setDeleteFolderName('')
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger delete-confirm-btn" 
                  onClick={handleDeleteFolder}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete Folder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AllFolders


