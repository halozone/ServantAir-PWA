# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ServantAir is an aviation booking and resource management system built as a Progressive Web Application (PWA). It's designed for flight schools, flying clubs, and FBOs to manage aircraft bookings, pilot certifications, resource scheduling, and compliance tracking.

**IMPORTANT: These HTML files are UI design prototypes only.** The complete application requirements and specifications are detailed in `Docs/PRD Servant Air App.txt`. These files demonstrate the visual design and user interface patterns but will require full backend integration and functionality implementation.

- **Project Type**: Full Stack Aviation Management Web Application
- **Development Phase**: UI Prototype → Production Implementation

## Visual Development & Design Review

### Design Principles
- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual changes, always refer to these files for guidance

### Quick Visual Check Protocol
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate`
3. **Verify design compliance** - Compare against design principles and style guide
4. **Validate feature implementation** - Ensure change fulfills user request
5. **Check acceptance criteria** - Review context files/requirements
6. **Capture evidence** - Take full page screenshot at 1440px viewport
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

### Available MCP Tools

**Playwright MCP**: Browser automation and testing
- `mcp__playwright__browser_navigate` - Navigate to web pages
- `mcp__playwright__browser_console_messages` - Check console errors
- `mcp__playwright__screenshot` - Take screenshots
- `mcp__playwright__click` - Click elements
- `mcp__playwright__type` - Type text into inputs

**Superdesign MCP**: Design generation and file operations
- Generate UI designs, wireframes, components, logos, and SVG icons
- File system operations and shell commands
- Automatic design organization with HTML gallery

**shadcn/ui MCP**: Component library integration
- Browse and search shadcn/ui components
- Install components with natural language
- Access component documentation and demos
- Multi-framework support (React, Svelte, Vue)

**Firecrawl MCP**: Web scraping and content extraction
- Web page scraping and crawling
- Content extraction and processing
- Batch processing capabilities
- **Requires**: `FIRECRAWL_API_KEY` environment variable

**Figma MCP**: Design file integration
- Access Figma design files and components
- Extract design tokens and assets
- Design-to-code workflow integration
- **Requires**: `FIGMA_ACCESS_TOKEN` environment variable

## Current State - UI Prototypes

These HTML files are **design prototypes** demonstrating the intended user interface and user experience. Current characteristics:

- **Pure HTML/CSS/JavaScript** - Static prototypes with no backend connectivity
- **Self-contained pages** - Each HTML file includes its own CSS and JavaScript inline
- **Mobile-first responsive design** - Hamburger navigation (mobile) and sidebar (desktop)
- **Mock data** - All data is hardcoded JavaScript objects and arrays for demonstration
- **Interactive UI elements** - Forms, modals, and interactions work for demonstration purposes

## Production Architecture (Per PRD)

The final application will implement:

### Frontend Stack
- **Next.js with TypeScript** - React framework with server-side rendering and TypeScript for type safety
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - Modern React component library built on Radix primitives
- **Radix UI** - Unstyled, accessible components for complex UI patterns
- **Icons**: Material Symbols, Hero Icons, Lucide React icons
- **Framer Motion** - Production-ready motion library for animations
- **Typography**: Sans serif fonts (Inter, Geist, Manrope)
- **Advanced calendar system** with drag-and-drop functionality

### Backend & Infrastructure
- **Firebase backend** (Cloud Functions, Firestore, Authentication)
- **Real-time features** with WebSocket connections
- **Payment integration** (Stripe, PayPal, Zelle)
- **Google Calendar API** for one-way sync
- **n8n workflow automation** for post-flight processing
- **Progressive Web App** capabilities with offline support

## Key Pages and Their Functions

| File | Purpose | Key Features |
|------|---------|--------------|
| `login.html` | Authentication entry point | Google OAuth integration interface, mobile-first design |
| `dashboard.html` | Pilot dashboard | Flight statistics, recent activity, weather widget |
| `dashboard-admin.html` | Admin system overview | System metrics, user management, admin controls |
| `calendar.html` | Flight booking interface | Drag-and-drop scheduling, conflict detection, resource filtering |
| `aircraft.html` | Fleet management | Aircraft cards, maintenance tracking, compliance status |
| `profile.html` | Pilot profile management | Certifications, currency tracking, flight history |
| `membership.html` | Member directory | Member cards, search/filter, membership tiers |
| `messages.html` | Internal messaging | Real-time communication, role-based filtering |
| `payments.html` | Financial management | Payment methods, transaction history, billing |
| `roles.html` | Role-based access control | Permission matrix, role creation/editing |
| `settings.html` | System configuration | Branding customization, system settings, live preview |

## Design System

### CSS Architecture
- **CSS Custom Properties** for theming: `--primary-color`, `--secondary-color`, etc.
- **Inline styles** - All CSS embedded in `<style>` tags within each HTML file
- **Consistent navigation** - Identical sidebar structure across all pages
- **Mobile-first breakpoints** - 768px (tablet/desktop), 480px (mobile)

### Color Scheme (Carolina Sky Blue)
```css
:root {
    --primary-color: #56B4E9;
    --secondary-color: #4A90E2;
    --success-color: #48bb78;
    --warning-color: #ed8936;
    --danger-color: #e53e3e;
}
```

### Common UI Patterns
- **Cards** - Consistent card design with shadows and hover effects
- **Modals** - Centered modals with backdrop for forms and details
- **Status badges** - Color-coded indicators for various states
- **Gradient backgrounds** - Linear gradients for headers and key elements

## Development Workflow

### Working with UI Prototypes
1. **Edit HTML files directly** - No compilation or build process needed for prototypes
2. **Test in browser** - Open HTML files directly in browser for UI testing
3. **CSS changes** - Update inline styles within each file's `<style>` tags
4. **JavaScript changes** - Modify inline scripts for UI interactions
5. **Cross-page consistency** - Manually ensure navigation and styling stays consistent

### Implementation Planning
- **Reference the PRD** (`Docs/PRD Servant Air App.txt`) for complete functional requirements
- **Use prototypes as design reference** - These files define the visual design and UX patterns
- **Migrate to Next.js/TypeScript** - Convert HTML prototypes to Next.js components with TypeScript
- **Implement Tailwind CSS styling** - Replace inline CSS with Tailwind utility classes
- **Integrate shadcn/ui components** - Use modern component library for complex UI elements
- **Plan backend integration** - Current UI elements will need to connect to Firebase services
- **Implement real functionality** - Replace mock data and static interactions with dynamic features

### Code Quality Standards
- Follow established coding conventions in the project
- Run linting and type checking before commits
- Ensure all tests pass before deployment
- Follow security best practices (no hardcoded secrets)

### Commands to Run
```bash
# Development
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checking

# Styling
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch
npx shadcn-ui@latest add [component]  # Add shadcn/ui components

# Database (if applicable)
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data

# Deployment
npm run deploy       # Deploy to production
```

### Code Patterns

#### Adding New Pages
- Copy navigation structure from existing page
- Include consistent CSS custom properties in `:root`
- Maintain mobile-first responsive design
- Follow established naming conventions for CSS classes

#### Modal Implementation
```javascript
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
```

#### Form Validation Pattern
- Use `preventDefault()` on form submissions
- Implement client-side validation
- Show success/error states with CSS classes

### Responsive Design Guidelines
- **Mobile first** - Start with mobile styles, enhance for larger screens
- **Breakpoints** - Use 768px for tablet/desktop transition
- **Navigation** - Hamburger menu for mobile, persistent sidebar for desktop
- **Touch targets** - Ensure 44px minimum touch targets for mobile

## Aviation-Specific Features

### Compliance Tracking
- Aircraft certifications (Annual, 100-hour, Transponder, etc.)
- Pilot currency (BFR, Medical, Night currency, Instrument currency)
- Color-coded status indicators (Green/Amber/Red)

### Role-Based Access
- **Admin** - Full system access
- **FlightLine Manager** - Aircraft and maintenance oversight  
- **Mechanic** - Aircraft status and maintenance logs
- **Treasurer** - Financial oversight and payment management
- **Pilot/Student/Instructor** - Booking and member directory access

### Booking System
- Drag-and-drop calendar interface
- Resource filtering (aircraft, instructors, facilities)
- Conflict detection and prevention
- Multi-resource booking (aircraft + instructor combinations)

## Data Structure Notes

### Mock Data Patterns
- **Aircraft objects** include: tail number, type, rates, compliance dates
- **User objects** include: name, role, certifications, currency status
- **Booking objects** include: datetime, resources, participants, type
- **All data** is currently hardcoded in JavaScript arrays/objects

### localStorage Usage
- Settings persistence in `settings.html`
- Branding customization storage
- User preferences (theme, view defaults)

## Testing and Deployment

### Testing Strategy
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows using Playwright MCP
- **Visual Tests**: Verify UI consistency across devices using screenshot tools

### Local Testing
- Open HTML files directly in browser
- Test responsive design using browser developer tools
- Verify mobile navigation and touch interactions
- Use MCP tools for automated visual testing

### Deployment
- Copy all HTML files to web server
- No build process required for prototypes
- Ensure proper MIME types for static files
- Consider adding service worker for PWA capabilities

## Performance Standards

### Frontend Performance
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

### Backend Performance (Future)
- API response times < 200ms for GET requests
- API response times < 500ms for POST/PUT requests
- Database query optimization
- Caching strategy implementation

## Security & Accessibility

### Security Checklist
- [ ] Input validation and sanitization
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure authentication handling
- [ ] Environment variable protection
- [ ] Rate limiting (backend)
- [ ] SQL injection prevention (backend)

### WCAG 2.1 AA Compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Alternative text for images
- [ ] Semantic HTML structure
- [ ] Focus management
- [ ] Error message accessibility

## Important Considerations

### Code Duplication
- Navigation HTML is duplicated across all files
- CSS styles are repeated in each file
- Consider refactoring to shared components when migrating to Next.js

### Prototype to Production Transition
- **UI patterns established** - Visual design and user experience defined
- **Component structure identified** - Clear page organization and navigation patterns
- **Integration points mapped** - Forms, modals, and data displays ready for backend connection
- **Design system documented** - Color schemes, typography, and component patterns established
- **Responsive design validated** - Mobile-first approach tested across devices

### Frontend Framework Migration Requirements
- **Next.js Implementation** - Convert HTML prototypes to Next.js pages and components
- **TypeScript Integration** - Add type safety to all components and data structures
- **Tailwind CSS Migration** - Replace inline CSS with Tailwind utility classes
- **shadcn/ui Component Integration** - Implement modern React components for complex UI patterns
- **Framer Motion Animations** - Add smooth transitions and interactive animations
- **Icon Library Setup** - Configure Material Symbols, Hero Icons, and Lucide icons
- **Typography System** - Implement Inter, Geist, or Manrope font families

### Backend Integration Requirements (Per PRD)
- **Firebase Authentication** - Google OAuth implementation needed
- **Firestore Database** - Data persistence for all entities (users, aircraft, bookings, etc.)
- **Real-time Updates** - WebSocket/Firebase real-time listeners for calendar and messaging
- **Payment Processing** - Stripe, PayPal, and Zelle integration
- **Email Services** - Firebase email for notifications and confirmations
- **Calendar Integration** - Google Calendar API for one-way sync
- **n8n Workflows** - Post-flight automation and data processing

### Browser Compatibility
- Uses modern CSS (Grid, Flexbox, Custom Properties)
- ES6+ JavaScript features
- Progressive Web App features implemented
- Requires modern browser support (IE11 not supported)

## Context Files

### Required Context Files
Create these files in the `/context/` directory:

1. **design-principles.md** - Core design guidelines and aviation-specific UI principles
2. **style-guide.md** - Brand colors, typography, spacing standards for ServantAir
3. **api-documentation.md** - Future API endpoint documentation for Firebase integration
4. **user-personas.md** - Aviation user profiles (pilots, instructors, mechanics, admins)
5. **technical-requirements.md** - Performance, security, and aviation compliance requirements

### Design System Components
- Color palette (Carolina Sky Blue theme with aviation-appropriate semantics)
- Typography scale and font families (professional, readable)
- Spacing units and grid system
- Component library documentation
- Aviation-specific accessibility guidelines

## Project Design Notes

- These files are used for UI design only, and will be later integrated with all functionality. The PRD for the complete app is found under `Docs/PRD Servant Air App.txt`
- Focus on aviation industry best practices for safety, compliance, and user experience
- Prioritize mobile-first design for field use by pilots and line personnel
- Implement robust error handling and offline capabilities for flight operations