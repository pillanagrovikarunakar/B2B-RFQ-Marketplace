# Mini B2B RFQ Marketplace

A high-performance Mini B2B RFQ (Request for Quotation) Marketplace platform connecting Buyers and Suppliers.

## Tech Stack
- **Frontend:** React (Vite), JavaScript, Bootstrap 5, Axios, React Router v6
- **Backend:** Python, Django, Django REST Framework, SimpleJWT (JWT Authentication)
- **Database:** PostgreSQL (with SQLite fallback for local development)

## Directory Structure
```
B2B-RFQ-Marketplace/
├── backend/            # Django REST API project & apps (accounts, rfqs, quotations)
├── frontend/           # React + Vite frontend application
├── .env.example        # Environment variables configuration template
└── README.md           # Project documentation
```

## Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt # (or install dependencies)
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
