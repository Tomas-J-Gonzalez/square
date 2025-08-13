# Be there or be square

A fun, social web app that helps prevent flaking on plans by creating consequences for flakes. Create events and let your group decide who gets punished when someone flakes!

## Features

### Core Functionality
- **Create Events**: Set up events with custom punishments for flakes
- **Group Decision Making**: Choose between Vote, Random Chance, or Mini Game to decide on flakes
- **Track Flakes**: See who flaked and what happened to them
- **Event History**: View past events and flake statistics

### MVP Features
- **Event Creation**: Title, date, time, location, decision mode, and punishment selection
- **Decision Methods**:
  - **Vote**: Everyone votes on who flaked
  - **Chance**: Random selection decides
  - **Game**: Play a quick mini-game to decide
- **Punishment Options**: Buy coffee, pay for dinner, clean up, plan next event, or complete embarrassing tasks
- **Event Management**: View active events and join with invite links
- **History Tracking**: See past events with flake counts and outcomes

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router DOM
- **Icons**: Font Awesome 6
- **Code Quality**: ESLint + Prettier

## Design System

The app uses a comprehensive design system with:
- **8px Grid System**: Consistent spacing throughout the UI
- **Design Tokens**: Colors, typography, spacing, and shadows defined in `src/tokens.json`
- **Responsive Breakpoints**: 
  - `xs`: 320-479px (4 columns, 16px margins)
  - `sm`: 480-767px (6 columns, 40px margins)
  - `md`: 768-1023px (12 columns, 80px margins)
  - `lg`: 1024-1199px (12 columns, 80px margins)
  - `xl`: 1200-1599px (12 columns, 80px margins)
  - `xxl`: 1600px+ (12 columns, 128px margins)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Button component with variants
│   ├── Card.jsx        # Card container component
│   ├── Section.jsx     # Page section wrapper
│   └── Icon.jsx        # Font Awesome icon wrapper
├── pages/              # Page components
│   ├── Home.jsx        # Landing page with event cards
│   ├── CreateEvent.jsx # Event creation form
│   ├── ViewEvent.jsx   # Event details and interaction
│   └── PastEvents.jsx  # Event history and statistics
├── layouts/            # Layout components
│   └── MainLayout.jsx  # Global layout with navigation
├── utils/              # Utility functions
│   └── tokenParser.js  # Design token parser for Tailwind
├── assets/             # Static assets
└── tokens.json         # Design tokens source of truth
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Customization

### Design Tokens
All design values are defined in `src/tokens.json`. Update this file to change colors, spacing, typography, and other design elements throughout the app.

### Styling
The app uses Tailwind CSS with custom design tokens. All styling comes from the tokenized theme, ensuring consistency and easy updates.

## Development

### Adding New Components
1. Create component in `src/components/`
2. Use design tokens via Tailwind classes
3. Follow the 8px grid system for spacing
4. Ensure mobile-first responsive design

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Use `MainLayout` for consistent navigation
4. Follow the established design patterns

## License

MIT License - feel free to use this project for your own anti-flake initiatives!
