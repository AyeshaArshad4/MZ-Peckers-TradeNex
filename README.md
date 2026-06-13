# TradeNex — Digital Trade, Inventory & Ordering System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/SQL_Server-2017+-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  A full-stack enterprise-grade digital trade and inventory management platform for tile installation materials, supporting the <strong>Pakistan</strong> and <strong>Saudi Arabia</strong> markets.
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Default Credentials](#default-credentials)
- [Modules](#modules)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

TradeNex is a full-stack digital platform built for **MZ Peckers** to manage tile installation product inventory, customer orders, bulk quote requests, and business analytics. It supports two user roles — **Admin** and **Customer** — with a complete approval workflow, JWT authentication, and a responsive React frontend.

---

## Tech Stack

### Backend

| Technology           | Purpose                     |
| -------------------- | --------------------------- |
| Node.js 18+          | Runtime                     |
| Express.js 4.18      | REST API framework          |
| Microsoft SQL Server | Database                    |
| mssql (Tedious)      | SQL Server driver           |
| bcrypt               | Password hashing            |
| jsonwebtoken         | JWT access & refresh tokens |
| Joi                  | Request validation          |
| Multer               | File uploads                |
| Helmet               | Security headers            |
| Winston              | Logging                     |
| Morgan               | HTTP request logging        |

### Frontend

| Technology      | Purpose                       |
| --------------- | ----------------------------- |
| React 18        | UI framework                  |
| Vite 5          | Build tool                    |
| Redux Toolkit   | State management              |
| React Router v6 | Client-side routing           |
| Axios           | HTTP client with interceptors |
| Tailwind CSS 3  | Styling                       |
| Recharts        | Analytics charts              |
| React Hook Form | Form management               |
| Zod             | Schema validation             |
| Lucide React    | Icons                         |
| React Hot Toast | Notifications                 |

---

## Features

### Authentication

- ✅ User registration with admin approval workflow
- ✅ JWT access tokens (15 min expiry)
- ✅ Refresh token rotation (7 day expiry)
- ✅ Secure logout with token revocation
- ✅ Password change with forced re-login
- ✅ Role-based access control (Admin / Customer)

### Product Catalog

- ✅ Product categories
- ✅ Product variants (e.g. Colour, Size, Grout Width)
- ✅ Product images (up to 6 per product)
- ✅ Trademark badge & Verified Supplier label
- ✅ Dynamic stock management (computed `IsInStock`)
- ✅ Full-text search by name, SKU, description
- ✅ Filter by category and stock status
- ✅ Paginated product listing

### Cart & Orders

- ✅ Add / update / remove cart items
- ✅ Variant-level stock validation
- ✅ One-click checkout
- ✅ Full order lifecycle (Pending → Confirmed → Processed → Shipped → Delivered)
- ✅ Order status history tracking
- ✅ Customer cancellation requests with admin decision
- ✅ Payment status management (Paid / Unpaid)

### Quote Management

- ✅ Customer bulk quote requests with target pricing
- ✅ Admin quote response with custom pricing
- ✅ Customer accept/reject quote
- ✅ Auto-convert accepted quotes to orders

### Decision Support Tools

- ✅ **Quantity Calculator** — calculates clips/boxes needed from tile dimensions and area (includes 10% wastage)
- ✅ Direct add-to-cart from calculator result

### Reviews & Queries

- ✅ Product reviews with star ratings
- ✅ Admin review moderation (approve/delete)
- ✅ Customer product queries
- ✅ Admin query responses

### Admin Dashboard

- ✅ Real-time analytics (orders, revenue, customers)
- ✅ Monthly revenue bar chart
- ✅ Top 5 selling products
- ✅ Recent orders table
- ✅ Pending user approval queue
- ✅ Full user management (approve/reject with reason)
- ✅ Complete product management (add/edit/deactivate)
- ✅ Order status & payment updates
- ✅ Quote response system

---

## Project Structure

```
MZ_Peckers/
├── tradenex-backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MSSQL connection pool
│   │   │   └── constants.js        # App-wide constants
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verification
│   │   │   ├── rbac.middleware.js  # Role-based access control
│   │   │   ├── validate.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── validators/
│   │   │   ├── auth.validators.js
│   │   │   ├── product.validators.js
│   │   │   ├── order.validators.js
│   │   │   └── quote.validators.js
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic + DB queries
│   │   ├── routes/                 # Express route definitions
│   │   └── utils/
│   │       ├── logger.js           # Winston daily rotate logger
│   │       ├── jwt.utils.js        # Token sign/verify helpers
│   │       ├── response.utils.js   # Standardized API responses
│   │       └── seed.js             # DB seed script
│   ├── uploads/                    # Uploaded product images
│   ├── logs/                       # Rotating log files
│   ├── .env
│   └── package.json
│
└── tradenex-frontend/
    ├── src/
    │   ├── api/                    # Axios API layer
    │   ├── components/
    │   │   ├── common/             # Reusable UI components
    │   │   └── layout/             # Navbar, Sidebar, AppLayout
    │   ├── pages/
    │   │   ├── auth/               # Login, Register
    │   │   ├── customer/           # Products, Cart, Orders, Quotes, Queries
    │   │   └── admin/              # Dashboard, Users, Products, Orders, Quotes, Reviews, Queries
    │   ├── store/
    │   │   └── slices/             # Redux state (auth, cart)
    │   ├── utils/
    │   │   └── formatters.js       # Currency, date, status color helpers
    │   ├── App.jsx                 # Route definitions
    │   └── main.jsx
    ├── .env
    └── package.json
```

---

## Database Schema

The database consists of **16 tables** with full constraints, indexes, and foreign keys.

```
Users                 — Customers and Admins
RefreshTokens         — JWT refresh token storage
PasswordResetTokens   — Password reset flow
Categories            — Product categories
Products              — Product catalog
ProductVariants       — Product options (colour, size, etc.)
ProductImages         — Product image gallery
Carts                 — Active customer carts
CartItems             — Items in each cart
Orders                — Customer orders
OrderItems            — Line items in each order
OrderStatusHistory    — Full order lifecycle audit trail
Quotes                — Bulk pricing requests
QuoteItems            — Items in each quote
Reviews               — Product reviews (with moderation)
CustomerQueries       — Customer questions
QueryResponses        — Admin answers to queries
DailySalesSnapshot    — Analytics pre-aggregation
```

### Key Relationships

```
Users ──< Orders ──< OrderItems >── ProductVariants >── Products
Users ──< Quotes ──< QuoteItems >── ProductVariants
Users ──< Carts  ──< CartItems  >── ProductVariants
Products ──< ProductVariants
Products ──< ProductImages
Products ──< Reviews
Products ──< CustomerQueries ──< QueryResponses
Orders ──< OrderStatusHistory
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint                | Auth | Description               |
| ------ | ----------------------- | ---- | ------------------------- |
| POST   | `/auth/register`        | No   | Register new customer     |
| POST   | `/auth/login`           | No   | Login, receive token pair |
| POST   | `/auth/refresh`         | No   | Refresh access token      |
| POST   | `/auth/logout`          | No   | Revoke refresh token      |
| GET    | `/auth/me`              | Yes  | Get current user          |
| PUT    | `/auth/change-password` | Yes  | Change password           |

### Users (Admin)

| Method | Endpoint             | Auth  | Description        |
| ------ | -------------------- | ----- | ------------------ |
| GET    | `/users`             | Admin | List all users     |
| GET    | `/users/:id`         | Admin | Get user by ID     |
| PATCH  | `/users/:id/approve` | Admin | Approve customer   |
| PATCH  | `/users/:id/reject`  | Admin | Reject customer    |
| PUT    | `/users/profile/me`  | Any   | Update own profile |

### Products

| Method | Endpoint               | Auth     | Description                              |
| ------ | ---------------------- | -------- | ---------------------------------------- |
| GET    | `/products`            | Approved | List products (search, filter, paginate) |
| GET    | `/products/categories` | Any      | List categories                          |
| GET    | `/products/:id`        | Approved | Product detail with variants & reviews   |
| POST   | `/products`            | Admin    | Create product (multipart/form-data)     |
| PUT    | `/products/:id`        | Admin    | Update product                           |
| DELETE | `/products/:id`        | Admin    | Soft-delete product                      |

### Cart

| Method | Endpoint              | Auth     | Description          |
| ------ | --------------------- | -------- | -------------------- |
| GET    | `/cart`               | Customer | Get cart with totals |
| POST   | `/cart/items`         | Customer | Add or update item   |
| DELETE | `/cart/items/:itemId` | Customer | Remove item          |
| DELETE | `/cart`               | Customer | Clear cart           |

### Orders

| Method | Endpoint                         | Auth     | Description                 |
| ------ | -------------------------------- | -------- | --------------------------- |
| POST   | `/orders`                        | Customer | Place order from cart       |
| GET    | `/orders/my`                     | Customer | My order history            |
| GET    | `/orders/my/:id`                 | Customer | My order detail             |
| POST   | `/orders/my/:id/cancel`          | Customer | Request cancellation        |
| GET    | `/orders/admin`                  | Admin    | All orders (filtered)       |
| GET    | `/orders/admin/:id`              | Admin    | Any order detail            |
| PATCH  | `/orders/admin/:id/status`       | Admin    | Update order status         |
| PATCH  | `/orders/admin/:id/payment`      | Admin    | Update payment status       |
| PATCH  | `/orders/admin/:id/cancellation` | Admin    | Approve/reject cancellation |

### Quotes

| Method | Endpoint                    | Auth     | Description                  |
| ------ | --------------------------- | -------- | ---------------------------- |
| POST   | `/quotes`                   | Customer | Submit quote request         |
| GET    | `/quotes/my`                | Customer | My quotes                    |
| GET    | `/quotes/my/:id`            | Customer | My quote detail              |
| POST   | `/quotes/my/:id/accept`     | Customer | Accept quote → creates order |
| POST   | `/quotes/my/:id/reject`     | Customer | Reject quote                 |
| GET    | `/quotes/admin`             | Admin    | All quotes                   |
| PATCH  | `/quotes/admin/:id/respond` | Admin    | Respond with pricing         |

### Reviews

| Method | Endpoint                      | Auth     | Description     |
| ------ | ----------------------------- | -------- | --------------- |
| POST   | `/reviews/:productId`         | Customer | Submit review   |
| GET    | `/reviews/product/:productId` | Any      | Product reviews |
| GET    | `/reviews/admin/pending`      | Admin    | Pending reviews |
| PATCH  | `/reviews/admin/:id/approve`  | Admin    | Approve review  |
| DELETE | `/reviews/admin/:id`          | Admin    | Delete review   |

### Queries

| Method | Endpoint                     | Auth     | Description      |
| ------ | ---------------------------- | -------- | ---------------- |
| POST   | `/queries`                   | Customer | Submit query     |
| GET    | `/queries/my`                | Customer | My queries       |
| GET    | `/queries/admin`             | Admin    | All queries      |
| POST   | `/queries/admin/:id/respond` | Admin    | Respond to query |

### Analytics

| Method | Endpoint               | Auth  | Description         |
| ------ | ---------------------- | ----- | ------------------- |
| GET    | `/analytics/dashboard` | Admin | Full dashboard data |

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **SQL Server** (Express edition is fine) — [SQL Server Downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **SSMS** (SQL Server Management Studio) — [Download SSMS](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- **Git** (optional)

---

## Installation & Setup

### Step 1 — Database Setup

1. Open **SSMS** and connect to your SQL Server instance
2. Open a new query window and run the full `tradenex_complete.sql` script
3. Verify all tables were created:

```sql
USE TradeNex;
SELECT name FROM sys.tables ORDER BY name;
```

You should see 16+ tables including `Users`, `Products`, `Orders`, etc.

### Step 2 — Enable TCP/IP (for Node.js connection)

1. Open **SQL Server Configuration Manager**
2. Go to `SQL Server Network Configuration → Protocols for SQLEXPRESS01`
3. Enable **TCP/IP**
4. Right-click TCP/IP → Properties → IP Addresses → IPAll → set **TCP Port = 1433**
5. Restart SQL Server service

### Step 3 — Create SQL Login

Run in SSMS:

```sql
USE master;
CREATE LOGIN tradenex_user WITH PASSWORD = 'TradeNex@2024!';
GO

USE TradeNex;
CREATE USER tradenex_user FOR LOGIN tradenex_user;
ALTER ROLE db_datareader ADD MEMBER tradenex_user;
ALTER ROLE db_datawriter ADD MEMBER tradenex_user;
GO
```

### Step 4 — Backend Setup

```bash
cd tradenex-backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
cd .env.example .env
# Edit .env with your DB credentials

# Create required folders
mkdir uploads logs

# Generate password hashes and seed DB
node generate-hashes.js

# Start development server
npm run dev
```

### Step 5 — Frontend Setup

```bash
cd tradenex-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env

# Start development server
npm run dev
```

---

## Environment Variables

### Backend — `tradenex-backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=TradeNex
DB_WINDOWS_AUTH=false
DB_USER=tradenex_user
DB_PASSWORD=TradeNex@2024!
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000

# JWT — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_hex_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_different_64_char_hex_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Uploads
MAX_FILE_SIZE_MB=5
UPLOAD_PATH=./uploads
```

### Frontend — `tradenex-frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Running the App

Open **two terminals** simultaneously:

**Terminal 1 — Backend:**

```bash
cd tradenex-backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
cd tradenex-frontend
npm run dev
# App running at http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## Default Credentials

| Role                | Email                       | Password        |
| ------------------- | --------------------------- | --------------- |
| Admin               | `admin@mzpeckers.com`       | `Admin@1234`    |
| Customer (Approved) | `ali.contractor@gmail.com`  | `Customer@1234` |
| Customer (Approved) | `sara.tileshop@gmail.com`   | `Customer@1234` |
| Customer (Approved) | `usman.installer@gmail.com` | `Customer@1234` |
| Customer (Pending)  | `fatima.pending@gmail.com`  | `Customer@1234` |

> **Note:** `fatima_pending` cannot log in until approved by an Admin.

---

## Modules

### 🔐 Authentication Flow

```
Register → PendingApproval
Admin approves → Approved (can log in)
Admin rejects → Rejected (cannot log in)

Login → Access Token (15min) + Refresh Token (7 days)
Access Token expires → Auto-refresh via interceptor
Logout → Refresh token revoked in DB
```

### 🛒 Order Lifecycle

```
Customer adds to cart → Checkout → Order (Pending)
Admin confirms → Confirmed
Admin processes → Processed
Admin ships → Shipped (with tracking info)
Admin delivers → Delivered
Customer requests cancel → Pending admin decision
Admin approves cancel → Cancelled
```

### 💬 Quote Lifecycle

```
Customer submits quote request → Pending
Admin responds with pricing → Responded
Customer accepts → Accepted → Order auto-created
Customer rejects → Rejected
```

### 📊 Analytics Dashboard

The admin dashboard shows:

- Total orders, revenue, customers
- Pending orders, shipped orders, delivered orders
- Monthly revenue bar chart (last 6 months)
- Top 5 best-selling products
- Recent 10 orders
- Pending user approvals

---

## Security

| Measure                | Implementation                                            |
| ---------------------- | --------------------------------------------------------- |
| Password hashing       | bcrypt with 12 salt rounds                                |
| Access tokens          | JWT, 15-minute expiry                                     |
| Refresh token rotation | Old token revoked on every refresh                        |
| Token reuse detection  | All user tokens revoked if reuse detected                 |
| Rate limiting          | 20 req/15min on auth, 300 req/15min on API                |
| Security headers       | Helmet.js (15 HTTP security headers)                      |
| CORS                   | Whitelist-only origin                                     |
| SQL injection          | Parameterized queries only (`sql.input()`)                |
| File upload            | Type validation (images only), UUID filenames, size limit |
| XSS                    | Helmet CSP headers                                        |
| Input validation       | Joi on all request bodies                                 |

---

## Troubleshooting

### DB Connection: `ETIMEOUT`

```
1. services.msc → Start "SQL Server Browser" → set Automatic
2. SQL Server Config Manager → Enable TCP/IP → Restart service
3. PowerShell: Test-NetConnection localhost -Port 1433
```

### DB Connection: `EINSTLOOKUP`

```
SQL Server Browser not running.
OR — use direct port instead: remove DB_INSTANCE, set DB_PORT=1433
```

### Login: `Invalid email or password`

```
Password hashes not set. Run:
node generate-hashes.js
```

### Frontend: Tailwind class errors

```
npm install -D tailwindcss@3 postcss autoprefixer
```

### Products not showing images

```
Backend must be running at port 5000.
Image URLs are served at http://localhost:5000/uploads/
```

### Admin redirects to login

```javascript
// Run in browser DevTools console:
localStorage.clear();
// Then refresh and login again
```

---

## Scripts

### Backend

| Script       | Command        | Description            |
| ------------ | -------------- | ---------------------- |
| Start (prod) | `npm start`    | Run with node          |
| Start (dev)  | `npm run dev`  | Run with nodemon       |
| Seed DB      | `npm run seed` | Update password hashes |

### Frontend

| Script     | Command           | Description              |
| ---------- | ----------------- | ------------------------ |
| Dev server | `npm run dev`     | Start Vite dev server    |
| Build      | `npm run build`   | Production build         |
| Preview    | `npm run preview` | Preview production build |

---

## License

This project is proprietary software developed for **MZ Peckers**.  
All rights reserved © 2024 MZ Peckers.
