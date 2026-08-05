# Growth with-in 🌱

> **A full-stack personal self-growth web app** — journal daily, track habits, set goals, manage tasks, and build a vision board. Everything you need for intentional growth, in one place.


---

## 🚀 Live Demo

**[👉 Try it live here](https://growth-within-frontend.onrender.com/)**

> Click **"⚡ Try Demo"** on the login page — no sign up needed, pre-filled with sample data.

---

## ✨ Features

- 📊 **Dashboard** — personal stats: streaks, goal progress, tasks done today
- 📅 **Monthly Planner** — dynamic navigable calendar, click any date to journal
- 📖 **Daily Journal** — mood tracker, guided reflection questions, per-date entries
- 🔥 **Habit Tracker** — 31-day visual grid, streak counter, completion percentage
- 🎯 **Goals** — set goals with milestones, animated SVG progress rings
- ✅ **To-Do List** — daily tasks (date-specific) + general tasks (always visible)
- ✨ **Vision Board** — search millions of photos via Unsplash API, drag to board, saved to MongoDB
- 🔐 **Authentication** — JWT login/register, forgot password via email, bcrypt encryption
- 🎨 **2 Themes** — Bloom (light) + Midnight (dark), persisted across sessions
- ⚡ **Demo Account** — pre-filled with sample data for instant exploration

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- CSS3 — custom design system built from scratch (no UI library)
- CSS Variables for theming

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Nodemailer (password reset emails)

**External APIs**
- [Unsplash API](https://unsplash.com/developers) — Vision Board image search

---

## 📁 Project Structure

```
growth_web/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   ├── context/
    │   │   └── Themecontext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Goals.jsx
    │   │   ├── Habits.jsx
    │   │   ├── Homepage.jsx
    │   │   ├── Journal.jsx
    │   │   ├── Login.jsx
    │   │   ├── Planner.jsx
    │   │   ├── Register.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Todolist.jsx
    │   │   └── Visionpage.jsx
    │   ├── styles/
    │   │   ├── AuthPages.css
    │   │   ├── dashboard.css
    │   │   ├── footer.css
    │   │   ├── goals.css
    │   │   ├── habits.css
    │   │   ├── Homepage.css
    │   │   ├── journal.css
    │   │   ├── navbar.css
    │   │   ├── planner.css
    │   │   ├── todolist.css
    │   │   └── visionpage.css
    │   ├── Api.js
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── netlify.toml
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── vite.config.js
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Gmail account with App Password for email features

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/growth-within.git
cd growth-within
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `.env` file inside `backend/`:
```env
JWT_SECRET=your_secret_key_here
PORT=5000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_char_app_password
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
node server.js
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173**

> A demo account is auto-created on first server start:
> - Email: `demo@growthwithin.app`
> - Password: `demo123456`

---

## 🚀 Deployment

### Frontend → Netlify
1. Push repo to GitHub
2. Connect repo on [netlify.com](https://render.com)
3. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`


### Backend → Railway
1. Connect `backend/` folder to [Railway](https://render.app)
2. Add environment variables in Render dashboard
3. Render auto-deploys on every push

### Database → MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Set `MONGODB_URI` in Railway environment variables

---

## 🔐 Authentication Flow

1. Register → password hashed with **bcrypt** → **JWT** issued (7 day expiry)
2. Token stored in `localStorage`
3. Every API call sends `Authorization: Bearer <token>`
4. Backend middleware verifies token on all protected routes
5. All data scoped to `userId` — users only see their own data
6. Forgot password → reset token → branded HTML email via **Nodemailer**

---

## 🎯 Key Technical Highlights

- **Zero UI libraries** — entire design system in custom CSS variables
- **Theme system** — 2 themes via single `data-theme` on `<html>`
- **Performance** — cursor glow uses direct DOM manipulation, zero React re-renders
- **Per-user isolation** — every MongoDB query scoped to `userId`
- **Unsplash integration** — search, paginate, drag-and-drop, duplicate prevention
- **Vision board persistence** — tiles saved to MongoDB, reload on every visit

---

## 📚 What I Learned

- Building JWT authentication + password reset flow from scratch
- Designing a REST API with multiple related MongoDB schemas
- Creating a custom CSS design system and theme switcher without any UI library
- Integrating third-party API with search, pagination and persistent storage
- Performance optimization — animations outside React state into direct DOM updates
- Managing complex state across 7 interconnected features

---


## 📄 License

MIT License — feel free to use this as inspiration.

---

*Built with ✦ for growth*
