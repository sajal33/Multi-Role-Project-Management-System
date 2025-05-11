# Multi-Role Project Management System

A robust REST API for a Project Management System where companies can manage users, projects, and tasks, with strict role-based access and multi-tenancy.

## Features

- **Multi-tenancy**: Users can only access data from their own company
- **Authentication**: JWT-based login with refresh token support
- **Role-based Authorization**:
  - **Admin**: Full access to all company data
  - **Manager**: Can manage projects & tasks, but not users
  - **Member**: Can view and update assigned tasks only
- **CRUD Operations**:
  - Companies: register & setup
  - Users: create (admin only), list (by company), login, refresh tokens
  - Projects: CRUD by Admin & Manager
  - Tasks: CRUD by Admin & Manager; Members can update their assigned tasks
- **Pagination** on listing endpoints
- **Search/Filter**: Tasks by status and assignee
- **Validation** using Joi
- **Rate Limiting** using express-rate-limit
- **Centralized Error Handling** middleware
- **Modular folder structure**

## Tech Stack

- Node.js with Express.js
- MongoDB (Mongoose ODM)
- JWT (with refresh token support)
- Joi for validation
- Jest for testing

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project-management-api
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example`
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your own values

5. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a company admin
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Companies

- `POST /api/companies` - Create a new company
- `GET /api/companies` - Get all companies (Admin only)
- `GET /api/companies/:id` - Get a single company (Admin only)
- `PUT /api/companies/:id` - Update a company (Admin only)
- `DELETE /api/companies/:id` - Delete a company (Admin only)

### Users

- `POST /api/users` - Create a new user (Admin only)
- `GET /api/users` - Get all users in company (Admin only)
- `GET /api/users/:id` - Get a single user (Admin only)
- `PUT /api/users/:id` - Update a user (Admin only)
- `DELETE /api/users/:id` - Delete a user (Admin only)

### Projects

- `POST /api/projects` - Create a new project (Admin/Manager)
- `GET /api/projects` - Get all projects in company (Admin/Manager)
- `GET /api/projects/:id` - Get a single project (All roles)
- `PUT /api/projects/:id` - Update a project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete a project (Admin/Manager)

### Tasks

- `POST /api/tasks` - Create a new task (Admin/Manager)
- `GET /api/tasks` - Get all tasks with filters (Admin/Manager)
- `GET /api/tasks/me` - Get tasks assigned to current user (All roles)
- `GET /api/tasks/:id` - Get a single task (All roles with permissions)
- `PUT /api/tasks/:id` - Update a task (All roles with permissions)
- `DELETE /api/tasks/:id` - Delete a task (Admin/Manager)

## Testing

Run the tests with:

```bash
npm test
```

## Postman Collection

A Postman collection is included in the repository. Import the `Project-Management-API.postman_collection.json` file into Postman to test the API endpoints.

## License

This project is licensed under the ISC License.
