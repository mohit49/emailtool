# Email Testing Tool

A modern web application for testing and previewing HTML email templates with a beautiful flat color UI.

## Features

- 🎨 Beautiful flat color UI design
- 🔐 User authentication (Email/Password and Google OAuth)
- ✉️ Email verification on signup
- 📝 HTML email template editor with Monaco Editor (VS Code-like)
- 👁️ Live preview of email templates
- 💾 Save and manage email templates
- 👤 Admin dashboard for managing users and default templates
- 📧 Default email templates that users can select and use
- 🚀 Built with Next.js and Node.js

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer (Email service)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- Email service credentials (Gmail or other SMTP service)

### Installation

1. Clone the repository and install dependencies:

```bash
npm run install:all
```

2. Set up environment variables:

Create `frontend/.env.local` (you can copy from `frontend/.env.local.example`):
```env
MONGODB_URI=mongodb://localhost:27017/emailtestingtool
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: For Gmail, you cannot use your regular password. You need to:
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: Go to [Google Account Settings](https://myaccount.google.com/) → Security → 2-Step Verification → App passwords
3. Use the generated 16-character app password as `SMTP_PASS`

3. Start the development server:

```bash
npm run dev
```

This will start the Next.js application on http://localhost:3000 (both frontend and API routes run on the same port).

## Project Structure

```
emailtestingtool/
├── frontend/              # Next.js application (frontend + API)
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes (backend)
│   │   ├── login/       # Login page
│   │   ├── signup/      # Signup page
│   │   └── tool/        # Email testing tool page
│   ├── lib/             # Shared libraries
│   │   ├── models/      # MongoDB models
│   │   ├── services/    # Business logic services
│   │   └── utils/       # Utility functions
│   └── ...
└── ...
```

## Usage

1. **Sign Up**: Create an account with your email
2. **Verify Email**: Check your inbox and click the verification link
3. **Login**: Sign in to access the tool
4. **Create Template**: Write your HTML email template in the editor (Monaco Editor with autocomplete)
5. **Use Default Templates**: Select from admin-created default templates
6. **Preview**: Switch to the preview tab to see how your email looks
7. **Save**: Save your templates for future use

## Admin Features

### Setting Up Admin Account

To make a user an admin, you can:
1. Use the API endpoint: `POST /api/admin/setup` with `{ "email": "your-email@example.com" }`
2. Or manually update the user's role in the database to `"admin"`

### Admin Dashboard

Access the admin dashboard at `/admin` (only for admin users):

- **Default Templates Management**: Create, edit, and delete default email templates that all users can access
- **User Management**: View all users, change user roles, verify emails, and delete users

## Email Service Setup

### Gmail Setup

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in `SMTP_PASS`

### Other SMTP Services

Update the SMTP configuration in `backend/.env` with your provider's settings.

## Google OAuth Setup (Optional)

To enable Google Sign-In:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000`
   - Production: `https://przio.com`
5. Add credentials to `frontend/.env.local` (development) or `frontend/.env.production` (production):
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
   
   **Note**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is prefixed with `NEXT_PUBLIC_` because it needs to be accessible in the browser. `GOOGLE_CLIENT_SECRET` should NOT have this prefix as it's server-side only.

## Production Deployment

For production deployment to przio.com, see:
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Quick setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment instructions

### Quick Deploy Options:

1. **Vercel** (Recommended - Easiest)
   - Push code to GitHub
   - Import in Vercel
   - Add environment variables
   - Add custom domain: przio.com

2. **VPS with PM2**
   - See DEPLOYMENT.md for detailed steps
   - Use ecosystem.config.js for PM2

3. **Docker**
   - Use Dockerfile and docker-compose.yml
   - `docker-compose up -d`

### Generate JWT Secret:
```bash
cd frontend
node scripts/generate-secret.js
```

## License

MIT


