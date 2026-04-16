# Emergency Backend API

## Installation

Clone project:

```bash
git clone https://github.com/aurelioo29/emergency-backend
cd emergency-backend
```

Install dependencies:

```bash
npm install
```

Copy Environment & Configuration:

```bash
cp .env.example .env
Edit our file .env
```

Database Setup &&
Create database manually in PostgreSQL:

```bash
CREATE DATABASE emergency_app;
```

Run Database Migration &&
Run all migrations:

```bash
npx sequelize-cli db:migrate
```

Run Seeder &&
Run all seeders:

```bash
npx sequelize-cli db:seed:all
```

Start Project:

```bash
npm run dev
```

## API Routes

- Auth Routes

```
/api/auth/register
/api/auth/login
/api/auth/admin/login
/api/auth/officer/login
/api/auth/refresh
/api/auth/logout
/api/auth/me
```

- Emergency Report Routes

```
/api/emergency-reports
/api/emergency-reports/me
/api/emergency-reports
/api/emergency-reports/:id
/api/emergency-reports/:id/status
```

- Dispatch Routes

```
/api/dispatches
/api/dispatches
/api/dispatches/report/:reportId
/api/dispatches/:id/status
/api/dispatches/:id/accept
/api/dispatches/:id/start
/api/dispatches/:id/arrive
/api/dispatches/:id/complete
```

- Officer Location Routes

```