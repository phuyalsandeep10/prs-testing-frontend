# PRS (Payment Receiving System) Frontend

A comprehensive multi-tenant SaaS application for managing payment workflows, client relationships, and sales operations across different organizational roles.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **npm** or **bun** package manager
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd PRS/app

# Install dependencies (using bun - recommended)
bun install

# Or using npm
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/

# Start development server
bun dev
# or
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development](#development)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

PRS is a sophisticated payment management platform designed to streamline payment workflows across organizations. It provides role-based access control, comprehensive deal management, payment verification, and real-time analytics for teams of all sizes.

### Key Capabilities

- **Multi-tenant Architecture** - Support for multiple organizations
- **Role-based Access Control** - 6+ distinct user roles with granular permissions
- **Deal Management** - Complete sales pipeline from creation to verification
- **Payment Processing** - Multiple payment methods with verification workflows
- **Real-time Analytics** - Performance dashboards and reporting
- **Commission Tracking** - Automated commission calculation and reporting

## ✨ Features

### 🏢 Organization Management
- Multi-tenant support with organization isolation
- Organization-level settings and configuration
- Team and user management

### 👥 User Roles & Permissions
- **Super Admin** - System-wide management
- **Organization Admin** - Organization-level control
- **Supervisor** - Team oversight and management
- **Salesperson** - Personal pipeline management
- **Verifier** - Payment verification workflows
- **Senior Verifier** - Advanced verification capabilities
- **Team Member** - Limited access for specific tasks

### 💼 Deal Management
- Complete deal lifecycle management
- Multiple payment methods (bank, wallet, cash, cheque)
- Payment tracking and verification
- Deal status progression
- Receipt and document management

### ✅ Verification System
- Multi-step payment verification
- Document validation workflows
- Verification notes and comments
- Approval/rejection workflows
- Audit trails for compliance

### 📊 Analytics & Reporting
- Role-specific dashboards
- Performance metrics and KPIs
- Commission tracking and reporting
- Team performance analytics
- Export capabilities (CSV, Excel, PDF)

### 🔔 Real-time Features
- Live notifications and updates
- Real-time deal status changes
- Cross-tab synchronization
- WebSocket integration

### 📱 User Experience
- Responsive design for all devices
- Dark/light theme support
- Offline-first capabilities
- Progressive Web App features

## 👤 User Roles

### Super Admin
- **Access**: System-wide across all organizations
- **Features**: Organization creation, admin management, system configuration
- **Dashboard**: Multi-organization overview and analytics

### Organization Admin
- **Access**: Full control within their organization
- **Features**: User management, team oversight, deal analytics, commission reports
- **Dashboard**: Organization KPIs, team performance, revenue tracking

### Supervisor
- **Access**: Team-level oversight and management
- **Features**: Team performance monitoring, goal setting, member mentoring
- **Dashboard**: Team metrics, individual performance, goal tracking

### Salesperson
- **Access**: Personal deals, clients, and performance data
- **Features**: Deal creation, client management, payment processing, commission tracking
- **Dashboard**: Personal metrics, achievements, streaks, performance standing

### Verifier
- **Access**: Assigned verification tasks and payment records
- **Features**: Payment verification, document validation, refund processing
- **Dashboard**: Verification queue, performance metrics, audit overview

### Senior Verifier
- **Access**: Enhanced verification with oversight capabilities
- **Features**: Complex case handling, junior verifier oversight, dispute resolution
- **Dashboard**: Advanced metrics, exception management, team oversight

### Team Member
- **Access**: Task-specific access based on assignments
- **Features**: Task completion, basic reporting, team support
- **Dashboard**: Task overview, progress tracking, announcements

## 🛠 Technology Stack

### Frontend Framework
- **Next.js 14** with App Router
- **React 19** with modern hooks
- **TypeScript** for type safety

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** component library
- **Lucide React** for consistent icons
- **Custom design system** with theming

### State Management
- **Zustand** for client state
- **React Query** for server state and caching
- **LocalStorage** for persistence

### Development Tools
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **ESLint** for code quality
- **Bun** for fast development

### Build & Deployment
- **Next.js** optimization
- **Docker** containerization
- **Environment-based** configuration

## 📁 Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Role-based dashboard routes
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── core/            # Framework components
│   │   ├── dashboard/       # Role-specific components
│   │   ├── forms/          # Form components
│   │   ├── shared/         # Shared utilities
│   │   └── ui/             # Design system
│   ├── hooks/              # Custom React hooks
│   │   └── api/           # API integration hooks
│   ├── lib/               # Utility libraries
│   │   ├── api-client.ts  # HTTP client
│   │   ├── auth.ts        # Authentication
│   │   └── utils.ts       # General utilities
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript definitions
│   └── contexts/          # React contexts
├── documentation/         # Comprehensive documentation
├── public/               # Static assets
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔧 Development

### Available Scripts

```bash
# Development
bun dev              # Start development server
bun build            # Production build
bun start            # Start production server

# Testing
bun test             # Run unit tests
bun test:watch       # Watch mode for tests
bun test:coverage    # Coverage report
bun test:e2e         # End-to-end tests

# Code Quality
bun lint             # Run ESLint
bun lint:fix         # Fix linting issues
bun type-check       # TypeScript checking
```

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   # Develop your feature
   bun test
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Testing**
   ```bash
   # Unit tests
   bun test
   
   # E2E tests
   bun test:e2e
   
   # Coverage
   bun test:coverage
   ```

3. **Code Quality**
   ```bash
   # Linting
   bun lint
   
   # Type checking
   bun type-check
   ```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional - External Services
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 📚 Documentation

Comprehensive documentation is available in the `/app/documentation` directory:

- **[Architecture Guide](./app/documentation/ARCHITECTURE.md)** - System architecture and design patterns
- **[User Roles Guide](./app/documentation/USER_ROLES_GUIDE.md)** - Detailed role descriptions and workflows
- **[Development Guide](./app/documentation/DEVELOPMENT_GUIDE.md)** - Development setup and best practices
- **[API Integration](./app/documentation/API_INTEGRATION.md)** - Backend integration and API usage
- **[Component Library](./app/documentation/COMPONENT_LIBRARY.md)** - UI components and usage examples

### Quick References

#### Authentication
```typescript
// Login with role-specific endpoint
const authResult = await authService.login({
  email: 'user@example.com',
  password: 'password'
}, '/auth/login/org-admin/')
```

#### Data Fetching
```typescript
// Using React Query hooks
const { data: deals, isLoading } = useDeals({
  status: 'pending',
  page: 1
})
```

#### Permission Checking
```typescript
// Role-based rendering
<PermissionGate permission="manage:users">
  <UserManagement />
</PermissionGate>
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
bun build

# Start production server
bun start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup

```bash
# Production environment
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NODE_ENV=production
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Commit Messages
Follow conventional commits:
```
feat: add user management dashboard
fix: resolve authentication token refresh
docs: update API integration guide
refactor: optimize table performance
```

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit PR with detailed description
6. Address review feedback

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

### Getting Help
- Check the [documentation](./app/documentation/) for detailed guides
- Review [existing issues](https://github.com/your-repo/issues) for solutions
- Open a [new issue](https://github.com/your-repo/issues/new) for bugs or feature requests

### Contact Information
- **Email**: support@yourapp.com
- **Documentation**: [docs.yourapp.com](https://docs.yourapp.com)
- **Status**: [status.yourapp.com](https://status.yourapp.com)

## 🏆 Acknowledgments

Built with modern web technologies and best practices:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [React Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

---

**PRS Frontend** - Streamlining payment workflows for modern organizations.