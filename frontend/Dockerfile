# frontend/Dockerfile - Producción con Nginx

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Aceptar argumento de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar código y construir
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]