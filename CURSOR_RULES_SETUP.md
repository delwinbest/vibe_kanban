# Cursor Rules Setup

This project uses shared Cursor AI rules managed via Git submodules for consistent development practices across multiple projects.

## Overview

The Cursor rules are stored in a separate repository (`cursor-rules`) and linked to this project using Git submodules. This allows for:

- **Centralized Management**: Update rules in one place for all projects
- **Version Control**: Track changes and rollback if needed
- **Selective Usage**: Use only the rules needed for each project
- **Team Sharing**: Share rules with team members

## Current Setup

### Submodule Configuration
- **Repository**: `https://github.com/delwinbest/cursor-rules.git`
- **Local Path**: `.cursor/rules-shared`
- **Symlinks**: `.cursor/rules/` contains symlinks to shared rules

### Active Rules
- `modern-web-development.mdc` - Comprehensive web development guidelines
- `github-operations.mdc` - GitHub workflow and issue management
- `react-nextjs.mdc` - React and Next.js specific rules
- `git-branching.mdc` - Git branching strategy and conventions

## Usage in Other Projects

### Adding to a New Project

1. **Add the submodule**:
   ```bash
   git submodule add https://github.com/delwinbest/cursor-rules.git .cursor/rules-shared
   ```

2. **Create symlinks to desired rules**:
   ```bash
   mkdir -p .cursor/rules
   ln -s ../rules-shared/web-development/modern-web-development.mdc .cursor/rules/
   ln -s ../rules-shared/workflows/github-operations.mdc .cursor/rules/
   ```

3. **Commit the changes**:
   ```bash
   git add .gitmodules .cursor/
   git commit -m "feat: Add shared cursor rules via submodule"
   ```

### Cloning Projects with Submodules

When cloning a project that uses these shared rules:

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/username/project.git

# Or initialize submodules after cloning
git clone https://github.com/username/project.git
cd project
git submodule update --init --recursive
```

### Updating Rules

To update to the latest version of the shared rules:

```bash
# Update the submodule
cd .cursor/rules-shared
git fetch
git merge origin/main
cd ../..

# Commit the update
git add .cursor/rules-shared
git commit -m "chore: Update cursor rules to latest version"
```

## Available Rules

### Web Development
- **modern-web-development.mdc**: TypeScript, React, Next.js, Supabase, Tailwind CSS
- **react-nextjs.mdc**: React and Next.js specific best practices

### Workflows
- **github-operations.mdc**: GitHub workflow, branching, issue management
- **git-branching.mdc**: Git branching strategy and conventions

### Templates
- **bug-report.mdc**: Bug report templates and guidelines
- **feature-request.mdc**: Feature request templates

## Adding New Rules

1. **Add to the shared repository**:
   ```bash
   cd /path/to/cursor-rules
   # Add new rule file
   git add .
   git commit -m "feat: Add new rule for X"
   git push origin main
   ```

2. **Update projects to use the new rule**:
   ```bash
   # Update submodule
   cd .cursor/rules-shared
   git pull origin main
   cd ../..
   
   # Create symlink
   ln -s ../rules-shared/category/new-rule.mdc .cursor/rules/
   
   # Commit changes
   git add .
   git commit -m "feat: Add new cursor rule for X"
   ```

## Troubleshooting

### Submodule Issues

If submodule is not initialized:
```bash
git submodule update --init --recursive
```

If symlinks are broken:
```bash
# Remove broken symlinks
rm .cursor/rules/*.mdc

# Recreate symlinks
ln -s ../rules-shared/web-development/modern-web-development.mdc .cursor/rules/
ln -s ../rules-shared/workflows/github-operations.mdc .cursor/rules/
```

### Permission Issues

If you can't push to the shared repository:
1. Check GitHub authentication
2. Ensure you have write access to the repository
3. Use SSH instead of HTTPS if needed

## Benefits

- **Consistency**: Same rules across all projects
- **Maintainability**: Update rules in one place
- **Collaboration**: Team members can easily use the same rules
- **Versioning**: Track rule changes over time
- **Flexibility**: Choose which rules to use per project
