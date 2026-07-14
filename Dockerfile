# ============================================
# Dockerfile para DigitalOcean
# ============================================

# === Etapa 1: Backend ===
FROM node:20-alpine AS backend

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

EXPOSE 3000
CMD ["node", "server.js"]