# Aplicación de Ahorros Fintech

> **Backend:** FastAPI (Python) + SQLite / PostgreSQL-ready  
> **Frontend:** React (CRA/Vite-ready)  
> **Infra:** EC2 en AWS (dos modos de despliegue: **Manual** y **Docker Compose**)  
> **Objetivo de la prueba:** “Se debe desplegar en AWS y **se debe poder *redesplegar*** (actualizar) la solución fácilmente”.

---

## Índice
- [Visión general](#visión-general)
- [Arquitectura](#arquitectura)
  - [Diagrama de alto nivel (Mermaid)](#diagrama-de-alto-nivel-mermaid)
  - [Diagrama de despliegue (Mermaid)](#diagrama-de-despliegue-mermaid)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Diseño de base de datos](#diseño-de-base-de-datos)
  - [ERD (Mermaid)](#erd-mermaid)
  - [DDL de referencia (SQLite/PostgreSQL)](#ddl-de-referencia-sqlitepostgresql)
- [API (endpoints principales)](#api-endpoints-principales)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Población de la base de datos (seed)](#población-de-la-base-de-datos-seed)
- [Despliegue en AWS](#despliegue-en-aws)
  - [Modo A · Manual (Uvicorn + systemd + Nginx)](#modo-a--manual-uvicorn--systemd--nginx)
  - [Modo B · Docker Compose (recomendado para redeploy rápido)](#modo-b--docker-compose-recomendado-para-redeploy-rápido)
  - [CI/CD opcional con GitHub Actions](#cicd-opcional-con-github-actions)
- [Redeploy: ¿qué significa y cómo demostrarlo?](#redeploy-qué-significa-y-cómo-demostrarlo)
- [Alternar entre modos sin romper nada](#alternar-entre-modos-sin-romper-nada)
- [Solución de problemas](#solución-de-problemas)
- [Capturas (placeholders)](#capturas-placeholders)
- [Licencia](#licencia)

---

## Visión general
Aplicación para gestionar **cuentas de ahorro**: creación de usuarios (admin/cliente), creación de cuentas, depósitos, retiros y consulta de transacciones.  
- **Admin**: CRUD de usuarios, cuentas, consulta de transacciones globales.  
- **Cliente**: consulta de sus cuentas y transacciones, depósitos/retiros propios.

---

## Arquitectura

### Diagrama de alto nivel (Mermaid)

```mermaid
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
```

### Diagrama de despliegue (Mermaid)

```mermaid
flowchart LR
  Dev[Dev Laptop] -- git push --> Repo[(GitHub Repo)]
  Repo -- opcional CI/CD --> EC2[(AWS EC2)]

  subgraph EC2
    direction TB
    NGINX[Nginx (host)] -- /api --> Uvicorn[Uvicorn (FastAPI)]
    NGINX -- / --> ReactBuild[React build estático]
    DB[(ahorros.db - SQLite)]
  end

  classDef infra fill:#eef,stroke:#555,stroke-width:1px;
  class EC2,Repo,Dev infra;
```

> **Alternativa**: EC2 con **Docker Compose** (Nginx/React y FastAPI en contenedores), ver sección *Modo B*.

---

## Estructura del proyecto

```
Ahorros_Fintech/
├─ backend/
│  ├─ main.py
│  ├─ routers/
│  │  ├─ account.py
│  │  ├─ user.py
│  │  └─ transaction.py
│  ├─ models.py
│  ├─ db.py
│  ├─ seed.py
│  ├─ requirements.txt
│  └─ .env
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  └─ AdminLogin.js
│  │  └─ ...
│  ├─ package.json
│  └─ .env.production
├─ docker-compose.yml        # (opcional) despliegue con Docker
└─ README.md
```

---

## Diseño de base de datos

### ERD (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : has
    ACCOUNTS ||--o{ TRANSACTIONS : registers

    USERS {
      int id PK
      string username UNIQUE
      string password_hash
      string role "admin|client"
      datetime created_at
    }

    ACCOUNTS {
      int id PK
      int user_id FK
      string account_number UNIQUE
      decimal balance
      string currency
      datetime created_at
    }

    TRANSACTIONS {
      int id PK
      int account_id FK
      string type "deposit|withdraw"
      decimal amount
      string description
      datetime created_at
    }
```

### DDL de referencia (SQLite/PostgreSQL)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','client')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_number TEXT NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'COP',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit','withdraw')),
  amount NUMERIC NOT NULL CHECK(amount >= 0),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

---

## API (endpoints principales)

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| POST | `/auth/login` | Autenticación (JWT) | Todos |
| GET  | `/users/` | Lista de usuarios | Admin |
| POST | `/users/` | Crea usuario | Admin |
| GET  | `/accounts/` | Lista cuentas (admin) / propias (cliente) | Admin/Cliente |
| POST | `/accounts/` | Crea cuenta | Admin |
| GET  | `/transactions/` | Lista transacciones (filtro por cuenta) | Admin/Cliente |
| POST | `/transactions/deposit` | Depósito | Admin/Cliente |
| POST | `/transactions/withdraw` | Retiro | Admin/Cliente |

**Credenciales seed por defecto**:  
- **admin / Admin123**  
- **client1 / Client123**

---

## Variables de entorno

**Backend (`backend/.env`):**
```ini
DATABASE_URL=sqlite:////home/ubuntu/Ahorros_Fintech/ahorros.db
SECRET_KEY=gbP95kts-z2j1sGq_wp5aZfxvBPnImS8xcp4Wnn0Jd8
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**Frontend (`frontend/.env.production`):**
```ini
REACT_APP_API_URL=/api
```

---

## Instalación y desarrollo local

### Backend
```bash
cd backend
python -m venv venv
# Linux/Mac:
source venv/bin/activate
# Windows (PowerShell):
# .\venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt

# dev server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start   # http://localhost:3000
```

### Población de la base de datos (seed)
```bash
# estando en backend con el venv activado
python seed.py
# crea admin/clientes/cuentas/transacciones de ejemplo
```

---

## Despliegue en AWS

> La IP pública puede cambiar al detener/arrancar EC2. Para evitarlo, asigna una **Elastic IP**.

### Modo A · Manual (Uvicorn + systemd + Nginx)

1. **Clonar y preparar backend**
   ```bash
   ssh -i $HOME/.ssh/fastapi_key.pem ubuntu@<IP>
   sudo apt update
   sudo apt install -y python3-venv python3-pip git nginx sqlite3
   git clone https://github.com/juancjaramillo/Ahorros_Fintech.git
   cd Ahorros_Fintech/backend
   python3 -m venv venv && source venv/bin/activate
   pip install --upgrade pip && pip install -r requirements.txt
   echo "DATABASE_URL=sqlite:////home/ubuntu/Ahorros_Fintech/ahorros.db" > .env
   echo "SECRET_KEY=gbP95kts-z2j1sGq_wp5aZfxvBPnImS8xcp4Wnn0Jd8" >> .env
   python seed.py
   deactivate
   ```

2. **Servicio systemd para Uvicorn** (`/etc/systemd/system/uvicorn.service`):
   ```ini
   [Unit]
   Description=FastAPI (Uvicorn)
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/Ahorros_Fintech/backend
   Environment="DATABASE_URL=sqlite:////home/ubuntu/Ahorros_Fintech/ahorros.db"
   Environment="SECRET_KEY=gbP95kts-z2j1sGq_wp5aZfxvBPnImS8xcp4Wnn0Jd8"
   ExecStart=/home/ubuntu/Ahorros_Fintech/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   RestartSec=3

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now uvicorn
   sudo systemctl status uvicorn --no-pager
   ```

3. **Construir frontend y Nginx (host)**
   ```bash
   cd ~/Ahorros_Fintech/frontend
   npm install && npm run build
   sudo chown -R ubuntu:www-data build && sudo chmod -R 755 build
   ```
   **Nginx** (`/etc/nginx/sites-available/ahorro`):
   ```nginx
   server {
       listen 80 default_server;
       server_name _;

       root /home/ubuntu/Ahorros_Fintech/frontend/build;
       index index.html;

       location /api/ {
           proxy_pass http://127.0.0.1:8000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       location /api/docs  { proxy_pass http://127.0.0.1:8000/docs; }
       location /api/redoc { proxy_pass http://127.0.0.1:8000/redoc; }

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   ```bash
   sudo ln -sf /etc/nginx/sites-available/ahorro /etc/nginx/sites-enabled/ahorro
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl restart nginx
   ```

4. **Pruebas**
   - React: `http://<IP>/`
   - Swagger: `http://<IP>/api/docs`

5. **Redeploy (actualizar versión)**
   ```bash
   cd ~/Ahorros_Fintech && git pull

   # backend
   cd backend && source venv/bin/activate
   pip install -r requirements.txt
   deactivate && sudo systemctl restart uvicorn

   # frontend
   cd ../frontend && npm install && npm run build
   sudo systemctl restart nginx
   ```

---

### Modo B · Docker Compose (recomendado para redeploy rápido)

**`docker-compose.yml` (raíz):**
```yaml
version: "3.9"
services:
  api:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: fastapi
    restart: always
    volumes:
      - /home/ubuntu/Ahorros_Fintech/ahorros.db:/data/ahorros.db
    networks: [ web ]

  web:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: react-nginx
    restart: always
    ports:
      - "80:80"
    depends_on: [ api ]
    networks: [ web ]

networks:
  web:
```

**`backend/Dockerfile`:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend /app
ENV PYTHONUNBUFFERED=1     DATABASE_URL=sqlite:////data/ahorros.db
VOLUME /data
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`frontend/Dockerfile`:**
```dockerfile
FROM node:20 AS builder
WORKDIR /src
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY frontend/ ./
ENV REACT_APP_API_URL=/api
RUN npm run build

FROM nginx:alpine
COPY --from=builder /src/build /usr/share/nginx/html
```

**Primer despliegue:**
```bash
ssh -i $HOME/.ssh/fastapi_key.pem ubuntu@<IP>
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker ubuntu && exit   # vuelve a entrar por SSH
ssh -i $HOME/.ssh/fastapi_key.pem ubuntu@<IP>

git clone https://github.com/juancjaramillo/Ahorros_Fintech.git
cd Ahorros_Fintech
docker compose up -d --build
docker compose ps
```

**Pruebas:**
- Web: `http://<IP>/`  
- Swagger: `http://<IP>/api/docs`

**Redeploy (actualizar versión):**
```bash
cd ~/Ahorros_Fintech
git pull
docker compose up -d --build
```

**Switch duro (alternar con modo manual):**
```bash
# Ir a Docker
sudo systemctl stop nginx uvicorn
cd ~/Ahorros_Fintech && docker compose up -d --build

# Volver a manual
cd ~/Ahorros_Fintech && docker compose down
sudo systemctl start uvicorn nginx
```

---

## Redeploy: ¿qué significa y cómo demostrarlo?

No es reinstalar desde cero. Es publicar una nueva versión **sin rehacer todo** y en minutos.

- **Docker:** `git pull && docker compose up -d --build`  
- **Manual:** `git pull && pip install -r ... && systemctl restart uvicorn && npm run build && systemctl restart nginx`

**Demostración:** cambia un texto visible en `frontend/src/...`, haz `git push` y ejecuta el comando de redeploy. Refresca y muestra el cambio.

---

## Alternar entre modos sin romper nada

- **Switch duro** (simple): un solo stack usa `:80` a la vez.
- **Convivencia por puertos**: publica Docker en `8080:80` y abre el puerto 8080 en el Security Group.

---

## Solución de problemas

- **502 Bad Gateway**: `sudo systemctl status uvicorn`, `ss -tlnp | grep 8000`.
- **Build lento o SSH se corta**: añade *swap* y usa `tmux`. En Dockerfile del frontend usa cache de `package*.json`.
- **Conflicto de :80**: apaga Docker o Nginx del host (switch duro).
- **La IP cambia**: asigna **Elastic IP** en AWS.

---

## Capturas (placeholders)

> Coloca tus imágenes reales en `docs/screenshots/` y enlázalas aquí.

- **Dashboard Admin**  
  ![Dashboard Admin](docs/screenshots/admin_dashboard.png)

- **Dashboard Cliente**  
  ![Dashboard Cliente](docs/screenshots/client_dashboard.png)

- **Swagger**  
  ![Swagger](docs/screenshots/swagger.png)

---

## Licencia
Este proyecto es de uso académico para la prueba técnica. Ajusta la licencia según tus necesidades (MIT recomendado).
