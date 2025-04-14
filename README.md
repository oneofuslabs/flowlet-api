# Flowless API

Express.js API with TypeScript and Supabase integration.

## Features

- TypeScript + Express.js
- Supabase for authentication and database
- JWT-based authentication
- Environment-based configuration

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your Supabase credentials:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your Supabase project URL and keys.

## Development

Start the development server:

```
npm run dev
```

## Production

Build and start for production:

```
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/reset-password` - Request password reset
- `GET /api/auth/me` - Get current user (requires authentication)

### Users

- `GET /api/users/profile` - Get user profile (requires authentication)
- `PATCH /api/users/profile` - Update user profile (requires authentication)

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and API keys from the Supabase dashboard
3. Update your `.env` file with the credentials
4. For local development, you can also use the Supabase CLI:
   ```
   npm install -g supabase
   supabase login
   supabase init
   ```

## Database Migrations

To apply migrations:

```
npm run migrate
```

## ESLint Configuration

This project uses ESLint to enforce code quality and identify potential issues. It is configured to:

- Check for unused variables (with special handling for parameters prefixed with underscore)
- Display errors in the console during development
- Block commits when ESLint errors are detected

### Development Mode

When running `npm run dev`, ESLint will run in watch mode alongside the development server, showing any linting errors in real-time.

### Pre-commit Hooks

The project uses Husky and lint-staged to run ESLint checks before each commit. If any errors are found, the commit will be prevented until they are fixed.

To manually run the linting check:

```
npm run lint
```

## Testing

This project uses Jest for unit testing. Tests are located in the `test` directory.

### Running Tests

Run all tests:

```
npm test
```

Run tests in CI mode (faster, without coverage):

```
npm run test:ci
```

### Pre-commit Hook

The pre-commit hook runs both ESLint and tests. If any of the following conditions are met, the commit will be blocked:

1. There are ESLint errors in any of the staged TypeScript files
2. Any test fails

This ensures that only code that passes both linting and tests can be committed.
