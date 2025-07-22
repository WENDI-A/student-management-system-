---
inclusion: always
---

# Project Organization & Development Guidelines

## Architecture Overview
Full-stack Student Management System with role-based access:
- **Backend**: Node.js/Express with Prisma ORM and MySQL
- **Frontend**: Next.js 15 with TypeScript, React 19, Tailwind CSS
- **Database**: MySQL with Prisma schema-first approach

## Backend Development Rules

### CRUD Operations
- Use `PrismaCrudRouter` class from `backend/CURD/` for standardized API endpoints
- Configure routes in `backend/controllers/configs/` with validation, middleware, and hooks
- Use `Api_Response` class from `backend/CURD/api_response_folder/` for consistent HTTP responses
- Exclude sensitive fields (passwords, tokens) from API responses by default
- Use handlers from `backend/CURD/Curd_op/` (CreateHandler, UpdateHandler, DeleteHandler, GetHandler)

### Database Patterns
- Use CUID for primary keys (never auto-increment integers)
- Include `createdAt`, `updatedAt`, `deletedAt` timestamps for all models
- Define proper foreign key relationships with cascade behavior
- Use Prisma enums for constrained values (AssessmentType, AttendanceStatus, etc.)
- Follow schema in `backend/prisma/schema.prisma`

### Validation & Security
- All inputs MUST be validated using Zod schemas from `backend/zodSchemas/` directory
- Hash passwords with bcrypt (salt rounds: 10)
- Implement role-based access control with `backend/middleware/authMiddleware.js`
- Use `FileHandler` for uploads with date-organized directories in `backend/uploads/`

### Code Style (Backend)
- Use CommonJS modules (`require`/`module.exports`)
- Prefer async/await over promises
- camelCase for files, PascalCase for classes
- JSDoc comments for complex functions
- Follow error handling patterns in `backend/CURD/Curd_op/PrismaError.js`

## Frontend Development Rules

### Structure & Patterns
- Use Next.js 15 app directory with role-based layouts (`/admin`, `/teacher`, `/student`, `/parent`)
- Store reusable UI components in `frontend/src/components/ui/` using Radix UI primitives
- Use Zustand for auth state (`frontend/src/lib/auth-store.ts`), custom hooks for data fetching
- Implement route protection with `frontend/src/lib/routeProtection.tsx`

### Code Style (Frontend)
- Use ES modules (`import`/`export`)
- PascalCase for React components, camelCase for utilities
- Tailwind CSS with custom component variants
- TypeScript for all components and utilities

## Performance & Optimization

### Database Optimization
- Use Prisma's `select` and `include` to fetch only needed data
- Implement pagination (max 100 items per request)
- Use `QueryProcessor` from `backend/CURD/Curd_op/` for complex queries
- Cache database structure analysis for query processing

### Testing Requirements
- Unit tests for CRUD operations and validation logic
- API endpoint tests with proper auth/authorization
- Database constraint and relationship validation
- File upload functionality testing
- Use test files in `backend/CURD/Curd_op/` as examples

## File Organization Patterns
- Config files: `{model}.config.js` in `backend/controllers/configs/`
- Zod schemas: `{Model}.js` in `backend/zodSchemas/`
- Database models: PascalCase names, camelCase fields
- API routes: Follow patterns in `backend/api_route.md`
- Frontend pages: Role-based directory structure under `frontend/src/app/` 