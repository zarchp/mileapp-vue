# Task Management App (Vue.js Frontend)

This project is the **frontend** of the **MileApp Fullstack Test**.  
It is a **Vue.js Single Page Application (SPA)** that connects to the mock Laravel backend API for user authentication and task management (CRUD).  
The interface is built with **Shadcn Vue** components for a clean and modern UI.

---

## 🧩 Overview

The application allows users to:

- **Login** (mock authentication)
- **View, create, edit, and delete** tasks
- **Filter tasks** by completion status
- **Mark tasks as completed**
- **View due dates** with visual indicators
- **Paginate and sort** task lists

All API requests use the base URL defined in the `.env.*` file.

---

## 🏗️ Design Decisions

1. **Vue 3 + Vite + TypeScript**  
   Chosen for performance, scalability, and strong typing when interacting with the backend API.

2. **Shadcn Vue (UI Library)**  
   Provides accessible, consistent, and easily customizable components for a modern interface.

3. **Composable Architecture**  
   Data logic is separated into composables (e.g., for fetching, filtering, and pagination), ensuring cleaner and reusable code.

4. **Vue Router**  
   Handles protected routes and smooth navigation between login and task pages.

---

## ⚙️ Environment Variables

Change base URL in `.env.production`

```
VITE_API_BASE_URL=http://localhost:8000
```

This ensures all API requests point to your Laravel backend.

---

## 🚀 How to Run

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Build for production:

   ```
   npm run build
   ```

4. Access the app:
   ```
   http://localhost:5173
   ```

---

## 🔐 Authentication

- Uses a **mock login** endpoint (`/login`) from the backend.
- The access token is stored in `localStorage`.
- Logging out clears the token and redirects to the login page.

---

## 💡 Features

- Clean and responsive UI built with Shadcn Vue
- Task filtering (All, Active, Completed)
- Pagination with adjustable items per page
- Quick toggle for task completion
- Human-readable due dates

---

## 🧠 Strengths

- **Built with Vue and TypeScript**
- **Realistic mock integration** with backend API
- **Lightweight and fast** using Vite
- **Accessible and elegant UI** with Shadcn Vue
- **Easy to extend** for real API or advanced features

---

**Project:** MileApp Fullstack Test  
**Author:** Muhamad Anzar Syahid  
**Tech Stack:** Vue 3 · TypeScript · Vue Router · Vite · Shadcn Vue
