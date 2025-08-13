# Be There or Be Square

A fun, social "anti-flake" web app built with React, Vite, and Tailwind CSS. Never get flaked on again! Create events and let fate decide the punishment for flakes.

## 🚀 Features

- **Event Management**: Create, view, and manage events
- **Attendance Tracking**: Mark friends as attended or flaked
- **Decision Modes**: Vote, chance, game, or no group decision
- **Punishment System**: Predefined punishments for flakes
- **Social Sharing**: Share events on Twitter, Facebook, Instagram
- **Mobile-First Design**: Responsive design with 8px grid system
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router DOM
- **Icons**: Font Awesome 7 Pro
- **State Management**: React Hooks + localStorage
- **Code Quality**: ESLint + Prettier
- **Accessibility**: jsx-a11y ESLint plugin

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd be-there-or-be-square
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Accessible button component
│   ├── Icon.jsx        # Font Awesome icon wrapper
│   ├── Modal.jsx       # Custom modal with focus management
│   └── ErrorBoundary.jsx # Error handling component
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js # localStorage hook
│   └── useModal.js     # Modal state management
├── layouts/            # Layout components
│   └── MainLayout.jsx  # Main app layout
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── CreateEvent.jsx # Event creation form
│   ├── ViewEvent.jsx   # Event details and management
│   └── PastEvents.jsx  # Event history
├── services/           # Business logic
│   └── eventService.js # Event CRUD operations
├── utils/              # Utility functions
│   └── tokenParser.js  # Design token parser
├── styles/             # Additional styles
├── tokens.json         # Design tokens
└── index.css           # Global styles
```

## 🎨 Design System

The app uses a custom design system with:

- **8px Grid System**: Consistent spacing throughout
- **Custom Breakpoints**: Mobile-first responsive design
- **Design Tokens**: Colors, spacing, typography, radius, shadows
- **Component Library**: Reusable, accessible components

### Breakpoints
- `screen-xs`: 320-479px (4 columns, 16px margins)
- `screen-sm`: 480-767px (6 columns, 40px margins)
- `screen-md`: 768-1023px (12 columns, 80px margins)
- `screen-lg`: 1024-1199px (12 columns, 80px margins)
- `screen-xl`: 1200-1599px (12 columns, 80px margins)
- `screen-xxl`: 1600px+ (12 columns, 128px margins)

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant color ratios
- **Error Handling**: Clear error messages and recovery
- **Loading States**: Proper loading indicators

### Accessibility Checklist

- [x] Semantic HTML structure
- [x] Proper heading hierarchy (h1-h6)
- [x] ARIA labels and roles
- [x] Keyboard navigation support
- [x] Focus management
- [x] Screen reader compatibility
- [x] Color contrast compliance
- [x] Error message accessibility
- [x] Loading state indicators
- [x] Mobile accessibility

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Quality

The project uses ESLint with the following configurations:

- **React Best Practices**: React hooks rules and JSX guidelines
- **Accessibility**: jsx-a11y plugin for accessibility rules
- **Code Style**: Consistent code formatting and patterns
- **Error Prevention**: Common JavaScript pitfalls

### Best Practices

1. **Component Structure**
   - Use functional components with hooks
   - Implement proper prop validation
   - Follow single responsibility principle

2. **State Management**
   - Use React hooks for local state
   - Implement custom hooks for reusable logic
   - Use localStorage for persistence

3. **Error Handling**
   - Implement error boundaries
   - Provide user-friendly error messages
   - Log errors for debugging

4. **Performance**
   - Use React.memo for expensive components
   - Implement proper dependency arrays
   - Optimize re-renders

5. **Accessibility**
   - Use semantic HTML elements
   - Provide ARIA labels and roles
   - Ensure keyboard navigation
   - Test with screen readers

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create new event
- [ ] Add participants
- [ ] Mark attendance
- [ ] Complete event
- [ ] Cancel event
- [ ] View past events
- [ ] Share event
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   The built files are in the `dist` directory and can be deployed to any static hosting service.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure accessibility compliance
6. Submit a pull request

### Commit Message Format

```
type(scope): description

feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ and accessibility in mind**
