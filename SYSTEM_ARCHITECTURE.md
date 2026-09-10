# 🏗️ System Architecture & Codebase Summary

## 1. Project Overview & Tech Stack
The **Event Management System** leverages a modern, scalable client-server architecture. The system employs several core architectural design patterns to ensure maintainability, security, and performance:

*   **Layered Architecture:** The backend follows a strict separation of concerns, separating Routing, Controllers (Handlers), Services (Business Logic), and Repositories (Data Access).
*   **REST API Specifications:** Standardized JSON over HTTP for client-server communication.
*   **Role-Based Access Control (RBAC):** Granular permissions ensuring operations are restricted to `ADMIN`, `ORGANIZER`, or `STAFF` roles where appropriate.
*   **Server-Side Pagination & Filtering:** Complex data querying is offloaded to the database to ensure UI performance is maintained regardless of dataset size.

**Backend Stack:**
*   **Language & Framework:** Go (Golang) with the Gin Web Framework.
*   **Database & ORM:** PostgreSQL managed via GORM.
*   **Security:** JWT Authentication for session management and route protection.

**Frontend Stack:**
*   **Core:** React built with Vite, utilizing TypeScript for type safety.
*   **Styling & UI:** Tailwind CSS combined with Shadcn UI components for accessible, rapid UI development.
*   **Network:** Axios for HTTP client operations and API communication.

---

## 2. Comprehensive Directory Breakdown

### Backend Directory Structure
```text
Backend/
├── constants/    # Defines system-wide constant values.
├── dtos/         # Data Transfer Objects for strictly typing incoming requests and outgoing responses.
├── handlers/     # HTTP Controllers that parse requests, invoke services, and format JSON responses.
├── helpers/      # Utility functions (e.g., password hashing, token generation).
├── infra/        # Infrastructure setup including Database connections and Environment variable loading.
├── middlewares/  # Express-style middleware functions (JWT Auth, RBAC, CORS).
├── models/       # GORM entity definitions (User, Event, Registration).
├── repository/   # Database access layer handling direct GORM/SQL queries.
├── routes/       # API endpoint definitions and router grouping.
└── services/     # Core business logic orchestrating operations between handlers and repositories.
```

### Frontend Directory Structure
```text
frontend/src/
├── assets/       # Static assets like images and global icons.
├── components/   # Reusable, generic UI components (often Shadcn UI primitives like Buttons, Inputs).
├── features/     # Domain-specific components (e.g., ReportFilterToolbar, ReportPreviewTable).
├── hooks/        # Custom React hooks encapsulating complex state and side-effects (e.g., useReports, useEvents).
├── pages/        # Top-level route components acting as view containers (e.g., Dashboard, LandingPage).
├── services/     # API client configurations and utility functions for external communication.
└── types/        # Global TypeScript interfaces and type definitions ensuring frontend data consistency.
```

---

## 3. End-to-End Feature Data Flow (Trace Mechanics)

Below is the complete request/response lifecycle for the **Filtered Reports Generation** feature.

```text
[1] UI Trigger (React Component)
    └── src/pages/dashboard/Reports.tsx
        User selects filters (e.g., Type: Performance, Category: Workshop) and clicks "Generate Report".

[2] Custom Hook Invocation
    └── src/hooks/useReports.ts
        The `generateReport` function constructs the URL query parameters and initiates the network request.

[3] Service Client & HTTP Network Boundary
    └── src/services/api.ts -> HTTP GET /api/admin/reports?type=performance&category=workshop
        Axios attaches the JWT Bearer token and sends the request over the network.

[4] Backend Router
    └── Backend/routes/routes.go
        The Gin router matches the `/api/admin/reports` path and applies the required middleware chain.

[5] Security Middleware (JWT/Admin RBAC)
    └── Backend/middlewares/auth.go -> middlewares.Authenticated()
    └── Backend/middlewares/role.go -> middlewares.RequiredRole("ADMIN", "STAFF")
        Validates the JWT signature, checks expiration, extracts user claims, and ensures the user holds the required role.

[6] Controller Handler
    └── Backend/handlers/report_handler.go -> ReportHandler.GetReport()
        Parses query parameters into `dtos.ReportQueryDTO` and passes them to the Report Service.

[7] Business Logic Service
    └── Backend/services/report_service.go -> ReportService.GetReport()
        Determines the specific report type and requests data from the Repository layer.

[8] Database Repository & PostgreSQL Execution
    └── Backend/repository/report_repo.go
        Executes complex GORM/SQL aggregation queries against the PostgreSQL database.

[9] JSON Response Formatter
    └── Backend/handlers/report_handler.go
        The handler wraps the database result and contextual metadata into a standardized JSON payload.

[10] React State Hydration & UI Rendering
     └── src/hooks/useReports.ts -> src/pages/dashboard/Reports.tsx
         The hook updates `reportData` and `filterContext` state, triggering a re-render of the Dashboard UI (Charts, Tables) and enabling PDF/CSV Export execution based on the hydrated data.
```

---

## 4. Security, DB Migrations & Infrastructure

### PostgreSQL Connections in Docker Environments
The application ensures reliable PostgreSQL connections by utilizing standard Docker orchestration mechanics. While explicit retry loops (like `wait-for-it.sh`) can be used, the backend primarily leverages Docker's intrinsic **restart policies** (e.g., `restart: always` or `on-failure`). If the PostgreSQL container is slow to initialize, the Go application will log a fatal error (`log.Fatalf("Failed to connect to database: %v", err)`) upon `gorm.Open` failure, causing the backend container to exit. Docker then automatically restarts the backend container until the database is ready to accept connections.

### JWT Validation & RBAC Protection Layers
Security is enforced at the routing level via middleware chains:
1.  **`Authenticated()`:** Extracts the `Bearer` token from the `Authorization` header, parses the JWT using the system's secret key, and validates the signature and expiration time. Extracted claims (UserID, Role) are injected into the Gin request context.
2.  **`RequiredRole(allowedRoles ...string)`:** Intercepts the request post-authentication. It retrieves the user's role from the Gin context and validates it against a slice of allowed roles for the specific endpoint. Unauthorized users immediately receive a `401 Unauthorized` JSON response, preventing them from hitting the controller logic.

### Database Auto-Migrations & Entity Relationships
The system utilizes GORM's `AutoMigrate` functionality during application startup (`infra.DbConnect()`). This guarantees that the database schema is always in sync with the Go struct definitions (`models.User`, `models.Event`, `models.EventRegistration`) without requiring manual SQL migration scripts.

**Core Relationships:**
*   **Events to Registrations (1:N):** An `Event` can have many `EventRegistration` records. The `EventRegistration` model establishes this relationship via the `EventID` foreign key (`gorm:"foreignKey:EventID"`).
*   **Indexing:** Critical foreign keys and frequently queried fields (e.g., `event_id`, `guest_email` on Registrations) are automatically indexed by GORM (`gorm:"index:idx_event_guest_email"`) to optimize query performance.

---

## 5. UI/UX Rules & Theme Governance

### Layout Separation (Public vs. Dashboard)
The frontend architecture enforcing distinct user experiences based on context:
*   **Public Landing Page:** Located in `src/pages/public/LandingPage.tsx`, this area utilizes a **Visual Cards Layout**. It focuses on aesthetics, large imagery, and marketing-friendly typography to showcase upcoming events to unauthenticated guests.
*   **Inside Dashboard:** Located under `src/pages/dashboard/`, the internal application utilizes a **Strict Shadcn Data Table Layout**. It prioritizes high information density, structural uniformity, and complex data manipulation (filtering, sorting, pagination) for administrators and organizers.

### Centralized CSS Variables & Theme Inheritance
The application utilizes a sophisticated theming engine governed by `src/index.css`. Tailwind CSS relies on these CSS variables to seamlessly handle Dark and Light mode transitions.

*   **Light Mode (Default):** Variables like `--background: #fafafa;` and `--card: #ffffff;` provide a clean, subtle off-white aesthetic with slight gradient depth (`--card-gradient`).
*   **Dark Mode (`.dark` class):** The variables are overridden (e.g., `--background: #09090b;`, `--card: #0c0c0f;`) to provide a flat, high-contrast dark aesthetic typical of modern Shadcn UIs.

By centralizing colors into structural variables (`--border`, `--muted-foreground`, `--card-foreground`), React components do not hardcode specific hex codes (e.g., using `bg-card` instead of `bg-white`). This ensures that applying the `.dark` class to the `<html>` or `<body>` element instantly propagates the correct theme throughout the entire application tree.
