#!/bin/bash

# Setup script for Vibe Kanban environment variables
echo "🚀 Setting up Vibe Kanban environment variables..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Copy example file to .env
cp env.example .env

echo "✅ Created .env file from template"
echo ""
echo "📝 Please edit the .env file with your actual Supabase credentials:"
echo "   - SUPABASE_PROJECT_REF: Your Supabase project reference ID"
echo "   - SUPABASE_ACCESS_TOKEN: Your Supabase personal access token"
echo "   - VITE_SUPABASE_URL: Your Supabase project URL"
echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key"
echo ""
echo "🔒 The .env file is already added to .gitignore and will not be committed to git"
echo ""
echo "💡 You can find these values in your Supabase Dashboard:"
echo "   - Project Settings → General → Reference ID"
echo "   - Account Settings → Access Tokens"
echo "   - Project Settings → API → Project URL and anon key"
