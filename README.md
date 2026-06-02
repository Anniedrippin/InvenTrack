# InvenTrack — Inventory & Order Management System

A full-stack, production-ready Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with Docker.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 + React Router |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── models/models.py       # SQLAlchemy ORM models
│   │   ├── schemas/schemas.py     # Pydantic schemas
│   │   ├── routers/               # API route handlers
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   ├── orders.py
│   │   │   └── dashboard.py
│   │   ├── database.py            # DB session/engine
│   │   └── config.py              # Settings via env vars
│   ├── main.py                    # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Dashboard, Products, Customers, Orders
│   │   ├── services/api.js        # Axios API client
│   │   ├── App.js                 # Router + layout
│   │   └── index.css              # Design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── .env.example
```

---

## Local Development (Docker Compose)

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd inventory-system
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for local dev)
   ```

3. **Build and start all services**
   ```bash
   docker compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs (Swagger): http://localhost:8000/docs
   - API Docs (Redoc): http://localhost:8000/redoc

5. **Stop services**
   ```bash
   docker compose down
   # To also remove the database volume:
   docker compose down -v
   ```

---

## API Reference

### Products
| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create a new product |
| GET | `/products` | Get all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | Get all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create a new order |
| GET | `/orders` | Get all orders |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel/delete order |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Get summary stats |

---

## Business Rules Implemented

- ✅ Product SKU must be unique
- ✅ Customer email must be unique
- ✅ Product quantity cannot be negative
- ✅ Orders are rejected if inventory is insufficient
- ✅ Creating an order automatically reduces available stock
- ✅ Cancelling an order restores the stock
- ✅ Total order amount is auto-calculated by the backend
- ✅ Proper HTTP status codes (201, 204, 400, 404, etc.)
- ✅ All request data is validated via Pydantic

---

## Deployment Guide

### Backend → Render

1. Push code to GitHub

2. Go to [render.com](https://render.com) → **New** → **Blueprint**

3. Connect your GitHub repo. Render will detect `render.yaml` automatically and create:
   - A free PostgreSQL database (`inventory-db`)
   - A web service (`inventory-backend`)

4. Wait for deployment to complete. Copy your backend URL (e.g. `https://inventory-backend.onrender.com`)

**Manual alternative (without render.yaml):**
- New → Web Service → connect repo
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add env var: `DATABASE_URL` = your Render PostgreSQL internal connection string

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**

2. Import your GitHub repository

3. Set the **Root Directory** to `frontend`

4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com`

5. Click **Deploy**

> ⚠️ **Important**: Make sure to set `REACT_APP_API_URL` to your actual Render backend URL before deploying the frontend.

---

## Environment Variables

### Backend
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/inventory_db` | PostgreSQL connection string |

### Frontend
| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API base URL |

### Docker Compose
| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `postgres` | DB username |
| `POSTGRES_PASSWORD` | `postgres` | DB password |
| `POSTGRES_DB` | `inventory_db` | DB name |

---

## Features

### Dashboard
- Total products, customers, orders at a glance
- Low stock alerts (threshold: ≤10 items)

### Product Management
- Create, read, update, delete products
- Unique SKU enforcement
- Stock level badges (green/yellow/red)

### Customer Management
- Create, read, delete customers
- Unique email enforcement

### Order Management
- Create orders with multiple line items
- Real-time stock validation
- Auto-calculated total amount
- View full order details modal
- Cancel orders (stock auto-restored)
