# HandConnect Vue.js

A Vue.js implementation of Advanced Hand Tracking AR experience with neon effects, inspired by the original HandConnect website.

## Features

- 🎯 Real-time hand tracking using MediaPipe
- 🌈 Beautiful neon visual effects
- 📱 Responsive design for all devices
- ⚡ Vue 3 Composition API
- 🎮 Interactive controls for pausing/resuming

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Project Structure

```
HandConnect-Vue/
├── src/
│   ├── App.vue              # Main component
│   ├── main.js              # Entry point
│   ├── assets/
│   │   └── styles.css       # Main styles
│   ├── components/          # Component directory (empty for now)
│   └── utils/
│       └── handTracking.js  # Hand tracking logic
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies
```

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **MediaPipe Hands** - Google's hand tracking solution
- **Vite** - Fast build tool and dev server
- **CSS Grid & Flexbox** - Modern responsive layout
- **CSS Animations** - Neon glow effects

## Browser Support

- Chrome/Firefox/Safari with camera access
- HTTPS required for camera permissions
- Modern JavaScript support required

## Usage

1. Grant camera permissions when prompted
2. Click "Start AR Experience" to begin
3. Show your hands to the camera
4. Use the control buttons to pause/reset the experience

## Customization

- Modify `src/assets/styles.css` for visual changes
- Update `src/App.vue` for UI modifications
- Adjust hand tracking in `src/utils/handTracking.js`

## License

MIT License - feel free to use and modify for your projects!