# New Project Setup Prompt

## Project Context

I want to create a new project with the same development setup and workflow as my Vibe Kanban project. This includes:

- **Modern Tech Stack**: React, TypeScript, Tailwind CSS, and appropriate backend
- **Development Workflow**: Cursor AI rules, structured prompts, and TODO-driven development
- **Project Organization**: Clean folder structure, proper documentation, and version control
- **Team Collaboration**: Shared rules, consistent practices, and clear project management

## Project Initialization Request

Please help me set up a new project with the following structure and configuration:

### 1. Project Foundation
- Create a new project with appropriate tech stack (React/Vue/Next.js based on requirements)
- Set up TypeScript configuration
- Configure build tools (Vite/Webpack/Next.js)
- Set up package.json with proper scripts and dependencies

### 2. Development Environment
- Configure ESLint and Prettier for code quality
- Set up environment variables configuration
- Create proper folder structure for components, services, types, etc.
- Set up testing framework (Jest/Vitest)

### 3. Cursor AI Rules Integration
- Add the cursor-rules submodule from `https://github.com/delwinbest/cursor-rules.git`
- Create symlinks to relevant rules in `.cursor/rules/`
- Set up `.cursor/mcp.json` for MCP server configuration
- Create `CURSOR_RULES_SETUP.md` documentation

### 4. Project Structure
Please create a well-organized folder structure that includes:
```
project-name/
├── .cursor/
│   ├── rules/              # Symlinks to shared rules
│   ├── rules-shared/       # Git submodule
│   └── mcp.json           # MCP server configuration
├── prompts/               # Project-specific prompts
│   ├── PROJECT_KICKSTART_PROMPT.md
│   ├── PROMPTS.md
│   └── [other prompts]
├── src/
│   ├── components/        # React components
│   ├── services/          # API and external services
│   ├── store/            # State management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── styles/           # CSS and styling
├── docs/                 # Project documentation
├── TODO.md              # Development TODO list
├── README.md            # Project overview
└── [other config files]
```

### 5. Documentation Setup
- **README.md**: Project overview, setup instructions, and features
- **TODO.md**: Development roadmap and task tracking
- **CURSOR_RULES_SETUP.md**: Cursor rules integration guide
- **prompts/**: Folder with project-specific prompts and templates

### 6. Git and Version Control
- Initialize Git repository
- Set up `.gitignore` with appropriate exclusions
- Create initial commit with project structure
- Set up branch strategy (main/development)

### 7. Development Workflow
- Configure GitHub Actions for CI/CD (if applicable)
- Set up environment variables for different stages
- Create development and production configurations
- Set up proper error handling and logging

## Expected Deliverables

Please provide:
1. **Complete project setup** with all dependencies and configurations
2. **Proper folder structure** following the outlined organization
3. **Cursor rules integration** with submodule and symlinks
4. **Documentation files** including README, TODO, and setup guides
5. **Development environment** ready for immediate development
6. **Git repository** initialized with proper configuration
7. **Prompts folder** with templates for future development

## Additional Requirements

### Cursor Rules Integration
- Add submodule: `git submodule add https://github.com/delwinbest/cursor-rules.git .cursor/rules-shared`
- Create symlinks to relevant rules (web-development, workflows, etc.)
- Document the setup process in `CURSOR_RULES_SETUP.md`

### Prompts Structure
- **PROJECT_KICKSTART_PROMPT.md**: Initial project setup prompt
- **PROMPTS.md**: Collection of useful prompts for development
- **Feature-specific prompts**: As needed for the project

### TODO Management
- **TODO.md**: Structured with phases, priorities, and status tracking
- **Status indicators**: ✅ Completed, 🚧 In Progress, 🎯 Planned
- **Phase organization**: Logical grouping of related features
- **Progress tracking**: Clear indication of current status and next steps

### Development Standards
- Follow React/TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Set up proper linting and formatting rules
- Configure for both development and production builds

## Project-Specific Customization

**Replace the following placeholders with your project details:**

### Project Information
- **Project Name**: [Your Project Name]
- **Description**: [Brief project description]
- **Tech Stack**: [React/Vue/Next.js, TypeScript, Tailwind, etc.]
- **Backend**: [Supabase/Firebase/Node.js/etc.]
- **Key Features**: [List main features]

### Technology Choices
- **Frontend Framework**: [React/Vue/Next.js]
- **Styling**: [Tailwind CSS/Styled Components/CSS Modules]
- **State Management**: [Redux Toolkit/Zustand/Context API]
- **Backend**: [Supabase/Firebase/Node.js/Express]
- **Database**: [PostgreSQL/MongoDB/SQLite]
- **Authentication**: [Supabase Auth/Firebase Auth/Auth0]

### Development Tools
- **Build Tool**: [Vite/Webpack/Next.js]
- **Testing**: [Jest/Vitest/Testing Library]
- **Linting**: [ESLint/TSLint]
- **Formatting**: [Prettier]
- **Type Checking**: [TypeScript]

## Usage Instructions

1. **Copy this prompt** and customize it for your specific project
2. **Replace placeholders** with your project details
3. **Use with AI assistant** to generate the complete project setup
4. **Follow the generated TODO.md** for development roadmap
5. **Update prompts** as the project evolves

## Example Customization

```markdown
### Project Information
- **Project Name**: Task Manager Pro
- **Description**: A comprehensive task management application with team collaboration
- **Tech Stack**: React, TypeScript, Tailwind CSS, Supabase
- **Backend**: Supabase (Database, Auth, Real-time)
- **Key Features**: Task management, team collaboration, project tracking, time tracking

### Technology Choices
- **Frontend Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: Redux Toolkit
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
```

This setup will provide a solid foundation for any new project with the same professional development workflow and tooling as the Vibe Kanban project.
