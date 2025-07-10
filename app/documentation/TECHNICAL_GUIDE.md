# PRS Technical Guide - Complete Setup & Troubleshooting! 🛠️

> **What is this?** This is your complete guide to getting PRS running on your computer, solving problems, and understanding how everything works together.

---

## 🎯 What You'll Learn

**By the end of this guide, you'll know how to:**
- Set up the entire PRS system from scratch
- Fix common problems that developers face
- Understand how all the pieces work together
- Deploy the application to production
- Monitor and maintain the system

**Who should read this?** 
- New developers joining the team
- DevOps engineers setting up servers
- Anyone who needs to understand the technical details

---

## 🏗️ System Architecture Overview

**Simple Explanation:** Think of PRS like a restaurant:

```
Users (Customers) → Frontend (Dining Room) → Backend (Kitchen) → Database (Pantry)
      ↓                      ↓                    ↓               ↓
   Click buttons         React App           Next.js API       PostgreSQL
   Fill out forms       (What users see)    (Business logic)   (Data storage)
```

### The Technology Stack

```typescript
// Our complete technology stack explained:

const TECH_STACK = {
  // FRONTEND (What users see and interact with)
  frontend: {
    framework: 'Next.js 15',           // React framework with built-in routing
    language: 'TypeScript',           // JavaScript with type safety
    styling: 'Tailwind CSS',          // Utility-first CSS framework
    components: 'shadcn/ui',          // Pre-built UI components
    icons: 'Lucide React',            // Icon library
    runtime: 'Bun'                    // Faster alternative to Node.js
  },
  
  // BACKEND (Business logic and API)
  backend: {
    framework: 'Next.js API Routes',   // Built into Next.js
    authentication: 'NextAuth.js',    // Handles login/logout
    database: 'PostgreSQL',           // Reliable SQL database
    orm: 'Prisma',                    // Database toolkit (makes SQL easier)
    deployment: 'Vercel'              // Hosting platform
  },
  
  // DEVELOPMENT TOOLS
  development: {
    codeEditor: 'VS Code',            // Recommended editor
    versionControl: 'Git',            // Track code changes
    linting: 'ESLint',               // Catch code problems
    formatting: 'Prettier',          // Auto-format code
    testing: 'Vitest'               // Run tests
  }
};
```

### How Data Flows Through the System

```
1. User logs in → NextAuth.js checks credentials → Creates session
2. User clicks "Get Users" → React component → API call
3. API route receives request → Checks authentication → Queries database
4. Database returns data → API processes it → Sends back to frontend
5. Frontend receives data → Updates React state → User sees the data
```

---

## 🚀 Complete Setup Guide

### Prerequisites (Install These First)

**Step 1: Install Bun (Our JavaScript Runtime)**
```bash
# For macOS/Linux:
curl -fsSL https://bun.sh/install | bash

# For Windows:
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
# Should show something like: 1.0.0
```

**Step 2: Install Git (Version Control)**
```bash
# Check if already installed
git --version

# If not installed:
# macOS: git comes with Xcode Command Line Tools
xcode-select --install

# Windows: Download from https://git-scm.com/
# Linux: 
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/RHEL
```

**Step 3: Install VS Code (Recommended Editor)**
- Download from: https://code.visualstudio.com/
- Install these extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - GitLens
  - Error Lens

### Project Setup (Step-by-Step)

**Step 1: Clone the Repository**
```bash
# Navigate to where you want the project
cd ~/Desktop  # or wherever you keep projects

# Clone the repository
git clone [your-repository-url] PRS
cd PRS/app

# Verify you're in the right place
ls -la
# You should see: package.json, src/, next.config.mjs, etc.
```

**Step 2: Install Dependencies**
```bash
# Install all required packages
bun install

# This will:
# - Read package.json
# - Download all dependencies to node_modules/
# - Create bun.lockb file (like package-lock.json)
# - Usually takes 1-2 minutes

# Verify installation worked
ls node_modules/
# Should see many folders (react, next, typescript, etc.)
```

**Step 3: Environment Configuration**
```bash
# Create environment file
cp .env.example .env.local

# Edit the environment file
code .env.local  # Opens in VS Code

# Add these required variables:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/prs_db
```

**Environment Variables Explained:**
```bash
# NEXTAUTH_URL: Where your app runs during development
NEXTAUTH_URL=http://localhost:3000

# NEXTAUTH_SECRET: Random string for encrypting sessions
# Generate one here: https://generate-secret.vercel.app/32
NEXTAUTH_SECRET=super-secret-random-string-here

# DATABASE_URL: How to connect to your database
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/prs_development

# Optional: For production deployments
VERCEL_URL=your-app.vercel.app
```

**Step 4: Database Setup**

**Option A: Using Local PostgreSQL**
```bash
# Install PostgreSQL
# macOS (using Homebrew):
brew install postgresql
brew services start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
# Linux:
sudo apt-get install postgresql postgresql-contrib

# Create database and user
psql postgres
CREATE DATABASE prs_development;
CREATE USER prs_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prs_development TO prs_user;
\q

# Update your .env.local file
DATABASE_URL=postgresql://prs_user:your_password@localhost:5432/prs_development
```

**Option B: Using Docker (Easier)**
```bash
# Create docker-compose.yml in your project root
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: prs_development
      POSTGRES_USER: prs_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start the database
docker-compose up -d

# Verify it's running
docker-compose ps
# Should show postgres container as "Up"
```

**Step 5: Initialize Database Schema**
```bash
# If using Prisma (check if prisma/ folder exists)
bunx prisma generate   # Generate Prisma client
bunx prisma db push    # Create tables in database

# Verify database is set up
bunx prisma studio     # Opens database browser at http://localhost:5555
```

**Step 6: Start Development Server**
```bash
# Start the application
bun run dev

# You should see:
# ✓ Ready in 2.1s
# ○ Local:        http://localhost:3000
# ○ Network:      http://192.168.1.100:3000

# Open your browser and go to: http://localhost:3000
# You should see the PRS login page
```

### First-Time Setup Verification

**Test That Everything Works:**

1. **Frontend Test:**
   - Go to http://localhost:3000
   - Should see PRS login page
   - No error messages in browser console (F12)

2. **API Test:**
   - Open browser console (F12)
   - Type: `fetch('/api/health').then(r => r.json()).then(console.log)`
   - Should return: `{status: 'ok', timestamp: '...'}`

3. **Database Test:**
   - In another terminal: `bunx prisma studio`
   - Should open database browser at http://localhost:5555
   - Should see your database tables

4. **Authentication Test:**
   - Try logging in with test credentials
   - Should redirect to dashboard after successful login

---

## 🔧 Development Workflow

### Daily Development Routine

```bash
# 1. MORNING: Start your development session
cd ~/path/to/PRS/app

# Pull latest changes from team
git pull origin main

# Install any new dependencies
bun install

# Start development server
bun run dev

# 2. CODING: Your normal development work
# - Edit files in src/
# - Browser automatically refreshes when you save
# - Check console for any errors

# 3. TESTING: Before committing changes
# Run type checking
bun run type-check

# Run linting
bun run lint

# Run tests (if you have them)
bun run test

# 4. EVENING: Commit your changes
git add .
git commit -m "Add user management feature"
git push origin your-branch-name
```

### Useful Development Commands

```bash
# START DEVELOPMENT
bun run dev              # Start development server (http://localhost:3000)
bun run dev --port 3001  # Start on different port

# CODE QUALITY
bun run lint             # Check for code problems
bun run lint:fix         # Fix automatically fixable problems
bun run type-check       # Check TypeScript types
bun run format           # Format code with Prettier

# DATABASE OPERATIONS
bunx prisma studio       # Open database browser
bunx prisma generate     # Regenerate Prisma client after schema changes
bunx prisma db push      # Apply schema changes to database
bunx prisma db seed      # Run seed data script

# BUILD & DEPLOYMENT
bun run build           # Build for production
bun run start           # Start production server
bun run analyze         # Analyze bundle size

# CLEANUP
rm -rf node_modules/    # Remove dependencies
rm -rf .next/          # Remove build cache
bun install            # Reinstall dependencies
```

---

## 🐛 Troubleshooting Common Problems

### Problem 1: "bun: command not found"

**Symptoms:**
```bash
$ bun --version
bash: bun: command not found
```

**Solution:**
```bash
# Reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Restart your terminal or run:
source ~/.bashrc  # Linux
source ~/.zshrc   # macOS with zsh

# Verify installation
bun --version
```

### Problem 2: "Port 3000 is already in use"

**Symptoms:**
```bash
$ bun run dev
Error: Port 3000 is already in use
```

**Solutions:**
```bash
# Option 1: Use different port
bun run dev --port 3001

# Option 2: Kill process using port 3000
# Find what's using the port
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Option 3: Kill all node processes
killall node
```

### Problem 3: Database Connection Errors

**Symptoms:**
```bash
PrismaClientInitializationError: Can't reach database server
```

**Solutions:**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Windows: Check Services app for PostgreSQL service

# If not running, start it:
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Test connection manually
psql -h localhost -p 5432 -U prs_user -d prs_development

# Check your .env.local file has correct DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### Problem 4: TypeScript Errors

**Symptoms:**
```bash
Type 'string' is not assignable to type 'number'
Property 'id' does not exist on type 'User'
```

**Solutions:**
```bash
# Check your TypeScript configuration
cat tsconfig.json

# Restart TypeScript language server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Check for missing type definitions
bun add -D @types/node @types/react @types/react-dom

# Run type checker
bun run type-check
```

### Problem 5: Tailwind CSS Not Working

**Symptoms:**
- CSS classes not applying
- Styles not updating

**Solutions:**
```bash
# Check Tailwind configuration
cat tailwind.config.ts

# Make sure paths include your source files:
# content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']

# Restart development server
# Ctrl+C to stop, then bun run dev

# Check if PostCSS is configured
cat postcss.config.mjs

# Clear Next.js cache
rm -rf .next/
bun run dev
```

### Problem 6: Authentication Issues

**Symptoms:**
- Login doesn't work
- Redirected to login after successful authentication
- Session expires immediately

**Solutions:**
```bash
# Check NextAuth configuration
cat src/app/api/auth/[...nextauth]/route.ts

# Verify environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# Check if secret is set properly
# NEXTAUTH_SECRET should be at least 32 characters

# Generate new secret if needed
openssl rand -base64 32

# Clear browser cookies and localStorage
# Browser DevTools → Application → Storage → Clear All
```

### Problem 7: Build Errors

**Symptoms:**
```bash
$ bun run build
✗ Failed to compile
./src/components/MyComponent.tsx: Module not found
```

**Solutions:**
```bash
# Check file paths are correct
find src/ -name "MyComponent.tsx"

# Check import statements
grep -r "import.*MyComponent" src/

# Common issues:
# - Wrong file extension (.js vs .tsx)
# - Case sensitivity (MyComponent vs mycomponent)
# - Missing files
# - Circular imports

# Clear build cache and try again
rm -rf .next/
bun run build
```

---

## 📊 Performance Monitoring

### Development Performance Tools

**1. Next.js Built-in Analytics**
```bash
# Add to your next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Enable webpack bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
};

# Analyze bundle size
ANALYZE=true bun run build
```

**2. Browser DevTools Performance**
```typescript
// Add performance measuring to your components
function MyComponent() {
  useEffect(() => {
    // Mark performance start
    performance.mark('MyComponent-start');
    
    return () => {
      // Mark performance end
      performance.mark('MyComponent-end');
      performance.measure('MyComponent', 'MyComponent-start', 'MyComponent-end');
      
      // Check results in DevTools Performance tab
      console.log(performance.getEntriesByName('MyComponent'));
    };
  }, []);
  
  return <div>Component content</div>;
}
```

**3. Core Web Vitals Monitoring**
```typescript
// Add to your _app.tsx or layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function reportWebVitals(metric) {
  console.log(metric.name, metric.value);
  
  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // analytics.track(metric.name, metric.value);
  }
}

// Measure all core web vitals
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

### Database Performance

**1. Query Performance Monitoring**
```typescript
// Add to your Prisma client setup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 1000) {  // Queries slower than 1 second
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

**2. Database Connection Monitoring**
```bash
# Check active connections
psql -d prs_development -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -d prs_development -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Monitor real-time activity
psql -d prs_development -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"
```

---

## 🚀 Deployment Guide

### Production Environment Setup

**1. Environment Variables for Production**
```bash
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-here
DATABASE_URL=postgresql://user:password@production-db:5432/prs_production

# Additional production variables
POSTGRES_SSL=true
REDIS_URL=redis://your-redis-server:6379
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

**2. Vercel Deployment (Recommended)**
```bash
# Install Vercel CLI
bun add -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production

# Redeploy with new environment variables
vercel --prod
```

**3. Docker Deployment**
```dockerfile
# Create Dockerfile in project root
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build application
COPY . .
RUN bun run build

# Production image
FROM oven/bun:1-slim as production
WORKDIR /app

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["bun", "start"]
```

**Build and run Docker container:**
```bash
# Build image
docker build -t prs-app .

# Run container
docker run -p 3000:3000 --env-file .env.production prs-app
```

### Health Checks and Monitoring

**1. Health Check Endpoint**
```typescript
// Create src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

**2. Monitoring Script**
```bash
#!/bin/bash
# create monitoring.sh

HEALTH_URL="https://your-app.vercel.app/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

# Check health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -ne 200 ]; then
    # Send alert to Slack
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 PRS Application Health Check Failed! HTTP $response\"}" \
        $SLACK_WEBHOOK
    
    echo "Health check failed with status: $response"
    exit 1
else
    echo "Health check passed"
fi
```

---

## 📋 Maintenance Tasks

### Daily Tasks
```bash
# Check application logs
vercel logs your-deployment-url

# Monitor error rates
# Check Vercel Analytics or your monitoring service

# Database health check
psql $DATABASE_URL -c "SELECT version();"
```

### Weekly Tasks
```bash
# Update dependencies
bun update

# Run security audit
bun audit

# Check disk space (if self-hosting)
df -h

# Review error logs
# Look for patterns in errors
# Check for performance degradation
```

### Monthly Tasks
```bash
# Full dependency update
rm -rf node_modules bun.lockb
bun install

# Database maintenance
# Analyze query performance
# Clean up old data if needed

# Security updates
# Update all Docker base images
# Review access logs for suspicious activity

# Backup verification
# Test that backups can be restored
```

---

## 🔍 Debugging Techniques

### Frontend Debugging

**1. React DevTools**
```bash
# Install React DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

# Use in browser:
# 1. Open DevTools (F12)
# 2. Go to "Components" tab
# 3. Inspect component state and props
# 4. Use "Profiler" tab to find performance issues
```

**2. Console Debugging**
```typescript
// Add debug information to your components
function MyComponent({ data }) {
  // Log component renders
  console.log('MyComponent rendered with data:', data);
  
  // Log when data changes
  useEffect(() => {
    console.log('Data changed:', data);
  }, [data]);
  
  // Log user interactions
  const handleClick = () => {
    console.log('Button clicked');
    // Your actual click handler
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

**3. Network Debugging**
```typescript
// Monitor API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('API Call:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('API Response:', response.status, args[0]);
      return response;
    })
    .catch(error => {
      console.error('API Error:', error, args[0]);
      throw error;
    });
};
```

### Backend Debugging

**1. API Route Debugging**
```typescript
// Add logging to your API routes
export async function GET(request: Request) {
  console.log('API called:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers));
  
  try {
    const result = await someOperation();
    console.log('Operation successful:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Operation failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**2. Database Query Debugging**
```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Log specific queries
const users = await prisma.user.findMany({
  where: { active: true }
});
console.log('Found users:', users.length);
```

---

## 🎯 Best Practices Summary

### Development Best Practices

1. **Always Use TypeScript**
   - Define interfaces for all data structures
   - Use strict type checking
   - Don't use `any` without good reason

2. **Performance First**
   - Use React.memo for expensive components
   - Memoize event handlers with useCallback
   - Use useMemo for expensive calculations

3. **Error Handling**
   - Wrap API calls in try-catch blocks
   - Show user-friendly error messages
   - Log errors for debugging

4. **Testing**
   - Write unit tests for complex logic
   - Test API endpoints
   - Use browser testing for critical user flows

5. **Security**
   - Never commit secrets to Git
   - Use environment variables for configuration
   - Validate all user inputs
   - Use HTTPS in production

### Deployment Best Practices

1. **Environment Management**
   - Separate dev/staging/production environments
   - Use different databases for each environment
   - Test in staging before production deployment

2. **Monitoring**
   - Set up health checks
   - Monitor error rates and performance
   - Use logging for debugging issues

3. **Backup Strategy**
   - Regular database backups
   - Test backup restoration
   - Store backups securely

---

**Remember: This guide is your technical reference. When you run into problems, come back here first. Most issues have solutions that someone else has already figured out! 🚀** 