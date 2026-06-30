# 🏥 MediCare HMS - Enterprise Hospital Management System

A fully functional, production-ready Hospital Management SaaS built with React + Vite + Supabase.

## ✨ Features

- **Multi-role authentication** (Admin, Doctor, Nurse, Patient)
- **Role-based dashboards** with full CRUD operations
- **Dark/Light mode** with Framer Motion animations
- **Glassmorphism UI** with Tailwind CSS
- **Real-time data** via Supabase
- **Lab Report uploads** via Supabase Storage
- **Business logic**: double-booking prevention, stock management, auto-billing

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your Project URL and Anon Key

### 2. Run Database Schema
1. Go to **Supabase Dashboard → SQL Editor**
2. Copy and run `supabase/schema.sql`
3. Copy and run `supabase/rls.sql`

### 3. Create Storage Bucket
1. Go to **Supabase Dashboard → Storage**
2. Create bucket named `lab-reports`
3. Set it to **Public**

### 4. Configure Auth Settings
1. Go to **Supabase Dashboard → Authentication → Settings**
2. Set Site URL: `http://localhost:5173` (development) or your domain
3. Enable Email confirmations (optional for dev: disable)

### 5. Create Admin Account
In Supabase Auth, create a user via Dashboard or API, then insert into users table:
```sql
INSERT INTO public.users (id, name, email, role) 
VALUES ('your-auth-user-uuid', 'Admin User', 'admin@hospital.com', 'admin');
```

### 6. Install & Run
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Install dependencies
npm install

# Start development server
npm run dev
```

### 7. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
hospital-management/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable: Modal, EmptyState, Spinner, Pagination
│   │   └── layout/         # Navbar, Sidebar
│   ├── context/            # AuthContext, ThemeContext
│   ├── dashboards/
│   │   ├── admin/          # Admin dashboard + 8 management pages
│   │   ├── doctor/         # Doctor dashboard + appointments, prescriptions
│   │   ├── nurse/          # Nurse dashboard + ward management
│   │   └── patient/        # Patient dashboard + appointments, bills, labs
│   ├── layouts/            # DashboardLayout (sidebar + header)
│   ├── pages/
│   │   ├── auth/           # Login, Register
│   │   └── public/         # Home, About, Services, Contact
│   ├── routes/             # ProtectedRoute
│   └── services/           # Supabase client
├── supabase/
│   ├── schema.sql          # Full database schema + seed data
│   └── rls.sql             # Row Level Security policies
└── .env.example
```

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full CRUD: doctors, nurses, patients, departments, medicines, appointments, billing, analytics |
| **Doctor** | View assigned appointments, update status, add prescriptions, view assigned patients |
| **Nurse** | View ward patients, record vitals, manage ward allocation |
| **Patient** | Self-register, book/cancel appointments, view prescriptions, bills, lab reports |

## 🛡️ Business Logic

- ✅ Double booking prevention (same doctor + date + time)
- ✅ Doctor must be active before appointment booking
- ✅ Cannot delete patient with active appointments
- ✅ Bill auto-created when appointment status = completed
- ✅ Duplicate bill prevention (unique constraint)
- ✅ Medicine stock auto-reduced when prescribed
- ✅ Cannot prescribe if medicine stock = 0
- ✅ Patients can only access their own records

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
