const ui = require('@supabase/ui/dist/config/ui.config.js')

module.exports = ui({
  purge: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@supabase/ui/dist/config/default-theme.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
})
