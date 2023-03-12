import fs from 'fs'
import { basename, join } from 'path'
import { app, dialog } from 'electron'

export const selectImage = async (event, options?: {
  extensions: string[]
  maxSize: number
}) => {
  const defaults = {
    extensions: ['jpg', 'png', 'gif', 'webp', 'jpeg'],
    maxSize: 3 * 1024 * 1024,
  }

  const { extensions, maxSize } = { ...defaults, ...(options || {}) }

  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions }],
  })

  if (result.canceled || result.filePaths.length === 0)
    return null

  const filePath = result.filePaths[0]

  // Read the file into a buffer
  const fileContent = await fs.promises.readFile(filePath)
  const extension = filePath.split('.').pop()

  // Make sure file isn't over 2MB
  if (fileContent.byteLength > maxSize) {
    return {
      error: 'File is too large',
    }
  }

  // Convert image to base64
  const base64 = fileContent.toString('base64')

  // Return image to renderer process
  return {
    base64: `data:image/${extension};base64,${base64}`,
  }
}

export const uploadImage = async (event, base64: string) => {
  // Convert base64 to image file
  const imageBuffer = Buffer.from(base64.split(',')[1], 'base64')

  // save in app://
  const appDir = app.getPath('userData')
  const targetPath = join(appDir, `theme-image-${Date.now()}.png`)
  await fs.promises.writeFile(targetPath, imageBuffer)

  // Return image path renderer process
  return {
    path: `app://${basename(targetPath)}`,
  }
}

export const deleteImage = async (event, path) => {
  // Make sure the image is one that we saved
  if (!path.startsWith('app://theme-image-'))
    return

  try {
    const appDir = app.getPath('userData')
    const targetPath = join(appDir, path.replace('app://', ''))

    await fs.promises.unlink(targetPath)
  }
  catch (error) {
    console.warn(error)
  }
}
