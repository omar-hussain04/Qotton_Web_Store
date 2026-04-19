# Qotton Project: Technical Specification & Blueprint

This document provides a detailed technical breakdown of the **Qotton** project, a premium Arab-centric e-commerce platform for high-quality hoodies. It is designed to be ingested by an AI agent (like Antigravity) to replicate or extend the project.

---

## 1. Project Overview & Tech Stack

### Core Identity
- **Name**: Qotton (قطن)
- **Niche**: Premium Hoodies / E-commerce
- **Language/Locale**: Arabic (Primary), RTL support.
- **Design Aesthetic**: Minimalist, luxury, traditional yet modern (using custom Arabic typography).

### Technical Stack
- **Framework**: Next.js 16.2+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + PostCSS
- **Animations**: Framer Motion 12+
- **Database & Auth**: Firebase 12.11+ (Firestore, Authentication, App Hosting)
- **State Management**: Zustand 5+ with Persistence Middleware
- **Deployment**: Dockerized, hosted on Firebase App Hosting.

---

## 2. Directory Structure & Conventions

The project follows a modular, feature-based structure:

- `/src/app`: Contains routes, layouts, and global styles.
- `/src/components`: UI components organized by category:
    - `layout/`: Shared layout components (Header, Footer, CartDrawer).
    - `ui/`: Atomic components (Buttons, Inputs, Skeletons).
    - `product/`: Product-specific displays.
- `/src/lib`: Core business logic and service modules (Firebase, DB operations, Auth).
- `/src/store`: Zustand stores for global client-side state.
- `/src/types`: TypeScript definitions, divided into models and common types.

### Barrel File Pattern
The project uses barrel files (e.g., `lib/db.ts`) to centralize exports from sub-modules, simplifying imports in components.

---

## 3. Data Models (Types)

### Product (`product.ts`)
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  colors: { name: string; hex: string; stock: number }[];
  sizes: string[];
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  isNew: boolean;
  inStock: boolean;
}
```

### Order (`order.ts`)
Stores customer shipping info, item list, and order metadata.
- **Status Enum**: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.
- **Payment**: Currently `cod` (Cash on Delivery) only.

---

## 4. Core Logic & Services

### Firebase Integration (`firebase.ts`)
Singleton instances of `app`, `db`, and `auth` are exported for global use.

### Authentication (`auth.ts`)
- Email/Password registration with profile updates and verification emails.
- Google OAuth via `signInWithPopup`.
- Persistence handled by Firebase Client SDK.

### Database Operations (Firestore)
- **Products**: Read-only from frontend (controlled via [firestore.rules](file:///e:/qottonweb/firestore.rules)).
- **Sync Logic (Headless Components)**:
    - **Merge Process**: When a user logs in, the `CartSync` and `WishlistSync` components merge the local "Guest" data with the "Cloud" data using a unique-ID map to avoid duplicates.
    - **Continuous Persistence**: After login, any changes to the local Zustand state are automatically debounced and synced to Firestore to ensure multi-device consistency.
    - **Logout Safety**: Local state is cleared immediately on logout to prevent data leakage between different users on the same machine.

---

## 5. State Management (Zustand)

### Cart Store (`useCartStore.ts`)
- **Persistence**: Uses `zustand/middleware/persist` to save to `localStorage` (`qotton-cart-storage`).
- **Logic**: Handles additive updates (incrementing quantity if the same item-color-size combination exists).

### Wishlist Store (`useWishlistStore.ts`)
- Simple ID list with persistence.
- Triggers Firestore updates if a `userId` is present.

---

## 6. UI/UX & Design System

### Typography
Uses three distinct font families for a premium feel:
1. **Lyon Arabic**: Primary display font (Serif).
2. **TS Hikayat**: Secondary accent font (Variable).
3. **Cormorant Garamond**: Latin serif for English text.

### Layout (`layout.tsx`)
- **RTL Support**: `dir="rtl"` is hardcoded on the `<html>` tag.
- **Providers**: `AuthProvider` wraps the application to provide user context.

---

## 7. Configuration & Deployment

### Environment Variables (`.env.example`)
Requires standard Firebase public keys: `NEXT_PUBLIC_FIREBASE_API_KEY`, `PROJECT_ID`, etc.

### Security Rules (`firestore.rules`)
- `/products`: Public Read.
- `/orders`: Anyone can Create, but only Owners can Read.
- `/users`: Only Owners can Read/Write their own profiles.
- `/messages`: Create-only (Security by obscurity for contact forms).

### Dockerization ([DockerFile](file:///e:/qottonweb/DockerFile))
Multi-stage build using `node:23-bookworm-slim` for optimized production images.

---

## 8. Deployment & Hosting

### Firebase App Hosting ([apphosting.yaml](file:///e:/qottonweb/apphosting.yaml))
The project uses Firebase App Hosting (Google Cloud Run behind the scenes) for seamless Next.js App Router support.
- **Environment Management**: Secrets and public variables are managed within `apphosting.yaml`.
- **Backend Setup**: `backendId` is configured in [firebase.json](file:///e:/qottonweb/firebase.json).

### Build Pipeline
1. **GitHub Trigger**: Pushes to specific branches trigger the Firebase App Hosting build.
2. **Build Stage**: Next.js `npm run build` is executed.
3. **Deployment**: The optimized output is served via Cloud Run with global CDN support.

---

## How to Replicate this Project
1. Initialize a Next.js project with `npx create-next-app@latest`.
2. Install dependencies: `firebase`, `zustand`, `framer-motion`, `lucide-react`, `tailwind-merge`.
3. Set up the directory structure as outlined above.
4. Copy the Type definitions and Barrel files (`lib/db.ts`, `lib/firebase.ts`).
5. Configure Firebase Console with Collections: `products`, `orders`, `users`, `messages`.
6. Implement the `Persist` middleware for stores.
