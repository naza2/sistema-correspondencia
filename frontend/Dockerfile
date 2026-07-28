# frontend/Dockerfile - Producción

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código y construir
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]