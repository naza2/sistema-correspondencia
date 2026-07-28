# frontend/Dockerfile - Producción con Nginx

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# ⬅️ NUEVO: Pasar variable de entorno al build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Dar permisos de ejecución a node_modules/.bin
RUN chmod +x node_modules/.bin/*

# Construir la aplicación
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]