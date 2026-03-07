# Enterprise Dashboard - Frontend

## Overview
High-end, enterprise-level dashboard built with React, Material UI (MUI v7), TanStack Table/Query, and Recharts. This dashboard provides advanced data exploration and decision-making capabilities for inventory management.

## Tech Stack
- **React 19** with TypeScript
- **Material UI v7** - UI Component Library
- **TanStack Table v8** - Advanced table features (sorting, filtering, pagination)
- **TanStack Query v5** - Data fetching and caching
- **Recharts** - Data visualization
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **jsPDF & xlsx** - Export to PDF and Excel
- **date-fns** - Date utilities

## Features

### Dashboard
- **KPI Cards**: Total products, total stock, low stock alerts, movements today
- **Trend Charts**: Stock evolution over last 7 days, most active products
- **Alerts Panel**: Real-time low stock warnings

### Inventory Management
- **Advanced Data Grid** powered by TanStack Table:
  - Multi-column sorting
  - Global search + per-column filters  
  - Column visibility toggling
  - Column resizing
  - Pagination (10/20/50/100 items per page)
- **Export**: Excel (.xlsx) and PDF
- **Visual Indicators**: Color-coded stock status (low stock in red)

### Movements History
- **Filterable Table**:
  - Date range filtering
  - Global search
  - Sortable columns
- **Export to Excel**
- **Type indicators**: Entry (green) vs Exit (red)

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin vs Comptable)
- Protected routes

## Project Structure

```
frontend/
├── src/
│   ├─ api/
│   │   └── axios.ts              # HTTP client configuration
│   ├── components/
│   │   ├── Dashboard/
│   │   │   └── KPICard.tsx       # Reusable KPI card component
│   │   └── Layout/
│   │       └── MainLayout.tsx    # Main layout with sidebar & header
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── features/
│   │   ├── auth/
│   │   │   └── Login.tsx         # Login page
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx     # Dashboard with KPIs and charts
│   │   ├── inventory/
│   │   │   └── InventoryPage.tsx # Inventory management with TanStack Table
│   │   └── movements/
│   │       └── MovementsPage.tsx # Stock movements history
│   ├── theme/
│   │   └── theme.ts              # MUI theme configuration
│   ├── utils/
│   │   └── export.ts             # Excel/PDF export utilities
│   ├── types.ts                  # TypeScript type definitions
│   └── App.tsx                   # Main app component with routing
├── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js (v22+ recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
Edit `src/api/axios.ts` and set the correct backend API URL:
```typescript
export const API_URL = 'http://localhost:5000/api'; // Update port if needed
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Backend Integration

### Required API Endpoints
The frontend expects the following endpoints from the .NET backend:

#### Authentication
- `POST /api/auth/login` - Login with username & password
- `POST /api/auth/register` - Register new user

#### Products
- `GET /api/products` - Get all products (with Category & Supplier)
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

#### Stock Movements
- `POST /api/stock/movement` - Record stock movement (Entry/Exit)
- `GET /api/stock/history` - Get movements history

#### Other
- `GET /api/categories` - Get all categories
- `GET /api/suppliers` - Get all suppliers

### CORS Configuration
Ensure your backend has CORS enabled to allow requests from the React development server (`http://localhost:5173`).

## Environment Variables
Create a `.env` file for environment-specific configuration:
```
VITE_API_URL=http://localhost:5000/api
```

## Known Issues & Notes

### MUI v7 Grid API
This project uses Material UI v7, which has a newer Grid API. The `item` prop has been deprecated. If you encounter TypeScript errors related to Grid, consider downgrading to MUI v5 or updating the Grid usage to the new API (using `Grid2` or the compatibility layer).

### JWT Token Claims
The `AuthContext` expects JWT tokens to contain:
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name` (username)
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` (role)

Adjust the token decoding in `AuthContext.tsx` if your backend uses different claim names.

## Development Tips

### Hot Reload
The Vite development server supports hot module replacement (HMR) for instant feedback during development.

### TypeScript
The project uses strict TypeScript configuration. Ensure all types are properly defined.

### Linting
Run ESLint to check for code quality issues:
```bash
npm run lint
```

## License
Proprietary - Enterprise Inventory Management System

---

**Note**: This is a professional ERP-style dashboard optimized for desktop usage. Mobile responsiveness is limited by design to maintain the dense, information-rich layout required for enterprise data exploration.
