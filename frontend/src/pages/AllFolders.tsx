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
  const [deleteButtonPosition, setDeleteButtonPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    fetchFolders()
  }, [])

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

    try {
      await folderService.deleteFolder(deleteFolderId)
      setDeleteFolderId(null)
      // Refresh the folder list
      await fetchFolders()
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
      </div>
    </Layout>
  )
}

export default AllFolders


