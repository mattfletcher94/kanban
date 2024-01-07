import { contextBridge, ipcRenderer } from 'electron'

export const API = {
  images: {
    select: options => ipcRenderer.invoke('select-image', options),
    upload: base64 => ipcRenderer.invoke('upload-image', base64),
    delete: path => ipcRenderer.invoke('delete-image', path),
  },
  importer: {
    export: data => ipcRenderer.invoke('download-json', data),
    select: () => ipcRenderer.invoke('select-json'),
  },
}

contextBridge.exposeInMainWorld('api', API)
