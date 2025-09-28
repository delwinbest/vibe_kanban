# Deployment Guide

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Configure Repository Secrets**:
   - Go to repository settings → Secrets and variables → Actions
   - Add the following secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Deployment Process**:
   - Push to `main` branch triggers automatic deployment
   - The workflow builds the project and deploys to GitHub Pages
   - Your app will be available at: `https://username.github.io/vibe_kanban/`

### Workflow Files

- **`.github/workflows/deploy.yml`**: Production deployment to GitHub Pages
- **`.github/workflows/ci.yml`**: Continuous integration for development branches

### Environment Variables

The following environment variables are required for the build:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Configuration

- **Base URL**: `/vibe_kanban/` (configured in `vite.config.ts`)
- **Output Directory**: `dist`
- **Source Maps**: Enabled for debugging

### Deployment Status

You can monitor deployment status in the "Actions" tab of your GitHub repository.

### Troubleshooting

1. **Build Failures**: Check the Actions tab for detailed error logs
2. **Environment Variables**: Ensure all required secrets are configured
3. **Base URL Issues**: Verify the `base` setting in `vite.config.ts` matches your repository name

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain
2. Configure DNS settings to point to GitHub Pages
3. Enable custom domain in repository settings → Pages

### Local Development

For local development, the base URL is automatically adjusted:

```bash
npm run dev  # Uses root path for local development
npm run build  # Uses /vibe_kanban/ for production builds
```
