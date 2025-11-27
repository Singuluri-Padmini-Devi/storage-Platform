import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password })
    return response.data
  },
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data.user
  },
}

export const folderService = {
  getAllFolders: async () => {
    const response = await api.get('/folders/all')
    return response.data
  },
  getRootFolders: async () => {
    const response = await api.get('/folders/root')
    return response.data
  },
  getSubFolders: async (folderId: string) => {
    const response = await api.get(`/folders/${folderId}/subfolders`)
    return response.data
  },
  getFolderContents: async (folderId: string | null) => {
    // Handle root case - use 'root' string or null
    const folderIdParam = !folderId || folderId === 'root' ? 'root' : folderId
    const endpoint = folderIdParam === 'root' ? '/folders/root/contents' : `/folders/${folderIdParam}/contents`
    const response = await api.get(endpoint)
    return response.data
  },
  createFolder: async (name: string, parentId?: string) => {
    const response = await api.post('/folders', { name, parentId })
    return response.data
  },
  renameFolder: async (folderId: string, name: string) => {
    const response = await api.put(`/folders/${folderId}`, { name })
    return response.data
  },
  deleteFolder: async (folderId: string) => {
    const response = await api.delete(`/folders/${folderId}`)
    return response.data
  },
}

export const fileService = {
  createFile: async (name: string, folderId?: string, fileUrl?: string) => {
    const response = await api.post('/files', { name, folderId, fileUrl })
    return response.data
  },
  renameFile: async (fileId: string, name: string) => {
    const response = await api.put(`/files/${fileId}`, { name })
    return response.data
  },
  deleteFile: async (fileId: string) => {
    const response = await api.delete(`/files/${fileId}`)
    return response.data
  },
}

export const shareService = {
  generateShareLink: async (resourceType: 'folder' | 'file', resourceId: string) => {
    const response = await api.post('/shares/generate', { resourceType, resourceId })
    return response.data
  },
  revokeShareLink: async (shareId: string) => {
    const response = await api.delete(`/shares/${shareId}`)
    return response.data
  },
  getPublicResource: async (shareId: string) => {
    const response = await api.get(`/shares/public/${shareId}`)
    return response.data
  },
  getPublicFolder: async (shareId: string, folderId: string) => {
    const response = await api.get(`/shares/public/${shareId}/folder/${folderId}`)
    return response.data
  },
  getMyShareLinks: async () => {
    const response = await api.get('/shares/my')
    return response.data
  },
}

export default api

