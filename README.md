# ZestiGo 🍛 🍕 🍔

ZestiGo is a premium, modern, and high-performance Indian Food Delivery web application built with a robust decoupled architecture. It features a modern Single Page Application (SPA) frontend powered by TanStack Start and a secure, enterprise-grade backend REST API powered by Spring Boot, Spring Security (OAuth2/JWT), and MySQL.

---

## 🚀 Key Features

* **Gourmet Browsing:** Explore premium restaurants, popular dishes, cuisines, and food categories.
* **Smart Wishlist & Cart:** Seamless client-side state management for cart updates, coupon application, and saved favorites.
* **Flexible Checkout:** Support for delivery address configurations, payments (Wallet, Cards, Cash on Delivery), and order placement.
* **Order Tracking:** Follow your food's status live from the kitchen to your doorstep.
* **Dual Auth System:** Local registration and login secured via state-of-the-art JWT tokens, alongside integrated Google OAuth2 social login.
* **Interactive UI:** A highly responsive dashboard boasting beautiful card layouts, hover micro-animations, theme toggling, and clean visual structure.

---

## 🛠️ Technology Stack

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Routing & State:** [TanStack Start](https://tanstack.com/router/v1) (with built-in SSR capabilities), TanStack Router, TanStack Query
* **Styling:** Tailwind CSS, Vanilla CSS, Lucide React Icons
* **Toasts & Feedback:** Sonner (rich toast notifications)

### Backend
* **Core:** Spring Boot 3.3.4, Java 21 (JDK 23 compatible)
* **Build System:** Apache Maven 3.9+
* **Database & Persistence:** Spring Data JPA, Hibernate, MySQL Connector/J
* **Security & Auth:** Spring Security, JSON Web Tokens (jjwt), Google OAuth2 Client
* **Helper Utilities:** Lombok, MapStruct (Data Mapping), Jakarta Bean Validation

---

## 📁 Repository Structure

```
ZestiGo/
├── backend/            # Spring Boot REST API
│   ├── src/            # Java backend source code
│   │   ├── main/
│   │   │   ├── java/com/zestigo/       # Controllers, Services, DTOs, Security filters
│   │   │   └── resources/
│   │   │       ├── application.yml     # Configuration properties
│   │   │       ├── schema.sql          # Database schema initialization script
│   │   │       └── data.sql            # Dummy data and demo user seed script
│   └── pom.xml         # Maven dependencies
├── frontend/           # TanStack Start SPA Client
│   ├── src/            # React & TypeScript client source code
│   │   ├── components/ # Shared visual components & UI elements
│   │   ├── context/    # Global Context states (Auth, Cart, Wishlist, Theme)
│   │   ├── routes/     # TanStack routing page routes
│   │   └── services/   # Axios API client integrations
│   ├── package.json    # Frontend dependency configs
│   ├── .env.development # Dev environment configuration (Vite Port mappings)
│   └── vite.config.ts  # Vite configuration
└── .gitignore          # Root Git ignore configuration
```

---

## 🔧 Getting Started

### Prerequisites
1. **Java Development Kit (JDK 21 or higher)**
2. **Node.js (v18.x or higher) & npm (v10.x or higher)**
3. **MySQL Server (v8.x or higher)**

---

### Database Setup
1. Start your local MySQL server.
2. The backend is configured to automatically create the database `zestigo_db` on launch if it does not exist:
   ```yaml
   # backend/src/main/resources/application.yml datasource configuration
   url: jdbc:mysql://localhost:3306/zestigo_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   username: root
   password: dbms # <-- Change this to your local MySQL password if different
   ```

---

### Running the Project

#### Step 1: Start the Backend (Spring Boot)
1. Navigate to the `backend` directory.
2. Compile and boot the application:
   ```bash
   mvn clean spring-boot:run
   ```
3. The server will launch and listen on **`http://localhost:8081`**.
4. Database tables will automatically initialize, and the demo user will seed.
   * **Demo Email:** `demo@zestigo.com`
   * **Demo Password:** `password`

#### Step 2: Start the Frontend (TanStack Start Client)
1. Navigate to the `frontend` directory.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The client application will launch on **`http://localhost:8080`**. Open this address in your web browser.

---

## 🔒 Security Configuration
* **Stateless REST Security:** Disables cookies and session state in favor of stateless JWT tokens, which are automatically sent via the HTTP `Authorization: Bearer <token>` header by the [apiClient.ts](frontend/src/services/apiClient.ts) interceptor.
* **OAuth2 Google Integration:** Supports social login by directing users to `http://localhost:8081/oauth2/authorization/google`. Set your actual Google Client credentials in your local environment variables (`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`) or configure them in `application.yml` for full production functionality.
* **CORS Support:** The backend allows direct cross-origin API request mapping for dev hosts, letting the browser make requests to port 8081 without warnings.
