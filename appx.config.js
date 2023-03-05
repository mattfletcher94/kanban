const convertToWindowsStore = require('electron-windows-store')
const pkg = require('./package.json')

convertToWindowsStore({
  inputDirectory: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\builds\\electron-builder\\win-unpacked',
  outputDirectory: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\builds\\appx',
  packageVersion: `${pkg.version}.0`,
  packageName: pkg.name,
  assets: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\public',
  manifest: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\AppXManifest.xml',
})
