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
