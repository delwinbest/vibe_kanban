# Vibe Kanban

A modern Trello-style kanban board application built with React, TypeScript, and Supabase. Features smooth drag-and-drop functionality, real-time collaboration, and responsive design.

## Features

- 🎯 **Drag & Drop Interface**: Smooth card movement between columns using @dnd-kit
- 🔄 **Real-time Collaboration**: Live updates using Supabase real-time subscriptions ✅
- 📋 **Comprehensive Card Management**: Cards with titles, descriptions, due dates, labels, priorities, and assignees
- 📊 **Column Management**: Add, rename, delete, and reorder columns
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 💾 **Data Persistence**: Auto-save with Supabase backend and offline support
- 📤 **Import/Export**: JSON and CSV data management capabilities
- 🎨 **Modern UI Design**: Clean, professional interface with priority badges (P1, P2, P3) and status indicators
- 🔧 **Consolidated Header**: Single header with all board management functionality

## Technology Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Drag & Drop**: @dnd-kit packages
- **Backend**: Supabase (Database, Real-time, Auth)
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Supabase account and project

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vibe-kanban
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

Run the following SQL in your Supabase SQL editor:

```sql
-- Create boards table
CREATE TABLE boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create columns table
CREATE TABLE columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_labels table
CREATE TABLE card_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_assignees table
CREATE TABLE card_assignees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_assignees ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Allow all operations for authenticated users" ON boards
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON columns
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON cards
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON card_labels
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON card_assignees
  FOR ALL USING (true);
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Real-time Features

### Real-time Subscriptions
The application includes comprehensive real-time functionality powered by Supabase:

- **Board Changes**: Live updates when board names or settings change
- **Column Management**: Real-time column creation, updates, and deletion
- **Card Operations**: Instant updates for card moves, edits, and status changes
- **Automatic Cleanup**: Subscriptions are properly managed and cleaned up on component unmount

### Subscription Management
- **Smart Filtering**: Subscriptions are filtered by board ID for optimal performance
- **Connection Management**: Automatic reconnection and error handling
- **Memory Efficient**: Proper cleanup prevents memory leaks
- **Debug Logging**: Console logs help track subscription status and changes

### Testing Real-time Features
To test real-time functionality:
1. Open the application in multiple browser tabs
2. Make changes in one tab (edit cards, move items, etc.)
3. Observe live updates in other tabs
4. Check browser console for subscription logs

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
│   ├── ui/           # Reusable UI components (Header, Modal, LoadingSpinner, ErrorBoundary)
│   ├── board/        # Board-related components
│   ├── column/       # Column components ✅
│   └── card/         # Card components ✅
├── store/
│   ├── slices/       # Redux slices (board, column, card, ui)
│   └── index.ts      # Store configuration
├── services/
│   └── supabase.ts   # Supabase client with real-time subscriptions
├── types/
│   └── index.ts      # TypeScript type definitions
├── hooks/
│   ├── redux.ts      # Custom Redux hooks
│   └── useRealtimeSubscriptions.ts # Real-time subscription hook
├── utils/
│   └── index.ts      # Utility functions
└── styles/
    └── globals.css   # Global styles
```

## Development Guidelines

### Code Style

- Use TypeScript for all code
- Follow React functional component patterns
- Use Redux Toolkit for state management
- Implement proper error boundaries
- Write accessible components with ARIA labels

### Component Structure

- Break down components into smaller, reusable parts
- Use custom hooks for complex logic
- Implement proper prop typing
- Follow the container/presentational component pattern

### State Management

- Use Redux Toolkit slices for organized state
- Implement optimistic updates for better UX
- Handle loading and error states properly
- Use selectors for derived state

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
- **`development`**: Integration branch for ongoing development
- **`feature/*`**: Feature branches for new functionality

### Development Workflow
1. Fork the repository
2. Create a feature branch from `development` (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add some amazing feature'`)
4. Push to your feature branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `development` branch
6. After review and testing, merge to `development`
7. When ready for release, merge `development` to `main`

### Getting Started for Development
```bash
# Clone the repository
git clone <repository-url>
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

## Roadmap

- [x] Real-time collaboration and live updates ✅
- [x] Basic UI components (Card, Column, Modal) ✅
- [x] Modern UI design with priority badges and status indicators ✅
- [x] Consolidated header with board management functionality ✅
- [ ] Drag & drop functionality
- [ ] CRUD operations for cards and columns
- [ ] Multiple board support
- [ ] User authentication and authorization
- [ ] Advanced filtering and search
- [ ] Board templates
- [ ] Third-party integrations
- [ ] Mobile app development
- [ ] Advanced analytics and reporting

---

Built with ❤️ using React, TypeScript, and Supabase
