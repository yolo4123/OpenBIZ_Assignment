# Udyam Registration Assignment

A full-stack React + Node.js (Express) demo app that lets users register for Udyam by verifying Aadhaar and mobile via OTP, filling a multi-step form, and saving submission details to a CSV file on the backend.

## Features

- ⚡ **Modern React Frontend** (Vite/React/TypeScript)
  - Multi-step registration (Aadhaar/mobile, then PAN/email)
  - Form validation using Zod + React Hook Form
  - Auto-fills city and state from pincode
  - Simple, clean UI inspired by the official Udyam portal

- 🔐 **OTP Demo System**
  - Generates a 6-digit OTP (simulated, printed in backend logs)
  - Verifies OTP entered by user (demo-only, no SMS integration)

- 🚀 **Express Backend**
  - Receives and validates API requests: `/api/send-otp`, `/api/verify-otp`, `/api/submit`
  - Strict Aadhaar/PAN/email/number checks
  - Handles CORS and JSON automatically

- 📄 **CSV File Storage**
  - On form submit, user details are appended to `submissions.csv` in the backend folder
  - Uses the `csv-writer` npm package for neat CSV output

- 🌏 **Production and Dev Ready**
  - In dev, proxy setup (`vite.config.js`) so frontend calls `/api/*` directly
  - In prod, backend serves frontend static files (`dist`) and APIs on same port

---

## Folder Structure

```
project-root/
├── backend/
│   ├── server.js               # Main Express backend (OTP, form, CSV API)
│   └── submissions.csv         # All saved entries (auto-created after first submit)
├── frontend/
│   ├── src/                    # React app source
│   └── dist/                   # Production build output (served by backend)
└── README.md
```

---

## Setup & Usage

### 1️⃣ Backend

1. Install dependencies:
   ```
   cd backend
   npm install express cors csv-writer
   ```

2. Start the server:
   ```
   npm start
   ```
   (Or `node server.js`)

### 2️⃣ Frontend

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. For **development**, start the dev server (make sure `vite.config.js` is set to proxy `/api` to your backend):
   ```
   npm run dev
   ```

3. For **production**, build and let backend serve static files:
   ```
   npm run build
   ```
   Then run the backend (`npm start` in backend folder).

---

## API Endpoints

- `POST /api/send-otp`
  - `{ aadhaarNumber, entrepreneurName, mobile }`
- `POST /api/verify-otp`
  - `{ mobile, otp }`
- `POST /api/submit`
  - `{ aadhaarNumber, entrepreneurName, mobile, pincode, city, state, panNumber, email }`
  - 📄 Appends the entry as a new row to `submissions.csv`

---

## How The Demo Works

- **User** enters Aadhaar, name, and mobile
- **Clicks Generate OTP** → backend creates OTP and prints it (no SMS sent, just for demo)
- **User enters OTP** and continues
- Fills PAN and email, submits form
- **Backend** validates and saves all details into `submissions.csv`
- Use Excel/Google Sheets or `cat submissions.csv` to view entries
- Demo video of how it works: https://drive.google.com/file/d/1951g7zij8ffcK0lvH7CuhamZcPcPwYpD/view?usp=sharing

---

## Credits

- React, Vite, TypeScript, Express
- [csv-writer npm](https://www.npmjs.com/package/csv-writer)
- Designed and implemented by Yasmeen as an assignment

---

## Notes

- No actual SMS is sent; OTP system is just for demonstration.
- Only valid, properly formatted submissions are saved.
- In real-world use, sensitive info like Aadhaar/PAN should be securely handled, not stored as plain CSV.

---

> Made with ❤️ for learning and portfolio purposes.  
```

***
