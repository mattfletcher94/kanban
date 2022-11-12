const convertToWindowsStore = require('electron-windows-store')
const pkg = require('./package.json')

convertToWindowsStore({
  inputDirectory: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\builds\\electron-builder\\win-unpacked',
  outputDirectory: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\builds\\appx',
  packageVersion: `${pkg.version}.0`,
  packageName: pkg.name,
  packageDisplayName: 'Kanban Board Offline',
  packageDescription: 'Offline Kanban Board - No Wifi required',
  packageBackgroundColor: 'transparent',
  publisherDisplayName: 'mattfletcher.dev',
  assets: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\appx',
  manifest: 'C:\\Users\\MattF\\Documents\\Code\\kanban-electron\\AppXManifest.xml',
  // packageExecutable: 'app/Ghost.exe',
  // deploy: false,
  // publisher: 'CN=developmentca',
  // windowsKit: 'C:\\windowskit',
  // devCert: 'C:\\devcert.pfx',
  // certPass: 'abcd',
  // desktopConverter: 'C:\\desktop-converter-tools',
  // expandedBaseImage: 'C:\\base-image.wim',
  // makeappxParams: ['/l'],
  // signtoolParams: ['/p'],
  // makePri: true,
  // createConfigParams: ['/a'],
  // createPriParams: ['/b'],
})
