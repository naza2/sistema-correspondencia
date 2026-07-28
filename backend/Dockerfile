FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo dev para producción)
RUN npm install

# Copiar todo el código (incluye src/config/database.js)
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]