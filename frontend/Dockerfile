# Etapa de build
FROM node:20 AS build
WORKDIR /app

# Copiar package.json y lock primero para cache
COPY frontend/package*.json ./

# Instalar dependencias en limpio
RUN npm ci

# Copiar resto del frontend
COPY frontend/ .

# Construir React
RUN npm run build

# Etapa final con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
