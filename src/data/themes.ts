import type { Theme } from '../stores/boards'
import abstactWavesBg from '../assets/themes/abstract-waves.png'
import forestBg from '../assets/themes/forest.png'

export const themes: Theme[] = [
  {
    id: '1',
    title: 'Abstract Waves',
    image: abstactWavesBg,
  },
  {
    id: '2',
    title: 'Forest',
    image: forestBg,
  },
]
