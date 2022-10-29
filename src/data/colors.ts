export const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

export const resolveUserFriendlyColorName = (color: string) => {
  return color.charAt(0).toUpperCase() + color.slice(1)
}
