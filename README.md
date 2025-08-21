# Happenin Mobile App

A React Native mobile application built with Expo for discovering and managing local events.

## Features

- **Authentication**: User login, registration, and profile management
- **Event Management**: Create, view, update, and delete events
- **Location Services**: Find events and locations near you
- **Search & Discovery**: Advanced search with filters and categories
- **Real-time Updates**: Live event updates and notifications
- **Dark Mode**: Theme switching with system preference support

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Hooks + Custom API Hooks
- **Maps**: React Native Maps
- **Styling**: React Native StyleSheet with theming
- **Type Safety**: TypeScript

## Project Structure

```
happenin-mobile/
├── app/                    # Expo Router app directory
│   ├── (tabs)/           # Tab navigation screens
│   ├── _layout.tsx       # Root layout
│   └── login.tsx         # Login screen
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── DarkModeToggle.tsx
│   ├── NativeMap.tsx
│   └── MapIcon.tsx
├── lib/                   # Core library code
│   └── api/              # API architecture
│       ├── types.ts       # TypeScript interfaces
│       ├── config.ts      # API configuration
│       ├── client.ts      # HTTP client
│       ├── services/      # API services
│       └── index.ts       # Main exports
├── hooks/                 # Custom React hooks
│   ├── useApi.ts         # API state management
│   └── useColorScheme.ts # Theme management
├── constants/             # App constants
└── assets/                # Images, fonts, etc.
```

## API Architecture

The app includes a comprehensive API architecture designed for scalability and maintainability:

### Core Components

- **`ApiClient`**: Centralized HTTP client with authentication, retry logic, and error handling
- **`AuthService`**: User authentication and profile management
- **`EventsService`**: Event CRUD operations and search
- **`LocationsService`**: Location data and geospatial queries

### Key Features

- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Error Handling**: Centralized error management with user-friendly messages
- **Authentication**: JWT token management with automatic refresh
- **Retry Logic**: Exponential backoff for failed requests
- **Rate Limiting**: Built-in request throttling
- **Environment Support**: Development, staging, and production configurations

### Usage Examples

#### Basic API Call
```typescript
import { eventsService } from '@/lib/api';

// Get upcoming events
const events = await eventsService.getUpcomingEvents();
```

#### Using Custom Hooks
```typescript
import { useApi } from '@/hooks/useApi';
import { eventsService } from '@/lib/api';

function EventList() {
  const { data, loading, error, execute } = useApi(eventsService.getUpcomingEvents);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <EventList events={data} />;
}
```

#### Search with Debouncing
```typescript
import { useSearchApi } from '@/hooks/useApi';
import { eventsService } from '@/lib/api';

function EventSearch() {
  const { query, search, loading, data } = useSearchApi(
    eventsService.searchEvents,
    500 // 500ms debounce
  );

  return (
    <SearchInput
      value={query}
      onChangeText={search}
      placeholder="Search events..."
    />
  );
}
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd happenin-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

### Environment Configuration

Create an `app.config.js` file in the root directory:

```javascript
export default {
  expo: {
    name: "Happenin",
    slug: "happenin-mobile",
    // ... other expo config
    extra: {
      apiUrl: process.env.API_URL || "https://api.happenin.com",
      environment: process.env.NODE_ENV || "development",
    },
  },
};
```

## Development

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use the provided theming system for consistent styling
- Implement proper error boundaries and loading states

### Adding New API Endpoints

1. **Define types** in `lib/api/types.ts`
2. **Add configuration** in `lib/api/config.ts`
3. **Implement service** in `lib/api/services/`
4. **Export** from `lib/api/index.ts`

### Testing

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## Deployment

### Building for Production

```bash
# Build for iOS
npx expo run:ios --configuration Release

# Build for Android
npx expo run:android --variant release
```

### App Store Deployment

1. Configure app signing in `app.json`
2. Build production version
3. Submit to App Store Connect / Google Play Console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions
