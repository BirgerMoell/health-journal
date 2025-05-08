# Personal Health Record AI - Next.js Version

A secure personal health record system with AI assistance, built with Next.js and Electron.

## Features

- Journal-based health recording
- AI-powered health insights using OpenAI
- Secure server-side API calls
- Voice recording and transcription
- Cross-platform compatibility (Web & Desktop)

## Tech Stack

- **Frontend**: Next.js, React, Framer Motion, TailwindCSS
- **API**: Next.js API Routes
- **AI Integration**: OpenAI API
- **Desktop**: Electron
- **Voice**: Web Speech API + OpenAI Whisper for transcription

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

### Development

#### Web Version

```
npm run dev
```

#### Desktop Version (Electron)

```
npm run electron-dev
```

### Building for Production

#### Web Version

```
npm run build
npm run start
```

#### Desktop Version

```
npm run electron-build
```

## Security

This application uses secure server-side API calls for OpenAI integration:

- Web version: API keys are securely stored in environment variables on the server
- Desktop version: API keys are stored securely in the system keychain

## Deployment

### Web Deployment (Vercel)

```
npm i -g vercel
vercel
```

### Desktop Distribution

Builds are created for:
- Windows (.exe installer)
- macOS (.dmg)
- Linux (.AppImage)

## License

MIT