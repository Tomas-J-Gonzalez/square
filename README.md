# Anti-Flake

A fun social web app to prevent flaking on plans! Create events and let fate decide who gets punished when someone flakes.

## Features

- **Event Creation**: Set up events with custom punishments and decision modes
- **Multiple Decision Modes**: Vote, chance (roulette), or game-based decisions
- **Real-time Participation**: Add participants and vote in real-time
- **Event History**: Track past events and flake counts
- **Mobile-First Design**: Responsive design that works on all devices
- **Design Token Integration**: Automatic mapping of design tokens from `src/tokens.json` to Tailwind CSS theme

## Project Structure

```
anti-flake-app/
├── src/
│   ├── tokens.json              # Design tokens
│   ├── utils/
│   │   └── tokenParser.js       # Token parsing utility
│   ├── components/
│   │   ├── Button.jsx           # Button component
│   │   ├── Card.jsx             # Card component
│   │   ├── Section.jsx          # Section component
│   │   └── Icon.jsx             # Font Awesome icon component
│   ├── layouts/
│   │   └── MainLayout.jsx       # Main layout with header
│   ├── pages/
│   │   ├── Home.jsx             # Home page with three main cards
│   │   ├── CreateEvent.jsx      # Event creation form
│   │   ├── ViewEvent.jsx        # Event details and decision interface
│   │   └── PastEvents.jsx       # Past events history
│   ├── App.jsx                  # Main application with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind CSS imports
├── assets/
│   ├── logo.png                 # Application logo
│   └── favicon.jpg              # Favicon
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
└── index.html                   # HTML entry point
```

## Core Functionality

### Create Event
- Event title, date, time, and optional location
- Decision mode selection (vote, chance, game)
- Punishment selection from preset list
- Form validation and submission

### View/Join Event
- Event details and participant management
- Decision interface based on mode:
  - **Vote**: Radio button voting for participants
  - **Chance**: Roulette wheel animation (placeholder)
  - **Game**: Simple game interface (placeholder)
- Real-time participant updates
- Social sharing options

### Past Events
- Chronological list of completed events
- Filter by decision mode (vote, chance, game)
- Event results with winner/loser and punishment
- Flake count tracking

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier

## MVP Features

### Phase 1 (Current)
- ✅ Basic event creation and management
- ✅ Simple decision mechanisms (vote, random, basic game)
- ✅ Preset punishment list
- ✅ Anonymous user sessions
- ✅ Basic social sharing
- ✅ Mobile-first responsive design

### Phase 2 (Future)
- User accounts and authentication
- Custom punishments
- Advanced games (multiple options)
- Event templates
- Recurring events
- Push notifications
- Advanced analytics

### Phase 3 (Future)
- Social features (friends, groups)
- Advanced animations and effects
- Integration with calendar apps
- API for third-party integrations
- Advanced punishment tracking
- Gamification elements

## Design System

### 8px Grid System
The project uses an 8px grid system for consistent spacing:
- All spacing values are multiples of 8px
- Responsive breakpoints: xs (320px), sm (480px), md (768px), lg (1024px), xl (1200px), xxl (1600px)
- Container margins and gutters follow the grid system

### Design Tokens
The design system is driven by tokens defined in `src/tokens.json`:
- **Colors**: Brand colors, semantic colors, and content colors
- **Spacing**: 8px grid-based spacing scale
- **Typography**: Font families, sizes, weights, and line heights
- **Border Radius**: Consistent border radius values
- **Shadows**: Box shadow definitions

### Components
- **Button**: Primary, secondary, and disabled variants with different sizes
- **Card**: Container component with consistent styling
- **Section**: Page section with responsive padding and max-width
- **Icon**: Font Awesome icon component with size variants

## How It Works

### Token Parsing
The `src/utils/tokenParser.js` file automatically reads your design tokens and converts them to Tailwind-compatible format:

- **Colors**: Extracted from nested color objects and mapped to semantic names
- **Spacing**: Extracted from dimensions and space values
- **Typography**: Font families, sizes, weights, line heights, and letter spacing
- **Border Radius**: Border radius values
- **Shadows**: Shadow definitions with x, y, blur, spread, and color

### Tailwind Integration
The `tailwind.config.js` file uses the token parser to extend Tailwind's theme:

```javascript
import { parseTokens } from './src/utils/tokenParser.js';

export default {
  theme: {
    extend: {
      ...parseTokens(),
      // Additional customizations
    },
  },
}
```

### Component Usage
Components can use the generated Tailwind classes directly:

```jsx
<button className="bg-background-brand-brand-primary text-content-knockout p-24 rounded-full">
  Create Event
</button>
```

## Design Token Updates

When you update tokens in `src/tokens.json`, the changes automatically propagate to your components:

1. **No manual CSS changes required**
2. **No component code changes needed**
3. **Hot reload updates the design instantly**

## Customization

### Updating Design Tokens
To update the design system, modify `src/tokens.json`. The changes will automatically be reflected in the UI without requiring code changes.

### Adding New Components
Create new components in `src/components/` and use the existing design tokens through Tailwind classes.

### Styling Guidelines
- Use design tokens through Tailwind classes (e.g., `bg-background-brand-brand-primary`)
- Follow the 8px grid system for spacing
- Use responsive breakpoints for mobile-first design
- Maintain consistency with existing component patterns

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Adding Dependencies

```bash
npm install package-name
```

## Production Deployment

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. The design tokens will be compiled into the final CSS

## License

MIT License - feel free to use this project as a starting point for your own anti-flake app!
