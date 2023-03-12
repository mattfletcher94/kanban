import { contextBridge, ipcRenderer } from 'electron'

export const API = {
  images: {
    select: options => ipcRenderer.invoke('select-image', options),
    upload: base64 => ipcRenderer.invoke('upload-image', base64),
    delete: path => ipcRenderer.invoke('delete-image', path),
  },
}

contextBridge.exposeInMainWorld('api', API)
