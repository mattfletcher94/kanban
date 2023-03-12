import type { Theme } from '../stores/boards'
import abstactWavesBg from '../assets/themes/abstract-waves.png'
import abstactWavesThumbnail from '../assets/themes/abstract-waves-thumbnail.png'
import forestBg from '../assets/themes/forest.png'
import forestThumbnail from '../assets/themes/forest-thumbnail.png'
import spaceBg from '../assets/themes/space.jpg'
import spaceThumbnail from '../assets/themes/space-thumbnail.jpg'
import blueBubblesBg from '../assets/themes/blue-bubbles.jpg'
import blueBubblesThumbnail from '../assets/themes/blue-bubbles-thumbnail.jpg'

export const themes: Theme[] = [
  {
    id: '1',
    title: 'Abstract Waves',
    image: abstactWavesBg,
    thumbnail: abstactWavesThumbnail,
    isCustom: false,
  },
  {
    id: '2',
    title: 'Blue Bubbles',
    image: blueBubblesBg,
    thumbnail: blueBubblesThumbnail,
    isCustom: false,
  },
  {
    id: '3',
    title: 'Forest',
    image: forestBg,
    thumbnail: forestThumbnail,
    isCustom: false,
  },
  {
    id: '4',
    title: 'Space',
    image: spaceBg,
    thumbnail: spaceThumbnail,
    isCustom: false,
  },
]
