# Fintech Savings App

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Setup & Local Development](#setup--local-development)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Database Seeding](#database-seeding)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [AWS CI/CD](#aws-cicd)
- [Screenshots](#screenshots)

## Overview
This project implements a savings account management system with separate **backend** (FastAPI + SQLite/Postgres-ready) and **frontend** (React).
- **Admin** can create clients, accounts, and view all transactions.
- **Clients** can view their accounts, deposit, and withdraw funds.

## Architecture

```mermaid
flowchart TD
  subgraph Frontend [React App]
    A[Landing Page] -->|Login| B(AdminLogin)
    A -->|Login| C(ClientLogin)
    B --> D(AdminDashboard)
    C --> E(ClientDashboard)
  end

  subgraph Backend [FastAPI]
    D -->|API calls| F[/auth/login]
    D -->|Manage| G[/users/]
    D -->|Manage| H[/accounts/]
    D -->|Manage| I[/transactions/]
    E -->|API calls| F
    E -->|Fetch| H
    E -->|Fetch| I
  end

  F --> J[(SQLite / PostgreSQL)]
  H --> J
  I --> J
```

## Setup & Local Development

### Backend
```bash
cd backend
python -m venv env
env\Scripts\activate      # Windows
# or source env/bin/activate  # Linux/macOS
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000).

### Database Seeding
```bash
# from project root
env\Scripts\activate
python -m backend.seed
```

## Deployment

### Docker
1. **Build images**:
   ```bash
   docker build -f backend/Dockerfile -t fintech-backend .
   docker build -f frontend/Dockerfile -t fintech-frontend .
   ```
2. **Run containers**:
   ```bash
   docker network create fintech-net
   docker run -d --name backend --network fintech-net fintech-backend
   docker run -d --name frontend -p 80:3000 --network fintech-net fintech-frontend
   ```

### AWS CI/CD
We recommend using **GitHub Actions** to:
1. Build Docker images.
2. Push to **Amazon ECR**.
3. Deploy to **Amazon ECS** or **AWS App Runner**.
4. Configure an **Application Load Balancer** and **Route 53** DNS.

## Screenshots

### Admin Dashboard
![Admin Dashboard](./screenshots/admin_dashboard.png)

### Client Dashboard
![Client Dashboard](./screenshots/client_dashboard.png)

