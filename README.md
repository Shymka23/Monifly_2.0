# Monifly

Modern financial management platform built with Next.js and Node.js.

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Authentication:** NextAuth.js, JWT
- **State Management:** Zustand
- **Internationalization:** i18next

## Features

- Budget Management
- Investment Portfolio
- Crypto Tracking
- Life Goals Planning
- Multi-language Support
- Dark/Light Theme
- Real-time Analytics

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## API Documentation

API documentation is available at:
- Development: `http://localhost:10000/docs`
- Production: `https://monifly-backend.onrender.com/docs`

## License

MIT