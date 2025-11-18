FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy shared types
COPY shared /shared

# Copy source code
COPY backend/. .

EXPOSE 3001

CMD ["npm", "run", "dev"]
