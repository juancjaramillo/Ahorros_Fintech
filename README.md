# Aplicación de Ahorros Fintech

## Índice
- [Visión general](#visión-general)
- [Arquitectura](#arquitectura)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Población de la base de datos](#población-de-la-base-de-datos)
- [Despliegue](#despliegue)
  - [Docker](#docker)
  - [AWS CI/CD](#aws-cicd)
- [Capturas de pantalla](#capturas-de-pantalla)

## Visión general
Esta aplicación gestiona cuentas de ahorro mediante un sistema con frontend (React) y backend (FastAPI + SQLite/PostgreSQL).  
- **Admin** puede crear clientes, cuentas y ver todas las transacciones.  
- **Clientes** pueden ver sus cuentas, consignar y retirar fondos.

## Arquitectura

\`\`\`mermaid
flowchart TD
  subgraph Frontend [App React]
    A[Landing] -->|Login| B(Ingreso Admin)
    A -->|Login| C(Ingreso Cliente)
    B --> D(Dashboard Admin)
    C --> E(Dashboard Cliente)
  end

  subgraph Backend [API FastAPI]
    D -->|API| F[/auth/login]
    D -->|Gestiona| G[/users/]
    D -->|Gestiona| H[/accounts/]
    D -->|Gestiona| I[/transactions/]
    E -->|API| F
    E -->|Consulta| H
    E -->|Consulta| I
  end

  F --> J[(SQLite / PostgreSQL)]
  H --> J
  I --> J
\`\`\`

## Instalación y desarrollo local

### Backend
\`\`\`bash
cd backend
python -m venv env
# Linux/macOS:
source env/bin/activate
# Windows:
# env\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`
Abre [http://localhost:3000](http://localhost:3000).

### Población de la base de datos
\`\`\`bash
# desde la raíz del proyecto
# Linux/macOS:
source backend/env/bin/activate
# Windows:
# env\Scripts\activate
python -m backend.seed
\`\`\`

## Despliegue

### Docker
1. Construir imágenes:
   \`\`\`bash
   docker build -f backend/Dockerfile -t fintech-backend .
   docker build -f frontend/Dockerfile -t fintech-frontend .
   \`\`\`
2. Ejecutar contenedores:
   \`\`\`bash
   docker network create fintech-net
   docker run -d --name backend --network fintech-net fintech-backend
   docker run -d --name frontend -p 80:3000 --network fintech-net fintech-frontend
   \`\`\`

### AWS CI/CD
Se recomienda usar **GitHub Actions** para:
1. Construir las imágenes Docker.  
2. Subirlas a **Amazon ECR**.  
3. Desplegar en **AWS ECS** o **AWS App Runner**.  
4. Configurar **ALB** y **Route 53** para DNS.

## Capturas de pantalla
![Dashboard Admin](./screenshots/admin_dashboard.png)
![Dashboard Cliente](./screenshots/client_dashboard.png)
