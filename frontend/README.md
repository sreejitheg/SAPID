# SAPID - AI-Powered Assistant

SAPID is a modern web application that provides AI-powered document analysis, chat functionality, and task automation through a clean, professional interface.

## Features

- **Unified Chat Interface**: Real-time streaming responses with document integration
- **Document Management**: Upload, view, and manage permanent and temporary documents
- **Conversation Management**: Multiple chat sessions with individual document contexts
- **Settings Management**: Configurable options for web search, demo mode, and themes
- **Responsive Design**: Optimized for both desktop and mobile experiences
- **Demo Mode**: Full functionality testing with mock data

## Development

```bash
npm install
npm run dev
```

## Backend Integration

The application expects a backend server running on `localhost:8000` with the following API endpoints. See `src/api/endpoints.md` for detailed API specifications.

## Demo Mode

Demo mode provides full functionality testing without requiring backend integration. Demo data includes:
- Sample conversations with streaming responses
- Mock document uploads and management
- PDF viewing demonstrations
- Form filling examples
- All API touchpoints simulated

## Project Structure

```
src/
├── api/                 # API service and endpoint definitions
├── components/          # React components
├── demo/               # Demo data and mock services
├── hooks/              # Custom React hooks
├── services/           # Application services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```