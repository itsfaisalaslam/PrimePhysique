# PrimePhysique

PrimePhysique is a MERN fitness platform built to feel like a modern SaaS product. It combines authentication, workout management, diet planning, AI-assisted coaching, progress tracking, streaks, reminders, and real-time communication in one application.

## Description

PrimePhysique helps users manage their full fitness journey from a single dashboard. Users can log in securely, explore workout and diet plans, track progress through charts, generate AI workout plans, chat with other users, interact with a fitness chatbot, and stay accountable with a calendar and streak system.

## Features

- Auth with JWT
- Workouts
- Diet Plans
- Progress Tracking
- AI Workout Generator
- Chatbot
- Calendar + Streak
- Chat System

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Authentication: JWT
- Realtime: Socket.io

## Installation

1. Install root dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
npm install --prefix server
```

3. Install frontend dependencies:

```bash
npm install --prefix client
```

4. Create the environment file:

```bash
copy server\\.env.example server\\.env
```

5. Start the project:

```bash
npm run dev
```

## Environment Variables

Create `server/.env` from `server/.env.example` and configure:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Optional values already shown in the example file:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Project Structure

```text
PrimePhysique/
|-- client/
|   |-- src/
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
|-- server/
|   |-- src/
|   |-- package.json
|   `-- .env.example
|-- package.json
|-- .gitignore
`-- README.md
```

## Screenshots

Add screenshots before publishing your repository:

- Home page
- Dashboard
- Workouts page
- Diet Plans page
- Progress Tracking page
- Calendar and Streak page

Example:

```md
![Home](./screenshots/home.png)
![Dashboard](./screenshots/dashboard.png)
```

## Run Commands

```bash
npm run dev
```

This runs:

- Express backend from `server/`
- Vite frontend from `client/`

## Notes

- `node_modules`, `.env`, and build output folders are excluded for GitHub submission.
- `server/.env.example` is kept so anyone cloning the repo can configure the project quickly.
