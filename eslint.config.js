// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  rules: {
    'curly': 'off',
    'no-console': 'off',
    'node/prefer-global/process': 'off',
  },
})
