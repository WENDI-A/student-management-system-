# Student Management System - Backend

This is the backend API for the Student Management System, built with Express.js and Sequelize ORM.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd student-management-system/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and other configuration.

5. Create the database:
   ```sql
   CREATE DATABASE student_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

6. Seed the database with sample data:
   ```bash
   npm run seed
   # or
   yarn seed
   ```

## Running the Server

### Development Mode
```bash
npm run dev
# or
yarn dev
```

### Production Mode
```bash
npm start
# or
yarn start
```

The server will start on the port specified in your `.env` file (default: 3001).

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `GET /api/auth/verify-token` - Verify JWT token
- `GET /api/auth/permissions` - Get user permissions

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create a new teacher
- `PUT /api/teachers/:id` - Update a teacher
- `DELETE /api/teachers/:id` - Delete a teacher

### Parents
- `GET /api/parents` - Get all parents
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create a new parent
- `PUT /api/parents/:id` - Update a parent
- `DELETE /api/parents/:id` - Delete a parent

## Database Troubleshooting

If you encounter database errors:

1. Check your MySQL server is running
2. Verify your database credentials in the `.env` file
3. Make sure the database exists:
   ```sql
   CREATE DATABASE student_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. If you need to reset the database, set `FORCE_MIGRATION=true` in your `.env` file and restart the server

## Default Users

After running the seed script, the following users will be available:

| Username | Password    | Role    |
|----------|-------------|---------|
| admin    | admin123    | Admin   |
| semer    | teacher123  | Teacher |
| john     | teacher123  | Teacher |
| jemal    | student123  | Student |
| sara     | student123  | Student |
| abdela   | parent123   | Parent  |
| mohammed | parent123   | Parent  |

## Testing

```bash
npm test
# or
yarn test
```
