# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code linting
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting with Prettier
- `npm run preview` - Preview production build locally
- `npm run knip` - Find unused dependencies and exports

## Architecture Overview

This is a React-based frontend application for a business management system with chat capabilities. The application is built with:

- **Framework**: React 19 with TypeScript, Vite for build tooling
- **Routing**: TanStack Router with file-based routing
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: Radix UI primitives with Tailwind CSS styling
- **Real-time Communication**: Socket.io client for live chat functionality

### Key Architecture Patterns

**Feature-Based Organization**: Code is organized by business domains under `src/features/`:
- `appointments/` - Calendar and appointment booking system
- `chats/` - WhatsApp Business integration and messaging
- `clients/` - Customer management
- `employees/` - Staff management and scheduling
- `events/` - Event management and booking
- `services/` - Service catalog management
- `settings/` - Application configuration
- `auth/` - Authentication and user management

**Component Structure**:
- `src/components/ui/` - Reusable UI components (shadcn/ui style)
- `src/components/` - Shared business components
- Feature-specific components are co-located within their respective feature directories

**Data Layer**:
- TanStack Query handles server state with custom hooks (e.g., `useGetClients`, `useGetAppointments`)
- Axios for HTTP requests with centralized configuration in `src/api/axiosInstance.ts`
- Each feature has its own API service file for data operations

**Routing Structure**:
- File-based routing with TanStack Router
- Protected routes under `_authenticated/` directory
- Auth routes under `(auth)/` directory
- Error pages under `(errors)/` directory

### Important Implementation Details

**Authentication**: Uses JWT tokens with Zustand store for auth state management in `src/stores/authStore.ts`

**Real-time Features**: Socket.io integration for live chat updates, managed through custom hooks in `src/hooks/use-web-socket.ts`

**WhatsApp Integration**: Core business feature with WhatsApp Business API integration for customer communications

**Appointment System**: Complex scheduling system with employee availability, service selection, and calendar views

**Styling**: Tailwind CSS with CSS-in-JS using class-variance-authority for component variants

**Form Handling**: React Hook Form with Zod validation throughout the application

The codebase follows TypeScript strict mode and uses path aliases (`@/` for `src/`) for clean imports.