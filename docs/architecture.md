# Smart Malligai Kadai ERP - Architecture

## Overview

Smart Malligai Kadai ERP is a full-stack SaaS application built for single-store and multi-store local retail businesses. It uses a serverless architecture with Next.js as the frontend and API layer, and Supabase as the backend-as-a-service.

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                       │
│  (Mobile / Tablet / Desktop / PWA)                       │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────┐
│              Vercel Edge / Serverless                   │
│  Next.js 15 App Router                                  │
│  - React Server Components (RSC)                        │
│  - Route Handlers (API)                                 │
│  - Middleware (Auth protection)                         │
│  - PWA (next-pwa)                                       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                    Supabase Platform                      │
│  - PostgreSQL Database                                  │
│  - Supabase Auth (JWT)                                  │
│  - Supabase Realtime (WebSocket)                        │
│  - Supabase Storage (file uploads)                      │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### App Router Structure

- **Route Groups**: `(auth)` and `(dashboard)` separate public/private layouts
- **Server Components**: Dashboard layout fetches user/profile server-side
- **Client Components**: Interactive pages (billing, forms, charts) use `'use client'`

### State Management

- **TanStack Query**: Server state caching, synchronization, real-time invalidation
- **Zustand**: Available for complex client state (cart, etc.)
- **React Hook Form + Zod**: Form handling and validation

### Data Fetching Pattern

```typescript
// lib/hooks/useDashboard.ts
const { data, isLoading } = useQuery({
  queryKey: ['dashboard-metrics', storeId],
  queryFn: async () => {
    const { data, error } = await supabase.from('dashboard_metrics').select('*').single();
    if (error) throw error;
    return data;
  },
});
```

### Real-time Updates

```typescript
useDashboardRealtime(storeId, () => {
  queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
});
```

Supabase Realtime listens to INSERT/UPDATE/DELETE on tables and invalidates React Query caches.

## Backend Architecture

### Supabase Client Strategy

- **Browser Client** (`createBrowserClient`): For client-side auth and queries
- **Server Client** (`createServerClient`): For Server Components and Route Handlers with cookie SSR
- **Admin Client** (`createAdminClient`): For privileged operations using service role key

### Authentication Flow

1. User signs up via `/register` → API creates user + store + profile
2. User signs in via email/password or Google OAuth
3. Supabase issues JWT stored in HTTP-only cookies
4. Middleware validates JWT and protects `/dashboard` routes
5. Server Components retrieve user/profile via server-side client

### Row Level Security (RLS)

Every table has RLS enabled. Policies ensure users can only access:

- Their own profile
- Stores they own or are assigned to
- Records scoped to their store_id

Example policy:

```sql
CREATE POLICY "Store scoped products" ON public.products
  FOR ALL USING (
    store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
    OR store_id IN (SELECT store_id FROM public.profiles WHERE id = auth.uid())
  );
```

### Database Triggers

| Trigger | Purpose |
|---------|---------|
| `update_updated_at_column` | Auto-update `updated_at` timestamps |
| `sync_customer_outstanding` | Sync customer balance from ledger |
| `sync_supplier_due` | Sync supplier due from purchases |
| `check_low_stock` | Create notification when stock is low |
| `audit_trigger` | Log INSERT/UPDATE/DELETE to audit_logs |

## Security Considerations

- RLS prevents unauthorized data access
- Service role key only used in secure server APIs
- Input validation via Zod on client and server
- XSS protection via React's escaping and CSP-ready headers
- SQL injection prevented by Supabase client parameterized queries
- JWT session management via Supabase Auth

## Scalability

- Stateless Next.js functions scale horizontally on Vercel
- PostgreSQL indexes on store_id, created_at, barcode, customer phone
- RPC functions for heavy aggregations (dashboard metrics, analytics)
- Realtime subscriptions scoped per store_id to minimize bandwidth

## Module Architecture

Each module follows the same pattern:

1. **Page Component** - Client component with TanStack Query
2. **List Component** - Table/card list with search
3. **Form Component** - Validated form with React Hook Form
4. **Validation Schema** - Zod schema in `lib/validations/`
5. **Database Tables** - Schema + RLS + triggers
6. **Realtime Hook** - Optional subscription for live updates
