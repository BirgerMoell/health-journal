# HealthJournal AI - Your Personal Health Companion

![HealthJournal AI](app.png)

## Overview

HealthJournal AI is a comprehensive health tracking platform that combines the power of journaling with artificial intelligence to provide personalized health insights. The application helps users maintain detailed health records, track symptoms, and receive AI-powered recommendations for better health management.

## Key Features

### 1. Smart Health Journaling
- **Text & Voice Entries**: Create journal entries through text or voice recording
- **Mood Tracking**: Log your daily mood and emotional state
- **Symptom Tracking**: Record and monitor health symptoms over time
- **Template-Based Entries**: Choose from various templates:
  - General Health Check-in
  - Symptom Tracker
  - Medication Log
  - Wellness Activities
  - Mental Health Check-in

### 2. AI-Powered Health Insights
- **Personalized Analysis**: Get AI-generated insights based on your journal entries
- **Pattern Recognition**: Identify health trends and patterns over time
- **Healthcare Specialist Perspectives**: Receive insights from different medical viewpoints
- **Real-time Feedback**: Immediate AI responses to your health updates

### 3. Security & Privacy
- **Encrypted Storage**: Industry-standard encryption for all health data
- **Secure Authentication**: Robust user authentication via Supabase
- **Private by Design**: Your health data remains private and secure

### 4. Cross-Platform Support
- Web Application (Next.js)
- Mobile App (React Native/Expo)
- Desktop App (Electron)

## Technical Stack

### Frontend
- **Web**: Next.js with TypeScript
- **Mobile**: React Native with Expo
- **Desktop**: Electron
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Backend & Services
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI API
- **Voice Processing**: OpenAI Whisper API

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/health-journal.git
cd health-journal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase and OpenAI API credentials.

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Mobile App Setup (React Native)

1. Install Expo CLI:
```bash
npm install -g expo-cli
```

2. Navigate to the mobile app directory:
```bash
cd app/health-journal
```

3. Install dependencies:
```bash
npm install
```

4. Start the Expo development server:
```bash
expo start
```

## Running the Application

### Web Version (Next.js)

1. Navigate to the Next.js app directory:
```bash
cd app/personal-health-record-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Mobile Version (React Native/Expo)

1. Navigate to the React Native app directory:
```bash
cd app/health-journal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Configure your `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. Start the Expo development server:
```bash
npx expo start
```

5. Run on different platforms:
   - Press `i` to run on iOS simulator
   - Press `a` to run on Android emulator
   - Scan QR code with Expo Go app on your device

### Desktop Version (Electron)

1. Navigate to the Electron app directory:
```bash
cd app/personal-health-record-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Configure your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run in development mode:
```bash
npm run electron-dev
# or
yarn electron-dev
```

5. Build the application:
```bash
# For macOS
npm run build:mac
# For Windows
npm run build:win
# For Linux
npm run build:linux
```

The built applications will be available in the `dist` directory.

### Development Tips

- **Hot Reloading**: All versions support hot reloading in development mode
- **Debugging**:
  - Web: Use browser developer tools
  - Mobile: Use React Native Debugger or Chrome Developer Tools
  - Desktop: Use Electron Developer Tools (Toggle with Cmd/Ctrl + Shift + I)
- **Environment**: Make sure all required environment variables are set before running any version

### Common Issues

1. **Port Conflicts**: If port 3000 is in use:
   - Web: Use `PORT=3001 npm run dev`
   - Mobile: Choose a different port when prompted
   - Desktop: Configure port in electron.js

2. **Dependencies Issues**:
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

3. **Mobile Device Connection**:
   - Ensure device and development machine are on the same network
   - Use tunnel connection if network issues persist: `expo start --tunnel`

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Supabase for the backend infrastructure
- The open-source community for various tools and libraries used in this project

## Support

For support, please open an issue in the GitHub repository or contact our support team at support@healthjournal-ai.com.
