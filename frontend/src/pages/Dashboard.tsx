import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { folderService } from '../services/api'
import './Dashboard.css'

interface Folder {
  _id: string
  name: string
  createdAt: string
}

const Dashboard = () => {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await folderService.getRootFolders()
      setFolders(data)
    } catch (error: any) {
      console.error('Failed to fetch folders:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load folders'
      setError(errorMessage)
      setFolders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  // Refresh when component comes into focus (user navigates back)
  useEffect(() => {
    const handleFocus = () => {
      fetchFolders()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
            Retry
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container">
        <h1>Dashboard</h1>
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Root Folders</h3>
            <p className="stat-number">{folders.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Root Folders</h2>
            <Link to="/folders" className="btn btn-primary">
              View All Folders
            </Link>
          </div>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>Loading...</h2>
            </div>
          ) : folders.length === 0 ? (
            <div className="empty-state">
              <p>No folders yet. Create your first folder!</p>
              <Link to="/folders" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Create Folder
              </Link>
            </div>
          ) : (
            <ul className="folder-list">
              {folders.map((folder) => (
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
                  <span className="folder-date">
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
              <li className="folder-item">
                <Link to="/folder" className="folder-item-name">
                  <span>📁</span>
                  <span>View All (Root)</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

