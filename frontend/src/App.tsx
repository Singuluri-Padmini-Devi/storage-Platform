import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AllFolders from './pages/AllFolders'
import SubFolders from './pages/SubFolders'
import FolderView from './pages/FolderView'
import PublicView from './pages/PublicView'
import PrivateRoute from './components/PrivateRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/:shareId" element={<PublicView />} />
          <Route path="/public/:shareId/folder/:folderId" element={<PublicView />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/folders"
            element={
              <PrivateRoute>
                <AllFolders />
              </PrivateRoute>
            }
          />
          <Route
            path="/subfolders/:folderId"
            element={
              <PrivateRoute>
                <SubFolders />
              </PrivateRoute>
            }
          />
          <Route
            path="/folder"
            element={
              <PrivateRoute>
                <FolderView />
              </PrivateRoute>
            }
          />
          <Route
            path="/folder/:folderId"
            element={
              <PrivateRoute>
                <FolderView />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

