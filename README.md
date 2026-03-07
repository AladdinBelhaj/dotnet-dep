# Dotnet Inventory Management System

A full-stack inventory management application built with .NET 9 backend API and React frontend.

## Features

- User authentication and authorization (JWT-based)
- Inventory management (Products, Categories, Suppliers)
- Stock movement tracking
- Dashboard with KPIs and reports
- Role-based access control (Admin, Comptable)

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 22+
- SQL Server (local or Docker)
- Docker & Docker Compose (optional, for containerized setup)

### Local Development Setup

#### Backend

1. Navigate to `projet_backend` directory
2. Update connection string in `API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "ConnectionString": "Your SQL Server connection string"
   }
   ```
3. Run database migrations:
   ```bash
   cd API
   dotnet ef database update --project ../Context
   ```
4. Start the API:
   ```bash
   dotnet run --project API
   ```
   The API will run on `http://localhost:5165`

#### Frontend

1. Navigate to `frontend` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Docker Setup

1. Build and start all services:
   ```bash
   docker compose up --build
   ```

2. Services will be available at:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - SQL Server: `localhost:1433`

3. Database migrations run automatically via the `migrations` service

## Default Login Credentials

After initial database setup (migration + seeding), the following default users are automatically created:

| Username | Password | Role |
|----------|----------|------|
| `comptable` | `comptable123` | Comptable |
| `admin` | `admin123` | Admin |

**Note**: Default users are automatically seeded when the API starts for the first time. If you need to manually seed roles, you can call:
- `POST /api/auth/seed-roles` - Seeds Admin and Comptable roles

## API Endpoints

- Swagger UI: `http://localhost:5165/swagger` (when running locally)
- Base API URL: `http://localhost:5165/api`

## Testing

### Backend Tests
```bash
cd projet_backend
dotnet test
```

### Frontend System Tests (Playwright)
```bash
cd frontend
npm run test:system
```

### Frontend Selenium Tests
```bash
cd frontend
npm run test:selenium
```

**Note**: Ensure both backend and frontend are running before executing frontend tests.

## Project Structure

```
dotnet/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── projet_backend/        # .NET 9 backend
│   ├── API/              # Web API project
│   ├── Context/          # EF Core DbContext
│   ├── Entities/         # Domain models
│   └── projet_backend.Tests/  # Unit tests
└── docker-compose.yml    # Docker Compose configuration
```

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs backend unit tests
- Runs frontend system tests (Playwright)
- Runs Selenium tests
- Performs Trivy security scans
- Runs SonarQube code analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request