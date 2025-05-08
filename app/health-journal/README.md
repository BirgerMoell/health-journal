# Health Journal App

A React Native mobile application for health journaling with AI-powered insights, voice recording transcription, and secure authentication.

## Features

- **User Authentication**: Secure sign-up, login, and account management via Supabase
- **Journal Entries**: Create, view, edit, and delete health journal entries
- **Voice Recording**: Record your journal entries using your device's microphone
- **Speech-to-Text**: Transcribe voice recordings using OpenAI's Whisper API
- **AI Insights**: Get personalized insights and recommendations using OpenAI's GPT
- **Tagging System**: Categorize and organize your journal entries with tags
- **User-friendly Interface**: Clean, intuitive UI designed for daily use

## Tech Stack

- **React Native**: Cross-platform mobile app development
- **Expo**: Simplified React Native development workflow
- **TypeScript**: Type-safe JavaScript
- **Supabase**: Backend-as-a-Service for authentication and database
- **OpenAI API**: AI integration for transcription and insights
- **React Navigation**: Navigation library for React Native
- **React Query**: Data fetching and state management
- **Expo AV**: Audio recording and playback
- **Expo Secure Store**: Secure storage for sensitive information

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional for local development)

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd health-journal
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```
npx expo start
```

## Project Structure

```
health-journal/
├── assets/              # Static assets (images, fonts)
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── context/         # React Context providers
│   ├── services/        # API and external services
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── constants/       # Constants and configuration
│   └── types/           # TypeScript type definitions
├── App.tsx              # Main app component
├── app.json             # Expo configuration
└── babel.config.js      # Babel configuration
```

## Supabase Setup

The app requires a Supabase project with the following tables:

### journal_entries
- id (uuid, primary key)
- created_at (timestamp)
- user_id (uuid, foreign key to auth.users)
- text (text)
- ai_response (text, nullable)
- mood (text, nullable)
- tags (array, nullable)

## OpenAI Integration

The app uses OpenAI APIs for:
1. **Whisper API**: Transcribing voice recordings to text
2. **GPT API**: Generating personalized insights based on journal entries

## Running on Physical Devices

1. Install the Expo Go app on your iOS or Android device
2. Connect to the same wireless network as your computer
3. Scan the QR code from the Expo development server

## Building for Production

### Android
```
eas build -p android --profile preview
```

### iOS
```
eas build -p ios --profile preview
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Expo team for the amazing React Native toolkit
- Supabase for the backend infrastructure
- OpenAI for the AI capabilities