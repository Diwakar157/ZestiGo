# ZestiGo 🍛 🍕 🍔

ZestiGo is a premium, modern, and high-performance Indian Food Delivery web application built with a robust decoupled architecture. It features a modern Single Page Application (SPA) frontend powered by TanStack Start, a secure enterprise-grade backend REST API powered by Spring Boot, and an admin dashboard powered by Next.js.

---

## 🚀 Key Features

* **Gourmet Browsing:** Explore premium restaurants, popular dishes, cuisines, and food categories.
* **Smart Wishlist & Cart:** Seamless client-side state management for cart updates, coupon application, and saved favorites.
* **Flexible Checkout & Payments:** Support for delivery address configurations, payments (Razorpay integration, cards, wallet, Cash on Delivery, and **UPI**), and order placement.
* **Interactive Maps & Real-time Tracking:** Real-time order tracking from kitchen to doorstep. Powered by Google Maps API with components including an **Address Map Picker**, **Current Location Button**, **MiniMap Preview**, **Street View Panel**, and a **Floating Order Tracker**.
* **Clerk Authentication:** Secure authentication powered by Clerk with JWT tokens and Google OAuth2 social login on both the customer app and admin dashboard.
* **Interactive UI & Themes:** A highly responsive customer client featuring beautiful card layouts, hover micro-animations, support for custom theme styling, and a redesigned **cinematic full-bleed Hero section** with gradient overlays and fade-in animations.
* **Order History & Quick Reordering:** View past order records and instantly re-add items to the cart.
* **Admin Dashboard:** Full-featured admin panel for managing restaurants, food items, orders, users, and delivery partners.

---

## 🛠️ Technology Stack

### Frontend (Customer App)
* **Core:** React 19, TypeScript, Vite
* **Routing & State:** TanStack Start (with built-in SSR), TanStack Router, TanStack Query
* **Styling:** Tailwind CSS, Vanilla CSS, Lucide React Icons
* **Auth:** Clerk (via `@clerk/tanstack-react-start`)
* **Toasts & Feedback:** Sonner (rich toast notifications)
* **Deployment:** Vercel

### Backend (REST API)
* **Core:** Spring Boot 3.3.4, Java 21
* **Build System:** Apache Maven 3.9+
* **Database & Persistence:** Spring Data JPA, Hibernate, PostgreSQL
* **Security & Auth:** Spring Security, JWT (jjwt), Clerk JWT verification, Google OAuth2
* **Payments:** Razorpay SDK
* **Utilities:** Lombok, Jakarta Bean Validation
* **Deployment:** Render (Docker)

### Admin Dashboard
* **Core:** Next.js 16, React 19, TypeScript
* **Database:** Prisma ORM (connects to same database as backend)
* **Auth:** Clerk (via `@clerk/nextjs`)
* **Charts:** Recharts
* **Styling:** Tailwind CSS, Radix UI primitives
* **Deployment:** Vercel

---

## 📁 Repository Structure

```
ZestiGo/
├── backend/                # Spring Boot REST API
│   ├── src/main/
│   │   ├── java/com/zestigo/   # Controllers, Services, DTOs, Security
│   │   └── resources/
│   │       ├── application.yml # Configuration (env-driven)
│   │       ├── schema.sql      # Database DDL schema
│   │       └── data.sql        # Demo database seed data
│   ├── Dockerfile          # Production Docker image
│   ├── .dockerignore
│   ├── .env.example        # Required environment variables
│   └── pom.xml             # Maven dependencies
├── frontend/               # TanStack Start SPA (Customer)
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── context/        # Global state (Cart, Wishlist, Theme)
│   │   ├── features/       # Feature modules (maps, payment)
│   │   ├── routes/         # TanStack file-based routes
│   │   └── services/       # Axios API client
│   ├── .env.example        # Required environment variables
│   ├── package.json
│   └── vite.config.ts
├── admin-dashboard/        # Next.js Admin Panel
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Admin UI components
│   │   └── lib/            # Server actions & utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (maps to backend DB)
│   ├── .env.example        # Required environment variables
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔧 Getting Started

### Prerequisites
1. **Java Development Kit (JDK 21 or higher)**
2. **Node.js (v18.x or higher) & npm (v10.x or higher)**
3. **PostgreSQL Server (v15.x or higher)**

### Environment Setup

Each module has a `.env.example` file. Copy and fill them in (you can reference the root `.env.example` for all modules):

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Admin Dashboard
cp admin-dashboard/.env.example admin-dashboard/.env.local
```

> [!IMPORTANT]
> The backend requires a valid Base64 encoded key for `JWT_SECRET`. You can generate a secure 512-bit key by running:
> ```bash
> openssl rand -base64 64
> ```
> 
> Also make sure to set the Google Maps API Keys (`GOOGLE_MAPS_API_KEY`) and Clerk API keys in the `.env` files.

---

### Database Setup
1. Start your local PostgreSQL server or initialize a cloud PostgreSQL database (e.g. Neon).
2. Create a database named `zestigo_db` (or use your preferred custom database name).
3. Set the database connection details in `backend/.env` (as `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) and in `admin-dashboard/.env.local` (as `DATABASE_URL`).
4. **Schema & Seed Data Setup:**
   * **Automatic Hibernate Creation:** By default, the application is configured to auto-create and update the tables (`spring.jpa.hibernate.ddl-auto: update`).
   * **SQL Initialization (data.sql & schema.sql):** Alternatively, you can use the PostgreSQL DDL schema at [schema.sql](file:///c:/Users/Diwakar%20R/Desktop/ZestiGo/backend/src/main/resources/schema.sql) and the seed data at [data.sql](file:///c:/Users/Diwakar%20R/Desktop/ZestiGo/backend/src/main/resources/data.sql) to set up and seed the database.
   * To enable automatic SQL initialization on backend startup, change `SQL_INIT_MODE=never` to `SQL_INIT_MODE=always` in your backend `.env` file (or set the respective environment variable).

---

### Running the Project

#### Step 1: Start the Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
The server launches on **`http://localhost:8081`** (or the port configured via `PORT` env var).

#### Step 2: Start the Frontend (Customer App)
```bash
cd frontend
npm install
npm run dev
```
The client launches on **`http://localhost:8080`**.

#### Step 3: Start the Admin Dashboard (Optional)
```bash
cd admin-dashboard
npm install
npm run dev
```
The admin panel launches on **`http://localhost:3001`**.

---

## 🚢 Deployment

### Backend → Render (Docker)
1. Create a **Web Service** on Render, select **Docker**.
2. Set **Root Directory** to `backend`, **Dockerfile Path** to `Dockerfile`.
3. Configure all environment variables from `backend/.env.example` in the Render dashboard.

### Frontend → Vercel
1. Import the repository, set **Root Directory** to `frontend`.
2. Configure `VITE_API_URL` (your Render backend URL) and `VITE_CLERK_PUBLISHABLE_KEY`.

### Admin Dashboard → Vercel
1. Import the repository, set **Root Directory** to `admin-dashboard`.
2. Configure `DATABASE_URL` and Clerk environment variables.

---

## 🔒 Security

* **Stateless REST Security:** JWT tokens sent via `Authorization: Bearer <token>` header. No cookies or sessions.
* **Clerk Authentication:** JWT verification using Clerk's issuer URL. Supports Google OAuth2 social login.
* **CORS:** Configured to allow only the frontend and admin dashboard origins (no wildcards with credentials).
* **Secrets:** All API keys and secrets are injected via environment variables — never committed to Git.
