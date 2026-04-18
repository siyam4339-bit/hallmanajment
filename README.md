# Hall Management Project

This repository contains a backend API for hall management and a frontend folder for the UI.

## Backend
Location: `backend/`

- `index.js` - Express API server
- `package.json` - backend dependencies and scripts

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Run Backend
```bash
cd backend
npm start
```

### Run Backend in Development Mode
```bash
cd backend
npm run dev
```

## Frontend
Location: `Frontent/`

- `index.html` - main page
- `app.js` - frontend logic
- `style.css` - styles

## Notes
- Ensure MySQL is running.
- The backend can create the database if it does not already exist, as long as the configured MySQL user has permission.
- Create `backend/.env` from `backend/.env.example` and update the values with your MySQL credentials.
- Do not commit `backend/.env` because it contains sensitive credentials.

### Create `backend/.env`
```bash
cd backend
copy .env.example .env
```

### Edit `backend/.env`
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hall_management
```
