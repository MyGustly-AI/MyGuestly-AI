MyGuestly AI

An AI-powered event hosting and guest experience platform.

https://via.placeholder.com/1200x400/4B0082/ffffff?text=MyGuestly+AI

📋 Table of Contents

· Overview
· Features
· Tech Stack
· Project Structure
· Getting Started
  · Prerequisites
  · Environment Variables
  · Installation
  · Running Locally
· Deployment
  · Frontend (Vercel)
  · Backend (Render)
· API Documentation
· Sitemap & Navigation
· Contributing
· License

---

🌟 Overview

MyGuestly AI is a modern event management platform designed to help hosts create unforgettable experiences. From sending invitations to managing guest lists, capturing memories, and analyzing RSVP data, MyGuestly AI leverages artificial intelligence to streamline every aspect of event hosting.

The platform features a responsive dashboard, real-time voice notes, AI-curated timelines, and seamless integration with cloud services.

---

✨ Features

For Hosts

· Event Creation – Design and launch events with custom themes, dates, and venues.
· Guest Management – Invite guests, track RSVPs, and manage check-ins.
· AI Timeline – Automatically curate event highlights from guest uploads.
· Voice Notes – Capture heartfelt voice messages from attendees in real-time.
· Gallery – Upload and share event photos and videos.
· Analytics – View RSVP progress, guest counts, and engagement metrics.
· Responsive Dashboard – Access all tools from any device.

For Guests

· Personalized Invitation – View event details, RSVP, and add to calendar.
· Memory Upload – Share photos and videos from the celebration.
· Timeline View – Follow the event flow and relive moments.
· Voice Notes – Leave voice messages for the host and other guests.

AI-Powered

· Smart RSVP Prediction – Forecast attendance based on historical data.
· Automated Timeline – Group and order media by event sequence.
· Sentiment Analysis – Gauge guest engagement from voice notes and feedback.

---

🛠️ Tech Stack

Frontend

· React – UI library
· React Router DOM – Routing
· Axios – HTTP client
· CSS Modules / Plain CSS – Styling (with responsive design)
· Vercel – Hosting and deployment

Backend

· Node.js – Runtime environment
· Express.js – Web framework
· MongoDB / PostgreSQL – Database (specify your choice)
· Cloudinary – Media storage and optimization
· Render – Hosting and deployment

DevOps & Tools

· Git – Version control
· npm – Package management
· ESLint – Code linting
· Prettier – Code formatting

---

📁 Project Structure

```
myguestly-ai/
├── frontend/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── _redirects        # Vercel routing
│   ├── src/
│   │   ├── assets/           # Images, fonts, icons
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── ...
│   │   ├── context/          # React context (Auth, etc.)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/            # Custom hooks
│   │   │   └── useMobileMenu.js
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── HostDashboard.jsx
│   │   │   ├── CreateEventPage.jsx
│   │   │   ├── GalleryPage.jsx
│   │   │   ├── TimelinePage.jsx
│   │   │   └── ... (all pages)
│   │   ├── services/         # API service layer
│   │   │   └── api.js
│   │   ├── sitemap.js        # Navigation configuration
│   │   ├── App.jsx           # Main app entry
│   │   ├── index.js          # ReactDOM entry
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vercel.json           # Vercel deployment config
│   └── .env                  # Environment variables
│
├── backend/                  # Node.js backend (optional, adjust to your setup)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── README.md
└── LICENSE
```

---

🚀 Getting Started

Prerequisites

· Node.js >= 18.0.0
· npm >= 8.0.0
· Git

Environment Variables

Create a .env file in the frontend/ directory:

```env
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

For the backend, create a .env in backend/ (adjust variables as needed):

```env
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Installation

1. Clone the repository
   ```bash
   git clone https://github.com/MyGustly-AI/MyGuestly-AI.git
   cd MyGuestly-AI
   ```
2. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies (if applicable)
   ```bash
   cd ../backend
   npm install
   ```

Running Locally

Frontend

```bash
cd frontend
npm start
```

Runs the app at http://localhost:3000.

Backend

```bash
cd backend
npm run dev   # or npm start
```

Runs the API server at http://localhost:5000.

---

🌐 Deployment

Frontend (Vercel)

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Set environment variables in Vercel dashboard.
4. Deploy automatically on every push to main.

Vercel Configuration (frontend/vercel.json):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Backend (Render)

1. Push your backend code to a separate GitHub repository or in the same repo with proper structure.
2. On Render, create a new Web Service and connect your repo.
3. Set environment variables in Render dashboard.
4. Deploy.

Make sure your backend package.json has a start script:

```json
"scripts": { "start": "node src/index.js" }
```

---

📚 API Documentation

The backend REST API follows standard JSON conventions.

Endpoint Method Description
/api/auth/login POST Authenticate user
/api/auth/signup POST Register new user
/api/auth/forgot-password POST Send password reset email
/api/auth/reset-password POST Reset password
/api/events GET Get all events for host
/api/events POST Create new event
/api/events/:id PUT Update event
/api/events/:id/guests GET Get guests for event
/api/events/:id/guests POST Add guest to event
/api/events/:id/gallery GET Get gallery images
/api/events/:id/gallery POST Upload image to gallery
/api/events/:id/timeline GET Get AI-generated timeline
/api/events/:id/voicenotes GET Get voice notes for event
/api/events/:id/voicenotes POST Upload a voice note

All protected routes require a Bearer token in the Authorization header.

---

🧭 Sitemap & Navigation

The application is structured as follows:

Public Pages

· / – Landing Page
· /about – About Us
· /contact – Contact
· /pricing – Pricing Plans
· /login – Sign In
· /signup – Sign Up
· /forgot-password – Password Reset Request

Authenticated Host Routes

All routes are prefixed with the host dashboard layout and require authentication.

· /host/dashboard – Overview with stats and quick actions
· /host/home – Events list
· /host/create-event – Create new event
· /host/guest-list – Manage guests
· /host/invitation – Send invitations
· /host/admin-roles – Team permissions

Event Experience

· /gallery – Event photo/video gallery
· /timeline – AI-curated event timeline with live voice notes
· /scan-qr – QR code check-in

Account

· /profile – Host profile
· /settings – Account settings
· /notification – Notifications

The main navigation is responsive with a collapsible sidebar on mobile.

---

🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature/fix: git checkout -b feature-name.
3. Commit your changes with clear messages.
4. Push to your fork and submit a Pull Request.

Please ensure your code adheres to the existing style (ESLint) and includes proper comments where necessary.

---

📄 License

This project is proprietary and not open-sourced. For licensing inquiries, please contact the project maintainers.

---

🙏 Acknowledgements

· React and its ecosystem
· Vercel and Render for hosting
· The open-source community

---

Built with ❤️ by the MyGuestly AI Team
