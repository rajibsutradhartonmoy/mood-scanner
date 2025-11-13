# Mood Scanner

A browser-based app that uses your webcam to detect facial expressions, estimate mood, and provide live feedback. Optionally, AI (Gemini) can summarize mood in natural language.

## Features

- **Real-time Facial Detection**: Uses MediaPipe's Face Landmarker for accurate facial landmark detection
- **Emotion Analysis**: Analyzes 7 different emotions (Happy, Sad, Angry, Surprised, Neutral, Fearful, Disgusted)
- **Live Feedback**: See your mood analysis in real-time with confidence scores
- **Expression Breakdown**: Visual breakdown of all detected emotions
- **AI Mood Summaries**: Optional integration with Google Gemini AI for natural language mood descriptions
- **Privacy First**: All processing happens locally in your browser - your video never leaves your device

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **MediaPipe Tasks Vision** - Facial landmark detection
- **Google Gemini AI** - Natural language mood summaries (optional)

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:5173`

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Usage

1. **Start Scanning**: Click the "Start Scanning" button to activate your webcam
2. **Grant Permissions**: Allow browser access to your camera when prompted
3. **View Real-time Analysis**: See your mood detected in real-time with confidence scores
4. **Optional AI Summary**:
   - Click "Setup Gemini AI" to configure the AI mood summarizer
   - Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Enter your API key and click "Generate AI Summary" for natural language mood descriptions

## Privacy & Security

- All facial detection and analysis happens locally in your browser
- Your webcam feed never leaves your device
- The Gemini AI integration (optional) only sends emotion data, not video or images
- Your API key is stored only in your browser session

## Browser Compatibility

Requires a modern browser with support for:
- WebRTC (getUserMedia)
- WebAssembly
- ES6+

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
