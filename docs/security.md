# Smart Malligai Kadai ERP - Security Guide

## Authentication

- JWT tokens managed by Supabase Auth
- HTTP-only cookies via `@supabase/ssr`
- Middleware protects all `/dashboard` routes
- Auth pages redirect logged-in users to dashboard

## Authorization

- Row Level Security (RLS) on every table
- Store-scoped data access
- Role-based UI permissions (coming in v1.1)
- Service role key only used in server-side API routes

## Data Protection

- All database queries parameterized by Supabase client
- Input validation with Zod on forms and API routes
- Audit logs for critical tables
- Automatic updated_at timestamps

## Best Practices

1. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
2. Keep RLS enabled on all tables
3. Validate all API inputs
4. Use HTTPS in production
5. Enable 2FA for Supabase project owners
6. Regularly review audit logs

## Security Roadmap

- [ ] Implement fine-grained role permissions
- [ ] Add rate limiting on API routes
- [ ] Add Content Security Policy headers
- [ ] Implement audit log viewer in UI
- [ ] Add data backup automation
