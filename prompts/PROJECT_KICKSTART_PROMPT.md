# Vibe Kanban - Project Kickstart Prompt

## Project Context

I'm building **Vibe Kanban**, a modern Trello-style kanban board application with the following key features:

- **Drag & Drop Interface**: Smooth card movement between columns using @dnd-kit
- **Real-time Collaboration**: Live updates using Supabase real-time subscriptions
- **Comprehensive Card Management**: Cards with titles, descriptions, due dates, labels, priorities, and assignees
- **Column Management**: Add, rename, delete, and reorder columns
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Data Persistence**: Auto-save with Supabase backend and offline support
- **Import/Export**: JSON and CSV data management capabilities

## Technology Stack
- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Drag & Drop**: @dnd-kit packages
- **Backend**: Supabase (Database, Real-time, Auth)
- **Language**: TypeScript

## Project Initialization Request

Please help me set up the initial project structure for Vibe Kanban. I need you to:

### 1. Initialize Vite + React Project
- Create a new Vite project with React and TypeScript template
- Set up the basic project structure with proper folder organization
- Configure package.json with appropriate scripts

### 2. Install and Configure Dependencies
- Install Tailwind CSS and configure it properly
- Set up Redux Toolkit with proper store configuration
- Install @dnd-kit packages (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- Install Supabase client library
- Add any other essential dependencies for the project

### 3. Development Environment Setup
- Configure ESLint and Prettier for code quality
- Set up TypeScript configuration
- Create proper folder structure for components, store, services, etc.
- Set up environment variables configuration

### 4. Basic Project Structure
Please create a well-organized folder structure that includes:
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── board/        # Board-related components
│   ├── column/       # Column components
│   └── card/         # Card components
├── store/
│   ├── slices/       # Redux slices
│   └── index.ts      # Store configuration
├── services/
│   └── supabase.ts   # Supabase client
├── types/
│   └── index.ts      # TypeScript type definitions
├── utils/
│   └── index.ts      # Utility functions
└── styles/
    └── globals.css   # Global styles
```

### 5. Initial Configuration Files
- Set up Tailwind config with custom colors for the kanban board
- Configure Redux store with initial state structure
- Set up Supabase client configuration
- Create basic TypeScript interfaces for Board, Column, and Card entities

### 6. Create Initial Components
- Basic App component structure
- Header component placeholder
- Board container component
- Column component skeleton
- Card component skeleton

### 7. Environment Setup
- Create .env.example file with required environment variables
- Set up Supabase project configuration
- Configure development and production environments

## Expected Deliverables

Please provide:
1. Complete project setup with all dependencies installed
2. Proper folder structure and organization
3. Basic component skeletons ready for development
4. Redux store configured with initial state
5. Supabase client properly configured
6. Tailwind CSS set up with custom theme
7. TypeScript interfaces for core entities
8. Development scripts and configuration files
9. README with setup instructions

## Additional Requirements

- Ensure the project follows React best practices
- Use functional components with hooks
- Implement proper TypeScript typing throughout
- Set up proper error boundaries
- Configure for both development and production builds
- Include proper linting and formatting rules

This initial setup should provide a solid foundation for building the full kanban board application with all the features outlined in the project specification.
