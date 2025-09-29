# Vibe Kanban

A modern Trello-style kanban board application built with React, TypeScript, and Supabase. Features smooth drag-and-drop functionality, real-time collaboration, and responsive design.

## Features

### ✅ Implemented Features
- 🎯 **Drag & Drop Interface**: Complete card and column drag-and-drop using @dnd-kit
- 🔄 **Real-time Collaboration**: Live updates using Supabase real-time subscriptions
- 📋 **Comprehensive Card Management**: Full CRUD operations with in-place editing
  - Card creation, editing, and deletion with modals
  - In-place editing for title, description, due date, and priority
  - Priority badges (P1, P2, P3) and status indicators
  - Card search functionality
- 📊 **Column Management**: Complete CRUD operations for columns (Phase 7 ✅)
  - Column creation, editing, and deletion with modals
  - Column reordering with drag-and-drop
  - Column position management
- 🎨 **Modern UI Design**: Clean, professional interface with consolidated header
- 📱 **Responsive Design**: Mobile-first responsive layout with accessibility
- ⚡ **Performance Optimizations**: React.memo, useMemo, useCallback optimizations
- 🎹 **Keyboard Navigation**: Global shortcuts and accessibility features
- 👆 **Touch Support**: Mobile-optimized drag-and-drop interactions
- 💾 **Data Persistence**: Supabase backend with Redux state management
- 🔧 **Modal System**: Complete modal system for card and column operations

### 📋 Planned Features
- 📤 **Import/Export**: JSON and CSV data management capabilities
- 👥 **User Assignment**: Card assignee functionality
- 🏷️ **Label System**: Advanced labeling and filtering
- 🔍 **Advanced Search**: Filter by labels, assignees, due dates
- 📊 **Analytics**: Board usage statistics and insights

## Technology Stack

- **Frontend**: React 19.1.1 with Vite 4.5.0
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **State Management**: Redux Toolkit 2.9.0
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **Backend**: Supabase (PostgreSQL, Real-time subscriptions, Auth)
- **Language**: TypeScript 5.9.2
- **Build Tool**: Vite with TypeScript compilation
- **Package Manager**: npm

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Supabase account and project
- Git (for submodule support)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vibe-kanban

# Initialize submodules (for shared Cursor rules)
git submodule update --init --recursive
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

**Option A: Use the setup script (Recommended)**
```bash
./setup-env.sh
```

**Option B: Manual setup**
1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your Supabase credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up MCP Configuration for Cursor integration:**
   
   Create a `.cursor/mcp.json` file in your project root:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=your_supabase_project_ref"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "your_supabase_personal_access_token"
         }
       }
     }
   }
   ```

4. **Find your Supabase credentials:**
   - **Project URL & Anon Key**: Supabase Dashboard → Project Settings → API
   - **Project Reference**: Supabase Dashboard → Project Settings → General → Reference ID
   - **Personal Access Token**: Supabase Dashboard → Account Settings → Access Tokens

### 4. Set up Supabase Database

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Database Schema

⚠️ **CRITICAL**: Real-time subscriptions require specific database configuration to work properly.

**Option A: Use the setup script (Recommended)**
```bash
./setup-database.sh
```

**Option B: Manual setup**
Run the complete schema file [`supabase-schema.sql`](supabase-schema.sql) in your Supabase SQL editor. This includes:

- All table definitions (boards, columns, cards, card_labels, card_assignees)
- Row Level Security policies
- **Required real-time publication settings** (CRITICAL for subscriptions):
  ```sql
  -- Enable Real-time for tables (REQUIRED for subscriptions)
  ALTER PUBLICATION supabase_realtime ADD TABLE boards;
  ALTER PUBLICATION supabase_realtime ADD TABLE columns;
  ALTER PUBLICATION supabase_realtime ADD TABLE cards;
  ALTER PUBLICATION supabase_realtime ADD TABLE card_labels;
  ALTER PUBLICATION supabase_realtime ADD TABLE card_assignees;
  ```
- Performance indexes

**⚠️ Important**: Without enabling real-time publication, subscription events will not propagate between instances, causing real-time collaboration to fail silently.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Real-time Features

### ✅ Implemented Real-time Subscriptions
The application includes comprehensive real-time functionality powered by Supabase:

- **Card Operations**: Live updates for card creation, editing, deletion, and moves
- **Column Changes**: Real-time column updates and reordering
- **Board Updates**: Live board name and setting changes
- **Optimistic Updates**: Immediate UI feedback with server reconciliation
- **Automatic Cleanup**: Subscriptions are properly managed and cleaned up

### Subscription Management
- **Smart Filtering**: Subscriptions filtered by board ID for optimal performance
- **Connection Management**: Automatic reconnection and error handling
- **Memory Efficient**: Proper cleanup prevents memory leaks
- **Debug Logging**: Comprehensive logging for development and debugging

### Testing Real-time Features
To test real-time functionality:
1. **Ensure real-time is enabled** (see Database Schema section above)
2. Open the application in multiple browser tabs
3. Make changes in one tab (create/edit/delete cards, reorder columns, etc.)
4. Observe live updates in other tabs
5. Check browser console for comprehensive subscription logging:
   - 🚀 SUBSCRIPTION: Setup and lifecycle events
   - 🔧 SUPABASE: Raw database events and channel status
   - 🔔 SUBSCRIPTION: Processed events sent to Redux
   - 📝 REDUX: State updates and reducer actions
   - 🐛 OPERATIONS: Database operations (create/delete success/failure)

### Troubleshooting Real-time Issues
If real-time collaboration isn't working:
1. **Check database configuration**: Ensure `ALTER PUBLICATION supabase_realtime ADD TABLE` commands were executed
2. **Verify console logs**: Look for subscription setup messages and event propagation
3. **Network inspection**: Check browser dev tools for WebSocket connections
4. **Subscription status**: Look for "SUBSCRIBED" status in console logs

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Modal, LoadingSpinner, ErrorBoundary, ModalProvider)
│   ├── board/        # Board component with consolidated header and search
│   ├── column/       # Column component with drag-and-drop support
│   └── card/         # Card components (Card, CardCreateModal, CardDeleteModal, CardDetailModal)
├── store/
│   ├── slices/       # Redux slices (board, column, card, label, ui)
│   ├── selectors.ts  # Comprehensive selectors for derived state
│   └── index.ts      # Store configuration
├── services/
│   └── supabase.ts   # Supabase client configuration
├── types/
│   └── index.ts      # TypeScript type definitions matching database schema
├── hooks/
│   ├── redux.ts      # Custom Redux hooks
│   └── useRealtimeSubscriptions.ts # Real-time subscription management
├── utils/
│   ├── debug.ts      # Debug logging utility
│   └── index.ts      # Utility functions
└── styles/
    └── globals.css   # Global styles with modern design system
```

## Development Guidelines

### Code Style

- Use TypeScript 5.9.2 for all code with strict type checking
- Follow React 19 functional component patterns with hooks
- Use Redux Toolkit 2.9.0 for centralized state management
- Implement proper error boundaries and error handling
- Write accessible components with ARIA labels and keyboard navigation

### Cursor AI Rules

This project uses shared Cursor AI rules managed via Git submodules for consistent development practices. The rules are stored in a separate repository and linked to this project.

**Setup**: Rules are automatically available when you clone with submodules (see Getting Started section above).

**Available Rules**:
- `modern-web-development.mdc` - Comprehensive web development guidelines
- `github-operations.mdc` - GitHub workflow and issue management
- `react-nextjs.mdc` - React and Next.js specific rules
- `git-branching.mdc` - Git branching strategy and conventions

**Documentation**: See [`CURSOR_RULES_SETUP.md`](CURSOR_RULES_SETUP.md) for detailed setup instructions and usage.

### Component Structure

- Break down components into smaller, reusable parts
- Use custom hooks for complex logic (useRealtimeSubscriptions, redux hooks)
- Implement proper prop typing with TypeScript interfaces
- Follow the container/presentational component pattern
- Use React.memo for performance optimization

### State Management

- Use Redux Toolkit slices for organized state (board, column, card, label, ui)
- Implement optimistic updates for better UX
- Handle loading and error states properly
- Use comprehensive selectors for derived state
- Implement real-time subscriptions with proper cleanup

## Security Considerations

### Environment Variables
- **Never commit `.env` files to git** - they contain sensitive credentials
- The `.env` file is already added to `.gitignore` for your protection
- Use `env.example` as a template for other developers

### Supabase MCP Integration
- The MCP server is configured with `--read-only` flag for safety
- MCP configuration is stored in `.cursor/mcp.json` (not in `.env`)
- Use personal access tokens with minimal required permissions
- Consider using service role keys only in secure environments
- Review Supabase's security best practices for LLM integrations

### General Security
- Implement Row Level Security (RLS) policies in your database
- Use proper authentication and authorization
- Validate all user inputs
- Keep dependencies updated

## Contributing

### Branch Strategy
- **`main`**: Production-ready code, stable releases
- **`development`**: Integration branch for ongoing development (current branch)
- **`feature/*`**: Feature branches for new functionality
- **`fix/*`**: Bug fix branches for issues and problems

### Development Workflow
1. Create a feature branch from `development` (`git checkout -b feature/phase-X-description`)
2. Make your changes and commit with conventional commit messages
3. Push to your feature branch (`git push origin feature/phase-X-description`)
4. Open a Pull Request to `development` branch
5. After review and testing, merge to `development`
6. When ready for release, merge `development` to `main`

### Current Development Status
- **Current Branch**: `development`
- **Current Phase**: Phase 7 - Column Management ✅
- **Last Updated**: January 2025
- **Recent Updates**: Added shared Cursor AI rules via Git submodules

### Getting Started for Development
```bash
# Clone the repository with submodules
git clone --recurse-submodules <repository-url>
cd vibe-kanban

# Switch to development branch
git checkout development

# Create your feature branch
git checkout -b feature/your-feature-name

# Make changes, commit, and push
git add .
git commit -m "feat: Add your feature"
git push origin feature/your-feature-name
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/your-repo/vibe-kanban/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## Project Status & Roadmap

### ✅ Completed (Phases 1-6)
- [x] **Project Setup**: Vite + React + TypeScript + Tailwind CSS
- [x] **Database Schema**: Complete Supabase schema with RLS policies
- [x] **Redux Store**: Complete store setup with all slices
- [x] **Core Components**: Board, Column, Card, Modal system
- [x] **Drag & Drop**: Complete card and column drag-and-drop functionality
- [x] **Card Management**: Full CRUD operations with in-place editing
- [x] **Real-time Features**: Supabase real-time subscriptions
- [x] **Modern UI**: Priority badges, status indicators, responsive design
- [x] **Search Functionality**: Card search with real-time filtering

### ✅ Recently Completed (Phase 7)
- [x] **Column Management**: Complete CRUD operations for columns
  - [x] Add new column functionality with modal
  - [x] Column name editing with modal
  - [x] Column deletion with confirmation modal
  - [x] Column reordering with drag-and-drop
  - [x] Column position persistence to database

### 🔧 Bug Fixes & Improvements
- [x] **Real-time Subscription Fix**: Enabled Supabase real-time publication
- [x] **Comprehensive Logging**: Added debug logging for subscription troubleshooting
- [x] **Performance Optimizations**: React.memo, useMemo, useCallback
- [x] **Accessibility**: Keyboard navigation and ARIA attributes
- [x] **Mobile Support**: Touch-optimized drag-and-drop interactions

### 📋 Upcoming Features (Phases 8+)
- [ ] **Label System**: Advanced labeling and color coding
- [ ] **User Assignment**: Card assignee functionality
- [ ] **Import/Export**: JSON and CSV data management
- [ ] **Advanced Search**: Filter by labels, assignees, due dates
- [ ] **Multiple Board Support**: Multi-board management
- [ ] **User Authentication**: Supabase Auth integration
- [ ] **Board Templates**: Pre-configured board layouts
- [ ] **Analytics**: Usage statistics and insights
- [ ] **Mobile App**: Native mobile applications
- [ ] **API Access**: Public API for integrations

---

Built with ❤️ using React, TypeScript, and Supabase
