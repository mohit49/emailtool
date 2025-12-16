#!/bin/bash

# Production Setup Script for przio.com
# This script helps set up the production environment

echo "🚀 Email Testing Tool - Production Setup"
echo "========================================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo "✅ Created .env.production"
        echo "⚠️  Please edit .env.production and fill in your production values"
    else
        echo "❌ .env.production.example not found"
    fi
else
    echo "✅ .env.production already exists"
fi
echo ""

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET=" .env.production 2>/dev/null || grep -q "JWT_SECRET=your-super-secret" .env.production 2>/dev/null; then
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(node scripts/generate-secret.js 2>&1 | grep -A1 "━━━━" | tail -1)
    if [ -f ".env.production" ]; then
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
        echo "✅ JWT secret generated and added to .env.production"
    fi
else
    echo "✅ JWT_SECRET already configured"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production
echo "✅ Dependencies installed"
echo ""

# Build application
echo "🔨 Building application for production..."
npm run build
echo "✅ Build completed"
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update .env.production with your production values"
echo "2. Set up MongoDB Atlas and update MONGODB_URI"
echo "3. Configure SMTP settings (support@przio.com)"
echo "4. Start the application: npm start"
echo "5. Or use PM2: pm2 start ecosystem.config.js"
echo ""
echo "📚 For detailed deployment instructions, see:"
echo "   - PRODUCTION_SETUP.md (quick guide)"
echo "   - DEPLOYMENT.md (detailed guide)"
echo ""


