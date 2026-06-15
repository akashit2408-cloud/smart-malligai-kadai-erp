# 🛒 Smart Malligai Kadai ERP

**Modern, mobile-first, real-time ERP for grocery stores, provision stores, kirana shops, mini supermarkets, and local retail businesses.**

Replace notebooks, Excel sheets, manual billing, paper ledgers, and WhatsApp order tracking with a complete digital business management system.

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Real-time KPIs: sales, profit, inventory value, credit outstanding, supplier dues, low stock, expiry alerts |
| **Inventory** | Products, categories, brands, units, variants, stock in/out, adjustments, damage, expiry, batch tracking |
| **Billing / POS** | Fast barcode billing, product search, GST, discounts, multiple payment modes (cash/UPI/card/credit) |
| **Customer Khata** | Digital ledger, credit sales, due tracking, payment collection, outstanding reports |
| **Suppliers** | Supplier contacts, purchase history, due tracking, invoice uploads |
| **Employees** | Profiles, attendance check-in/out, salary, daily tasks |
| **Expenses** | Rent, electricity, salary, maintenance, transport, miscellaneous |
| **Reports** | Daily/weekly/monthly sales, profit, inventory, credit, supplier, employee, expense reports |
| **Analytics** | Sales, revenue, profit, inventory, customer, supplier, expense trends with Recharts |
| **Notifications** | Real-time alerts via Supabase Realtime |
| **Auth & Roles** | Email, password, OTP, Google login, forgot password, role-based access |
| **PWA** | Installable app, offline fallback, mobile-first responsive design |

---

## 🚀 Tech Stack (100% Free Tier)

| Layer | Technology | Free Plan |
|-------|-----------|-----------|
| Frontend | Next.js 15 + React 19 + TypeScript + Tailwind CSS + ShadCN UI | Vercel Free |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) | Supabase Free Tier |
| Email | Resend | Resend Free Tier |
| Images | Cloudinary | Cloudinary Free Tier |
| Source Control | GitHub | Free |
| Hosting | Vercel | Free Plan |

---

## 📁 Project Structure

```
smart-malligai-kadai-erp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register, forgot/reset)
│   ├── (dashboard)/              # Dashboard & module routes
│   ├── api/auth/                 # Auth API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing/redirect
│   └── globals.css               # Tailwind + theme CSS
├── components/                   # React components
│   ├── ui/                       # UI primitives (button, card, input, etc.)
│   ├── dashboard/                # Dashboard widgets
│   ├── inventory/                # Inventory components
│   ├── billing/                  # Billing components
│   ├── customers/                # Customer forms
│   ├── suppliers/                # Supplier forms
│   ├── employees/                # Employee forms
│   ├── expenses/                 # Expense forms
│   ├── shared/                   # Sidebar, Header, MobileNav, Notifications
│   └── layouts/                  # Dashboard layout
├── lib/                          # Utilities, hooks, providers, validations
│   ├── supabase/                 # Supabase client/server/middleware helpers
│   ├── hooks/                    # React Query + Realtime hooks
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Formatting, helpers
├── types/                        # TypeScript types
├── supabase/migrations/          # PostgreSQL migrations
├── public/                       # PWA icons, manifest
├── docs/                         # Architecture & deployment guides
└── README.md                     # This file
```

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 20+
- npm / yarn / pnpm
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier)
- A [Resend](https://resend.com) account (free tier - optional)
- A [Cloudinary](https://cloudinary.com) account (free tier - optional)

### 2. Clone & Install

```bash
git clone https://github.com/your-username/smart-malligai-kadai-erp.git
cd smart-malligai-kadai-erp
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
RESEND_API_KEY=re_xxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 4. Database Setup

Run the initial migration in Supabase SQL Editor:

```bash
# Or use Supabase CLI
supabase db reset
```

The migration file is at `supabase/migrations/000001_initial_schema.sql`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Architecture

### Core Tables

- `profiles` - User profiles with roles
- `stores` - Store details
- `products` - Product catalog
- `categories`, `brands`, `units` - Product taxonomy
- `inventory` - Stock levels with batch/expiry
- `inventory_movements` - Stock audit trail
- `sales`, `sale_items` - Billing transactions
- `customers`, `customer_ledger` - Credit book
- `suppliers`, `purchases`, `purchase_items` - Supplier management
- `employees`, `attendance` - HR management
- `expenses` - Expense tracking
- `notifications` - Real-time notification center
- `audit_logs` - Change audit trail

### Key Features

- **Row Level Security (RLS)** on every table
- **Foreign keys** with proper constraints
- **Indexes** for performance
- **Triggers** for:
  - Updated timestamps
  - Customer outstanding sync
  - Supplier due sync
  - Low stock notifications
  - Audit logging
- **PostgreSQL functions** for dashboard metrics, inventory operations, analytics

---

## 🔐 Authentication & Roles

### Roles

1. **Super Admin** - Platform administration
2. **Store Owner** - Full store access
3. **Manager** - Inventory, billing, customers, suppliers, employees, reports
4. **Cashier** - Billing and customer management
5. **Staff** - View dashboard and inventory

### Login Methods

- Email + Password
- Magic Link / OTP
- Google OAuth (configure in Supabase Auth)
- Forgot / Reset Password

---

## 🌐 Deployment Guide

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variables in Vercel project settings
4. Deploy

### Vercel Configuration

The project includes `next.config.js` with PWA configuration and image domain allowlisting for Supabase Storage and Cloudinary.

### Supabase Configuration

1. Enable **Email** provider in Auth → Providers
2. Enable **Google** provider and add OAuth credentials
3. Configure site URL and redirect URLs in Auth → URL Configuration
4. Add `https://your-app.vercel.app` and `https://your-app.vercel.app/api/auth/callback`

---

## 📱 PWA Installation

The app is a Progressive Web App. Users can:

1. Open the app in mobile browser
2. Tap "Add to Home Screen"
3. Use it like a native app with offline fallback

---

## 🎨 UI/UX Design

- Mobile-first responsive layout
- Glassmorphism cards with soft shadows
- Smooth animations with Framer Motion
- Loading skeletons
- Dark mode and light mode
- ShadCN UI component system
- Premium SaaS dashboard aesthetic

---

## 🔧 Customization

### Adding New ShadCN Components

```bash
npx shadcn@latest add table dialog dropdown-menu select tabs
```

### Branding

Update `tailwind.config.ts` colors, `public/manifest.json`, and `app/layout.tsx` metadata.

---

## 🧪 Testing

```bash
npm run test
npm run test:watch
```

---

## 📄 License

MIT License - free for personal and commercial use.

---

## 🙏 Support

For issues, feature requests, or contributions, please open a GitHub issue or pull request.

---

**Built for every local retailer who wants to go digital. 🚀**
#   s m a r t - m a l l i g a i - k a d a i - e r p  
 