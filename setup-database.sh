#!/bin/bash

# Supabase Database Setup Script
echo "🚀 Setting up Vibe Kanban database schema..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found. Please run ./setup-env.sh first"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - SUPABASE_PROJECT_REF: $SUPABASE_PROJECT_REF"
    echo "   - SUPABASE_ACCESS_TOKEN: ${SUPABASE_ACCESS_TOKEN:0:20}..."
    exit 1
fi

echo "📋 Project Reference: $SUPABASE_PROJECT_REF"
echo "🔑 Access Token: ${SUPABASE_ACCESS_TOKEN:0:20}..."

# Method 1: Try using Supabase CLI (if available)
if command -v supabase &> /dev/null; then
    echo "🔧 Using Supabase CLI..."
    supabase db reset --project-ref $SUPABASE_PROJECT_REF
    supabase db push --project-ref $SUPABASE_PROJECT_REF --file supabase-schema.sql
    echo "✅ Database schema applied via Supabase CLI"
else
    echo "⚠️  Supabase CLI not found. Using alternative method..."
    
    # Method 2: Provide instructions for manual setup
    echo ""
    echo "📝 Manual Setup Instructions:"
    echo "1. Go to your Supabase Dashboard: https://supabase.com/dashboard"
    echo "2. Select your project: $SUPABASE_PROJECT_REF"
    echo "3. Navigate to SQL Editor"
    echo "4. Copy and paste the contents of 'supabase-schema.sql'"
    echo "5. Click 'Run' to execute the SQL"
    echo ""
    echo "📄 SQL file location: $(pwd)/supabase-schema.sql"
    echo ""
    
    # Method 3: Try using MCP server
    echo "🔧 Attempting to use Supabase MCP server..."
    if SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN npx @supabase/mcp-server-supabase@latest --read-only --project-ref=$SUPABASE_PROJECT_REF --access-token=$SUPABASE_ACCESS_TOKEN &>/dev/null; then
        echo "✅ MCP server connection successful"
        echo "💡 You can now use Cursor with Supabase MCP integration to manage your database"
    else
        echo "⚠️  MCP server connection failed. Please use manual setup method."
    fi
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Verify tables were created in Supabase Dashboard"
echo "2. Test the connection with: npm run dev"
echo "3. Check the application at: http://localhost:3000"
echo ""
echo "📊 Expected tables:"
echo "   - boards"
echo "   - columns" 
echo "   - cards"
echo "   - card_labels"
echo "   - card_assignees"
